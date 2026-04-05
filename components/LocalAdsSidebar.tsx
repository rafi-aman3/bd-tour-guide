"use client";

import { Star, PhoneCall, Megaphone, CheckCircle2 } from "lucide-react";

interface Ad {
  type: "guide" | "business";
  name: string;
  description?: string;
  rating?: number;
  languages?: string[];
  phone: string;
}

export default function LocalAdsSidebar({ ads, primaryColor }: { ads?: Ad[], primaryColor: string }) {
  if (!ads || ads.length === 0) return null;

  return (
    <div className="rounded-[2rem] bg-white border border-slate-100 shadow-xl overflow-hidden flex flex-col p-6 md:p-8 relative">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 bg-gradient-to-br from-transparent to-current blur-2xl pointer-events-none" style={{ color: primaryColor }} />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-black text-slate-900 flex items-center">
          <span className="w-1.5 h-6 mr-3 rounded-full" style={{ backgroundColor: primaryColor }}></span>
          Local Promotions
        </h3>
        <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest rounded-md border border-slate-100 flex items-center">
          <Megaphone className="w-3 h-3 mr-1" /> AD
        </span>
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        {ads.map((ad, idx) => {
          const isGuide = ad.type === "guide";
          
          return (
            <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all group">
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-slate-900 text-base leading-tight flex items-center">
                    {ad.name}
                    {isGuide && <CheckCircle2 className="w-4 h-4 ml-1.5 text-blue-500" />}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {isGuide ? "Verified Tour Guide" : "Verified Business"}
                  </p>
                </div>
                
                {ad.rating && (
                  <div className="flex items-center bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                    <Star className="w-3 h-3 text-orange-400 fill-orange-400 mr-1" />
                    <span className="text-xs font-black text-orange-600">{ad.rating}</span>
                  </div>
                )}
              </div>

              {ad.description && (
                <p className="text-sm font-medium text-slate-600 mb-3">{ad.description}</p>
              )}

              {ad.languages && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ad.languages.map(lang => (
                    <span key={lang} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] uppercase font-black tracking-wider">
                      {lang}
                    </span>
                  ))}
                </div>
              )}

              <a 
                href={`tel:${ad.phone}`}
                className="flex items-center justify-center w-full py-2.5 rounded-xl border-border bg-slate-800 text-white font-bold text-sm tracking-wide group-hover:bg-slate-900 transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4 mr-2 opacity-70" />
                Contact / Hire
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
