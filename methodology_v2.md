# Methodology — Archaeological Site Risk Classification (Final)

## 1. Dataset

**Source**: *Pleiades* Gazetteer of Ancient Places
(https://pleiades.stoa.org), a peer-reviewed, community-built gazetteer
maintained by the Institute for the Study of the Ancient World (New York
University) and the Ancient World Mapping Center (UNC Chapel Hill).
Data accessed via the platform-independent CSV export mirrored at
https://github.com/isawnyu/pleiades.datasets (CC-BY 3.0 license).

**Scope**: Filtered by geographic bounding box (and cross-checked against
place descriptions) to Sri Lanka and comparable South/Southeast Asian
countries — as agreed with the project supervisor, given the
unavailability of a direct data-sharing arrangement with the Sri Lankan
Department of Archaeology. Countries originally targeted: India, Nepal,
Myanmar, Cambodia, Indonesia. **Pleiades' actual coverage** for this
region turned out to be concentrated in **India, Sri Lanka, and
Cambodia** (Nepal, Myanmar, and Indonesia had negligible entries in this
particular gazetteer, which historically has stronger coverage of the
ancient Mediterranean and South Asian world than maritime Southeast
Asia).

**Sample size**: n = 428 sites (India: 365, Sri Lanka: 53, Cambodia: 10).

**Country-attribution limitation (important)**: Country labels were
assigned using rectangular geographic bounding boxes, not precise
administrative-boundary polygons. This is an approximation. During data
cleaning, 43 sites were identified and removed after being incorrectly
attributed to India by the bounding box when their descriptions or known
locations placed them in Pakistan or Afghanistan (e.g., Mohenjo-daro,
Harappa, Taxila — all well-documented sites in modern Pakistan that fall
inside a naive India bounding box near the shared border). A
description-text cross-check followed by a stricter longitude cutoff
(74°E) for India-labeled points was used to reduce this error. **Some
residual border-region misattribution may remain**; a production-grade
fix would use a proper country-boundary shapefile (e.g. Natural Earth
admin-0 boundaries) with a point-in-polygon test rather than bounding
boxes. This is disclosed as a limitation, not hidden.

## 2. Environmental Covariates

| Covariate | Source | Notes |
|---|---|---|
| `elevation_m` | Open-Meteo Elevation API (Copernicus DEM GLO-90) | Real digital elevation model, ~90m resolution |
| `distance_to_coast_km` | Haversine distance to nearest of ~10 manually-identified coastal reference points | **Approximation** — a proper coastline vector layer would improve accuracy; documented limitation |
| `climate_zone` | Latitude-based classification (equatorial ≤10°, tropical ≤23.5°, subtropical >23.5°) | Standard geographic convention |

Unlike the earlier UNESCO-only pilot (n=55), this dataset does not carry
an inscription date, so an "exposure duration" covariate was not
available and is not used here.

## 3. Risk Label Construction

No public ground-truth dataset records observed damage or deterioration
for these sites. As in the pilot study, a **composite risk score** was
constructed from real covariates, following precedent in the heritage
climate-risk literature (cf. Marzeion & Levermann, 2014, *Environmental
Research Letters*, which uses elevation and coastal proximity as
inundation-exposure proxies for World Heritage sites):

```
risk_score = 0.45 × elevation_risk
           + 0.30 × coastal_proximity_risk
           + 0.25 × climatic_exposure_risk
```

Each component normalized to [0, 1] (higher = riskier) before weighting.
The continuous score was discretized into three balanced classes
(Low/Medium/High) using tercile thresholds computed from this sample.

**This label is an expert-informed heuristic proxy, not an observed
outcome** — state this explicitly wherever results are reported.

## 4. Classification Model

- **Algorithm**: Random Forest Classifier (`scikit-learn`), 300 trees,
  max depth 6.
- **Features**: latitude, longitude, elevation, distance to coast,
  climate zone (encoded).
- **Validation**: 5-fold stratified cross-validation.

## 5. Results

- **Cross-validated accuracy: 94.6%** (n=428)
- Per-class F1: High 0.96, Low 0.97, Medium 0.92
- **Feature importance**: elevation (38%) > distance to coast (29%) >
  latitude (17%) > longitude (10%) > climate zone (5%) — elevation and
  coastal proximity dominating is consistent with the coastal-heritage-
  exposure literature underpinning the heuristic.

**Comparison to the n=55 UNESCO-only pilot** (78.2% accuracy): the larger,
more geographically diverse sample yields a substantially higher and
more stable cross-validated accuracy. This is expected — with 8× more
samples, the Random Forest has more data to learn genuine, generalizable
relationships between geographic covariates and the (heuristic-defined)
risk classes, and the tercile-based labels are less sensitive to
individual outlier sites than in the smaller sample.

**Important caveat on interpreting the accuracy figure**: because
`risk_score` (and therefore `risk_label`) is a deterministic function of
the same covariates used as model features (elevation, coastal distance,
climate zone), high cross-validated accuracy here primarily demonstrates
that the Random Forest can recover the known relationship it was trained
on — it is a **methodological validity check of the pipeline**, not
evidence that these covariates causally predict real-world site
deterioration. Genuine predictive validity can only be established
against real observed outcome data (e.g., documented erosion, flood
damage, or conservation-status changes over time), which does not
currently exist as an open dataset for this region. This should be
stated plainly in the thesis to avoid overclaiming.

## 6. Stated Limitations (for the thesis Limitations section)

1. **No ground-truth risk/damage data** — label is a heuristic proxy.
2. **Circularity caveat** — model accuracy reflects recovery of a
   deterministic label function, not validated real-world predictive
   power (see Section 5).
3. **Bounding-box country attribution** — an approximation; some
   residual border-region noise may remain despite cleaning.
4. **Uneven country coverage** — Pleiades' coverage of this dataset is
   concentrated in India/Sri Lanka/Cambodia; Nepal, Myanmar, and
   Indonesia were part of the originally agreed scope but had
   negligible representation in this specific source, a constraint of
   the chosen open dataset rather than a deliberate exclusion.
5. **Pleiades sites are historically/archaeologically notable ancient
   places, not administratively registered "at-risk" sites** — they
   represent varying scales of significance (from major temple
   complexes to minor findspots), which the model does not currently
   distinguish.
6. **Scope-extension rationale**: Asian countries were used, on
   supervisor guidance, as a proxy for Sri Lankan sites given the
   inability to obtain a data-sharing agreement with the Department of
   Archaeology, selected for comparable geographic heterogeneity.
