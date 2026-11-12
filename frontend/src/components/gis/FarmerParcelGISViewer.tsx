import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft, 
  MapPin, 
  Layers, 
  Download, 
  Maximize2, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Sprout, 
  Compass, 
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../../api/client';

export interface ParcelDetail {
  id: string;
  parcel_code: string;
  khata_number: string;
  plot_number: string;
  state: string;
  district: string;
  sub_district: string;
  village: string;
  primary_crop: string;
  area_acres: number;
  recorded_area_acres?: number | null;
  calculated_area_acres?: number | null;
  farmer_entered_area?: number | null;
  cadastral_reference?: string | null;
  geojson_geometry?: {
    type: string;
    coordinates: number[][][];
  } | null;
  bbox?: [number, number, number, number] | null;
  cadastral_source: string;
  verification_status: string;
  created_at: string;
  latest_ndvi?: number | null;
}

interface FarmerParcelGISViewerProps {
  parcelId: string;
  onBack: () => void;
  allParcels?: ParcelDetail[];
}

export const FarmerParcelGISViewer: React.FC<FarmerParcelGISViewerProps> = ({
  parcelId,
  onBack,
  allParcels = [],
}) => {
  const [parcel, setParcel] = useState<ParcelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBasemap, setActiveBasemap] = useState<'satellite' | 'streets'>('satellite');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const streetsLayerRef = useRef<L.TileLayer | null>(null);
  const targetPolygonRef = useRef<L.Polygon | null>(null);
  const neighborsGroupRef = useRef<L.FeatureGroup | null>(null);

  // 1. Fetch Parcel Record with Stored Geometry from Backend
  useEffect(() => {
    const fetchParcel = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<ParcelDetail>(`/api/farmer/parcels/${parcelId}`);
        setParcel(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load parcel geospatial records from PostGIS.');
      } finally {
        setLoading(false);
      }
    };
    fetchParcel();
  }, [parcelId]);

  // 2. Initialize Leaflet Map and Render Geometry
  useEffect(() => {
    if (!parcel || !mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Determine initial center
      let center: L.LatLngExpression = [20.4630, 85.8835];
      if (parcel.bbox) {
        center = [(parcel.bbox[1] + parcel.bbox[3]) / 2, (parcel.bbox[0] + parcel.bbox[2]) / 2];
      }

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 16,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // Basemap 1: Esri World Imagery (Satellite)
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
      satelliteLayerRef.current = satLayer;

      // Basemap 2: OpenStreetMap
      const streetsLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      streetsLayerRef.current = streetsLayer;

      // Reference Labels
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.8 }
      ).addTo(map);

      // Render Neighbor Parcels
      const neighborsGroup = L.featureGroup().addTo(map);
      neighborsGroupRef.current = neighborsGroup;

      allParcels
        .filter((p) => p.id !== parcel.id && p.geojson_geometry)
        .forEach((p) => {
          try {
            const ring = p.geojson_geometry!.coordinates[0];
            const latlngs: [number, number][] = ring.map((pt) => [pt[1], pt[0]]);
            const poly = L.polygon(latlngs, {
              color: '#94A3B8',
              weight: 1.5,
              dashArray: '4, 4',
              fillColor: '#64748B',
              fillOpacity: 0.15,
            });
            poly.bindTooltip(`Plot #${p.plot_number} (${p.parcel_code})`, {
              direction: 'center',
              className: 'font-mono text-[10px]',
            });
            neighborsGroup.addLayer(poly);
          } catch (e) {
            console.warn('Could not render neighbor parcel:', e);
          }
        });

      // Render Target Parcel Geometry
      if (parcel.geojson_geometry && parcel.geojson_geometry.coordinates) {
        const ring = parcel.geojson_geometry.coordinates[0];
        const latlngs: [number, number][] = ring.map((pt) => [pt[1], pt[0]]);

        const targetPoly = L.polygon(latlngs, {
          color: '#00A86B',
          weight: 3.5,
          fillColor: '#00E676',
          fillOpacity: 0.35,
        }).addTo(map);
        targetPolygonRef.current = targetPoly;

        // Add prominent vertex handles
        latlngs.forEach((coord, i) => {
          if (i < latlngs.length - 1) {
            L.circleMarker(coord, {
              radius: 5,
              color: '#ffffff',
              fillColor: '#008C45',
              fillOpacity: 1,
              weight: 2,
            }).addTo(map);
          }
        });

        targetPoly.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.6; color: #172B22;">
            <div style="font-weight: bold; color: #008C45; font-size: 13px; margin-bottom: 4px;">
              Plot #${parcel.plot_number} (Khata: ${parcel.khata_number})
            </div>
            <div><strong>Parcel ID:</strong> ${parcel.parcel_code}</div>
            <div><strong>Location:</strong> ${parcel.village}, ${parcel.sub_district}, ${parcel.district}</div>
            <div><strong>Area:</strong> ${parcel.recorded_area_acres || parcel.area_acres} Acres</div>
            <div><strong>Crop:</strong> ${parcel.primary_crop}</div>
            <div style="margin-top: 4px; padding: 2px 6px; background: #E6F4EA; color: #137333; border-radius: 4px; font-weight: 600; display: inline-block;">
              ${parcel.verification_status}
            </div>
          </div>
        `);

        // Exact Bounding Box Zoom
        if (parcel.bbox) {
          const [minLon, minLat, maxLon, maxLat] = parcel.bbox;
          const bounds = L.latLngBounds([minLat, minLon], [maxLat, maxLon]);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
        } else {
          map.fitBounds(targetPoly.getBounds(), { padding: [60, 60], maxZoom: 18 });
        }

        targetPoly.openPopup();
      }

      // Invalidate size to ensure proper tile rendering
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [parcel, allParcels]);

  // Toggle Basemap
  const toggleBasemap = () => {
    if (!mapInstanceRef.current || !satelliteLayerRef.current || !streetsLayerRef.current) return;
    const map = mapInstanceRef.current;
    if (activeBasemap === 'satellite') {
      map.removeLayer(satelliteLayerRef.current);
      streetsLayerRef.current.addTo(map);
      setActiveBasemap('streets');
    } else {
      map.removeLayer(streetsLayerRef.current);
      satelliteLayerRef.current.addTo(map);
      setActiveBasemap('satellite');
    }
  };

  // Recenter map on target parcel
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !targetPolygonRef.current) return;
    mapInstanceRef.current.fitBounds(targetPolygonRef.current.getBounds(), {
      padding: [60, 60],
      maxZoom: 18,
    });
  };

  // Download GeoJSON Action
  const handleDownloadGeoJSON = () => {
    if (!parcel || !parcel.geojson_geometry) return;
    const feature = {
      type: 'Feature',
      id: parcel.id,
      bbox: parcel.bbox,
      properties: {
        parcel_code: parcel.parcel_code,
        khata_number: parcel.khata_number,
        plot_number: parcel.plot_number,
        state: parcel.state,
        district: parcel.district,
        tahasil: parcel.sub_district,
        village: parcel.village,
        area_acres: parcel.area_acres,
        recorded_area_acres: parcel.recorded_area_acres,
        calculated_area_acres: parcel.calculated_area_acres,
        farmer_entered_area: parcel.farmer_entered_area,
        verification_status: parcel.verification_status,
        cadastral_source: parcel.cadastral_source,
        primary_crop: parcel.primary_crop,
      },
      geometry: parcel.geojson_geometry,
    };
    const blob = new Blob([JSON.stringify(feature, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parcel-${parcel.parcel_code}-${parcel.plot_number.replace('/', '-')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E9E4] rounded-2xl p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#008C45] animate-spin mx-auto" />
        <h3 className="font-display font-bold text-base text-[#172B22]">Loading Cadastral Parcel Geometry...</h3>
        <p className="text-xs text-[#64746A]">Retrieving verified PostGIS spatial boundaries and satellite layers.</p>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="font-display font-bold text-base text-[#172B22]">Parcel Not Found</h3>
        <p className="text-xs text-red-600 max-w-md mx-auto">{error || 'Unable to locate parcel record.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-[#008C45] text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Parcels</span>
        </button>
      </div>
    );
  }

  const isVerified = parcel.verification_status === 'VERIFIED';
  const hasAreaDiscrepancy =
    parcel.recorded_area_acres &&
    parcel.calculated_area_acres &&
    Math.abs(parcel.recorded_area_acres - parcel.calculated_area_acres) > 0.05;

  return (
    <div className="space-y-4">
      {/* Top Header Navigation */}
      <div className="bg-white border border-[#E2E9E4] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-[#E2E9E4] bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs transition-all"
            title="Return to Parcel List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-[#172B22]">
                Parcel #{parcel.parcel_code} &mdash; Plot No. {parcel.plot_number}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1 ${
                  isVerified
                    ? 'bg-[#E6F4EA] text-[#008C45] border border-[#008C45]/20'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isVerified ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {isVerified ? 'VERIFIED CADASTRAL' : 'PENDING VERIFICATION'}
              </span>
            </div>
            <p className="text-xs text-[#64746A] mt-0.5">
              Khata: {parcel.khata_number} &bull; Mouza: {parcel.village}, Tahasil: {parcel.sub_district}, District: {parcel.district}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadGeoJSON}
            className="px-3.5 py-2 rounded-xl border border-[#E2E9E4] bg-white hover:bg-slate-50 text-[#172B22] text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            title="Export GeoJSON boundary feature"
          >
            <Download className="w-3.5 h-3.5 text-[#008C45]" />
            <span>Download GeoJSON</span>
          </button>

          <button
            onClick={handleRecenter}
            className="px-3.5 py-2 rounded-xl border border-[#E2E9E4] bg-white hover:bg-slate-50 text-[#172B22] text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            title="Recenter view on parcel"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#008C45]" />
            <span>Fit Bounds</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Map + Right Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive GIS Satellite Map */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl overflow-hidden border border-[#E2E9E4] relative min-h-[500px] shadow-sm">
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

          {/* Top Controls Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <div className="p-2 px-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono flex items-center gap-2 pointer-events-auto shadow-md">
              <Compass className="w-3.5 h-3.5 text-[#38ef7d] animate-spin-slow shrink-0" />
              <span>Plot #{parcel.plot_number} &bull; WGS84 (SRID 4326)</span>
            </div>

            <button
              type="button"
              onClick={toggleBasemap}
              className="p-2 px-3 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-[11px] font-semibold border border-slate-300 shadow-md flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-[#008C45]" />
              <span className="capitalize">{activeBasemap === 'satellite' ? 'Streets' : 'Satellite'}</span>
            </button>
          </div>

          {/* Bottom Legend */}
          <div className="absolute bottom-3 left-3 right-3 p-2 px-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono flex items-center justify-between pointer-events-none z-10">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#00E676] inline-block border border-white" />
                <span>Selected Parcel #{parcel.plot_number}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border border-dashed border-[#94A3B8] inline-block" />
                <span>Neighbor Parcels ({allParcels.length - 1})</span>
              </span>
            </div>
            <span className="text-[#38ef7d] font-bold">PostGIS Geo-Referenced</span>
          </div>
        </div>

        {/* Right Column: Detailed Land Record & Geospatial Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Area Verification Breakdown */}
          <div className="bg-white border border-[#E2E9E4] rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-sm text-[#172B22] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#008C45]" />
              Geodesic Area Analysis
            </h3>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                <span className="text-slate-600">Official Bhulekh Area:</span>
                <strong className="text-[#172B22]">{parcel.recorded_area_acres || parcel.area_acres} Acres</strong>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                <span className="text-slate-600">Calculated Geometry Area:</span>
                <strong className="text-[#008C45]">{parcel.calculated_area_acres || parcel.area_acres} Acres</strong>
              </div>

              {parcel.farmer_entered_area && (
                <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-slate-600">Farmer Entered Value:</span>
                  <span className="text-slate-800 font-medium">{parcel.farmer_entered_area} Acres</span>
                </div>
              )}
            </div>

            {hasAreaDiscrepancy && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Minor difference between recorded land deed and digitized spatial polygon.
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Cadastral Provenance & Attributes */}
          <div className="bg-white border border-[#E2E9E4] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-display font-bold text-sm text-[#172B22] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#008C45]" />
              Cadastral Metadata
            </h3>

            <div className="space-y-2.5 text-slate-600">
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span>Primary Crop Variety:</span>
                <strong className="text-[#172B22] flex items-center gap-1 font-mono">
                  <Sprout className="w-3.5 h-3.5 text-[#008C45]" />
                  {parcel.primary_crop}
                </strong>
              </div>

              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span>Revenue Mouza:</span>
                <strong className="text-[#172B22] font-mono">{parcel.village}</strong>
              </div>

              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span>Tahasil:</span>
                <strong className="text-[#172B22] font-mono">{parcel.sub_district}</strong>
              </div>

              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span>District & State:</span>
                <strong className="text-[#172B22] font-mono">{parcel.district}, {parcel.state}</strong>
              </div>

              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span>Cadastral Source:</span>
                <span className="text-[#008C45] font-semibold text-right max-w-[180px] truncate" title={parcel.cadastral_source}>
                  {parcel.cadastral_source}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Registered On:</span>
                <span className="font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(parcel.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

