"""
Risk Assessment Model Service
==============================
A small FastAPI microservice that serves the trained Random Forest risk
classification model (see methodology_v2.md for the full research
writeup and validation results — 94.6% cross-validated accuracy on a
428-site reference dataset).

This is a SEPARATE process from the main Node.js/Express backend. The
Node backend calls this service over HTTP when it needs a risk
prediction for a site — a standard polyglot microservice pattern: keep
the ML model in Python (where scikit-learn lives), keep the main app in
Node/TypeScript, and let them talk over a small internal API.

Requirements:
    pip install fastapi uvicorn joblib scikit-learn pandas requests

Run:
    uvicorn risk_service:app --host 0.0.0.0 --port 8000

Then the Node backend calls, e.g.:
    POST http://localhost:8000/predict
    { "lat": 7.29, "lon": 80.63, "elevation_m": 500, "distance_to_coast_km": 100 }
    -> { "risk_label": "Low", "risk_score": 23.4, "probabilities": {...} }

Or, to let this service fetch elevation itself from just coordinates:
    POST http://localhost:8000/predict_from_coordinates
    { "lat": 7.29, "lon": 80.63 }
"""

import math
from typing import Optional

import joblib
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

MODEL_PATH = "risk_model.joblib"

app = FastAPI(title="Archaeological Site Risk Assessment Service", version="1.0")

# Loaded once at startup, reused across requests (avoids reloading per call).
_artifact = None


@app.on_event("startup")
def load_model():
    global _artifact
    _artifact = joblib.load(MODEL_PATH)
    print(f"Loaded model. Classes: {_artifact['model'].classes_}")


# --- Coastal reference points, same list used in the research script,
#     so live scoring is consistent with how training data was derived. ---
COASTAL_REFERENCE_POINTS = [
    (6.0, 80.2), (9.8, 80.0), (13.0, 80.3),
    (19.0, 72.8), (22.5, 88.3), (8.1, 77.5),
    (21.6, 87.5), (15.5, 73.8), (11.9, 79.8),
    (10.6, 103.5), (13.1, 100.6),
]


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi, dlambda = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def distance_to_coast_km(lat, lon):
    return min(haversine_km(lat, lon, clat, clon) for clat, clon in COASTAL_REFERENCE_POINTS)


def climate_zone(lat):
    a = abs(lat)
    if a <= 10:
        return "equatorial"
    elif a <= 23.5:
        return "tropical"
    return "subtropical"


def fetch_elevation(lat: float, lon: float) -> float:
    """Live elevation lookup — the Node backend and this service both have
    real internet access (unlike a sandboxed dev/research environment), so
    this works reliably in this deployment."""
    resp = requests.get(
        "https://api.open-meteo.com/v1/elevation",
        params={"latitude": lat, "longitude": lon},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["elevation"][0]


def score(lat, lon, elevation_m, distance_to_coast_km_val):
    a = _artifact
    zone = climate_zone(lat)
    zone_encoded = a["climate_encoder"].transform([zone])[0]

    X = pd.DataFrame([{
        "lat": lat, "lon": lon,
        "elevation_m": elevation_m,
        "distance_to_coast_km": distance_to_coast_km_val,
        "climate_zone": zone_encoded,
    }])[a["feature_cols"]]

    label = a["model"].predict(X)[0]
    proba = dict(zip(a["model"].classes_, a["model"].predict_proba(X)[0].tolist()))

    # Also report the underlying heuristic score (0-100) for transparency —
    # this is what the model was trained to reproduce (see methodology).
    elev_risk = 1 - min(max(elevation_m / a["elevation_q90"], 0), 1)
    coast_risk = 1 - min(max(distance_to_coast_km_val / a["coast_q90"], 0), 1)
    climate_risk = a["climate_risk_map"][zone]
    heuristic_score = (0.45 * elev_risk + 0.30 * coast_risk + 0.25 * climate_risk) * 100

    return {
        "risk_label": label,
        "risk_score": round(heuristic_score, 1),
        "probabilities": {k: round(v, 3) for k, v in proba.items()},
        "climate_zone": zone,
        "elevation_m": elevation_m,
        "distance_to_coast_km": round(distance_to_coast_km_val, 1),
        "model_note": (
            "Heuristic-based risk indicator (elevation, coastal proximity, "
            "climate zone). Not a verified damage prediction — see "
            "methodology_v2.md for validation details and limitations."
        ),
    }


class PredictRequest(BaseModel):
    lat: float
    lon: float
    elevation_m: float
    distance_to_coast_km: Optional[float] = None


class PredictFromCoordsRequest(BaseModel):
    lat: float
    lon: float


@app.post("/predict")
def predict(req: PredictRequest):
    """Use this if the caller already has elevation/coastal-distance
    (e.g. cached on the site record)."""
    if _artifact is None:
        raise HTTPException(503, "Model not loaded")
    coast_km = req.distance_to_coast_km
    if coast_km is None:
        coast_km = distance_to_coast_km(req.lat, req.lon)
    return score(req.lat, req.lon, req.elevation_m, coast_km)


@app.post("/predict_from_coordinates")
def predict_from_coordinates(req: PredictFromCoordsRequest):
    """Use this for a plain lat/lng — the service fetches elevation itself."""
    if _artifact is None:
        raise HTTPException(503, "Model not loaded")
    try:
        elevation = fetch_elevation(req.lat, req.lon)
    except requests.RequestException as e:
        raise HTTPException(502, f"Elevation lookup failed: {e}")
    coast_km = distance_to_coast_km(req.lat, req.lon)
    return score(req.lat, req.lon, elevation, coast_km)


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _artifact is not None}
