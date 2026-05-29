"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Gauge, MapPin, X } from "lucide-react";
import { usePlannerStore } from "@/lib/store/usePlannerStore";
import type { Itinerary } from "@/lib/itineraries";

interface Props {
  itineraries: Itinerary[];
  primaryColor: string;
  secondaryColor: string;
  mutedColor: string;
}

export default function DivisionItineraries({ itineraries, primaryColor, secondaryColor, mutedColor }: Props) {
  const router = useRouter();
  const createTripFromTemplate = usePlannerStore((s) => s.createTripFromTemplate);
  const [preview, setPreview] = useState<Itinerary | null>(null);

  if (!itineraries.length) return null;

  function makeTrip(it: Itinerary) {
    const id = crypto.randomUUID();
    createTripFromTemplate(id, it);
    router.push(`/planner/${id}`);
  }

  const totalStops = (it: Itinerary) => it.days.reduce((n, d) => n + d.stops.length, 0);

  return (
    <section className="mb-20">
      <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body mb-6">
        § 01 &nbsp;Trip Plans
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {itineraries.map((it) => (
          <button
            key={it.id}
            onClick={() => setPreview(it)}
            className="group text-left rounded-md overflow-hidden border border-[var(--hairline)] bg-white/70 hover:bg-white transition-colors flex flex-col"
          >
            <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
              {it.coverImage && (
                <img src={it.coverImage} alt={it.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <span
                className="absolute top-3 left-3 px-2 py-1 rounded-sm text-[0.6rem] uppercase tracking-[0.16em] font-semibold font-body text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {it.durationDays} {it.durationDays === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-display text-xl font-semibold text-slate-900 leading-tight">{it.title}</h3>
              {it.subtitle && <p className="mt-1 text-sm text-slate-600 font-body">{it.subtitle}</p>}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.7rem] font-body text-slate-600">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{it.bestSeason}</span>
                <span className="inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-slate-400" />{it.pace}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--hairline)] flex flex-wrap gap-1.5">
                {it.themeTags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-sm text-[0.6rem] uppercase tracking-[0.14em] font-semibold font-body text-slate-700" style={{ backgroundColor: mutedColor }}>{t}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-6" onClick={() => setPreview(null)}>
          <div
            className="relative w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-md border border-[var(--hairline)] paper-grain"
            style={{ backgroundColor: "var(--paper-cream)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>

              <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
                {preview.durationDays}-day plan · {preview.pace}
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 leading-tight">{preview.title}</h2>
              {preview.subtitle && <p className="mt-1 text-slate-600 font-body">{preview.subtitle}</p>}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-body text-slate-700">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-slate-400" />Best: {preview.bestSeason}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" />{totalStops(preview)} stops</span>
              </div>
              {preview.seasonNote && <p className="mt-2 text-sm text-slate-500 font-body italic">{preview.seasonNote}</p>}
              <p className="mt-4 text-slate-700 font-body leading-relaxed">{preview.summary}</p>

              <div className="mt-6 space-y-5">
                {preview.days.map((d) => (
                  <div key={d.day} className="border-t border-[var(--hairline)] pt-4">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-lg font-semibold text-slate-900">Day {d.day}</span>
                      <span className="text-sm text-slate-600 font-body">{d.title}</span>
                      <span className="ml-auto text-[0.65rem] uppercase tracking-[0.14em] font-semibold text-slate-400 font-body capitalize">{d.district}</span>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {d.stops.map((s) => (
                        <li key={s.name} className="text-sm text-slate-700 font-body flex gap-2">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                          <span><span className="font-semibold">{s.name}</span>{s.note ? ` — ${s.note}` : ""}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => makeTrip(preview)}
                  className="px-6 py-3 rounded-md font-semibold font-body text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Make this trip →
                </button>
                <button onClick={() => setPreview(null)} className="px-6 py-3 rounded-md font-semibold font-body text-slate-600 border border-[var(--hairline)] hover:bg-white transition-colors">
                  Close
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400 font-body">Opens the planner with all stops laid out by day — adjust dates, places and budget there.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
