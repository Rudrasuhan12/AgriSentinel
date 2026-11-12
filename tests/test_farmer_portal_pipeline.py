import pytest
import numpy as np
import cv2
from app.core.photogrammetry.photogrammetry_pipeline import photogrammetry_engine
from app.ml.infer import paddy_inference_service
from app.services.yield_engine import yield_engine, HeapMeasurement, STANDARD_SWARNA_BULK_DENSITY


def test_paddy_canopy_segmentation_pipeline():
    """Verify U-Net inference on a test vegetative agricultural field frame."""
    # Synthetic 256x256 agricultural image (paddy canopy green)
    img_bgr = np.zeros((256, 256, 3), dtype=np.uint8)
    img_bgr[:, :, 1] = 160  # Green
    img_bgr[:, :, 0] = 50   # Blue
    img_bgr[:, :, 2] = 60   # Red

    res = paddy_inference_service.predict_canopy(img_bgr)
    assert "canopy_coverage_percent" in res
    assert "vegetative_health_index" in res
    assert res["model_architecture"] == "Paddy Canopy U-Net (v1.2.0)"
    assert res["canopy_coverage_percent"] >= 0.0


def test_photogrammetry_reconstruction_pipeline(tmp_path):
    """Verify multi-view photogrammetry engine with valid test frames."""
    # Generate 4 distinct multi-view frames with texture
    image_paths = []
    for i in range(4):
        p = tmp_path / f"frame_{i}.jpg"
        img = np.full((320, 320, 3), (110 + i * 5, 150 + i * 3, 170 + i * 2), dtype=np.uint8)
        # Add high-frequency noise for ORB feature keypoint detection
        noise = np.random.randint(0, 50, (320, 320, 3), dtype=np.uint8)
        img = cv2.add(img, noise)
        cv2.imwrite(str(p), img)
        image_paths.append(str(p))

    recon = photogrammetry_engine.reconstruct_from_image_files(
        image_files=image_paths,
        survey_id="TEST-SRV-01",
        heap_id="TEST-HEAP-01",
        reference_scale_bar_meters=1.0,
        known_bulk_density_kg_m3=STANDARD_SWARNA_BULK_DENSITY
    )

    assert recon.volume_m3 > 0.0
    assert recon.estimated_mass_quintals > 0.0
    assert recon.quality.reconstruction_status == "COMPLETED_METRIC_VERIFIED"
    assert recon.quality.vertical_accuracy_cm <= 2.0
    assert len(recon.point_cloud["vertices"]) > 0
    assert len(recon.mesh["indices"]) > 0


def test_yield_engine_benchmark_accuracy():
    """Verify yield per unit area against Cuttack historical benchmarks."""
    # 2.0 acres parcel with 8.0 m3 paddy heap scan
    # Mass = 8.0 * 578 = 4624 kg = 46.24 Q
    # Yield = 46.24 / 2.0 = 23.12 Q/ac
    heaps = [HeapMeasurement(heap_id="h1", volume_cubic_meters=8.0)]
    res = yield_engine.estimate_total_yield(heaps=heaps, parcel_area_acres=2.0)

    assert res.total_volume_m3 == 8.0
    assert res.total_mass_quintals == 46.24
    assert res.yield_quintals_per_acre == 23.12
    assert res.benchmark_status in ["Regional Average (Cuttack)", "High Yield"]
    assert res.is_outlier is False

