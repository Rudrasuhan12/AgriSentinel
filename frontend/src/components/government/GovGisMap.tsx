import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Map, 
  Search, 
  X, 
  Box
} from 'lucide-react';

export interface GisParcelProperty {
  parcel_id: string;
  district: string;
  tahasil: string;
  village: string;
  khata_number: string;
  plot_number: string;
  recorded_area_acres: number;
  calculated_area_acres: number;
  centroid: [number, number];
  farmer_name: string;
  farmer_id: string;
  crop_variety: string;
  survey_status: string;
  harvest_status: string;
  estimated_yield_qtl: number;
  source: string;
  verification_status: string;
}

export interface GisFeature {
  type: string;
  id: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: GisParcelProperty;
}

export type CadastralParcelFeature = GisFeature;

export interface GovGisMapProps {
  features?: GisFeature[];
  parcels?: GisFeature[];
  selectedDistrict: string;
  selectedCropVariety?: string;
  onReview3DMesh?: (parcel: GisParcelProperty) => void;
  isLoading?: boolean;
}

export const GovGisMap: React.FC<GovGisMapProps> = ({
  features,
  parcels,
  selectedDistrict,
  selectedCropVariety,
  onReview3DMesh,
  isLoading = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const satLayerRef = useRef<L.TileLayer | null>(null);
  const streetsLayerRef = useRef<L.TileLayer | null>(null);

  const [basemap, setBasemap] = useState<'sat' | 'streets'>('sat');
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showCentroids, setShowCentroids] = useState<boolean>(true);
  const [selectedParcel, setSelectedParcel] = useState<GisParcelProperty | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeFeatures = parcels || features || [];

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centered around Odisha agricultural basin (Cuttack-Bhubaneswar corridor)
    const map = L.map(mapContainerRef.current, {
      center: [20.4536, 85.9325],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Satellite Imagery Layer (Esri World Imagery)
    const sat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    // Standard Cartographic Layer (OpenStreetMap)
    const streets = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19 }
    );

    sat.addTo(map);
    satLayerRef.current = sat;
    streetsLayerRef.current = streets;

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle Basemap Switch
  useEffect(() => {
    if (!mapRef.current || !satLayerRef.current || !streetsLayerRef.current) return;

    if (basemap === 'sat') {
      if (mapRef.current.hasLayer(streetsLayerRef.current)) {
        mapRef.current.removeLayer(streetsLayerRef.current);
      }
      if (!mapRef.current.hasLayer(satLayerRef.current)) {
        satLayerRef.current.addTo(mapRef.current);
      }
    } else {
      if (mapRef.current.hasLayer(satLayerRef.current)) {
        mapRef.current.removeLayer(satLayerRef.current);
      }
      if (!mapRef.current.hasLayer(streetsLayerRef.current)) {
        streetsLayerRef.current.addTo(mapRef.current);
      }
    }
  }, [basemap]);

  // 3. Render PostGIS GeoJSON Features
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing layers
    if (geojsonLayerRef.current) {
      mapRef.current.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    if (!activeFeatures || activeFeatures.length === 0) return;

    // Filter by district, crop, and search query
    let baseList = activeFeatures;
    if (selectedDistrict && selectedDistrict !== 'ALL' && selectedDistrict !== 'All Districts') {
      baseList = baseList.filter(f => f.properties.district.toLowerCase() === selectedDistrict.toLowerCase());
    }
    if (selectedCropVariety && selectedCropVariety !== 'ALL') {
      baseList = baseList.filter(f => f.properties.crop_variety.toLowerCase().includes(selectedCropVariety.toLowerCase()));
    }

    const filtered = searchQuery.trim()
      ? baseList.filter(f => {
          const q = searchQuery.toLowerCase();
          const p = f.properties;
          return (
            p.plot_number.toLowerCase().includes(q) ||
            p.khata_number.toLowerCase().includes(q) ||
            p.farmer_name.toLowerCase().includes(q) ||
            p.village.toLowerCase().includes(q)
          );
        })
      : baseList;

    // Create GeoJSON Layer
    const geoLayer = L.geoJSON({
      type: "FeatureCollection",
      features: filtered
    } as any, {
      style: (feature) => {
        const p = feature?.properties as GisParcelProperty;
        const isSelected = selectedParcel?.parcel_id === p?.parcel_id;
        const isVerified = p?.survey_status === 'VERIFIED';
        const isAudited = p?.survey_status === 'UAV_AUDITED';

        return {
          color: isSelected ? '#FACC15' : isVerified ? '#00E676' : isAudited ? '#38BDF8' : '#F59E0B',
          weight: isSelected ? 3.5 : 2,
          opacity: 0.95,
          fillColor: isSelected ? '#FACC15' : isVerified ? '#008C45' : isAudited ? '#0284C7' : '#D97706',
          fillOpacity: isSelected ? 0.45 : showBoundaries ? 0.25 : 0.05,
          dashArray: isSelected ? undefined : '4 3'
        };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties as GisParcelProperty;

        layer.on({
          click: () => {
            setSelectedParcel(p);
            if (mapRef.current && (layer as any).getBounds) {
              mapRef.current.fitBounds((layer as any).getBounds(), { padding: [40, 40], maxZoom: 17 });
            }
          }
        });

        // Add Centroid Marker Pin if enabled
        if (showCentroids && markersGroupRef.current && p.centroid) {
          const isSelected = selectedParcel?.parcel_id === p.parcel_id;
          const pinHtml = `
            <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
              <div style="background:${isSelected ? '#FACC15' : '#008C45'}; color:${isSelected ? '#000' : '#FFF'}; font-family:monospace; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:4px; border:1px solid #FFF; box-shadow:0 2px 4px rgba(0,0,0,0.4); white-space:nowrap;">
                ${p.plot_number}
              </div>
              <div style="width:2px; height:6px; background:#FFF;"></div>
              <div style="width:6px; height:6px; background:${isSelected ? '#FACC15' : '#008C45'}; border:1px solid #FFF; border-radius:50%;"></div>
            </div>
          `;
          const customIcon = L.divIcon({
            html: pinHtml,
            className: 'custom-centroid-pin',
            iconSize: [0, 0]
          });

          const marker = L.marker(p.centroid, { icon: customIcon });
          marker.on('click', () => {
            setSelectedParcel(p);
            if (mapRef.current) {
              mapRef.current.setView(p.centroid, 16);
            }
          });
          markersGroupRef.current.addLayer(marker);
        }
      }
    });

    geoLayer.addTo(mapRef.current);
    geojsonLayerRef.current = geoLayer;

    // Fit map bounds to loaded parcels if no parcel currently selected
    if (!selectedParcel && filtered.length > 0) {
      try {
        const b = geoLayer.getBounds();
        if (b.isValid()) {
          mapRef.current.fitBounds(b, { padding: [50, 50], maxZoom: 16 });
        }
      } catch (e) {
        // Fallback
      }
    }
  }, [features, showBoundaries, showCentroids, selectedParcel, searchQuery]);

  return (
    <div className="relative bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs select-none">
      
      {/* 1. Map Toolbar Strip */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2.5 bg-gray-50/80">
        
        {/* Left: Map Title & Status */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#008C45]">
            <Map className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                ODISHA AGRICULTURAL GIS CADASTRE
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-100 text-[#008C45] border border-emerald-300">
                {activeFeatures.length} PostGIS Parcels Loaded
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-sans hidden sm:inline">
              Authoritative Bhulekh cadastral demarcation with UAV photogrammetry overlays.
            </span>
          </div>
        </div>

        {/* Right: Search Input & Layer Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Plot, Khata, Farmer..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] w-48 sm:w-56"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Basemap Toggle Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-gray-200/80 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => setBasemap('sat')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                basemap === 'sat' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              type="button"
              onClick={() => setBasemap('streets')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                basemap === 'streets' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🗺️ Standard
            </button>
          </div>

          {/* Layer Checkboxes Menu */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-gray-600 pl-2 border-l border-gray-200">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBoundaries}
                onChange={(e) => setShowBoundaries(e.target.checked)}
                className="rounded accent-[#008C45] cursor-pointer"
              />
              <span>Cadastral Boundary</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCentroids}
                onChange={(e) => setShowCentroids(e.target.checked)}
                className="rounded accent-[#008C45] cursor-pointer"
              />
              <span>Centroid Pins</span>
            </label>
          </div>

        </div>

      </div>

      {/* 2. Map Canvas Viewport */}
      <div className="relative w-full h-[540px] sm:h-[600px] bg-slate-950">
        
        {/* Leaflet DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-lg text-xs font-mono text-[#008C45]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008C45] animate-ping" />
              <span>Querying PostGIS Cadastral Polygons...</span>
            </div>
          </div>
        )}

        {/* Top-Left Map HUD Overlay (CRS & Sensor Precision) */}
        <div className="absolute top-3 left-3 z-20 bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-white font-mono text-[10px] space-y-0.5 shadow-md hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">CRS:</span>
            <span className="text-emerald-400 font-bold">EPSG:4326 (WGS 84)</span>
          </div>
          <div className="text-gray-300">
            PostGIS Geography: Geodesic Area Measurement
          </div>
          <div className="text-[9px] text-gray-400">
            Basemap: {basemap === 'sat' ? 'Esri World Imagery 0.3m' : 'OpenStreetMap'}
          </div>
        </div>

        {/* Bottom Map Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-black/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-white font-mono text-[10px] flex items-center gap-3 sm:gap-4 shadow-lg flex-wrap">
          <span className="text-gray-400 uppercase tracking-wider font-bold text-[9px]">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-white" style={{ background: '#00E676' }} />
            <span>Verified PostGIS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-white" style={{ background: '#38BDF8' }} />
            <span>UAV Audited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-white" style={{ background: '#F59E0B' }} />
            <span>Pending Audit</span>
          </div>
        </div>

        {/* Right Floating Parcel Detail Inspector Card (When Parcel Selected) */}
        {selectedParcel && (
          <div className="absolute top-3 right-3 z-20 w-80 sm:w-96 bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200">
            
            {/* Header with Plot Tag & Close Button */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E6F4EA] text-[#008C45] border border-[#B7E1CD]">
                  PLOT: {selectedParcel.plot_number}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  KHATA: {selectedParcel.khata_number}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParcel(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Farmer & Location Info */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Registered Farmer</span>
                <span className="text-sm font-bold text-gray-900">{selectedParcel.farmer_name}</span>
                <span className="text-[10px] font-mono text-emerald-700 ml-2">ID: {selectedParcel.farmer_id}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] space-y-1 font-mono">
                <div>Revenue Mouza: <strong className="text-gray-900">{selectedParcel.village}</strong></div>
                <div>Tahasil / Block: <strong className="text-gray-900">{selectedParcel.tahasil}</strong></div>
                <div>District: <strong className="text-gray-900">{selectedParcel.district}</strong></div>
              </div>

              {/* Cadastral Acreage & Verification */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Recorded Bhulekh Area</span>
                  <span className="text-sm font-mono font-bold text-gray-900">{selectedParcel.recorded_area_acres} Ac</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">PostGIS Geodesic Area</span>
                  <span className="text-sm font-mono font-bold text-[#008C45]">{selectedParcel.calculated_area_acres} Ac</span>
                </div>
              </div>

              {/* Crop & Yield Mass */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Crop Variety:</span>
                  <strong className="text-gray-900">{selectedParcel.crop_variety}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Yield Mass:</span>
                  <strong className="text-[#008C45]">{selectedParcel.estimated_yield_qtl} Quintals</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Harvest Status:</span>
                  <span className="text-[10px] font-bold text-gray-800">{selectedParcel.harvest_status}</span>
                </div>
              </div>

              {/* Inspector Action Buttons */}
              <div className="pt-2 flex flex-col gap-1.5">
                {onReview3DMesh && (
                  <button
                    type="button"
                    onClick={() => onReview3DMesh(selectedParcel)}
                    className="w-full py-2 px-3 rounded-xl bg-[#008C45] hover:bg-[#007338] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Review 3D Heap Photogrammetry</span>
                  </button>
                )}
                
                <div className="text-[9px] font-mono text-gray-400 text-center pt-1">
                  Verified with Schedule I Form 39-A • DILRMP / LGD
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
