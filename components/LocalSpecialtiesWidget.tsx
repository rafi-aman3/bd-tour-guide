"use client";

import { useState } from "react";
import { Utensils, ShoppingBag, CalendarDays, MapPin, Sparkles, Store, ExternalLink } from "lucide-react";
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
      case 'food': return <Utensils className="w-5 h-5" />;
      case 'craft': return <ShoppingBag className="w-5 h-5" />;
      case 'festival': return <Sparkles className="w-5 h-5" />;
      case 'mela': return <MapPin className="w-5 h-5" />;
      default: return <Store className="w-5 h-5" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'food': return "Famous Eatery";
      case 'craft': return "Local Handicraft";
      case 'festival': return "Cultural Event";
      case 'mela': return "Village Fair";
      default: return "Local Produce";
    }
  };

  return (
    <section className="mb-16 mt-16">
      <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center">
        <span className="w-1.5 h-8 mr-4 rounded-full" style={{ backgroundColor: primaryColor }}></span>
        District Specialties
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {specialties.map((item, idx) => {
          
          const isMela = item.type === "mela";
          
          return (
            <div 
              key={idx} 
              className="flex flex-col p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-48 h-48 opacity-5 rounded-full blur-3xl" style={{ backgroundColor: primaryColor }} />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-2xl" 
                  style={{ backgroundColor: mutedColor, color: primaryColor }}
                >
                  {getIcon(item.type)}
                </div>
                <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400">
                  {getLabel(item.type)}
                </span>
              </div>

              <div className="relative z-10 flex-grow">
                <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight">{item.name}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm mb-6">{item.description}</p>
              </div>

              {/* Dynamic Footer / Action Area based on Type */}
              <div className="mt-auto relative z-10 pt-6 border-t border-slate-50">
                {item.venue && (
                  <div className="flex items-center text-sm font-bold text-slate-700">
                    <Store className="w-4 h-4 mr-2 text-slate-400" />
                    {item.venue}
                  </div>
                )}
                {item.timing && !isMela && (
                  <div className="flex items-center text-sm font-bold text-slate-700">
                    <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                    {item.timing}
                  </div>
                )}
                
                {/* Specific Action for Mela / Map Coordinations */}
                {isMela && item.coordinates && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-bold text-slate-700">
                      <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                      {item.timing}
                    </div>
                    
                    <button 
                      onClick={() => setModalData({ isOpen: true, name: item.name, coordinates: item.coordinates! })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white hover:scale-105 active:scale-95 transition-transform shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      View Map
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {modalData.coordinates && (
        <HeritageMapModal
          isOpen={modalData.isOpen}
          onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
          coordinates={modalData.coordinates}
          name={modalData.name}
        />
      )}
    </section>
  );
}
