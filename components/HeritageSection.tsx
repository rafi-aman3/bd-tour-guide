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
    coordinates: null,
  });

  if (!sites || sites.length === 0) return null;

  const WrapperComponent = isSubsection ? "div" : "section";

  return (
    <>
      <WrapperComponent className={isSubsection ? "mt-12" : "mb-16"}>
        <header className="mb-6">
          {!isSubsection && (
            <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
              § 02 &nbsp;Protected Heritage
            </div>
          )}
          {isSubsection ? (
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              Protected heritage sites
            </h3>
          ) : (
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
              Protected heritage sites
            </h2>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border-t border-[var(--hairline)]">
          {sites.map((site, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setModalData({ isOpen: true, name: site.name, coordinates: site.coordinates })}
              className="group flex items-center gap-4 py-5 text-left border-b border-[var(--hairline)] cursor-pointer transition-colors"
            >
              <span className="text-xs font-body tabular-nums text-slate-400 self-start pt-1">
                {(idx + 1).toString().padStart(2, "0")}
              </span>
              <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-[var(--hairline)]">
                <img
                  src={site.image}
                  alt={site.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-lg font-semibold text-slate-900 leading-tight">
                  {site.name}
                </h4>
                <span
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.16em] font-semibold font-body text-slate-400 group-hover:text-slate-900 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                  View on map
                </span>
              </div>
            </button>
          ))}
        </div>
      </WrapperComponent>

      {modalData.coordinates && (
        <HeritageMapModal
          isOpen={modalData.isOpen}
          onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
          coordinates={modalData.coordinates}
          name={modalData.name}
        />
      )}
    </>
  );
}
