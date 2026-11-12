# AgriSentinel

## UAV-Based Intelligent Agricultural Field Assessment and Paddy Yield Estimation System

> **Academic Project Notice:** AgriSentinel is an applied research and engineering initiative developed as a B.Tech Robotics & Artificial Intelligence capstone project.

---

### Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Key Objectives](#key-objectives)
4. [Proposed System Workflow](#proposed-system-workflow)
5. [Planned Technology Stack](#planned-technology-stack)
6. [Repository Structure](#repository-structure)
7. [Installation & Setup](#installation--setup)
8. [Development Roadmap](#development-roadmap)
9. [Project Status](#project-status)
10. [License](#license)

---

### Project Overview

AgriSentinel is an end-to-end aerial intelligence and agricultural monitoring platform. The system is designed to streamline field registration, integrate high-resolution satellite basemaps with Unmanned Aerial Vehicle (UAV) survey missions, orchestrate photogrammetric 3D surface reconstruction of harvested paddy heaps, and compute volumetric measurements to derive harvest mass and net field yield using empirical bulk density calibration models.

By bridging automated drone photogrammetry and agronomic analytics, AgriSentinel replaces manual, error-prone crop cutting experiments with rapid, non-destructive, and spatially auditable yield estimation.

---

### Problem Statement

Traditional agricultural harvest assessment and post-harvest grain verification rely heavily on:
1. **Manual Crop Cutting Experiments (CCEs):** Labor-intensive sampling methods prone to human bias and statistical sampling error.
2. **Delayed Yield Reporting:** Extended lags between harvesting and administrative or insurance yield validation.
3. **Subjective Heap Sizing:** Visual approximation of threshed or harvested crop heaps resulting in inaccurate storage planning and supply chain forecasting.

Smallholder and medium-scale paddy producers require an accessible, accurate, and scalable solution that can digitize agricultural parcels, ingest aerial imagery captured via commercial off-the-shelf UAVs, and calculate reliable volumetric mass approximations of harvested paddy prior to transport.

---

### Key Objectives

- **Parcel Demarcation & Georeferencing:** Enable farmers and agronomists to register geospatial boundaries of agricultural plots on satellite basemaps.
- **Aerial Imagery Management:** Provide an ingestion interface for UAV survey runs, including geotagged oblique and nadir image sequences.
- **Photogrammetric 3D Heap Reconstruction:** Generate dense point clouds, digital surface models (DSMs), and 3D triangle meshes from UAV datasets.
- **Volumetric Approximation:** Segment ground planes and calculate net volumes ($m^3$) of irregular paddy piles.
- **Calibrated Mass & Yield Computation:** Apply laboratory-calibrated grain bulk density ($\rho_{bulk}$ in $kg/m^3$) to estimate harvested grain weight ($kg$) and area-normalized yield ($metric\ tons/ha$).
- **Spatial Auditing & Reporting:** Produce verifiable diagnostic reports detailing plot boundaries, flight parameters, reconstructed geometry, and computed yields.

---

### Proposed System Workflow

```
+--------------------------+       +------------------------------+
| 1. Field Demarcation     |  -->  | 2. UAV Aerial Survey         |
| - Satellite map boundary |       | - Automated flight path      |
| - Plot registration      |       | - High-overlap geotagged RGB |
+--------------------------+       +------------------------------+
                                                  |
                                                  v
+--------------------------+       +------------------------------+
| 4. Volumetric Extraction |  <--  | 3. Photogrammetry Pipeline   |
| - Ground plane fitting   |       | - SfM / MVS reconstruction   |
| - Heap mesh segmentation |       | - Dense point cloud & DSM    |
| - Net volume ($V$) calc  |       +------------------------------+
+--------------------------+
             |
             v
+-----------------------------------------------------------------+
| 5. Yield & Mass Estimation                                      |
| - Bulk density calibration ($M = V \times \rho_{bulk}$)         |
| - Moisture correction factor                                    |
| - Area-normalized yield output ($Yield = M / Area$)             |
+-----------------------------------------------------------------+
             |
             v
+-----------------------------------------------------------------+
| 6. Presentation & Analytic Reporting                            |
| - Web dashboard visualization                                   |
| - Exportable field yield certifications                         |
+-----------------------------------------------------------------+
```

---

### Planned Technology Stack

> *Note: These components reflect the architectural target for upcoming implementation phases.*

| Subsystem | Planned Technologies | Role / Description |
| :--- | :--- | :--- |
| **Frontend** | React / TypeScript / Vite | Single-page user application & responsive dashboard |
| **Mapping & GIS UI** | Leaflet / MapLibre GL | Interactive parcel registration and raster overlay |
| **3D Visualization** | Three.js / WebGL | Interactive browser-based point cloud and mesh viewer |
| **Backend API** | Python (FastAPI / Uvicorn) | Asynchronous RESTful API orchestrating tasks & metadata |
| **Spatial Database** | PostgreSQL + PostGIS | Geodatabase storing plot polygons, flights, and metrics |
| **Photogrammetry & 3D** | OpenSfM / OpenDroneMap / Open3D | Structure-from-Motion (SfM), point cloud filtering & meshing |
| **Numerical Processing** | NumPy / SciPy / Shapely | Spatial polygon operations, plane-fitting & volumetric calculus |
| **Containerization** | Docker / Docker Compose | Reproducible environment for API, spatial DB, and photogrammetry engines |

---

### Repository Structure

```text
AgriSentinel/
├── frontend/             # Single-page web application (React / TypeScript)
├── backend/              # Core API server, computation services & geospatial routines
├── docs/                 # Architectural specifications, project documentation & research notes
├── datasets/             # Data directory for aerial imagery and photogrammetric assets
│   ├── raw/              # Unprocessed drone captures and flight mission data (git-ignored)
│   ├── processed/        # Generated point clouds, DSMs, and orthomosaics (git-ignored)
│   └── sample/           # Low-resolution sample assets for validation and test suites
├── experiments/          # Exploratory notebooks, density calibrations & algorithm prototyping
├── scripts/              # Utility automation, data ingestion & calibration helpers
├── tests/                # Unit, integration, and end-to-end test suites
├── .gitignore            # Git exclusion rules for large datasets, point clouds & env secrets
├── .env.example          # Environment variable template for system configuration
├── README.md             # Project documentation and architectural overview
└── LICENSE               # Open-source MIT License
```

---

### Implemented Authentication & Database Architecture

AgriSentinel provides a robust, production-grade authentication and authorization foundation built for agricultural and governmental multi-tenancy:

1. **Dockerized PostgreSQL 16 + PostGIS 3.5:**
   - Dedicated PostGIS database container initialized via `docker-compose.yml`.
   - Host port default: `5436` (internal container port `5432`) to prevent conflicts with standard local databases.
   - Persistent volume: `agrisentinel_pgdata`.

2. **Security & Session Architecture:**
   - **Password Security:** Salted `bcrypt` hashing (12 rounds) with OWASP-aligned complexity rules.
   - **Access Tokens:** Signed asymmetric-compatible JWTs (HS256 default, 60-minute expiry) containing user role and verified status.
   - **Refresh Tokens:** Cryptographically random (64-byte URL-safe) tokens stored as SHA-256 hashes in `user_sessions` with single-use rotation and revocation.
   - **Rate Limiting & Consent Logging:** Consent timestamps (`terms`, `privacy`, `field_data_processing`) recorded with client IP and user agent.

3. **Multi-Role Access Control (RBAC):**
   - **`FARMER`:** Instant access upon phone verification; land parcel cadastral records, NDVI vegetation status, and 3D heap reconstruction records.
   - **`GOVERNMENT_OFFICIAL`:** Requires submission of department, designation, employee ID, and jurisdiction district; account status remains `PENDING` until approved by an administrator.
   - **`ADMIN`:** System governance console with live pending request review (`Approve` / `Reject`), user audit trails, and PostGIS infrastructure monitoring. Development admin automatically bootstrapped via environment settings.

4. **Colorful, Modern Authentication UI:**
   - Responsive split-screen design featuring a 50–55% desktop visual showcase with dynamic layered farm landscapes, animated UAV telemetry, coordinate scanners, and floating crop analytics.
   - Vibrant palette combining emerald green, lime, teal, turquoise, warm yellow, soft cream, and light sky blue.
   - 4-step progressive farmer registration with dependent Odisha administrative divisions (District -> Block -> Village) and mobile number authentication.

---

### Installation & Setup

#### 1. Configure Environment Variables

Copy the template to your local `.env`:

```bash
cp .env.example .env
```

Default local database port is set to `5436` in `.env.example`:
```env
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5436
POSTGRES_DB=agrisentinel_db
POSTGRES_USER=agrisentinel_admin
POSTGRES_PASSWORD=AgrisentinelSecure2026!
```

#### 2. Start PostgreSQL + PostGIS via Docker

```bash
docker compose up -d
```

Verify the container is healthy:
```bash
docker ps --filter "name=agrisentinel_db"
```

#### 3. Backend Service Setup (FastAPI)

```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

*The database tables and development administrator account (`admin@agrisentinel.local`) are automatically initialized on application startup.*

#### 4. Frontend Application (React + Vite + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173/` in your browser.

#### 5. Running the Test Suite

```bash
pytest -v
```

---

### API Endpoints Summary

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health & database connectivity check | Public |
| `POST` | `/api/auth/register/farmer` | Register farmer with Odisha profile & consent log | Public |
| `POST` | `/api/auth/register/official-request` | Submit government official access request | Public |
| `POST` | `/api/auth/login` | Authenticate with email/mobile and password | Public |
| `POST` | `/api/auth/refresh` | Rotate single-use refresh token for new access token | Public |
| `POST` | `/api/auth/logout` | Revoke active session refresh token | Authenticated |
| `GET` | `/api/auth/me` | Fetch authenticated user profile and permissions | Authenticated |
| `GET` | `/api/admin/official-requests` | List official access requests | Admin only |
| `POST` | `/api/admin/official-requests/{id}/approve` | Approve government official account | Admin only |
| `POST` | `/api/admin/official-requests/{id}/reject` | Reject government official account | Admin only |

---

### Development Roadmap

- [x] **Phase 0: Repository Architecture & Project Inception**
  - [x] Repository initialization with standard structure
  - [x] Comprehensive `.gitignore` for geospatial and photogrammetric assets
  - [x] Environment configuration template (`.env.example`)
  - [x] Baseline project documentation and architectural specifications
- [ ] **Phase 1: Backend Scaffolding & Geospatial Foundation**
  - [ ] FastAPI service structure and configuration loading
  - [ ] PostGIS database models (Parcels, Flights, Surveys, HeapResults)
  - [ ] Field demarcation API endpoints and GeoJSON validation
- [ ] **Phase 2: Frontend Parcel Management & GIS Mapping**
  - [ ] Interactive map interface for plot boundary drawing
  - [ ] Aerial survey metadata upload and flight mission logging
- [ ] **Phase 3: Photogrammetry & Volumetric Computation Pipeline**
  - [ ] Ingestion of UAV image sequences
  - [ ] Open3D / SfM pipeline integration for heap point cloud generation
  - [ ] Ground plane segmentation and Delaunay/voxel volume integration
- [ ] **Phase 4: Calibration, Yield Calculation & Reporting**
  - [ ] Empirical bulk density calibration module
  - [ ] Moisture-adjusted yield estimation
  - [ ] Web-based 3D heap viewer and automated PDF summary generation

---

### Project Status

| Area | Current Status | Notes |
| :--- | :--- | :--- |
| **Repository Initialization** | **Complete** | Standard structure, Git configuration, and documentation verified |
| **Frontend Application** | *Not Started* | Scaffolding pending Phase 2 |
| **Backend API** | *Not Started* | Architectural planning complete; scaffolding pending Phase 1 |
| **Photogrammetry Engine** | *Not Started* | Pipeline design documented; implementation pending Phase 3 |
| **Dataset Ingestion** | *Not Started* | Directory structure initialized; sample fixtures pending |

---

### License

This project is licensed under the terms of the [MIT License](LICENSE).
