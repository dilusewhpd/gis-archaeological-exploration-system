"""
Enrich the expanded Pleiades-derived archaeological sites dataset with real
environmental covariates. Run this on your own machine (needs internet
access — Claude's sandbox can't reach these APIs).

Requirements:
    pip install pandas requests

Usage:
    python enrich_dataset_v2.py

Input:  asia_pleiades_sites_raw.csv
        (428 real archaeological/ancient places from the Pleiades gazetteer
         of ancient places — https://pleiades.stoa.org, CC-BY 3.0,
         mirrored at https://github.com/isawnyu/pleiades.datasets —
         covering Sri Lanka, India, and Cambodia; filtered by bounding
         box with additional text cross-checking and a stricter longitude
         cutoff for India to reduce Pakistan/Afghanistan border-region
         misattribution. This filtering is a documented approximation,
         not a precise administrative-boundary check — see the
         methodology write-up.)

Output: asia_pleiades_sites_enriched.csv
"""

import time
import math
import pandas as pd
import requests

INPUT_CSV = "asia_pleiades_sites_raw.csv"
OUTPUT_CSV = "asia_pleiades_sites_enriched.csv"


def fetch_elevations(lats, lons, batch_size=100):
    """Open-Meteo Elevation API (free, no key, Copernicus DEM GLO-90)."""
    elevations = []
    n = len(lats)
    for i in range(0, n, batch_size):
        lat_batch = lats[i:i + batch_size]
        lon_batch = lons[i:i + batch_size]
        url = "https://api.open-meteo.com/v1/elevation"
        params = {
            "latitude": ",".join(str(x) for x in lat_batch),
            "longitude": ",".join(str(x) for x in lon_batch),
        }
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        elevations.extend(resp.json()["elevation"])
        print(f"  elevation batch {i // batch_size + 1}/{(n - 1) // batch_size + 1} done")
        time.sleep(1.2)  # be polite to the free API
    return elevations


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


# Coarse coastal reference points (lat, lon). Extend this list for better
# accuracy — or replace with a real coastline layer (e.g. Natural Earth
# 10m coastline shapefile) for a production-quality distance calculation.
COASTAL_REFERENCE_POINTS = [
    (6.0, 80.2), (9.8, 80.0), (13.0, 80.3),            # Sri Lanka / SE India
    (19.0, 72.8), (22.5, 88.3), (8.1, 77.5),            # India west/east/south
    (21.6, 87.5), (15.5, 73.8), (11.9, 79.8),           # more India coast points
    (10.6, 103.5), (13.1, 100.6),                        # Cambodia/Gulf of Thailand
]


def distance_to_coast_km(lat, lon):
    return min(haversine_km(lat, lon, clat, clon) for clat, clon in COASTAL_REFERENCE_POINTS)


def climate_zone(lat):
    a = abs(lat)
    if a <= 10:
        return "equatorial"
    elif a <= 23.5:
        return "tropical"
    else:
        return "subtropical"


def main():
    df = pd.read_csv(INPUT_CSV)
    print(f"Loaded {len(df)} sites")

    print("Fetching real elevation data from Open-Meteo (Copernicus DEM)...")
    df["elevation_m"] = fetch_elevations(df["lat"].tolist(), df["lon"].tolist())

    print("Computing distance to coastline (approximate, haversine to reference points)...")
    df["distance_to_coast_km"] = df.apply(
        lambda r: round(distance_to_coast_km(r["lat"], r["lon"]), 1), axis=1
    )

    print("Assigning climate zone (latitude-based proxy)...")
    df["climate_zone"] = df["lat"].apply(climate_zone)

    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\nSaved enriched dataset to {OUTPUT_CSV} ({len(df)} rows, {len(df.columns)} columns)")
    print(df.head())


if __name__ == "__main__":
    main()
