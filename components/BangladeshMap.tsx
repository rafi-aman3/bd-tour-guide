"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type FeatureCollection, type Feature, type MultiPolygon, type Polygon } from "geojson";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { DEFAULT_CENTER, DEFAULT_ZOOM, BD_BOUNDS, getThematicColor } from "@/lib/map-data";

// Fix for Leaflet icon issues in Next.js
import L from "leaflet";

interface DivisionLabel {
  name: string;
  center: [number, number];
}

interface BangladeshMapProps {
  mode?: "divisions" | "division-districts";
  activeDivision?: string;
}

function FitBoundsHelper({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    // Make sure we have valid bounds
    if (bounds) {
      map.fitBounds(bounds, { padding: [10, 10], animate: false });
      
      const handleResize = () => {
        map.fitBounds(bounds, { padding: [10, 10], animate: false });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [map, bounds]);
  return null;
}

export default function BangladeshMap({ mode = "divisions", activeDivision }: BangladeshMapProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [divisionLabels, setDivisionLabels] = useState<DivisionLabel[]>([]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Leaflet icon fix
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    const dataUrl = mode === "divisions" 
      ? "/data/BD_Divisions.json" 
      : `/data/divisions/${slugify(activeDivision || "")}.json`;

    fetch(dataUrl)
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        setGeoData(data);
        
        if (mode === "divisions") {
           calculateDivisionCenters(data);
           setMapBounds(BD_BOUNDS);
        } else {
           // For a specific division, calculate its exact bounds
           const geoJsonLayer = L.geoJSON(data as any);
           const bounds = geoJsonLayer.getBounds();
           if (bounds.isValid()) {
             setMapBounds([
               [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
               [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
             ]);
           } else {
             setMapBounds(BD_BOUNDS); // Fallback
           }
        }
      })
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, [mode, activeDivision]);

  const calculateDivisionCenters = (data: FeatureCollection) => {
    const divisions: Record<string, { latSum: number; lngSum: number; count: number }> = {};

    data.features.forEach((feature) => {
      const divisionName = feature.properties?.ADM1_EN;
      if (!divisionName) return;

      let lat = 0;
      let lng = 0;
      let coordCount = 0;

      if (feature.geometry.type === "Polygon") {
        (feature.geometry as Polygon).coordinates[0].forEach(p => {
          lng += p[0];
          lat += p[1];
          coordCount++;
        });
      } else if (feature.geometry.type === "MultiPolygon") {
        (feature.geometry as MultiPolygon).coordinates.forEach(poly => {
          poly[0].forEach(p => {
            lng += p[0];
            lat += p[1];
            coordCount++;
          });
        });
      }

      if (coordCount > 0) {
        if (!divisions[divisionName]) {
          divisions[divisionName] = { latSum: 0, lngSum: 0, count: 0 };
        }
        divisions[divisionName].latSum += (lat / coordCount);
        divisions[divisionName].lngSum += (lng / coordCount);
        divisions[divisionName].count += 1;
      }
    });

    const labels: DivisionLabel[] = Object.entries(divisions).map(([name, data]) => {
      let center: [number, number] = [data.latSum / data.count, data.lngSum / data.count];
      return { name, center };
    });

    setDivisionLabels(labels);
  };

  const onEachFeature = (feature: any, layer: any) => {
    const divisionName = feature.properties.ADM1_EN;
    
    if (mode === "divisions") {
      layer.bindTooltip(`${divisionName} Division`, {
        permanent: false,
        direction: "center",
        className: "district-tooltip"
      });
  
      layer.on({
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({
            weight: 2,
            color: "white",
            dashArray: "",
            fillOpacity: 1,
            fillColor: getThematicColor(divisionName, divisionName, 1) // Using divisionName as district to get base color
          });
        },
        mouseout: (e: any) => {
          const l = e.target;
          l.setStyle({
            weight: 1,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.8,
            fillColor: getThematicColor(divisionName, divisionName, 0.8)
          });
        },
        click: () => {
          const slug = slugify(divisionName);
          router.push(`/division/${slug}`);
        },
      });
    } else {
      const districtName = feature.properties.ADM2_EN;
      layer.bindTooltip(districtName, {
        permanent: false,
        direction: "center",
        className: "district-tooltip"
      });
  
      layer.on({
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({
            weight: 2,
            color: "white",
            dashArray: "",
            fillOpacity: 1,
            fillColor: getThematicColor(divisionName, districtName, 1)
          });
        },
        mouseout: (e: any) => {
          const l = e.target;
          l.setStyle({
            weight: 1,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.6,
            fillColor: getThematicColor(divisionName, districtName, 0.6)
          });
        },
        click: () => {
          const slug = slugify(districtName);
          router.push(`/district/${slug}`);
        },
      });
    }
  };

  const geoJsonStyle = (feature: any) => {
    const divisionName = feature.properties.ADM1_EN;
    
    if (mode === "divisions") {
      return {
        fillColor: getThematicColor(divisionName, divisionName, 0.8),
        weight: 1,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.8,
      };
    } else {
      const districtName = feature.properties.ADM2_EN;
      return {
        fillColor: getThematicColor(divisionName, districtName, 0.6),
        weight: 1,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.6,
      };
    }
  };

  if (!geoData || !mapBounds) {
    return (
      <div className="flex h-[400px] md:h-[600px] w-full items-center justify-center rounded-xl bg-slate-100 animate-pulse">
        <p className="text-slate-500 font-medium">Loading Interactive Map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] md:h-[650px] w-full overflow-hidden rounded-2xl transition-all shadow-lg border border-slate-100">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={6}
        maxZoom={10}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <FitBoundsHelper bounds={mapBounds} />
        <GeoJSON
          key={`geojson-${mode}-${activeDivision || "all"}`}
          data={geoData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />

        {mode === "divisions" && divisionLabels.map((division) => (
          <Marker
            key={division.name}
            position={division.center}
            icon={L.divIcon({
              className: 'division-label',
              html: `<span>${division.name}</span>`,
            })}
            interactive={false}
          />
        ))}
      </MapContainer>

      <div className="absolute top-6 left-6 z-[1000] p-5 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/50 pointer-events-none">
        <h2 className="text-2xl font-black text-slate-900 leading-tight">
          {mode === "divisions" ? "Explore Divisions" : "Explore Districts"}
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {mode === "divisions" ? "Click on a division to see its districts" : "Click on a district to learn more"}
        </p>
      </div>

      <style jsx global>{`
        .division-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: rgba(30, 41, 59, 0.7) !important;
          font-weight: 900 !important;
          font-size: 16px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          white-space: nowrap !important;
          pointer-events: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-shadow: 0 0 15px rgba(255, 255, 255, 1) !important;
        }
        .district-tooltip {
          background: rgba(255, 255, 255, 0.95) !important;
          border: none !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px -2px rgb(0 0 0 / 0.15) !important;
          color: #0f172a !important;
          font-weight: 800 !important;
          padding: 6px 12px !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .leaflet-container {
            background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
