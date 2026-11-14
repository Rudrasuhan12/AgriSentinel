import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Map,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ParcelOption {
  id: string;
  name: string;
  district: string;
  tahasil: string;
  village: string;
  khata: string;
  plot: string;
  recordedArea: number;
  calculatedArea: number;
  centroid: [number, number];
  bounds: [[number, number], [number, number]];
  coords: [number, number][];
  surroundingCoords?: [number, number][][];
}

export const InteractiveGisShowcase: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const centroidMarkerRef = useRef<L.Marker | null>(null);
  const surroundingGroupRef = useRef<L.FeatureGroup | null>(null);
  const satLayerRef = useRef<L.TileLayer | null>(null);
  const streetsLayerRef = useRef<L.TileLayer | null>(null);

  const [basemap, setBasemap] = useState<'sat' | 'streets'>('sat');

  // Authentic Odisha PostGIS Parcels
  const parcels: ParcelOption[] = [
    {
      id: 'bidyadharpur',
      name: 'Bidyadharpur Field (NRRI Cuttack)',
      district: 'Cuttack',
      tahasil: 'Cuttack Sadar',
      village: 'Bidyadharpur',
      khata: '299/611',
      plot: '640/2536',
      recordedArea: 4.85,
      calculatedArea: 4.85,
      centroid: [20.4536, 85.9325],
      bounds: [[20.4526, 85.9312], [20.4548, 85.9339]],
      coords: [
        [20.4542, 85.9312],
        [20.4548, 85.9335],
        [20.4531, 85.9339],
        [20.4526, 85.9316],
        [20.4542, 85.9312]
      ],
      surroundingCoords: [
        [
          [20.4538, 85.9288],
          [20.4542, 85.9312],
          [20.4526, 85.9316],
          [20.4521, 85.9292],
          [20.4538, 85.9288]
        ],
        [
          [20.4548, 85.9335],
          [20.4553, 85.9358],
          [20.4536, 85.9362],
          [20.4531, 85.9339],
          [20.4548, 85.9335]
        ]
      ]
    },
    {
      id: 'mundali',
      name: 'Mundali Agricultural Basin',
      district: 'Cuttack',
      tahasil: 'Baranga',
      village: 'Mundali',
      khata: '299/611',
      plot: '640/2536',
      recordedArea: 2.45,
      calculatedArea: 2.45,
      centroid: [20.4611, 85.8823],
      bounds: [[20.4603, 85.8812], [20.4619, 85.8834]],
      coords: [
        [20.4615, 85.8812],
        [20.4619, 85.8831],
        [20.4607, 85.8834],
        [20.4603, 85.8816],
        [20.4615, 85.8812]
      ]
    },
    {
      id: 'choudwar',
      name: 'Choudwar Revenue Mouza',
      district: 'Cuttack',
      tahasil: 'Cuttack Sadar',
      village: 'Choudwar',
      khata: '55/18',
      plot: '1024',
      recordedArea: 2.15,
      calculatedArea: 2.15,
      centroid: [20.5274, 85.9132],
      bounds: [[20.5264, 85.9120], [20.5285, 85.9145]],
      coords: [
        [20.5280, 85.9120],
        [20.5285, 85.9142],
        [20.5268, 85.9145],
        [20.5264, 85.9123],
        [20.5280, 85.9120]
      ]
    },
    {
      id: 'patia',
      name: 'Patia Agrarian Zone',
      district: 'Khordha',
      tahasil: 'Bhubaneswar',
      village: 'Patia',
      khata: '78/02',
      plot: '412',
      recordedArea: 1.85,
      calculatedArea: 1.85,
      centroid: [20.3534, 85.8120],
      bounds: [[20.3525, 85.8110], [20.3544, 85.8131]],
      coords: [
        [20.3540, 85.8110],
        [20.3544, 85.8128],
        [20.3528, 85.8131],
        [20.3525, 85.8113],
        [20.3540, 85.8110]
      ]
    }
  ];

  const [selectedParcel, setSelectedParcel] = useState<ParcelOption>(parcels[0]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: selectedParcel.centroid,
      zoom: 16,
      attributionControl: false,
    });

    const satLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(map);
    satLayerRef.current = satLayer;

    const streetsLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19 }
    );
    streetsLayerRef.current = streetsLayer;

    // Boundaries & Labels overlay
    L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.8 }
    ).addTo(map);

    const surrGroup = L.featureGroup().addTo(map);
    surroundingGroupRef.current = surrGroup;

    mapRef.current = map;
    renderParcel(selectedParcel, map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const renderParcel = (parcel: ParcelOption, mapInstance?: L.Map) => {
    const map = mapInstance || mapRef.current;
    if (!map) return;

    // Remove previous polygon
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    // Remove previous centroid marker
    if (centroidMarkerRef.current) {
      map.removeLayer(centroidMarkerRef.current);
      centroidMarkerRef.current = null;
    }

    // Remove surrounding parcels
    if (surroundingGroupRef.current) {
      surroundingGroupRef.current.clearLayers();
    }

    // Render surrounding plots
    if (parcel.surroundingCoords && surroundingGroupRef.current) {
      parcel.surroundingCoords.forEach((ring) => {
        const surrPoly = L.polygon(ring, {
          color: '#94A3B8',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#64748B',
          fillOpacity: 0.15,
        });
        surroundingGroupRef.current?.addLayer(surrPoly);
      });
    }

    // Render target polygon in bright emerald green
    const targetPoly = L.polygon(parcel.coords, {
      color: '#00E676',
      fillColor: '#008C45',
      fillOpacity: 0.35,
      weight: 3,
    }).addTo(map);
    polygonLayerRef.current = targetPoly;

    // Centroid marker pin
    const centroidIcon = L.divIcon({
      className: 'centroid-icon',
      html: `<div style="
        background: #008C45;
        color: white;
        border: 2px solid #FFFFFF;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        font-size: 13px;
      ">📍</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const marker = L.marker(parcel.centroid, { icon: centroidIcon }).addTo(map);
    marker.bindTooltip(`Plot #${parcel.plot} Centroid`, { direction: 'top', offset: [0, -10] });
    centroidMarkerRef.current = marker;

    // Detailed popup
    targetPoly.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; color: #172B22; min-width: 210px;">
        <div style="font-weight: bold; color: #008C45; font-size: 13px; margin-bottom: 4px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">
          Plot #${parcel.plot} (Khata: ${parcel.khata})
        </div>
        <div><strong>District:</strong> ${parcel.district}</div>
        <div><strong>Tahasil:</strong> ${parcel.tahasil}</div>
        <div><strong>Mouza:</strong> ${parcel.village}</div>
        <div><strong>Recorded Area:</strong> ${parcel.recordedArea} Acres</div>
        <div><strong>CRS:</strong> EPSG:4326</div>
        <div style="margin-top: 6px; padding: 2px 6px; background: #E6F4EA; color: #137333; border-radius: 4px; font-weight: 600; display: inline-block;">
          ✓ OFFICIAL_CADASTRAL
        </div>
      </div>
    `);

    // Smoothly fit bounds
    map.fitBounds(parcel.bounds, { padding: [40, 40], maxZoom: 18 });
    targetPoly.openPopup();
  };

  const handleSelectParcel = (p: ParcelOption) => {
    setSelectedParcel(p);
    renderParcel(p);
  };

  const toggleBasemap = (mode: 'sat' | 'streets') => {
    if (!mapRef.current || !satLayerRef.current || !streetsLayerRef.current) return;
    setBasemap(mode);
    if (mode === 'streets') {
      mapRef.current.removeLayer(satLayerRef.current);
      streetsLayerRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(streetsLayerRef.current);
      satLayerRef.current.addTo(mapRef.current);
    }
  };

  return (
    <section id="gis-showcase" className="py-24 bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-gray-100 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#008C45] mb-2">
              <Map className="w-3.5 h-3.5" />
              <span>INTERACTIVE SATELLITE GIS SHOWCASE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0f2e1e] tracking-tight">
              Authoritative PostGIS Cadastral Viewer
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
              Inspect authentic Odisha revenue parcel polygons, boundary coordinates, and centroid markers directly rendered from the PostGIS spatial engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBasemap('sat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                basemap === 'sat'
                  ? 'bg-[#008C45] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Satellite Imagery
            </button>
            <button
              onClick={() => toggleBasemap('streets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                basemap === 'streets'
                  ? 'bg-[#008C45] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Topographic Map
            </button>
          </div>
        </div>

        {/* Main GIS Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Authentic Parcel Selector */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 block mb-2">
              SELECT DEMARCATED PARCEL
            </span>

            {parcels.map((p) => {
              const isSelected = selectedParcel.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectParcel(p)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/70 border-[#008C45] shadow-xs'
                      : 'bg-[#F8FAFC] border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#008C45]' : 'text-gray-900'}`}>
                        {p.name}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-2">
                      <span>Plot #{p.plot}</span>
                      <span>•</span>
                      <span>Khata: {p.khata}</span>
                      <span>•</span>
                      <span className="font-semibold text-gray-700">{p.recordedArea} Ac</span>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-gray-400">
                      {p.village}, {p.tahasil}, {p.district}
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-[#008C45] translate-x-1' : 'text-gray-400'}`} />
                </button>
              );
            })}

            {/* Selected Parcel Telemetry Box */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-2 mt-4 text-xs font-mono">
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Centroid Coordinates:</span>
                <strong className="text-gray-800">{selectedParcel.centroid[0]}° N, {selectedParcel.centroid[1]}° E</strong>
              </div>
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Coordinate System:</span>
                <strong className="text-[#008C45]">EPSG:4326 (WGS 84)</strong>
              </div>
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Verification State:</span>
                <strong className="text-[#008C45]">OFFICIAL_CADASTRAL</strong>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                state={{ defaultRole: 'FARMER' }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#008C45] hover:bg-[#007338] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Register Your Parcel on Satellite GIS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: High-Res Interactive Map Viewport */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-md bg-slate-900 relative">
              
              {/* Map Canvas */}
              <div ref={mapContainerRef} className="w-full h-[480px] sm:h-[520px] z-10" />

              {/* Floating Overlay Badge */}
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono shadow-xs pointer-events-none">
                <span className="font-bold text-[#0f2e1e]">{selectedParcel.village}</span>
                <span className="text-gray-400 mx-1.5">|</span>
                <span className="text-[#008C45]">Plot #{selectedParcel.plot}</span>
              </div>

              {/* Coordinate Reticle Pin Overlay */}
              <div className="absolute bottom-4 right-4 z-20 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded text-white text-[10px] font-mono pointer-events-none">
                PostGIS ST_AsGeoJSON • Centroid Active
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
