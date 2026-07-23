#!/usr/bin/env python3
"""Join downloaded NHGIS tables to tracts and create web-ready files."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import geopandas as gpd
import pandas as pd
from shapely.geometry import box


PROJECT_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = PROJECT_DIR / "data" / "raw" / "nhgis"
PROCESSED_DIR = PROJECT_DIR / "data" / "processed"
MANIFEST_PATH = PROJECT_DIR / "data" / "metadata" / "nhgis_manifest.json"
RULES_PATH = PROJECT_DIR / "config" / "indicator_rules.json"
STUDY_BOUNDS = (-74.016, 40.708, -73.984, 40.742)
NY_STATE_NHGIS = "360"
NEW_YORK_COUNTY_NHGIS = "0610"
MANHATTAN_GISJOIN_PREFIX = f"G{NY_STATE_NHGIS}{NEW_YORK_COUNTY_NHGIS}"


def normalized(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().lower()


def metadata_variables(table: dict[str, Any]) -> dict[str, str]:
    return {
        variable["name"]: normalized(variable.get("description", ""))
        for variable in table.get("variables", [])
    }


def select_variable(
    table: dict[str, Any],
    rule: dict[str, list[str]],
    available_columns: set[str],
) -> str | None:
    variables = metadata_variables(table)
    candidates = [
        name
        for name, description in variables.items()
        if name in available_columns
        and all(term.lower() in description for term in rule["include"])
        and not any(term.lower() in description for term in rule["exclude"])
    ]
    if not candidates:
        return None
    if len(candidates) > 1:
        exact_total = [
            name
            for name in candidates
            if variables[name] in {"occupied", "vacant", "owner occupied", "renter occupied"}
            or variables[name].startswith("total")
        ]
        if len(exact_total) == 1:
            return exact_total[0]
        rendered = ", ".join(
            f"{name} ({variables[name]})" for name in candidates[:8]
        )
        raise RuntimeError(
            f"Indicator rule is ambiguous in {table['datasetName']}/{table['name']}: "
            f"{rendered}"
        )
    return candidates[0]


def read_nhgis_csv(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path, dtype="string", low_memory=False)
    if "GISJOIN" not in frame.columns:
        raise ValueError(f"{path} does not contain GISJOIN")
    return frame


def filter_manhattan(frame: pd.DataFrame) -> pd.DataFrame:
    gisjoin_match = frame["GISJOIN"].str.startswith(MANHATTAN_GISJOIN_PREFIX)
    if gisjoin_match.any():
        return frame[gisjoin_match].copy()

    state_column = next(
        (name for name in ("STATEA", "STATEFP", "STATE") if name in frame.columns),
        None,
    )
    county_column = next(
        (name for name in ("COUNTYA", "COUNTYFP", "COUNTY") if name in frame.columns),
        None,
    )
    output = frame
    if state_column:
        output = output[
            output[state_column].str.extract(r"(\d+)", expand=False)
            == NY_STATE_NHGIS
        ]
    if county_column:
        output = output[
            output[county_column].str.extract(r"(\d+)", expand=False)
            == NEW_YORK_COUNTY_NHGIS
        ]
    if output.empty:
        raise RuntimeError(
            "The downloaded tract table contains no New York County rows. "
            "Check the extract extent and NHGIS geographic identifiers."
        )
    return output.copy()


def find_csv_for_dataset(
    dataset_name: str,
    tables: list[dict[str, Any]],
    csv_paths: list[Path],
) -> tuple[Path, pd.DataFrame]:
    expected_columns = {
        variable["name"]
        for table in tables
        for variable in table.get("variables", [])
    }
    matches: list[tuple[Path, pd.DataFrame, int]] = []
    for path in csv_paths:
        frame = read_nhgis_csv(path)
        overlap = len(expected_columns.intersection(frame.columns))
        if overlap:
            matches.append((path, frame, overlap))
    if not matches:
        raise FileNotFoundError(
            f"No downloaded CSV contains variables for {dataset_name}."
        )
    matches.sort(key=lambda item: item[2], reverse=True)
    return matches[0][0], filter_manhattan(matches[0][1])


def find_shapefile(year: int, paths: list[Path]) -> Path:
    candidates = [
        path
        for path in paths
        if str(year) in path.as_posix()
        and "tract" in path.as_posix().lower()
    ]
    if len(candidates) != 1:
        rendered = "\n".join(f"  {path}" for path in candidates) or "  (none)"
        raise FileNotFoundError(
            f"Expected one {year} tract shapefile, found {len(candidates)}:\n{rendered}"
        )
    return candidates[0]


def calculate_indicators(frame: pd.DataFrame) -> pd.DataFrame:
    output = frame.copy()
    numeric_fields = [
        "same_house_5yr",
        "moved_same_county",
        "moved_same_state",
        "moved_other_state",
        "moved_abroad",
        "occupied_units",
        "vacant_units",
        "owner_units",
        "renter_units",
        "median_contract_rent",
        "median_gross_rent",
    ]
    for field in numeric_fields:
        if field not in output:
            output[field] = pd.NA
        output[field] = pd.to_numeric(output[field], errors="coerce")

    migration_fields = [
        "same_house_5yr",
        "moved_same_county",
        "moved_same_state",
        "moved_other_state",
        "moved_abroad",
    ]
    migration_complete = output[migration_fields].notna().all(axis=1)
    output["known_mobility_population"] = output[migration_fields].sum(
        axis=1, min_count=len(migration_fields)
    )
    output["recent_movers"] = output[migration_fields[1:]].sum(
        axis=1, min_count=len(migration_fields) - 1
    )
    denominator = output["known_mobility_population"].where(
        output["known_mobility_population"] > 0
    )
    output["recent_mover_pct"] = (
        output["recent_movers"].where(migration_complete) / denominator * 100
    )
    output["local_mover_pct"] = (
        output[["moved_same_county", "moved_same_state"]].sum(
            axis=1, min_count=2
        )
        / denominator
        * 100
    )
    output["interstate_mover_pct"] = (
        output["moved_other_state"] / denominator * 100
    )
    output["international_mover_pct"] = (
        output["moved_abroad"] / denominator * 100
    )

    output["housing_units"] = output[["occupied_units", "vacant_units"]].sum(
        axis=1, min_count=2
    )
    output["vacancy_pct"] = (
        output["vacant_units"] / output["housing_units"].where(output["housing_units"] > 0)
        * 100
    )
    output["renter_pct"] = (
        output["renter_units"] / output["occupied_units"].where(output["occupied_units"] > 0)
        * 100
    )
    output["owner_pct"] = (
        output["owner_units"] / output["occupied_units"].where(output["occupied_units"] > 0)
        * 100
    )
    return output


def build_year(
    year: int,
    manifest: dict[str, Any],
    rules: dict[str, Any],
    csv_paths: list[Path],
    shapefile_paths: list[Path],
    boundary: gpd.GeoDataFrame,
) -> gpd.GeoDataFrame:
    standardized: pd.DataFrame | None = None

    for dataset_name, dataset in manifest["datasets"].items():
        if int(dataset["year"]) != year:
            continue
        tables = list(dataset["roles"].values())
        csv_path, source = find_csv_for_dataset(dataset_name, tables, csv_paths)
        source_columns = set(source.columns)
        selected = source[["GISJOIN"]].copy()

        for role, table in dataset["roles"].items():
            for target, indicator_rule in rules[role].items():
                variable = select_variable(table, indicator_rule, source_columns)
                if variable:
                    selected[target] = source[variable]
                    print(
                        f"{year} {target}: {dataset_name}/{table['name']}/{variable}"
                    )
                else:
                    print(
                        f"Warning: {year} {target} was not found in "
                        f"{dataset_name}/{table['name']} ({csv_path.name})."
                    )

        standardized = (
            selected
            if standardized is None
            else standardized.merge(selected, on="GISJOIN", how="outer")
        )

    if standardized is None:
        raise RuntimeError(f"No manifest datasets were configured for {year}.")

    standardized = calculate_indicators(standardized)
    shapes = gpd.read_file(find_shapefile(year, shapefile_paths))
    shapes["GISJOIN"] = shapes["GISJOIN"].astype("string")
    shapes = shapes.to_crs("EPSG:4326")
    shapes = shapes[shapes.intersects(boundary.geometry.iloc[0])].copy()
    joined = shapes.merge(standardized, on="GISJOIN", how="left", validate="one_to_one")
    joined["year"] = year
    joined["tract"] = joined.get("TRACTA", joined.get("TRACT", pd.NA))
    return joined


def main() -> None:
    if not MANIFEST_PATH.exists():
        raise SystemExit(
            "Missing data/metadata/nhgis_manifest.json. "
            "Run scripts/fetch_ipums_nhgis.py first."
        )

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    rules = json.loads(RULES_PATH.read_text(encoding="utf-8"))
    csv_paths = sorted(RAW_DIR.rglob("*.csv"))
    shapefile_paths = sorted(RAW_DIR.rglob("*.shp"))
    if not csv_paths or not shapefile_paths:
        raise SystemExit(
            "No downloaded NHGIS CSVs or shapefiles were found in data/raw/nhgis."
        )

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    boundary = gpd.GeoDataFrame(
        {
            "name": ["Downtown Manhattan Art-Migration Study Area"],
            "geometry": [box(*STUDY_BOUNDS)],
        },
        crs="EPSG:4326",
    )
    boundary.to_file(
        PROCESSED_DIR / "downtown_study_boundary.geojson", driver="GeoJSON"
    )

    years: list[gpd.GeoDataFrame] = []
    for year in (1960, 1970):
        result = build_year(
            year,
            manifest,
            rules,
            csv_paths,
            shapefile_paths,
            boundary,
        )
        output_path = PROCESSED_DIR / f"soho_migration_{year}.geojson"
        result.to_file(output_path, driver="GeoJSON")
        years.append(result)
        print(f"Wrote {output_path.relative_to(PROJECT_DIR)} ({len(result)} tracts)")

    non_geometry = pd.concat(
        [pd.DataFrame(frame.drop(columns="geometry")) for frame in years],
        ignore_index=True,
    )
    csv_output = PROCESSED_DIR / "soho_migration_long.csv"
    non_geometry.to_csv(csv_output, index=False)
    print(f"Wrote {csv_output.relative_to(PROJECT_DIR)}")


if __name__ == "__main__":
    main()
