"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

interface UpazilaMapProps {
  geoJsonUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

// Component to recenter map based on GeoJSON bounds
function MapBounds({ bounds }: { bounds: [number, number, number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      // bounds is [minX, minY, maxX, maxY]
      // Leaflet fitBounds wants [[minY, minX], [maxY, maxX]] (SouthWest, NorthEast)
      map.fitBounds([
        [bounds[1], bounds[0]],
        [bounds[3], bounds[2]]
      ], { padding: [20, 20] });
    }
  }, [bounds, map]);
  return null;
}

export default function UpazilaMap({ geoJsonUrl, primaryColor, secondaryColor }: UpazilaMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  useEffect(() => {
    if (!geoJsonUrl) return;
    
    fetch(geoJsonUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        const bbox = turf.bbox(data);
        setBounds(bbox as [number, number, number, number]);
      })
      .catch((err) => console.error("Failed to fetch Upazila data:", err));
  }, [geoJsonUrl]);

  if (!geoJsonUrl) return null; // Failsafe if district has no mapped file

  if (!geoData) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 animate-pulse rounded-[2rem]">
        <p className="text-slate-400 font-medium">Loading Upazila Data...</p>
      </div>
    );
  }

  // Thematic Styling with distinct shades per Upazila
  const getGeoJsonStyle = (feature: any) => {
    const name = feature.properties.ADM3_EN || "Unknown";
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const shadeOpacity = 0.3 + (Math.abs(hash) % 40) / 100; // Varied between 0.3 and 0.7

    return {
      fillColor: primaryColor,
      weight: 1.5,
      opacity: 1,
      color: "white",
      fillOpacity: shadeOpacity,
    };
  };

  const activeStyle = {
    fillColor: primaryColor,
    weight: 2.5,
    color: "white",
    fillOpacity: 0.9,
  };

  const onEachFeature = (feature: any, layer: any) => {
    const upazilaName = feature.properties.ADM3_EN || "Unknown Upazila";

    // Tooltip rendering logic
    layer.bindTooltip(
      `<div class="text-center font-sans tracking-tight">
        <div class="font-bold text-base text-slate-900 mb-1 leading-none">${upazilaName}</div>
        <div class="text-[10px] uppercase font-black tracking-widest text-slate-400">Upazila</div>
      </div>`,
      {
        sticky: true,
        className: "bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl p-3",
        opacity: 1
      }
    );

    // Hover interactions
    layer.on({
      mouseover: (e: any) => {
        const featureLayer = e.target;
        featureLayer.setStyle(activeStyle);
        featureLayer.bringToFront();
      },
      mouseout: (e: any) => {
        const featureLayer = e.target;
        featureLayer.setStyle(getGeoJsonStyle(feature));
      }
    });
  };

  return (
    <MapContainer
      center={[23.685, 90.356]}
      zoom={7}
      scrollWheelZoom={false}
      className="h-full w-full bg-slate-100"
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      attributionControl={false}
    >
      <GeoJSON data={geoData} style={getGeoJsonStyle} onEachFeature={onEachFeature} />
      <MapBounds bounds={bounds} />
    </MapContainer>
  );
}
