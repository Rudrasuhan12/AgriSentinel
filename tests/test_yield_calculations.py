import pytest
import math
from app.services.yield_engine import (
    yield_engine,
    YieldEngine,
    HeapMeasurement,
    DensityProvenance,
    STANDARD_SWARNA_BULK_DENSITY,
)


def test_single_heap_mass_standard():
    # 10 m3 of Swarna paddy at 578 kg/m3 = 5,780 kg = 57.8 quintals = 5.78 tonnes
    res = yield_engine.calculate_single_heap_mass(
        volume_m3=10.0,
        bulk_density_kg_m3=STANDARD_SWARNA_BULK_DENSITY,
        provenance=DensityProvenance.ASSUMED_STANDARD,
        heap_id="heap-test-1"
    )
    assert res.volume_m3 == 10.0
    assert res.volume_liters == 10000.0
    assert res.bulk_density_kg_m3 == 578.0
    assert res.mass_kg == 5780.0
    assert res.mass_quintals == 57.8
    assert res.mass_tonnes == 5.78


def test_cylinder_bulk_density_calibration():
    # Standard 1-liter cylinder: r = 5.319 cm, h = 11.25 cm -> V approx 1000 cm3
    # r = 5 cm, h = 12.7324 cm -> V = pi * 25 * 12.7324 approx 1000 cm3 = 0.001 m3
    # Grain net mass = 578 g = 0.578 kg -> rho = 578 kg/m3
    r = 5.0
    h = 1000.0 / (math.pi * 25.0)  # exactly 1000 cm3
    calib = yield_engine.calibrate_bulk_density(
        cylinder_radius_cm=r,
        cylinder_height_cm=h,
        mass_empty_cylinder_grams=250.0,
        mass_filled_cylinder_grams=828.0,  # 828 - 250 = 578 grams
        moisture_percent=14.0
    )
    assert calib["calibrated_density_kg_m3"] == 578.0
    assert calib["provenance"] == "Experimentally calibrated"


def test_multi_heap_yield_estimation_average_odisha():
    # Scenario: 2.50 acre parcel in Cuttack, Odisha
    # Heap 1: 10.0 m3 @ 578 kg/m3 = 5780 kg = 57.8 Q
    # Heap 2: 5.0 m3 @ 578 kg/m3 = 2890 kg = 28.9 Q
    # Total mass = 8670 kg = 86.7 Q
    # Total volume = 15.0 m3
    # Yield = 86.7 Q / 2.50 ac = 34.68 Q/ac (High yield / good harvest)
    heaps = [
        HeapMeasurement(heap_id="h1", volume_cubic_meters=10.0),
        HeapMeasurement(heap_id="h2", volume_cubic_meters=5.0),
    ]
    result = yield_engine.estimate_total_yield(
        heaps=heaps,
        parcel_area_acres=2.50
    )
    assert result.total_heaps == 2
    assert result.total_volume_m3 == 15.0
    assert result.total_mass_kg == 8670.0
    assert result.total_mass_quintals == 86.7
    assert result.parcel_area_acres == 2.50
    assert result.yield_quintals_per_acre == pytest.approx(34.68, 0.01)
    assert result.is_outlier is False


def test_yield_outlier_detection_extreme_high():
    # Extremely unrealistic volume for a 1-acre plot: 30 m3 -> ~173 Q/ac
    heaps = [
        HeapMeasurement(heap_id="h-outlier", volume_cubic_meters=30.0)
    ]
    result = yield_engine.estimate_total_yield(
        heaps=heaps,
        parcel_area_acres=1.0
    )
    assert result.is_outlier is True
    assert "exceeds standard physical ceiling" in result.outlier_reason


def test_yield_outlier_detection_extreme_low():
    # Unrealistically low volume: 0.5 m3 for 3 acres -> 2.89 Q / 3 ac = 0.96 Q/ac
    heaps = [
        HeapMeasurement(heap_id="h-low", volume_cubic_meters=0.5)
    ]
    result = yield_engine.estimate_total_yield(
        heaps=heaps,
        parcel_area_acres=3.0
    )
    assert result.is_outlier is True
    assert "below viable threshold" in result.outlier_reason


def test_negative_volume_rejection():
    with pytest.raises(Exception):
        yield_engine.calculate_single_heap_mass(volume_m3=-5.0)


def test_invalid_area_rejection():
    heaps = [HeapMeasurement(heap_id="h1", volume_cubic_meters=10.0)]
    with pytest.raises(ValueError):
        yield_engine.estimate_total_yield(heaps=heaps, parcel_area_acres=0.0)
