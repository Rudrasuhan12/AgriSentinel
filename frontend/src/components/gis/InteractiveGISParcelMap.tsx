import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ParcelGeometry {
  id: string;
  parcel_code: string;
  khata_number: string;
  plot_number: string;
  area_acres: number;
  verification_status: string;
  geojson_geometry?: any;
}

interface InteractiveGISParcelMapProps {
  parcels: ParcelGeometry[];
  height?: string;
  interactive?: boolean;
  onSelectParcel?: (parcel: ParcelGeometry) => void;
}

export const InteractiveGISParcelMap: React.FC<InteractiveGISParcelMapProps> = ({
  parcels,
  height = '180px',
  interactive = false,
  onSelectParcel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center on Cuttack, Odisha agricultural region
    const defaultCenter: L.LatLngExpression = [20.4630, 85.8835];
    const defaultZoom = interactive ? 15 : 14;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: interactive,
      attributionControl: false,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
    });

    mapInstanceRef.current = map;

    // Satellite Imagery Basemap (Esri World Imagery - high resolution orthomosaic)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        subdomains: ['server', 'services'],
      }
    ).addTo(map);

    // Labels & Boundaries Layer
    L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        opacity: 0.7,
      }
    ).addTo(map);

    // Draw Registered Parcel Polygons
    const polygonGroup = L.featureGroup();

    parcels.forEach((p) => {
      if (p.geojson_geometry && p.geojson_geometry.coordinates) {
        try {
          const coords = p.geojson_geometry.coordinates[0].map((coord: number[]) => [
            coord[1], // Latitude
            coord[0], // Longitude
          ]);

          const isVerified = p.verification_status === 'VERIFIED';
          const polygon = L.polygon(coords, {
            color: '#38ef7d',
            weight: 2,
            fillColor: isVerified ? '#008C45' : '#E6A323',
            fillOpacity: 0.35,
          });

          // Bind Popup
          polygon.bindTooltip(
            `<strong>${p.parcel_code}</strong><br/>Plot: ${p.plot_number} • Khata: ${p.khata_number}<br/>Area: ${p.area_acres} Acres`,
            { permanent: !interactive, direction: 'center', className: 'gis-parcel-tooltip' }
          );

          if (onSelectParcel) {
            polygon.on('click', () => onSelectParcel(p));
          }

          polygonGroup.addLayer(polygon);
        } catch (e) {
          console.warn('[GIS] Error parsing parcel polygon:', e);
        }
      }
    });

    if (polygonGroup.getLayers().length > 0) {
      polygonGroup.addTo(map);
      try {
        map.fitBounds(polygonGroup.getBounds(), { padding: [20, 20] });
      } catch (e) {
        // Fallback to default center
      }
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [parcels, interactive]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 border border-[#E2E9E4]">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />
      
      {/* GPS Status Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white font-mono text-[9px] z-10 pointer-events-none flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#38ef7d] animate-pulse" />
        <span>Satellite GIS: EPSG:4326</span>
      </div>
    </div>
  );
};
