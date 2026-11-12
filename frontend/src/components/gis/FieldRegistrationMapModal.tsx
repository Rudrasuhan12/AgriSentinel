import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  X, 
  Check, 
  Undo, 
  RefreshCw, 
  AlertCircle, 
  Compass, 
  Search, 
  Layers, 
  ShieldCheck, 
  AlertTriangle,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../api/client';

interface FieldRegistrationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDistrict?: string;
}

interface DistrictOption {
  name: string;
  code?: string;
  tahasils: {
    name: string;
    code?: string;
    villages: string[];
  }[];
}

interface CadastralLookupResult {
  success: boolean;
  parcel?: {
    id: string;
    khata_number: string;
    plot_number: string;
    state: string;
    district: string;
    tahasil: string;
    village: string;
    recorded_area_acres: number;
    calculated_area_acres: number;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
    bbox: [number, number, number, number];
    source: string;
    verification_status: string;
  };
  surrounding_parcels?: {
    plot_number: string;
    khata_number: string;
    recorded_area_acres: number;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }[];
  multiple_matches?: boolean;
  matches?: {
    khata_number: string;
    plot_number: string;
    recorded_area_acres: number;
    village: string;
  }[];
  message: string;
  fallback_allowed?: boolean;
}

export const FieldRegistrationMapModal: React.FC<FieldRegistrationMapModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDistrict = 'Cuttack',
}) => {
  // Administrative Hierarchy from Backend
  const [districtsList, setDistrictsList] = useState<DistrictOption[]>([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);

  // Form selections
  const [state] = useState('Odisha');
  const [district, setDistrict] = useState(defaultDistrict);
  const [subDistrict, setSubDistrict] = useState('Baranga');
  const [village, setVillage] = useState('Mundali');
  const [khataNumber, setKhataNumber] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [crop, setCrop] = useState('Paddy (Swarna MTU)');
  const [enteredArea, setEnteredArea] = useState('');

  // Cadastral Search & Geometry state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'searching' | 'found' | 'not_found' | 'multiple' | 'error'>('idle');
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [officialRecordedArea, setOfficialRecordedArea] = useState<number | null>(null);
  const [cadastralSource, setCadastralSource] = useState<string>(
    'Farmer Digitized Boundary (Awaiting Official Cadastral Survey Verification)'
  );
  const [isOfficialCadastral, setIsOfficialCadastral] = useState<boolean>(false);

  // Spatial Drawing & Area Calculation
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);
  const [calculatedAreaAcres, setCalculatedAreaAcres] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map Basemap layer toggle
  const [activeBasemap, setActiveBasemap] = useState<'satellite' | 'streets'>('satellite');

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const streetsLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const drawnPolygonRef = useRef<L.Polygon | null>(null);
  const surroundingGroupRef = useRef<L.FeatureGroup | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // 1. Fetch Authoritative Administrative Hierarchy on Modal Open
  useEffect(() => {
    if (!isOpen) return;

    const fetchHierarchy = async () => {
      try {
        setHierarchyLoading(true);
        const data = await api.get<{ state: string; districts: DistrictOption[] }>('/api/cadastral/hierarchy');
        if (data && data.districts && data.districts.length > 0) {
          setDistrictsList(data.districts);
          
          // Match default district or first
          const matchedDist = data.districts.find(d => d.name.toLowerCase() === defaultDistrict.toLowerCase()) || data.districts[0];
          setDistrict(matchedDist.name);
          if (matchedDist.tahasils.length > 0) {
            setSubDistrict(matchedDist.tahasils[0].name);
            if (matchedDist.tahasils[0].villages.length > 0) {
              setVillage(matchedDist.tahasils[0].villages[0]);
            }
          }
        }
      } catch (err) {
        console.warn('[GIS] Failed to load dynamic administrative hierarchy, using defaults:', err);
      } finally {
        setHierarchyLoading(false);
      }
    };

    fetchHierarchy();
  }, [isOpen, defaultDistrict]);

  // Derived Tahasils and Villages for dependent dropdowns
  const currentDistrictObj = districtsList.find(d => d.name === district);
  const currentTahasils = currentDistrictObj ? currentDistrictObj.tahasils : [];
  const currentTahasilObj = currentTahasils.find(t => t.name === subDistrict);
  const currentVillages = currentTahasilObj ? currentTahasilObj.villages : [];

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    const dObj = districtsList.find(d => d.name === newDist);
    if (dObj && dObj.tahasils.length > 0) {
      setSubDistrict(dObj.tahasils[0].name);
      if (dObj.tahasils[0].villages.length > 0) {
        setVillage(dObj.tahasils[0].villages[0]);
      }
    }
  };

  const handleTahasilChange = (newTahasil: string) => {
    setSubDistrict(newTahasil);
    const tObj = currentTahasils.find(t => t.name === newTahasil);
    if (tObj && tObj.villages.length > 0) {
      setVillage(tObj.villages[0]);
    }
  };

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const center: L.LatLngExpression = [20.4630, 85.8835]; // Cuttack agricultural basin
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 15,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Basemap 1: High-res Esri Satellite Basemap
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
      satelliteLayerRef.current = satLayer;

      // Basemap 2: OpenStreetMap streets
      const streetsLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      streetsLayerRef.current = streetsLayer;

      // Labels & Boundaries Layer
      const labelsLayer = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.8 }
      ).addTo(map);
      labelsLayerRef.current = labelsLayer;

      // Surrounding parcels feature group
      const surrGroup = L.featureGroup().addTo(map);
      surroundingGroupRef.current = surrGroup;

      // Click event to place parcel boundary vertices manually
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

  // Toggle between Satellite and Streets
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

  // 3. Cadastral Spatial Lookup Function
  const handleCadastralLookup = async () => {
    setError(null);
    setLookupMessage(null);

    if (!plotNumber.trim()) {
      setError('Please provide a Plot / Dag Number for cadastral resolution.');
      return;
    }

    try {
      setLookupLoading(true);
      setLookupStatus('searching');

      const response = await api.post<CadastralLookupResult>('/api/cadastral/lookup', {
        state,
        district,
        tahasil: subDistrict,
        village,
        khata_number: khataNumber.trim() || '299/611',
        plot_number: plotNumber.trim(),
      });

      if (response.success && response.parcel) {
        setLookupStatus('found');
        setLookupMessage(response.message);
        setOfficialRecordedArea(response.parcel.recorded_area_acres);
        setCadastralSource(response.parcel.source);
        setIsOfficialCadastral(true);
        setEnteredArea(response.parcel.recorded_area_acres.toString());

        // Parse coordinates [lon, lat] -> Leaflet [lat, lon]
        const ring = response.parcel.geometry.coordinates[0];
        const leafletCoords: [number, number][] = ring.map((pt) => [pt[1], pt[0]]);
        
        // Remove closing coordinate for internal coords array
        const distinctCoords = leafletCoords.slice(0, -1);
        setPolygonCoords(distinctCoords);

        // Compute geodesic area
        const areaM2 = computeGeodesicPolygonArea(distinctCoords);
        const acres = Number((areaM2 * 0.000247105).toFixed(2));
        setCalculatedAreaAcres(acres);

        // Render on map and fitBounds
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;

          // Clear manual vertex markers
          markersRef.current.forEach((m) => map.removeLayer(m));
          markersRef.current = [];

          // Clear previous polygon
          if (drawnPolygonRef.current) {
            map.removeLayer(drawnPolygonRef.current);
            drawnPolygonRef.current = null;
          }

          // Clear previous surrounding parcels
          if (surroundingGroupRef.current) {
            surroundingGroupRef.current.clearLayers();
          }

          // 1. Render Surrounding Cadastral Parcels with subtle dashed lines
          if (response.surrounding_parcels && surroundingGroupRef.current) {
            response.surrounding_parcels.forEach((surr) => {
              const surrRing = surr.geometry.coordinates[0];
              const surrCoords: [number, number][] = surrRing.map((pt) => [pt[1], pt[0]]);
              const surrPoly = L.polygon(surrCoords, {
                color: '#94A3B8',
                weight: 1.5,
                dashArray: '4, 4',
                fillColor: '#64748B',
                fillOpacity: 0.1,
              });
              surrPoly.bindTooltip(`Plot #${surr.plot_number} (${surr.recorded_area_acres} Ac)`, {
                direction: 'center',
                className: 'font-mono text-[10px]',
              });
              surroundingGroupRef.current?.addLayer(surrPoly);
            });
          }

          // 2. Render Main Target Parcel in Bright Emerald Green
          const targetPoly = L.polygon(leafletCoords, {
            color: '#00E676',
            fillColor: '#008C45',
            fillOpacity: 0.35,
            weight: 3,
          }).addTo(map);

          targetPoly.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; color: #172B22;">
              <div style="font-weight: bold; color: #008C45; font-size: 13px; margin-bottom: 4px;">
                Plot #${response.parcel.plot_number} (Khata: ${response.parcel.khata_number})
              </div>
              <div><strong>Village:</strong> ${response.parcel.village}, ${response.parcel.tahasil}</div>
              <div><strong>Recorded Area:</strong> ${response.parcel.recorded_area_acres} Acres</div>
              <div><strong>Calculated Area:</strong> ${acres} Acres</div>
              <div style="margin-top: 4px; padding: 2px 6px; background: #E6F4EA; color: #137333; border-radius: 4px; font-weight: 600; display: inline-block;">
                ${response.parcel.verification_status}
              </div>
            </div>
          `);

          drawnPolygonRef.current = targetPoly;

          // 3. Zoom directly to parcel bounding box with comfortable padding
          const [minLon, minLat, maxLon, maxLat] = response.parcel.bbox;
          const bounds = L.latLngBounds([minLat, minLon], [maxLat, maxLon]);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });

          targetPoly.openPopup();
        }
      } else if (response.multiple_matches) {
        setLookupStatus('multiple');
        setLookupMessage(response.message);
      } else {
        setLookupStatus('not_found');
        setLookupMessage(response.message);
        setIsOfficialCadastral(false);
        setCadastralSource('Farmer Digitized Boundary (Awaiting Official Cadastral Survey Verification)');
      }
    } catch (err: any) {
      setLookupStatus('error');
      setLookupMessage(err.message || 'Cadastral lookup service unavailable. You may digitize manually.');
      setIsOfficialCadastral(false);
    } finally {
      setLookupLoading(false);
    }
  };

  // 4. Update Map Drawings during Manual Digitization
  const updateMapDrawings = (coords: [number, number][], map: L.Map) => {
    setIsOfficialCadastral(false);
    setCadastralSource('Farmer Digitized Boundary (Awaiting Official Cadastral Survey Verification)');

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
      circle.bindTooltip(`P${i + 1}`, { permanent: true, direction: 'top', className: 'font-mono text-[9px]' });
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
        weight: 2.5,
      }).addTo(map);
      drawnPolygonRef.current = poly;

      // Geodesic area calculation using shoelace approximation
      const areaM2 = computeGeodesicPolygonArea(coords);
      const acres = Number((areaM2 * 0.000247105).toFixed(2));
      setCalculatedAreaAcres(acres);
      if (!enteredArea) {
        setEnteredArea(acres.toString());
      }
    } else {
      setCalculatedAreaAcres(0);
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
    setLookupStatus('idle');
    setLookupMessage(null);
    setOfficialRecordedArea(null);
    setIsOfficialCadastral(false);
    if (mapInstanceRef.current) {
      markersRef.current.forEach((m) => mapInstanceRef.current?.removeLayer(m));
      markersRef.current = [];
      if (drawnPolygonRef.current) {
        mapInstanceRef.current.removeLayer(drawnPolygonRef.current);
        drawnPolygonRef.current = null;
      }
      if (surroundingGroupRef.current) {
        surroundingGroupRef.current.clearLayers();
      }
    }
  };

  // 5. Submit Parcel to PostGIS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!khataNumber.trim() || !plotNumber.trim()) {
      setError('Please provide Bhulekh Khata and Plot numbers.');
      return;
    }

    if (polygonCoords.length < 3) {
      setError('A valid boundary polygon requires at least 3 distinct boundary vertices. Please delineate on map or locate via cadastral lookup.');
      return;
    }

    const finalArea = parseFloat(enteredArea) || calculatedAreaAcres;
    if (finalArea <= 0) {
      setError('Field area must be greater than 0 Acres.');
      return;
    }

    // Close polygon ring (lon, lat order for standard GeoJSON)
    const ring = polygonCoords.map((c) => [c[1], c[0]]);
    ring.push(ring[0]);
    const geojsonGeometry = {
      type: 'Polygon',
      coordinates: [ring],
    };

    setSubmitting(true);
    try {
      await api.post('/api/farmer/parcels', {
        khata_number: khataNumber.trim(),
        plot_number: plotNumber.trim(),
        state,
        district,
        sub_district: subDistrict,
        village,
        primary_crop: crop,
        area_acres: finalArea,
        geojson_geometry: geojsonGeometry,
        cadastral_source: cadastralSource,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save parcel to PostGIS. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Calculate area discrepancy if both official and entered exist
  const parsedEnteredArea = parseFloat(enteredArea) || 0;
  const hasAreaDiscrepancy = 
    officialRecordedArea !== null && 
    parsedEnteredArea > 0 && 
    Math.abs(officialRecordedArea - parsedEnteredArea) / officialRecordedArea > 0.15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs" style={{ colorScheme: 'light' }}>
      <div className="bg-white text-[#172B22] w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] border border-[#E2E9E4]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E9E4] flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-[#172B22]">
                Cadastral Parcel Identification & Satellite Registration
              </h3>
              {isOfficialCadastral && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E6F4EA] text-[#008C45] border border-[#008C45]/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  OFFICIAL BHULEKH BOUNDARY
                </span>
              )}
            </div>
            <p className="text-xs text-[#64746A] mt-0.5">
              Enter administrative land records to automatically resolve authoritative parcel boundaries, or delineate vertices manually on high-res satellite GIS.
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

        {/* Dynamic Alerts */}
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {lookupStatus === 'found' && lookupMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{lookupMessage}</span>
          </div>
        )}

        {lookupStatus === 'not_found' && lookupMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <div>
              <span className="font-semibold">Cadastral Notice: </span>
              <span>{lookupMessage}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white">
          
          {/* Left Column: Form Details & Cadastral Controls */}
          <form onSubmit={handleSubmit} className="lg:col-span-5 p-5 space-y-3.5 text-xs border-r border-[#E2E9E4] bg-white overflow-y-auto">
            
            {/* Step 1: Administrative Location Dropdowns */}
            <div className="space-y-2 pb-3 border-b border-[#E2E9E4]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-[#172B22] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#008C45]" />
                  1. Administrative Hierarchy
                </span>
                <span className="text-[10px] text-slate-500">State: Odisha</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
                    DISTRICT
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={hierarchyLoading || districtsList.length === 0}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B22] text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 cursor-pointer shadow-2xs"
                  >
                    {districtsList.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                    {districtsList.length === 0 && <option value="Cuttack">Cuttack</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
                    TAHASIL / BLOCK
                  </label>
                  <select
                    value={subDistrict}
                    onChange={(e) => handleTahasilChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B22] text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 cursor-pointer shadow-2xs"
                  >
                    {currentTahasils.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                    {currentTahasils.length === 0 && <option value="Baranga">Baranga</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
                  VILLAGE (MOUZA)
                </label>
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B22] text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 cursor-pointer shadow-2xs"
                >
                  {currentVillages.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                  {currentVillages.length === 0 && <option value="Mundali">Mundali</option>}
                </select>
              </div>
            </div>

            {/* Step 2: Cadastral Identifiers & Lookup */}
            <div className="space-y-2.5 pb-3 border-b border-[#E2E9E4]">
              <span className="text-[11px] font-mono uppercase font-bold text-[#172B22] flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-[#008C45]" />
                2. Land Record Identifiers
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
                    BHULEKH KHATA NO. *
                  </label>
                  <input
                    type="text"
                    required
                    value={khataNumber}
                    onChange={(e) => setKhataNumber(e.target.value)}
                    placeholder="e.g. 299/611"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
                    PLOT NO. (DAG) *
                  </label>
                  <input
                    type="text"
                    required
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    placeholder="e.g. 640/2536"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Dedicated Locate Land Parcel Button */}
              <button
                type="button"
                onClick={handleCadastralLookup}
                disabled={lookupLoading || !plotNumber.trim()}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#008C45] to-[#006B36] hover:from-[#007a3c] hover:to-[#005c2e] text-white font-semibold flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer transition-all"
              >
                {lookupLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching Official Cadastral Records...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Locate Land Parcel on Satellite GIS</span>
                  </>
                )}
              </button>
            </div>

            {/* Step 3: Crop & Area Verification */}
            <div className="space-y-2.5 pb-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[#172B22] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#008C45]" />
                3. Crop & Cadastral Area
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
                    PRIMARY CROP VARIETY
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B22] text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 cursor-pointer shadow-2xs"
                  >
                    <option value="Paddy (Swarna MTU)" className="bg-white text-[#172B22]">Paddy (Swarna MTU-7029)</option>
                    <option value="Paddy (Pooja CR-1018)" className="bg-white text-[#172B22]">Paddy (Pooja CR-1018)</option>
                    <option value="Paddy (Sambha Mahsuri)" className="bg-white text-[#172B22]">Paddy (Sambha Mahsuri)</option>
                    <option value="Pulses (Moong / Biri)" className="bg-white text-[#172B22]">Pulses (Moong / Biri)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
                    FIELD AREA (ACRES) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={enteredArea}
                    onChange={(e) => setEnteredArea(e.target.value)}
                    placeholder="e.g. 2.45"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B22] placeholder:text-slate-400 text-xs font-mono font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Area Discrepancy Alert */}
              {hasAreaDiscrepancy && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>
                    Area Discrepancy: Entered {enteredArea} Ac differs from recorded {officialRecordedArea} Ac.
                  </span>
                </div>
              )}

              {/* Boundary Vertices Stats Card */}
              <div className="p-3 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4] text-[11px] font-mono text-[#64746A] space-y-1">
                <div className="flex justify-between items-center">
                  <span>Boundary Vertices:</span>
                  <strong className={`font-semibold ${polygonCoords.length >= 3 ? 'text-[#008C45]' : 'text-amber-600'}`}>
                    {polygonCoords.length} points {polygonCoords.length < 3 && '(Min 3 required)'}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Calculated Geodesic Area:</span>
                  <strong className="text-[#008C45] font-bold">{calculatedAreaAcres} Acres</strong>
                </div>
                {officialRecordedArea !== null && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span>Official Bhulekh Area:</span>
                    <strong className="text-slate-800 font-semibold">{officialRecordedArea} Acres</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#E2E9E4]">
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
                disabled={submitting || polygonCoords.length < 3 || calculatedAreaAcres <= 0}
                title={polygonCoords.length < 3 ? 'Place at least 3 points or resolve parcel via cadastral lookup' : ''}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#008C45] to-[#006B36] hover:from-[#007a3c] hover:to-[#005c2e] text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save to PostGIS</span>
              </button>
            </div>
          </form>

          {/* Right Column: Interactive Leaflet Map for Parcel Demarcation */}
          <div className="lg:col-span-7 flex flex-col bg-slate-900 relative min-h-[380px] lg:min-h-full">
            <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
            
            {/* Top Floating Map Controls */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
              
              {/* Instruction Banner */}
              <div className="p-2 px-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono flex items-center gap-2 pointer-events-auto shadow-md">
                <Compass className="w-3.5 h-3.5 text-[#38ef7d] animate-spin-slow shrink-0" />
                <span className="truncate">
                  {isOfficialCadastral 
                    ? `Cadastral Plot #${plotNumber} Resolved · WGS84`
                    : 'Click satellite basemap to delineate boundary vertices (min 3)'}
                </span>
              </div>

              {/* Basemap Switcher */}
              <button
                type="button"
                onClick={toggleBasemap}
                className="p-2 px-3 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-[11px] font-semibold border border-slate-300 shadow-md flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-all"
                title="Toggle Satellite / Streets"
              >
                <Layers className="w-3.5 h-3.5 text-[#008C45]" />
                <span className="capitalize">{activeBasemap === 'satellite' ? 'Streets' : 'Satellite'}</span>
              </button>
            </div>

            {/* Bottom Floating Legend */}
            <div className="absolute bottom-3 left-3 right-3 p-2 px-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono flex items-center justify-between z-10 pointer-events-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] inline-block" />
                  <span>Selected Parcel</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 border border-dashed border-[#94A3B8] inline-block" />
                  <span>Cadastral Neighbors</span>
                </span>
              </div>
              <span className="text-[#38ef7d] font-bold">EPSG:4326</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
