import os
import cv2
import numpy as np
from typing import Dict, Any, Tuple

from app.ml.model import PaddySegmentationUNet
from app.ml.preprocess import preprocess_image


class PaddyInferenceService:
    """
    Inference service for field image processing and vegetative canopy segmentation.
    Produces segmented masks, canopy coverage percentage, and vegetative health metrics.
    """

    def __init__(self, weights_path: str | None = None):
        if weights_path is None:
            weights_path = os.path.join(os.path.dirname(__file__), "weights", "paddy_segmentation_unet.npz")
        self.model = PaddySegmentationUNet(in_channels=3, base_filters=16)
        if os.path.exists(weights_path):
            self.model.load_weights(weights_path)
            self.loaded = True
        else:
            self.loaded = False

    def predict_canopy(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Runs inference on an agricultural field image.
        Returns canopy mask, vegetative coverage percentage, and health status.
        """
        orig_h, orig_w = image_bgr.shape[:2]
        processed = preprocess_image(image_bgr, target_size=(256, 256))
        pred_prob = self.model.forward(processed)
        pred_bin = (pred_prob > 0.5).astype(np.uint8)

        # Resize mask back to original resolution
        full_mask = cv2.resize(pred_bin, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)

        canopy_pixels = int(np.sum(full_mask))
        total_pixels = int(orig_h * orig_w)
        canopy_coverage_percent = round((canopy_pixels / total_pixels) * 100.0, 2)

        # Estimate average vegetative vitality (NDVI proxy from Green-Red contrast)
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
        r = rgb[:, :, 0]
        g = rgb[:, :, 1]
        ndvi_proxy = np.mean((g - r) / (g + r + 1e-6))
        normalized_health = round(float(np.clip((ndvi_proxy + 0.1) * 2.5, 0.0, 1.0)), 2)

        return {
            "canopy_coverage_percent": canopy_coverage_percent,
            "vegetative_health_index": normalized_health,
            "classified_state": "VIGOROUS_PADDY_GROWTH" if normalized_health > 0.65 else "MODERATE_VEGETATION",
            "mask_shape": [orig_h, orig_w],
            "model_architecture": "Paddy Canopy U-Net (v1.2.0)"
        }


paddy_inference_service = PaddyInferenceService()
