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

export default function LocalAdsSidebar({ ads, primaryColor }: { ads?: Ad[]; primaryColor: string }) {
  if (!ads || ads.length === 0) return null;

  return (
    <div className="rounded-md border border-[var(--hairline)] bg-white/70 p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.18em] uppercase font-semibold font-body text-slate-500">
          <Megaphone className="h-3.5 w-3.5" style={{ color: primaryColor }} />
          Local Promotions
        </div>
        <span className="text-[0.6rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-400 border border-[var(--hairline)] rounded px-1.5 py-0.5">
          AD
        </span>
      </div>

      <div className="border-t border-[var(--hairline)]">
        {ads.map((ad, idx) => {
          const isGuide = ad.type === "guide";

          return (
            <div key={idx} className="py-5 border-b border-[var(--hairline)] last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-display text-base font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
                    {ad.name}
                    {isGuide && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />}
                  </h4>
                  <p className="text-[0.6rem] font-semibold text-slate-400 uppercase tracking-[0.16em] mt-1 font-body">
                    {isGuide ? "Verified tour guide" : "Verified business"}
                  </p>
                </div>

                {ad.rating && (
                  <span className="flex items-center gap-1 shrink-0 text-xs font-body tabular-nums text-slate-600">
                    <Star className="w-3.5 h-3.5" style={{ color: primaryColor, fill: primaryColor }} />
                    {ad.rating}
                  </span>
                )}
              </div>

              {ad.description && (
                <p className="text-sm font-body text-slate-600 leading-relaxed mt-2">{ad.description}</p>
              )}

              {ad.languages && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {ad.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-0.5 border border-[var(--hairline)] text-slate-500 rounded text-[0.6rem] uppercase font-semibold tracking-[0.16em] font-body"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              )}

              <a
                href={`tel:${ad.phone}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-md font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <PhoneCall className="w-4 h-4" />
                Contact / Hire
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
