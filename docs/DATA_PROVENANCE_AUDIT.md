# AgriSentinel — Data Provenance & Operational Integrity Audit

**Audit Date:** November 2026  
**Audited Subsystems:** Farmer Portal, Yield Estimates, 3D Heap Reconstruction, Cadastral GIS, Reports & Certificates  
**Compliance Mandate:** Zero Fabricated Operational Data, Cryptographic Traceability, Disclaimed Technical Reporting  

---

## 1. Executive Summary

An audit of the AgriSentinel codebase was conducted to eliminate all simulated/fabricated values, placeholder calculations, fake accuracy claims, and unauthorized government certification badges. The platform has been transitioned from a concept showcase into an empirical, data-driven system where every metric directly links to:
1. Valid PostgreSQL/PostGIS database records.
2. Actual uploaded multi-view imagery or UAV flight telemetry.
3. Computed output from the ORB-SLAM/RANSAC photogrammetry engine or semantic segmentation pipeline.
4. Explicitly identified, user-entered field measurements.

---

## 2. Metric Provenance Matrix

| Metric / Field | Frontend Component | Backend API Endpoint | Database Source / Model | Status & Provenance |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer Name & KYC** | `FarmerDashboard.tsx` (Header & Hero) | `GET /api/farmer/dashboard-summary` | `users.display_name`, `farmer_profiles` | **Real DB Record** |
| **Registered Parcel Boundary** | `FarmerParcelGISViewer.tsx`, `InteractiveGISParcelMap.tsx` | `GET /api/farmer/parcels/{id}` | `farmer_parcels.boundary_geojson` (SRID 4326) | **Real PostGIS Geometry** |
| **Parcel Area (Acres/Ha)** | `FarmerDashboard.tsx` (Parcels Table) | `GET /api/fields`, `GET /api/farmer/parcels` | `farmer_parcels.area_acres` | **Geodesic Calculation (ST_Area)** |
| **Reconstructed Volume** | `FarmerDashboard.tsx` (Yield Estimates) | `GET /api/heap-scans`, `POST /api/processing/reconstruction` | `heap_reconstructions.volume_cubic_meters` | **Empirical 3D DEM Raster (Above RANSAC Plane)** |
| **Bulk Density (ρ)** | `FarmerDashboard.tsx` (Quantification Panel) | `GET /api/heap-scans` | `heap_reconstructions.bulk_density_kg_per_m3` | **Standard Laboratory Swarna MTU (578.0 kg/m³ @ 14% moisture)** |
| **Total Grain Mass (Q)** | `FarmerDashboard.tsx` (Quantification Panel) | `GET /api/yield-estimates` | `heap_reconstructions.estimated_mass_quintals` | **Empirically Formulated (M = V × ρ / 100)** |
| **Point Cloud Count** | `FarmerDashboard.tsx` (Analytical Panel) | `POST /api/processing/reconstruction` | `heap_reconstructions.point_cloud_count` | **Actual Triangulated 3D Point Count** |
| **Vertical Accuracy RMSE**| `FarmerDashboard.tsx` (Analytical Panel) | `POST /api/processing/reconstruction` | `heap_reconstructions.rmse_vertical_cm` | **Actual RANSAC Ground Residual (cm)** |
| **Reprojection RMSE** | `FarmerDashboard.tsx` (Analytical Panel) | `POST /api/processing/reconstruction` | `recon_result.quality.reprojection_rmse_px` | **Real ORB Epipolar Reprojection Error** |
| **Historical Benchmark** | `FarmerDashboard.tsx` (Yield Estimates) | Dynamic calculation | `N/A` | **Labelled as Odisha Baseline Datum (15.4–18.2 Q/ac)** |
| **Parcel Yield Breakdown** | `FarmerDashboard.tsx` (Parcels Table) | Dynamic mapping from DB | `farmer_parcels` + `heap_reconstructions` | **Real Scan Association (Removed fake multiplier `* 28.53`)** |
| **Assessment Report Hash** | `FarmerDashboard.tsx` (Certificates Tab) | `GET /api/yield-estimates` | `yield_certificates.verification_hash` | **SHA-256 Cryptographic Hash** |
| **PDF Report Generation** | `FarmerDashboard.tsx` (Certificates Tab) | `GET /api/yield-estimates/{id}/pdf` | ReportLab dynamic compilation | **Real PDF Byte Stream with Embedded QR Code** |
| **Public QR Verification**| External Scan URL | `GET /api/yield-estimates/verify/{token}` | `yield_certificates` | **Cryptographic SHA-256 Digest Match** |

---

## 3. Removals & Neutralizations

1. **Arbitrary Multiplier Formulations Removed:**
   - Previous formula in `FarmerDashboard.tsx`: `vol = p.area_acres * 28.53` and `mass = p.area_acres * 164.9` — **Deleted**. Replaced with real linked reconstruction volume or explicit empty state (`Awaiting Scan`).
   - Removed hardcoded fallback `128.40 m³` and `742.15 Q` from dashboard state defaults.
2. **False Government Authority Badges Cleared:**
   - Default issuing authority changed from `District Agriculture Office (DAO), Cuttack` to `AgriSentinel Technical Assessment System`.
   - Authorized signatory changed from `DAO Verification Officer` to `AgriSentinel Automated Engine`.
   - Added mandatory legal disclaimer stating reports are technical advisories and not statutory land/crop insurance certificates.
3. **Map Overlap Cleared:**
   - Eliminated permanent tooltips on parcel polygons in `InteractiveGISParcelMap.tsx` (`permanent: false`). Labels only appear on deliberate user hover or click.
   - Added `map.invalidateSize()` lifecycle hooks to ensure tile rendering on mount.

