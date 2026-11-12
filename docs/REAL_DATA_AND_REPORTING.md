# AgriSentinel — Production Data Integrity & Real Reporting Architecture

This document outlines the architectural changes implemented to transition AgriSentinel from a prototype into an authentic, data-driven system.

---

## 1. Real PDF Report Generation (`ReportLab` + `qrcode`)

- **Service Module:** `backend/app/services/report_generator.py`
- **Output:** Professional A4/Letter Technical Harvest Assessment Report PDF.
- **Components:**
  - Automated report numbering (`CRT-OD-YYYY-XXXXXX`).
  - Cadastral parcel metadata (Village, Tahasil, District, Recorded Geodesic Area).
  - Volumetric and mass metrics calculated strictly above the RANSAC ground datum plane.
  - Formulated harvest mass ($M = V \times \rho$).
  - Dynamic QR code pointing to public verification URI.
  - Cryptographic SHA-256 integrity digest.
  - Explicit legal disclaimer confirming the report is an automated technical advisory and not a statutory government certificate.

## 2. Cryptographic Verification Service

- **Endpoint:** `GET /api/yield-estimates/verify/{verification_token}`
- **Behavior:**
  - Publicly accessible (requires no authentication or login session).
  - Accepts either the certificate number or the full 64-character SHA-256 hash.
  - Confirms system authenticity and returns technical assessment parameters without disclosing sensitive personal farmer PII.

## 3. Satellite GIS Improvements

- **Component:** `InteractiveGISParcelMap.tsx` & `FarmerParcelGISViewer.tsx`
- **Fixes Applied:**
  - **Tile Provider:** Esri World Imagery (high-resolution orthomosaic) with fallback to OpenStreetMap.
  - **Label De-Cluttering:** Removed `permanent: true` tooltips that caused text collision across neighboring plots. Tooltips now display cleanly on hover or parcel selection.
  - **Container Lifecycle:** Implemented `map.invalidateSize()` after DOM container rendering to eliminate gray tile defects.
  - **Geometry Ingestion:** PostGIS GeoJSON polygons parsed with inverted latitude/longitude handling to comply with Leaflet $([lat, lng])$ standards.

## 4. UI Cleanliness & Empty States

- **Dashboard Hero & Quantification Panel:**
  - When no survey or 3D scan has been executed, the dashboard now renders an unambiguous empty state: `"Awaiting Scan"`, `"Pending Survey"`, and `"Awaiting 3D Elevation"`.
  - Removed simulated accuracy benchmarks and static RMSE values when real scan metrics are not present.
- **CSV Data Export:**
  - Exported spreadsheets now reference actual linked scan volume and mass rather than arbitrary multipliers.

