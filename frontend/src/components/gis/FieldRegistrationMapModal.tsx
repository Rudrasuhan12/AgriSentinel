import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Check, Undo, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import { api } from '../../api/client';

interface FieldRegistrationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDistrict?: string;
}

export const FieldRegistrationMapModal: React.FC<FieldRegistrationMapModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDistrict = 'Cuttack',
}) => {
  const [khataNumber, setKhataNumber] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [state] = useState('Odisha');
  const [district, setDistrict] = useState(defaultDistrict);
  const [subDistrict, setSubDistrict] = useState('Baranga');
  const [village, setVillage] = useState('Mundali');
  const [crop, setCrop] = useState('Paddy (Swarna MTU)');
  const [enteredArea, setEnteredArea] = useState('');

  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);
  const [calculatedAreaAcres, setCalculatedAreaAcres] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnPolygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const center: L.LatLngExpression = [20.4630, 85.8835]; // Cuttack agricultural basin
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 16,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // High-res Esri Satellite Basemap
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      // Boundaries & labels
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.7 }
      ).addTo(map);

      // Click event to place parcel boundary vertices
      map.on('click', (e: L.LeafletMouseEvent) => {
        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));

        setPolygonCoords((prev) => {
          const next = [...prev, [lat, lng] as [number, number]];
          updateMapDrawings(next, map);
          return next;
        });
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const updateMapDrawings = (coords: [number, number][], map: L.Map) => {
    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Draw vertex circle markers
    coords.forEach((coord, i) => {
      const circle = L.circleMarker(coord, {
        radius: 5,
        color: '#ffffff',
        fillColor: '#008C45',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
      circle.bindTooltip(`P${i + 1}`, { permanent: true, direction: 'top' });
      markersRef.current.push(circle as any);
    });

    // Redraw polygon if >= 3 points
    if (drawnPolygonRef.current) {
      map.removeLayer(drawnPolygonRef.current);
      drawnPolygonRef.current = null;
    }

    if (coords.length >= 3) {
      const poly = L.polygon(coords, {
        color: '#38ef7d',
        fillColor: '#008C45',
        fillOpacity: 0.35,
        weight: 2,
      }).addTo(map);
      drawnPolygonRef.current = poly;

      // Geodesic area calculation using shoelace approximation
      const areaM2 = computeGeodesicPolygonArea(coords);
      const acres = Number((areaM2 * 0.000247105).toFixed(2));
      setCalculatedAreaAcres(acres);
      if (!enteredArea) {
        setEnteredArea(acres.toString());
      }
    }
  };

  const computeGeodesicPolygonArea = (coords: [number, number][]): number => {
    if (coords.length < 3) return 0;
    const R = 6378137; // Earth radius in meters
    let total = 0;
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      const lat1 = (p1[0] * Math.PI) / 180;
      const lat2 = (p2[0] * Math.PI) / 180;
      const lon1 = (p1[1] * Math.PI) / 180;
      const lon2 = (p2[1] * Math.PI) / 180;
      total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    return Math.abs((total * R * R) / 2);
  };

  const handleResetDrawing = () => {
    setPolygonCoords([]);
    setCalculatedAreaAcres(0);
    if (mapInstanceRef.current) {
      markersRef.current.forEach((m) => mapInstanceRef.current?.removeLayer(m));
      markersRef.current = [];
      if (drawnPolygonRef.current) {
        mapInstanceRef.current.removeLayer(drawnPolygonRef.current);
        drawnPolygonRef.current = null;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!khataNumber.trim() || !plotNumber.trim()) {
      setError('Please provide Bhulekh Khata and Plot numbers.');
      return;
    }

    const finalArea = parseFloat(enteredArea) || calculatedAreaAcres;
    if (finalArea <= 0) {
      setError('Please enter field area or delineate boundary on map.');
      return;
    }

    let geojsonGeometry = null;
    if (polygonCoords.length >= 3) {
      // Close polygon ring (lon, lat order for standard GeoJSON)
      const ring = polygonCoords.map((c) => [c[1], c[0]]);
      ring.push(ring[0]);
      geojsonGeometry = {
        type: 'Polygon',
        coordinates: [ring],
      };
    }

    setSubmitting(true);
    try {
      await api.post('/api/farmer/parcels', {
        khata_number: khataNumber,
        plot_number: plotNumber,
        state,
        district,
        sub_district: subDistrict,
        village,
        primary_crop: crop,
        area_acres: finalArea,
        geojson_geometry: geojsonGeometry,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register parcel in database.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" style={{ colorScheme: 'light' }}>
      <div className="bg-white text-[#172B22] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-[#E2E9E4]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E9E4] flex items-center justify-between bg-white">
          <div>
            <h3 className="font-display font-bold text-lg text-[#172B22]">
              Register Cadastral Parcel on Satellite GIS
            </h3>
            <p className="text-xs text-[#64746A] mt-0.5">
              Click points on the satellite basemap to delineate your agricultural boundary, then record land registry details.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg border border-[#E2E9E4] bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white">
          
          {/* Left Column: Form Details */}
          <form onSubmit={handleSubmit} className="lg:col-span-5 p-5 space-y-3.5 text-xs border-r border-[#E2E9E4] bg-white">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  BHULEKH KHATA NO. *
                </label>
                <input
                  type="text"
                  required
                  value={khataNumber}
                  onChange={(e) => setKhataNumber(e.target.value)}
                  placeholder="e.g. 204/12"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  PLOT NO. (DAG) *
                </label>
                <input
                  type="text"
                  required
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  placeholder="e.g. 892"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  DISTRICT
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  TAHASIL / BLOCK
                </label>
                <input
                  type="text"
                  required
                  value={subDistrict}
                  onChange={(e) => setSubDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  VILLAGE
                </label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  FIELD AREA (ACRES) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={enteredArea}
                  onChange={(e) => setEnteredArea(e.target.value)}
                  placeholder="e.g. 2.50"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-mono font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                PRIMARY CROP VARIETY
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs cursor-pointer"
              >
                <option value="Paddy (Swarna MTU)" className="bg-white text-[#172B22]">Paddy (Swarna MTU-7029)</option>
                <option value="Paddy (Pooja CR-1018)" className="bg-white text-[#172B22]">Paddy (Pooja CR-1018)</option>
                <option value="Paddy (Sambha Mahsuri)" className="bg-white text-[#172B22]">Paddy (Sambha Mahsuri)</option>
                <option value="Pulses (Moong / Biri)" className="bg-white text-[#172B22]">Pulses (Moong / Biri)</option>
              </select>
            </div>

            {/* Boundary Vertices Stats */}
            <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4] text-[11px] font-mono text-[#64746A] space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Boundary Vertices:</span>
                <strong className="text-[#172B22] font-semibold">{polygonCoords.length} points</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Calculated Geodesic Area:</span>
                <strong className="text-[#008C45] font-bold">{calculatedAreaAcres} Acres</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetDrawing}
                disabled={polygonCoords.length === 0}
                className="px-3 py-2 rounded-xl border border-[#E2E9E4] bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-2xs transition-all"
              >
                <Undo className="w-3.5 h-3.5" />
                <span>Reset Map</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008C45] to-[#006B36] hover:from-[#007a3c] hover:to-[#005c2e] text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer transition-all"
              >
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save to PostGIS</span>
              </button>
            </div>
          </form>

          {/* Right Column: Interactive Leaflet Map for Polygon Demarcation */}
          <div className="lg:col-span-7 flex flex-col bg-slate-900 relative min-h-[360px] lg:min-h-full">
            <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />
            
            {/* Instruction Banner at top of map */}
            <div className="absolute top-3 left-3 right-3 p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono flex items-center justify-between z-10 pointer-events-none">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#38ef7d] animate-spin-slow" />
                <span>Click on satellite view to place parcel boundary corners</span>
              </span>
              <span className="text-[#38ef7d] font-bold">WGS84</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
