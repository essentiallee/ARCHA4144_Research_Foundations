# Art-Based Gentrification in SoHo

This repository combines historical research, a reproducible Python data
pipeline, and browser-based D3 visualizations. The first data milestone maps
residential migration and housing conditions in downtown Manhattan using 1960
and 1970 census tracts.

The census layer does **not** identify artists directly. It measures general
residential mobility, vacancy, renter occupancy, and rent. Artist residences,
A.I.R. registrations, cooperatives, and galleries will be added later as
separate archival point layers.

## Study area

The current comparison area extends approximately from Chambers Street to 14th
Street and from the Hudson River to Bowery/Chrystie Street:

```text
west   -74.016
south   40.708
east   -73.984
north   40.742
```

The Python workflow retains the original tract boundaries that intersect this
box. It does not subtract 1960 values from 1970 tracts because the two census
geographies are not necessarily equivalent.

## Project structure

```text
config/                         NHGIS table and indicator-selection rules
data/raw/nhgis/                 authenticated downloads; ignored by Git
data/metadata/                  generated table/variable provenance
data/processed/                 Python outputs used by D3
scripts/fetch_ipums_nhgis.py    API discovery, request, monitoring, download
scripts/prepare_census_migration.py
mapping.ipynb                   Python exploration of processed outputs
d3-census-map.js                interactive browser map
index.html, style.css, main.js  research site
```

## 1. Set up Python

Create and activate a virtual environment, then install the pinned dependency
ranges:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## 2. Add the IPUMS API key locally

Create a key at <https://account.ipums.org/api_keys>. Copy the example
environment file and edit `.env`:

```bash
cp .env.example .env
```

```text
IPUMS_API_KEY=your_key_here
```

`.env` is ignored by Git. Do not paste the key into source code, notebooks,
commits, or chat.

## 3. Fetch the NHGIS extract

The fetch script first reads current IPUMS metadata, resolves the configured
table descriptions and historical New York tract boundaries, submits one
extract, waits for completion, and unpacks the returned files:

```bash
python scripts/fetch_ipums_nhgis.py fetch
```

Useful individual commands:

```bash
python scripts/fetch_ipums_nhgis.py discover
python scripts/fetch_ipums_nhgis.py submit
python scripts/fetch_ipums_nhgis.py status
python scripts/fetch_ipums_nhgis.py download
```

The exact resolved datasets, table names, variable descriptions, and shapefile
names are recorded in `data/metadata/nhgis_manifest.json`. This makes the
extract auditable even if API metadata changes later.

The request uses:

- `1960_tPH` for tract-level residence in 1955 and housing context.
- `1970_Cnt4Pb` for residence in 1965.
- `1970_Cnt2` for occupancy/vacancy and tenure.
- `1970_Cnt4H` for rent.

## 4. Prepare the map data

```bash
python scripts/prepare_census_migration.py
```

This creates:

```text
data/processed/soho_migration_1960.geojson
data/processed/soho_migration_1970.geojson
data/processed/soho_migration_long.csv
data/processed/downtown_study_boundary.geojson
```

All output geometries use WGS84 (`EPSG:4326`) so the same GeoJSON works in
GeoPandas, D3, Leaflet, or MapLibre.

## 5. View the D3 map

Serve the repository instead of opening `index.html` directly, because browsers
restrict local GeoJSON requests:

```bash
python -m http.server 8000
```

Open <http://localhost:8000>. Until the processed files exist, the map displays
a setup message rather than example or fabricated values.

## Method notes

- “Recent movers” is the population age five and over living in a different
  house five years before the census, divided by the population with known
  mobility status.
- Missing values stay missing. They are never converted to zero.
- Historical prices remain nominal dollars.
- 1960 and 1970 are shown side by side in their own tract geographies.
- IPUMS source files remain untracked; processed data publication should follow
  the [IPUMS terms of use](https://www.ipums.org/about/terms).

## Sources

- [IPUMS NHGIS API documentation](https://developer.ipums.org/docs/v2/apiprogram/apis/nhgis/)
- [NHGIS dataset overview](https://www.nhgis.org/overview-nhgis-datasets)
- [1960 Census Tract Reports](https://www.census.gov/library/publications/1961/dec/population-and-housing-phc-1.html)

