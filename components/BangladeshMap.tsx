"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type FeatureCollection, type Feature, type MultiPolygon, type Polygon } from "geojson";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { DEFAULT_CENTER, DEFAULT_ZOOM, BD_BOUNDS, DIVISION_COLORS, getThematicColor } from "@/lib/map-data";

// Fix for Leaflet icon issues in Next.js
import L from "leaflet";

interface DivisionLabel {
  name: string;
  center: [number, number];
}

function FitBoundsHelper({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();
  useEffect(() => {
    // Using 0 padding to maximize the map size within the container
    map.fitBounds(bounds, { padding: [0, 0], animate: false });

    // Also handle resize
    const handleResize = () => {
      map.fitBounds(bounds, { padding: [0, 0], animate: false });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map, bounds]);
  return null;
}

export default function BangladeshMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [divisionLabels, setDivisionLabels] = useState<DivisionLabel[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Dynamically load the large GeoJSON file
    fetch("/data/BD_Districts.json")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        setGeoData(data);
        calculateDivisionCenters(data);
      })
      .catch((err) => console.error("Error loading GeoJSON:", err));

    // Leaflet icon fix
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

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
      // Adjust labels slightly for better visual placement if needed
      let center: [number, number] = [data.latSum / data.count, data.lngSum / data.count];
      return { name, center };
    });

    setDivisionLabels(labels);
  };

  const onEachFeature = (feature: any, layer: any) => {
    const districtName = feature.properties.ADM2_EN;
    const divisionName = feature.properties.ADM1_EN;

    layer.bindTooltip(districtName, {
      permanent: false,
      direction: "center",
      className: "district-tooltip"
    });

    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: "white",
          dashArray: "",
          fillOpacity: 1,
          fillColor: getThematicColor(divisionName, districtName, 1)
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle({
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
        router.push(`/${slug}`);
      },
    });
  };

  const geoJsonStyle = (feature: any) => {
    const districtName = feature.properties.ADM2_EN;
    const divisionName = feature.properties.ADM1_EN;
    return {
      fillColor: getThematicColor(divisionName, districtName, 0.6),
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.6,
    };
  };

  if (!geoData) {
    return (
      <div className="flex h-[400px] md:h-[600px] w-full items-center justify-center rounded-xl bg-slate-100 animate-pulse">
        <p className="text-slate-500 font-medium">Loading Interactive Map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] md:h-[650px] w-full overflow-hidden rounded-2xl transition-all">
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
        <FitBoundsHelper bounds={BD_BOUNDS} />
        <GeoJSON
          data={geoData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />

        {divisionLabels.map((division) => (
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

      <div className="absolute top-6 left-6 z-[1000] p-4 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 pointer-events-none">
        <h2 className="text-xl font-bold text-slate-900 leading-tight">Explore Districts</h2>
        <p className="text-sm text-slate-600 mt-1">Click on a district to learn more</p>
      </div>

      <style jsx global>{`
        .division-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: rgba(30, 41, 59, 0.4) !important; /* Subtle slate-800 */
          font-weight: 800 !important;
          font-size: 16px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          white-space: nowrap !important;
          pointer-events: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8) !important;
        }
        .district-tooltip {
          background: rgba(255, 255, 255, 0.9) !important;
          border: none !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          color: #1e293b !important;
          font-weight: 600 !important;
          padding: 4px 8px !important;
          font-size: 12px !important;
        }
        .leaflet-container {
            background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
