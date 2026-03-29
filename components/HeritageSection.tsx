"use client";

import { useState } from "react";
import HeritageMapModal from "./HeritageMapModal";
import { MapPin } from "lucide-react";

interface HeritageSite {
  name: string;
  image: string;
  coordinates: [number, number];
}

interface HeritageSectionProps {
  primaryColor: string;
  sites: HeritageSite[];
  isSubsection?: boolean;
}

export default function HeritageSection({ primaryColor, sites, isSubsection = false }: HeritageSectionProps) {
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    name: string;
    coordinates: [number, number] | null;
  }>({
    isOpen: false,
    name: "",
    coordinates: null
  });

  if (!sites || sites.length === 0) return null;

  const WrapperComponent = isSubsection ? 'div' : 'section';
  const headerClass = isSubsection 
    ? "text-2xl font-black text-slate-800 mb-6 flex items-center" 
    : "text-3xl font-black text-slate-900 mb-8 flex items-center";

  return (
    <>
      <WrapperComponent className={isSubsection ? "mt-12" : "mb-16"}>
        {isSubsection ? (
          <h3 className={headerClass}>
            <span className="w-1.5 h-6 mr-3 rounded-full" style={{ backgroundColor: primaryColor }}></span>
            Protected Heritage Sites
          </h3>
        ) : (
          <h2 className={headerClass}>
            <span className="w-1.5 h-8 mr-4 rounded-full" style={{ backgroundColor: primaryColor }}></span>
            Protected Heritage Sites
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sites.map((site, idx) => (
            <div 
              key={idx} 
              className="group cursor-pointer flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              onClick={() => setModalData({ isOpen: true, name: site.name, coordinates: site.coordinates })}
            >
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                <img
                  src={site.image}
                  alt={site.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {site.name}
                </h3>
                <div className="flex items-center text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                  <MapPin className="w-4 h-4 mr-1" style={{ color: primaryColor }} />
                  View on Map
                </div>
              </div>
            </div>
          ))}
        </div>
      </WrapperComponent>

      {modalData.coordinates && (
        <HeritageMapModal
          isOpen={modalData.isOpen}
          onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
          coordinates={modalData.coordinates}
          name={modalData.name}
        />
      )}
    </>
  );
}
