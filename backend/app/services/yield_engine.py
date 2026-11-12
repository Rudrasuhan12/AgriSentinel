"""
AgriSentinel Yield Estimation & Volume-to-Mass Engine
Authoritative calculations for rough rice paddy volume, mass conversion,
multi-heap aggregation, unit-area yields, regional benchmark comparisons,
and experimental bulk density calibrations according to Odisha agricultural standards.
"""

from __future__ import annotations
import math
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DensityProvenance(str, Enum):
    ASSUMED_STANDARD = "Assumed (standard table)"
    REFERENCE_MEASURED = "Reference measured"
    EXPERIMENTALLY_CALIBRATED = "Experimentally calibrated"


# Authoritative Swarna (MTU-7029) rough rice paddy bulk density at 14% standardized moisture
STANDARD_SWARNA_BULK_DENSITY = 578.0  # kg/m^3

# Regional CCE Benchmarks for Odisha (Cuttack District Paddy)
REGIONAL_BENCHMARK_AVG_MIN_Q_HA = 38.0
REGIONAL_BENCHMARK_AVG_MAX_Q_HA = 45.0
REGIONAL_BENCHMARK_HIGH_MIN_Q_HA = 50.0
REGIONAL_BENCHMARK_HIGH_MAX_Q_HA = 65.0

OUTLIER_MIN_Q_ACRE = 5.0
OUTLIER_MAX_Q_ACRE = 35.0

# Conversion constants
M3_TO_LITERS = 1000.0
KG_PER_QUINTAL = 100.0
KG_PER_TONNE = 1000.0
ACRES_PER_HECTARE = 2.47105381
HECTARES_PER_ACRE = 0.40468564
SQM_PER_ACRE = 4046.8564224
SQM_PER_HECTARE = 10000.0


class HeapMeasurement(BaseModel):
    heap_id: str
    volume_cubic_meters: float = Field(..., ge=0.0, description="3D Photogrammetric volume strictly above base plane in m3")
    bulk_density_kg_m3: float = Field(default=STANDARD_SWARNA_BULK_DENSITY, gt=300.0, lt=900.0)
    density_provenance: DensityProvenance = DensityProvenance.ASSUMED_STANDARD
    moisture_content_percent: float = Field(default=14.0, ge=8.0, le=25.0)
    footprint_area_sqm: Optional[float] = Field(default=None, ge=0.0)


class HeapMassResult(BaseModel):
    heap_id: str
    volume_m3: float
    volume_liters: float
    bulk_density_kg_m3: float
    density_provenance: DensityProvenance
    mass_kg: float
    mass_quintals: float
    mass_tonnes: float


class YieldEstimationResult(BaseModel):
    total_heaps: int
    total_volume_m3: float
    total_volume_liters: float
    total_mass_kg: float
    total_mass_quintals: float
    total_mass_tonnes: float
    
    # Area measurements
    parcel_area_acres: float
    parcel_area_hectares: float
    parcel_area_sqm: float
    
    # Yield outputs
    yield_quintals_per_acre: float
    yield_tonnes_per_hectare: float
    yield_kg_per_sqm: float
    
    # Provenance and moisture
    dominant_density_provenance: DensityProvenance
    weighted_bulk_density_kg_m3: float
    
    # Regional comparison & QA
    benchmark_status: str  # "Below Average", "Regional Average (Cuttack)", "High Yield", "Exceptional Yield"
    is_outlier: bool
    outlier_reason: Optional[str] = None
    
    individual_heaps: List[HeapMassResult]


class YieldEngine:
    """
    Stateless, verified agricultural engineering yield calculation engine.
    """

    @staticmethod
    def calculate_single_heap_mass(
        volume_m3: float,
        bulk_density_kg_m3: float = STANDARD_SWARNA_BULK_DENSITY,
        provenance: DensityProvenance = DensityProvenance.ASSUMED_STANDARD,
        heap_id: str = "heap-1"
    ) -> HeapMassResult:
        """
        Calculates mass from volume and bulk density: M = V * rho.
        """
        if volume_m3 < 0:
            raise ValueError(f"Volume cannot be negative: {volume_m3}")
        if bulk_density_kg_m3 <= 0:
            raise ValueError(f"Bulk density must be positive: {bulk_density_kg_m3}")

        mass_kg = volume_m3 * bulk_density_kg_m3
        mass_quintals = mass_kg / KG_PER_QUINTAL
        mass_tonnes = mass_kg / KG_PER_TONNE
        volume_liters = volume_m3 * M3_TO_LITERS

        return HeapMassResult(
            heap_id=heap_id,
            volume_m3=round(volume_m3, 4),
            volume_liters=round(volume_liters, 2),
            bulk_density_kg_m3=round(bulk_density_kg_m3, 2),
            density_provenance=provenance,
            mass_kg=round(mass_kg, 2),
            mass_quintals=round(mass_quintals, 3),
            mass_tonnes=round(mass_tonnes, 4)
        )

    @classmethod
    def calibrate_bulk_density(
        cls,
        cylinder_radius_cm: float,
        cylinder_height_cm: float,
        mass_empty_cylinder_grams: float,
        mass_filled_cylinder_grams: float,
        moisture_percent: float = 14.0
    ) -> Dict[str, Any]:
        """
        Calculates calibrated bulk density from physical cylinder measurements:
        V_cylinder = pi * r^2 * h
        rho = (m_filled - m_empty) / V_cylinder
        """
        if cylinder_radius_cm <= 0 or cylinder_height_cm <= 0:
            raise ValueError("Cylinder dimensions must be strictly positive.")
        if mass_filled_cylinder_grams <= mass_empty_cylinder_grams:
            raise ValueError("Filled mass must be strictly greater than empty mass.")

        # Volume in cm^3 (mL)
        volume_cm3 = math.pi * (cylinder_radius_cm ** 2) * cylinder_height_cm
        # Volume in m^3 (1 m^3 = 1,000,000 cm^3)
        volume_m3 = volume_cm3 / 1_000_000.0

        # Sample grain mass in grams -> kg
        sample_mass_grams = mass_filled_cylinder_grams - mass_empty_cylinder_grams
        sample_mass_kg = sample_mass_grams / 1000.0

        calibrated_density_kg_m3 = sample_mass_kg / volume_m3

        if calibrated_density_kg_m3 < 300.0 or calibrated_density_kg_m3 > 900.0:
            raise ValueError(
                f"Calibrated bulk density {calibrated_density_kg_m3:.1f} kg/m3 is outside standard rough rice range (300-900 kg/m3)."
            )

        return {
            "calibrated_density_kg_m3": round(calibrated_density_kg_m3, 2),
            "cylinder_volume_liters": round(volume_cm3 / 1000.0, 4),
            "sample_net_mass_kg": round(sample_mass_kg, 4),
            "moisture_content_percent": moisture_percent,
            "provenance": DensityProvenance.EXPERIMENTALLY_CALIBRATED.value
        }

    @classmethod
    def estimate_total_yield(
        cls,
        heaps: List[HeapMeasurement],
        parcel_area_acres: Optional[float] = None,
        parcel_area_hectares: Optional[float] = None,
        parcel_area_sqm: Optional[float] = None,
    ) -> YieldEstimationResult:
        """
        Aggregates multiple paddy heap scans for a harvested parcel and computes total yield metrics.
        Handles unit conversions: m^3 -> L, kg -> quintals (100 kg) -> tonnes (1000 kg), acres <-> hectares <-> sqm.
        Evaluates against Cuttack, Odisha regional CCE benchmarks.
        """
        if not heaps:
            raise ValueError("At least one heap measurement is required for yield estimation.")

        # Area normalization
        if parcel_area_acres is not None and parcel_area_acres > 0:
            area_acres = parcel_area_acres
            area_ha = area_acres * HECTARES_PER_ACRE
            area_sqm = area_acres * SQM_PER_ACRE
        elif parcel_area_hectares is not None and parcel_area_hectares > 0:
            area_ha = parcel_area_hectares
            area_acres = area_ha * ACRES_PER_HECTARE
            area_sqm = area_ha * SQM_PER_HECTARE
        elif parcel_area_sqm is not None and parcel_area_sqm > 0:
            area_sqm = parcel_area_sqm
            area_acres = area_sqm / SQM_PER_ACRE
            area_ha = area_sqm / SQM_PER_HECTARE
        else:
            raise ValueError("A valid positive parcel area (acres, hectares, or sqm) must be provided.")

        total_volume_m3 = 0.0
        total_mass_kg = 0.0
        individual_results: List[HeapMassResult] = []
        provenances = []

        for h in heaps:
            res = cls.calculate_single_heap_mass(
                volume_m3=h.volume_cubic_meters,
                bulk_density_kg_m3=h.bulk_density_kg_m3,
                provenance=h.density_provenance,
                heap_id=h.heap_id
            )
            individual_results.append(res)
            total_volume_m3 += res.volume_m3
            total_mass_kg += res.mass_kg
            provenances.append(h.density_provenance)

        total_volume_liters = total_volume_m3 * M3_TO_LITERS
        total_mass_quintals = total_mass_kg / KG_PER_QUINTAL
        total_mass_tonnes = total_mass_kg / KG_PER_TONNE

        # Weighted bulk density
        weighted_density = (total_mass_kg / total_volume_m3) if total_volume_m3 > 0 else STANDARD_SWARNA_BULK_DENSITY

        # Dominant provenance
        if DensityProvenance.EXPERIMENTALLY_CALIBRATED in provenances:
            dominant_prov = DensityProvenance.EXPERIMENTALLY_CALIBRATED
        elif DensityProvenance.REFERENCE_MEASURED in provenances:
            dominant_prov = DensityProvenance.REFERENCE_MEASURED
        else:
            dominant_prov = DensityProvenance.ASSUMED_STANDARD

        # Unit-area yields
        yield_q_per_acre = total_mass_quintals / area_acres
        yield_tonnes_per_ha = total_mass_tonnes / area_ha
        yield_kg_per_sqm = total_mass_kg / area_sqm

        # Benchmark comparison based on Cuttack Kharif Paddy CCE standards
        # Note: 1 tonne/ha = 10 quintals/ha
        yield_q_per_ha = yield_tonnes_per_ha * 10.0

        if yield_q_per_ha < REGIONAL_BENCHMARK_AVG_MIN_Q_HA:
            benchmark_status = "Below Average"
        elif yield_q_per_ha <= REGIONAL_BENCHMARK_AVG_MAX_Q_HA:
            benchmark_status = "Regional Average (Cuttack)"
        elif yield_q_per_ha <= REGIONAL_BENCHMARK_HIGH_MAX_Q_HA:
            benchmark_status = "High Yield"
        else:
            benchmark_status = "Exceptional Yield"

        # Outlier detection
        is_outlier = False
        outlier_reason = None
        if yield_q_per_acre > OUTLIER_MAX_Q_ACRE:
            is_outlier = True
            outlier_reason = (
                f"Estimated yield of {yield_q_per_acre:.2f} quintals/acre exceeds standard physical ceiling ({OUTLIER_MAX_Q_ACRE} Q/ac). "
                "Possible overestimation in heap DEM volume or uncompressed straw inclusion."
            )
        elif yield_q_per_acre < OUTLIER_MIN_Q_ACRE:
            is_outlier = True
            outlier_reason = (
                f"Estimated yield of {yield_q_per_acre:.2f} quintals/acre is below viable threshold ({OUTLIER_MIN_Q_ACRE} Q/ac). "
                "Verify if additional threshing yard heaps remain unmeasured."
            )

        return YieldEstimationResult(
            total_heaps=len(heaps),
            total_volume_m3=round(total_volume_m3, 3),
            total_volume_liters=round(total_volume_liters, 1),
            total_mass_kg=round(total_mass_kg, 2),
            total_mass_quintals=round(total_mass_quintals, 2),
            total_mass_tonnes=round(total_mass_tonnes, 3),
            parcel_area_acres=round(area_acres, 2),
            parcel_area_hectares=round(area_ha, 3),
            parcel_area_sqm=round(area_sqm, 1),
            yield_quintals_per_acre=round(yield_q_per_acre, 2),
            yield_tonnes_per_hectare=round(yield_tonnes_per_ha, 2),
            yield_kg_per_sqm=round(yield_kg_per_sqm, 3),
            dominant_density_provenance=dominant_prov,
            weighted_bulk_density_kg_m3=round(weighted_density, 2),
            benchmark_status=benchmark_status,
            is_outlier=is_outlier,
            outlier_reason=outlier_reason,
            individual_heaps=individual_results
        )


yield_engine = YieldEngine()
