"""
Archaeological Site Risk Classification — Final Research Pipeline (v2)
=========================================================================
Uses the expanded 428-site Pleiades-derived dataset (Sri Lanka, India,
Cambodia) instead of the earlier 55-site UNESCO-only sample, for a more
statistically reliable model.

Requirements:
    pip install pandas numpy scikit-learn

Usage:
    python train_risk_model_v2.py

Input:  asia_pleiades_sites_enriched.csv
Output: asia_pleiades_sites_labeled.csv (adds risk_score, risk_label)
        Console: cross-validated accuracy, classification report,
                 confusion matrix, feature importances
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

INPUT_CSV = "asia_pleiades_sites_enriched.csv"
OUTPUT_CSV = "asia_pleiades_sites_labeled.csv"


def build_risk_label(df: pd.DataFrame) -> pd.DataFrame:
    """
    Composite risk score (0-100) from three real, coordinate-derived
    covariates (see methodology.md for full justification and citations):
      - Elevation exposure    (45%): lower elevation -> higher risk
      - Coastal proximity     (30%): closer to coast  -> higher risk
      - Climatic exposure     (25%): equatorial/tropical humidity & rainfall
                                      stress -> higher risk

    (Note: this dataset, derived from the Pleiades gazetteer, does not
    carry a UNESCO-style inscription date, so the "exposure duration"
    component used in the earlier 55-site UNESCO-only version is dropped
    here and the remaining weights rebalanced.)

    Thresholds are tercile-based (33rd/66th percentile of this sample),
    producing roughly balanced Low/Medium/High classes.

    LIMITATION: this is an expert-informed heuristic proxy, not an
    observed damage/risk outcome — state this explicitly in any report.
    """
    df = df.copy()
    elev_risk = 1 - np.clip(df["elevation_m"] / df["elevation_m"].quantile(0.9), 0, 1)
    coast_risk = 1 - np.clip(
        df["distance_to_coast_km"] / df["distance_to_coast_km"].quantile(0.9), 0, 1
    )
    climate_risk = df["climate_zone"].map(
        {"equatorial": 1.0, "tropical": 0.7, "subtropical": 0.4}
    )
    df["risk_score"] = (0.45 * elev_risk + 0.30 * coast_risk + 0.25 * climate_risk) * 100

    q1, q2 = df["risk_score"].quantile([0.33, 0.66])

    def label(score):
        if score >= q2:
            return "High"
        elif score >= q1:
            return "Medium"
        return "Low"

    df["risk_label"] = df["risk_score"].apply(label)
    print(f"Risk score thresholds — Low < {q1:.1f} <= Medium < {q2:.1f} <= High")
    print(df["risk_label"].value_counts(), "\n")
    return df


def train_and_evaluate(df: pd.DataFrame):
    """Random Forest, 5-fold stratified cross-validation."""
    feature_cols = ["lat", "lon", "elevation_m", "distance_to_coast_km"]
    X = df[feature_cols].copy()
    X["climate_zone"] = LabelEncoder().fit_transform(df["climate_zone"])
    y = df["risk_label"]

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    model = RandomForestClassifier(n_estimators=300, max_depth=6, random_state=42)

    y_pred = cross_val_predict(model, X, y, cv=skf)

    print("=== 5-fold Stratified Cross-Validation (n=%d) ===" % len(df))
    print(f"Accuracy: {accuracy_score(y, y_pred):.3f}\n")
    print(classification_report(y, y_pred))

    labels_sorted = sorted(y.unique())
    print("Confusion matrix (rows=true, cols=pred), label order:", labels_sorted)
    print(confusion_matrix(y, y_pred, labels=labels_sorted))

    model.fit(X, y)
    importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(
        ascending=False
    )
    print("\n=== Feature Importances (fit on full data) ===")
    print(importances)


def main():
    df = pd.read_csv(INPUT_CSV)
    print(f"Loaded {len(df)} sites from {INPUT_CSV}\n")
    print(df["country"].value_counts(), "\n")

    df = build_risk_label(df)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Saved labeled dataset to {OUTPUT_CSV}\n")

    train_and_evaluate(df)


if __name__ == "__main__":
    main()
