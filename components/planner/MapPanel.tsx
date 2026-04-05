"use client";

import { useEffect, useMemo } from "react";
import { usePlannerStore } from "@/lib/store/usePlannerStore";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function FitBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      if (coordinates.length === 1) {
        map.setView(coordinates[0], 9);
      } else {
        const bounds = L.latLngBounds(coordinates as any);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    } else {
      map.setView([23.6850, 90.3563], 7); // Default Bangladesh center
    }
  }, [coordinates, map]);
  return null;
}

export default function MapPanel() {
  const { trips, activeTripId } = usePlannerStore();
  const trip = activeTripId ? trips[activeTripId] : null;

  const validPlaces = useMemo(() => {
    if (!trip) return [];
    return trip.placesToExplore.filter((p) => p.coordinates && Array.isArray(p.coordinates));
  }, [trip]);

  // Extract coordinates for bounds fitting and polylines, ordered by day offset
  const mapLines = useMemo(() => {
    const sorted = [...validPlaces].sort((a, b) => {
      const dayA = a.dayOffset ?? 999;
      const dayB = b.dayOffset ?? 999;
      return dayA - dayB;
    });
    return sorted.map((p) => p.coordinates as [number, number]);
  }, [validPlaces]);

  if (!trip) return null;

  return (
    <div className="h-full w-full bg-slate-200 z-0">
      <MapContainer
        center={[23.6850, 90.3563]}
        zoom={7}
        className="w-full h-full"
        zoomControl={false} // Will add custom positioned control if needed
      >
        <TileLayer
          attribution='&copy; OpenStreetMap & CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          maxZoom={19}
        />
        
        {validPlaces.map((place) => (
          <Marker key={place.id} position={place.coordinates as [number, number]}>
            <Popup className="font-bold border-none shadow-xl rounded-xl">
              <div className="text-sm font-black text-slate-900">{place.name}</div>
              {place.dayOffset !== undefined ? (
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 w-max px-2 py-0.5 rounded-md mt-1">
                  Day {place.dayOffset + 1}
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-400 mt-1">Unassigned</div>
              )}
            </Popup>
          </Marker>
        ))}

        {mapLines.length > 1 && (
          <Polyline 
            positions={mapLines} 
            pathOptions={{ 
              color: '#10b981', 
              weight: 4, 
              dashArray: "10, 10" 
            }} 
          />
        )}

        <FitBounds coordinates={mapLines} />
      </MapContainer>
      
      <div className="absolute bottom-6 right-6 md:right-auto md:left-6 z-[400] bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center shadow-emerald-500/10">
        <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
        <span className="text-sm font-bold text-slate-700">Trip Route</span>
      </div>
    </div>
  );
}
