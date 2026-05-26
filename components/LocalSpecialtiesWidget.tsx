"use client";

import { useState } from "react";
import { Utensils, ShoppingBag, CalendarDays, MapPin, Sparkles, Store } from "lucide-react";
import HeritageMapModal from "./HeritageMapModal";

interface Specialty {
  type: "food" | "craft" | "festival" | "mela" | "produce";
  name: string;
  description: string;
  venue?: string;
  timing?: string;
  coordinates?: [number, number];
}

interface LocalSpecialtiesWidgetProps {
  specialties: Specialty[];
  primaryColor: string;
  mutedColor: string;
}

export default function LocalSpecialtiesWidget({ specialties, primaryColor, mutedColor }: LocalSpecialtiesWidgetProps) {
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    name: string;
    coordinates: [number, number] | null;
  }>({ isOpen: false, name: "", coordinates: null });

  if (!specialties || specialties.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "food":
        return <Utensils className="w-4 h-4" />;
      case "craft":
        return <ShoppingBag className="w-4 h-4" />;
      case "festival":
        return <Sparkles className="w-4 h-4" />;
      case "mela":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Store className="w-4 h-4" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "food":
        return "Famous Eatery";
      case "craft":
        return "Local Handicraft";
      case "festival":
        return "Cultural Event";
      case "mela":
        return "Village Fair";
      default:
        return "Local Produce";
    }
  };

  return (
    <section className="mb-16">
      <header className="mb-6">
        <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
          § 04 &nbsp;District Specialties
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
          Made and celebrated here
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t border-[var(--hairline)]">
        {specialties.map((item, idx) => {
          const isMela = item.type === "mela";

          return (
            <article
              key={idx}
              className="flex flex-col pt-6 border-b border-[var(--hairline)] pb-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-md shrink-0"
                  style={{ backgroundColor: mutedColor, color: primaryColor }}
                >
                  {getIcon(item.type)}
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500">
                  {getLabel(item.type)}
                </span>
              </div>

              <h3 className="font-display text-xl font-semibold text-slate-900 leading-tight">{item.name}</h3>
              <p className="mt-2 text-sm text-slate-600 font-body leading-relaxed flex-grow">{item.description}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-body text-slate-700">
                <div className="flex flex-col gap-1.5">
                  {item.venue && (
                    <span className="inline-flex items-center gap-2">
                      <Store className="w-4 h-4 text-slate-400" />
                      {item.venue}
                    </span>
                  )}
                  {item.timing && (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      {item.timing}
                    </span>
                  )}
                </div>

                {isMela && item.coordinates && (
                  <button
                    type="button"
                    onClick={() => setModalData({ isOpen: true, name: item.name, coordinates: item.coordinates! })}
                    className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.16em] font-semibold font-body text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    View on map
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {modalData.coordinates && (
        <HeritageMapModal
          isOpen={modalData.isOpen}
          onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
          coordinates={modalData.coordinates}
          name={modalData.name}
        />
      )}
    </section>
  );
}
