import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
import httpx
from app.config import settings


class CopernicusService:
    """
    Copernicus Data Space Ecosystem (CDSE) service for Sentinel-2 Level-2A imagery & analytics.
    Follows official CDSE STAC and Sentinel Hub API specifications:
    - https://documentation.dataspace.copernicus.eu/APIs/STAC.html
    - https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/
    """

    def __init__(self):
        self.auth_url = settings.COPERNICUS_AUTH_URL
        self.stac_url = settings.COPERNICUS_STAC_URL
        self.client_id = settings.COPERNICUS_CLIENT_ID
        self.client_secret = settings.COPERNICUS_CLIENT_SECRET
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None

    async def get_access_token(self) -> Optional[str]:
        """Obtain or refresh Copernicus OAuth2 Bearer token."""
        if not self.client_id or not self.client_secret:
            return None

        now = datetime.now(timezone.utc)
        if self._access_token and self._token_expires_at and now < self._token_expires_at:
            return self._access_token

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                data = {
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                }
                resp = await client.post(self.auth_url, data=data)
                if resp.status_code == 200:
                    token_data = resp.json()
                    self._access_token = token_data.get("access_token")
                    expires_in = token_data.get("expires_in", 3600)
                    self._token_expires_at = now + timedelta(seconds=expires_in - 60)
                    return self._access_token
        except Exception as e:
            print(f"[COPERNICUS] OAuth2 token acquisition failed: {e}")
        return None

    async def search_sentinel2_scenes(
        self,
        bbox: List[float], # [min_lon, min_lat, max_lon, max_lat]
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        max_cloud_cover: float = 30.0,
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Query Copernicus STAC Catalogue API for Sentinel-2 Level-2A acquisitions over parcel bbox.
        """
        if not end_date:
            end_date = datetime.now(timezone.utc)
        if not start_date:
            start_date = end_date - timedelta(days=30)

        datetime_str = f"{start_date.strftime('%Y-%m-%dT%H:%M:%SZ')}/{end_date.strftime('%Y-%m-%dT%H:%M:%SZ')}"

        stac_search_payload = {
            "collections": ["sentinel-2-l2a"],
            "bbox": bbox,
            "datetime": datetime_str,
            "query": {
                "eo:cloud_cover": {"lte": max_cloud_cover}
            },
            "limit": limit
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    f"{self.stac_url}/search",
                    json=stac_search_payload,
                    headers={"Content-Type": "application/json"}
                )

                if resp.status_code == 200:
                    data = resp.json()
                    features = data.get("features", [])
                    scenes = []
                    for f in features:
                        props = f.get("properties", {})
                        scenes.append({
                            "id": f.get("id"),
                            "collection": f.get("collection", "sentinel-2-l2a"),
                            "datetime": props.get("datetime"),
                            "cloud_cover": props.get("eo:cloud_cover", 0.0),
                            "platform": props.get("platform", "Sentinel-2"),
                            "instrument": props.get("instruments", ["MSI"]),
                            "bbox": f.get("bbox"),
                            "thumbnail_url": f.get("assets", {}).get("thumbnail", {}).get("href")
                        })
                    
                    return {
                        "status": "SUCCESS",
                        "count": len(scenes),
                        "scenes": scenes,
                        "provider": "Copernicus Data Space Ecosystem (Sentinel-2 L2A)",
                        "query_window": datetime_str
                    }
                else:
                    return {
                        "status": "UNAVAILABLE",
                        "message": f"Copernicus STAC returned HTTP {resp.status_code}",
                        "count": 0,
                        "scenes": []
                    }
        except Exception as e:
            return {
                "status": "UNAVAILABLE",
                "message": f"Copernicus STAC connection failed: {str(e)}",
                "count": 0,
                "scenes": []
            }

    def calculate_theoretical_ndvi_range(
        self,
        crop_type: str,
        growth_stage: str = "flowering"
    ) -> Dict[str, float]:
        """
        Documented agronomical NDVI ranges for paddy (Oryza sativa) based on ICAR-NRRI Cuttack research:
        - Seedling / Transplanting: 0.20 - 0.35
        - Tillering: 0.35 - 0.55
        - Panicle Initiation / Flowering: 0.65 - 0.82
        - Ripening / Maturity: 0.40 - 0.60
        - Post-harvest stubble: 0.15 - 0.25
        """
        growth_stage_clean = growth_stage.lower()
        if "seedling" in growth_stage_clean or "transplant" in growth_stage_clean:
            return {"min": 0.20, "max": 0.35, "typical": 0.28, "canopy_status": "Emergence"}
        elif "tiller" in growth_stage_clean:
            return {"min": 0.35, "max": 0.55, "typical": 0.46, "canopy_status": "Vegetative Growth"}
        elif "flower" in growth_stage_clean or "heading" in growth_stage_clean:
            return {"min": 0.65, "max": 0.82, "typical": 0.74, "canopy_status": "Peak Canopy"}
        elif "ripen" in growth_stage_clean or "matur" in growth_stage_clean or "harvest" in growth_stage_clean:
            return {"min": 0.40, "max": 0.60, "typical": 0.48, "canopy_status": "Senescence / Ripening"}
        else:
            return {"min": 0.30, "max": 0.75, "typical": 0.50, "canopy_status": "Active Crop"}


copernicus_service = CopernicusService()

