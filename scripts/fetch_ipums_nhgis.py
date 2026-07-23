#!/usr/bin/env python3
"""Resolve, request, monitor, and download the project's NHGIS extract."""

from __future__ import annotations

import argparse
import json
import os
import re
import time
import zipfile
from pathlib import Path
from typing import Any

import requests


PROJECT_DIR = Path(__file__).resolve().parents[1]
CONFIG_PATH = PROJECT_DIR / "config" / "nhgis_tables.json"
METADATA_DIR = PROJECT_DIR / "data" / "metadata"
RAW_DIR = PROJECT_DIR / "data" / "raw" / "nhgis"
MANIFEST_PATH = METADATA_DIR / "nhgis_manifest.json"
STATE_PATH = METADATA_DIR / "nhgis_extract_state.json"
API_ROOT = "https://api.ipums.org"
API_PARAMS = {"collection": "nhgis", "version": 2}


def load_dotenv(path: Path) -> None:
    """Load a minimal KEY=value file without adding a runtime dependency."""
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def api_key() -> str:
    load_dotenv(PROJECT_DIR / ".env")
    key = os.getenv("IPUMS_API_KEY")
    if not key or key == "replace_with_your_ipums_api_key":
        raise SystemExit(
            "IPUMS_API_KEY is not set. Copy .env.example to .env and add your "
            "key from https://account.ipums.org/api_keys."
        )
    return key


class NhgisClient:
    def __init__(self, key: str) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {"Authorization": key, "User-Agent": "soho-census-research/1.0"}
        )

    def request(
        self, method: str, url: str, *, params: dict[str, Any] | None = None, **kwargs: Any
    ) -> requests.Response:
        response = self.session.request(
            method,
            url,
            params=params,
            timeout=90,
            **kwargs,
        )
        if not response.ok:
            detail = response.text[:1_000]
            raise RuntimeError(
                f"IPUMS API returned {response.status_code} for {url}:\n{detail}"
            )
        return response

    def get_json(self, path: str) -> dict[str, Any]:
        return self.request(
            "GET", f"{API_ROOT}{path}", params=API_PARAMS
        ).json()

    def get_all(self, path: str) -> list[dict[str, Any]]:
        page = 1
        results: list[dict[str, Any]] = []
        while True:
            payload = self.request(
                "GET",
                f"{API_ROOT}{path}",
                params={**API_PARAMS, "pageNumber": page, "pageSize": 500},
            ).json()
            results.extend(payload.get("data", []))
            if not payload.get("links", {}).get("nextPage"):
                return results
            page += 1

    def post_extract(self, definition: dict[str, Any]) -> dict[str, Any]:
        return self.request(
            "POST",
            f"{API_ROOT}/extracts/",
            params=API_PARAMS,
            json=definition,
        ).json()

    def extract_status(self, number: int) -> dict[str, Any]:
        return self.get_json(f"/extracts/{number}")


def regex_match(pattern: str, value: str) -> bool:
    return re.search(pattern, value, flags=re.IGNORECASE) is not None


def resolve_table(
    dataset_name: str,
    tables: list[dict[str, Any]],
    role: str,
    rule: dict[str, Any],
) -> dict[str, Any]:
    preferred = rule.get("preferredTable")
    if preferred:
        match = next((table for table in tables if table["name"] == preferred), None)
        if match:
            return match

    include = rule.get("descriptionPatterns", [])
    exclude = rule.get("excludePatterns", [])
    candidates = [
        table
        for table in tables
        if all(regex_match(pattern, table.get("description", "")) for pattern in include)
        and not any(
            regex_match(pattern, table.get("description", "")) for pattern in exclude
        )
    ]
    if len(candidates) != 1:
        rendered = "\n".join(
            f"  {table['name']}: {table.get('description', '')}"
            for table in candidates
        ) or "  (none)"
        raise RuntimeError(
            f"Could not uniquely resolve {dataset_name}/{role}. Candidates:\n{rendered}\n"
            "Adjust config/nhgis_tables.json after checking IPUMS metadata."
        )
    return candidates[0]


def resolve_shapefile(
    year: str,
    rule: dict[str, str],
    shapefiles: list[dict[str, Any]],
) -> dict[str, Any]:
    preferred = rule.get("preferredName")
    if preferred:
        match = next((item for item in shapefiles if item["name"] == preferred), None)
        if match:
            return match

    candidates = [
        item
        for item in shapefiles
        if str(item.get("year")) == str(rule["year"])
        and regex_match(
            rule["geographicLevelPattern"], item.get("geographicLevel", "")
        )
        and regex_match(rule["extentPattern"], item.get("extent", ""))
        and (
            not rule.get("basisPattern")
            or regex_match(rule["basisPattern"], item.get("basis", ""))
        )
    ]
    if len(candidates) != 1:
        rendered = "\n".join(
            f"  {item['name']}: {item.get('extent')} / {item.get('basis')}"
            for item in candidates
        ) or "  (none)"
        raise RuntimeError(
            f"Could not uniquely resolve the {year} tract shapefile. Candidates:\n"
            f"{rendered}\nSet preferredName in config/nhgis_tables.json."
        )
    return candidates[0]


def build_manifest(client: NhgisClient) -> dict[str, Any]:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    manifest: dict[str, Any] = {
        "description": config["description"],
        "geographicExtents": config["geographicExtents"],
        "geogLevel": config["geogLevel"],
        "datasets": {},
        "shapefiles": {},
    }

    for dataset_name, dataset_rule in config["datasets"].items():
        dataset = client.get_json(f"/metadata/datasets/{dataset_name}")
        tables = dataset["dataTables"]
        resolved_roles: dict[str, Any] = {}

        for role, role_rule in dataset_rule["roles"].items():
            table = resolve_table(dataset_name, tables, role, role_rule)
            detail = client.get_json(
                f"/metadata/datasets/{dataset_name}/data_tables/{table['name']}"
            )
            resolved_roles[role] = detail

        manifest["datasets"][dataset_name] = {
            "year": dataset_rule["year"],
            "group": dataset.get("group"),
            "description": dataset.get("description"),
            "roles": resolved_roles,
        }

    available_shapes = client.get_all("/metadata/shapefiles")
    for year, rule in config["shapefiles"].items():
        manifest["shapefiles"][year] = resolve_shapefile(
            year, rule, available_shapes
        )

    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    return manifest


def extract_definition(manifest: dict[str, Any]) -> dict[str, Any]:
    datasets: dict[str, Any] = {}
    for name, details in manifest["datasets"].items():
        table_names = sorted(
            {table["name"] for table in details["roles"].values()}
        )
        datasets[name] = {
            "dataTables": table_names,
            "geogLevels": [manifest["geogLevel"]],
        }
    return {
        "datasets": datasets,
        "shapefiles": [
            details["name"] for details in manifest["shapefiles"].values()
        ],
        "geographicExtents": manifest["geographicExtents"],
        "dataFormat": "csv_no_header",
        "description": manifest["description"],
    }


def save_state(payload: dict[str, Any]) -> None:
    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        raise SystemExit("No extract state found. Run the 'submit' command first.")
    return json.loads(STATE_PATH.read_text(encoding="utf-8"))


def submit(client: NhgisClient, refresh_manifest: bool = False) -> dict[str, Any]:
    if refresh_manifest or not MANIFEST_PATH.exists():
        manifest = build_manifest(client)
    else:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    response = client.post_extract(extract_definition(manifest))
    save_state(response)
    print(f"Submitted NHGIS extract {response['number']}: {response['status']}")
    return response


def safe_extract(zip_path: Path, destination: Path) -> None:
    destination = destination.resolve()
    with zipfile.ZipFile(zip_path) as archive:
        for member in archive.infolist():
            target = (destination / member.filename).resolve()
            if destination not in target.parents and target != destination:
                raise RuntimeError(f"Unsafe path in ZIP: {member.filename}")
        archive.extractall(destination)


def download_completed(
    client: NhgisClient, status: dict[str, Any]
) -> list[Path]:
    if status.get("status") != "completed":
        raise SystemExit(f"Extract status is {status.get('status')}, not completed.")

    extract_dir = RAW_DIR / f"extract_{status['number']}"
    extract_dir.mkdir(parents=True, exist_ok=True)
    downloaded: list[Path] = []

    for label, link in (status.get("downloadLinks") or {}).items():
        url = link.get("url") if isinstance(link, dict) else link
        if not url or label == "codebookPreview":
            continue
        zip_path = extract_dir / f"{label}.zip"
        response = client.request("GET", url)
        zip_path.write_bytes(response.content)
        safe_extract(zip_path, extract_dir / label)
        downloaded.append(zip_path)
        print(f"Downloaded {label} to {zip_path.relative_to(PROJECT_DIR)}")

    save_state(status)
    return downloaded


def wait_for_extract(
    client: NhgisClient,
    number: int,
    *,
    poll_seconds: int,
    timeout_minutes: int,
) -> dict[str, Any]:
    deadline = time.monotonic() + timeout_minutes * 60
    previous = None
    while time.monotonic() < deadline:
        status = client.extract_status(number)
        current = status.get("status")
        if current != previous:
            print(f"Extract {number}: {current}")
            previous = current
        save_state(status)
        if current == "completed":
            return status
        if current in {"failed", "canceled"}:
            raise RuntimeError(
                f"Extract {number} ended with status {current}: "
                f"{json.dumps(status.get('errors', {}), indent=2)}"
            )
        time.sleep(poll_seconds)
    raise TimeoutError(
        f"Extract {number} did not finish within {timeout_minutes} minutes. "
        "Run the 'status' command later."
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "command",
        choices=["discover", "submit", "status", "download", "fetch"],
        nargs="?",
        default="fetch",
    )
    parser.add_argument("--refresh-manifest", action="store_true")
    parser.add_argument("--poll-seconds", type=int, default=10)
    parser.add_argument("--timeout-minutes", type=int, default=20)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    client = NhgisClient(api_key())

    if args.command == "discover":
        manifest = build_manifest(client)
        print(
            f"Resolved {len(manifest['datasets'])} datasets and "
            f"{len(manifest['shapefiles'])} shapefiles."
        )
        return

    if args.command == "submit":
        submit(client, args.refresh_manifest)
        return

    if args.command == "status":
        state = load_state()
        status = client.extract_status(int(state["number"]))
        save_state(status)
        print(json.dumps({"number": status["number"], "status": status["status"]}))
        return

    if args.command == "download":
        state = load_state()
        status = client.extract_status(int(state["number"]))
        download_completed(client, status)
        return

    response = submit(client, args.refresh_manifest)
    status = wait_for_extract(
        client,
        int(response["number"]),
        poll_seconds=args.poll_seconds,
        timeout_minutes=args.timeout_minutes,
    )
    download_completed(client, status)


if __name__ == "__main__":
    main()
