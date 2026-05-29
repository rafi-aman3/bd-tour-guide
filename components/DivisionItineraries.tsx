"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Gauge, MapPin, Route, X } from "lucide-react";
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

  // Close the preview on Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [preview]);

  if (!itineraries.length) return null;

  function makeTrip(it: Itinerary) {
    const id = crypto.randomUUID();
    createTripFromTemplate(id, it);
    router.push(`/planner/${id}`);
  }

  const totalStops = (it: Itinerary) => it.days.reduce((n, d) => n + d.stops.length, 0);

  return (
    <section className="mb-20">
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
          § 01 &nbsp;Trip Plans
        </div>
        <span className="text-[0.65rem] tracking-[0.16em] uppercase font-semibold text-slate-400 font-body">
          Ready-made routes · tap to preview
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {itineraries.map((it) => {
          const stops = totalStops(it);
          return (
            <button
              key={it.id}
              onClick={() => setPreview(it)}
              aria-label={`Preview the ${it.durationDays}-day ${it.title} itinerary`}
              className="group text-left rounded-md overflow-hidden border border-[var(--hairline)] bg-white/70 hover:bg-white cursor-pointer transition-colors duration-200 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900/30"
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                {it.coverImage && (
                  <img
                    src={it.coverImage}
                    alt={`${it.title} — ${it.subtitle ?? "trip"}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                {/* Duration ticket */}
                <span
                  className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[0.62rem] uppercase tracking-[0.16em] font-semibold font-body text-white shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Route className="h-3 w-3" />
                  {it.durationDays} {it.durationDays === 1 ? "day" : "days"}
                </span>
                <span className="absolute bottom-3 left-3 right-3 text-[0.62rem] uppercase tracking-[0.16em] font-semibold font-body text-white/90">
                  {it.districts.length} {it.districts.length === 1 ? "district" : "districts"} · {stops} stops
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display text-xl font-semibold text-slate-900 leading-tight">{it.title}</h3>
                {it.subtitle && <p className="mt-1 text-sm text-slate-600 font-body leading-snug">{it.subtitle}</p>}

                {/* Trip spec sheet */}
                <dl className="mt-4 rounded-sm border border-[var(--hairline)] overflow-hidden" style={{ backgroundColor: mutedColor }}>
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--hairline)]">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" style={{ color: primaryColor }} />
                    <dt className="text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-slate-500 font-body">Best</dt>
                    <dd className="ml-auto text-[0.72rem] font-body font-semibold text-slate-800 text-right leading-tight">{it.bestSeason}</dd>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Gauge className="h-3.5 w-3.5 shrink-0" style={{ color: primaryColor }} />
                    <dt className="text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-slate-500 font-body">Pace</dt>
                    <dd className="ml-auto text-[0.72rem] font-body font-semibold text-slate-800">{it.pace}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {it.themeTags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-sm text-[0.6rem] uppercase tracking-[0.14em] font-semibold font-body text-slate-700 border border-[var(--hairline)] bg-white/60">{t}</span>
                  ))}
                </div>

                <span className="mt-4 inline-flex items-center gap-1 text-[0.72rem] font-body font-semibold transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" style={{ color: primaryColor }}>
                  Preview itinerary →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 p-0 md:p-6"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.title} itinerary`}
        >
          <div
            className="relative w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-md border border-[var(--hairline)] paper-grain shadow-xl"
            style={{ backgroundColor: "var(--paper-cream)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent rule */}
            <div className="h-1 w-full" style={{ backgroundColor: primaryColor }} />

            <div className="p-6 md:p-8">
              <button
                onClick={() => setPreview(null)}
                className="absolute top-4 right-4 p-1.5 rounded-sm text-slate-400 hover:text-slate-900 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
                {preview.durationDays}-day plan · {preview.pace} pace
              </div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">{preview.title}</h2>
              {preview.subtitle && <p className="mt-1 text-slate-600 font-body">{preview.subtitle}</p>}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-body text-slate-700">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-slate-400" />Best: {preview.bestSeason}</span>
                <span className="inline-flex items-center gap-1.5"><Route className="h-4 w-4 text-slate-400" />{preview.districts.length} districts</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" />{totalStops(preview)} stops</span>
              </div>
              {preview.seasonNote && <p className="mt-2 text-sm text-slate-500 font-body italic">{preview.seasonNote}</p>}
              <p className="mt-4 text-slate-700 font-body leading-relaxed">{preview.summary}</p>

              <div className="mt-6">
                {preview.days.map((d) => (
                  <div key={d.day} className="border-t border-[var(--hairline)] py-4 first:border-t-0">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-display text-sm font-semibold tabular-nums px-2 py-0.5 rounded-sm shrink-0"
                        style={{ backgroundColor: secondaryColor, color: primaryColor }}
                      >
                        Day {d.day}
                      </span>
                      <span className="text-sm text-slate-700 font-body font-semibold">{d.title}</span>
                      <span className="ml-auto text-[0.62rem] uppercase tracking-[0.14em] font-semibold text-slate-400 font-body capitalize">{d.district}</span>
                    </div>
                    <ul className="mt-2.5 space-y-1.5 pl-1">
                      {d.stops.map((s) => (
                        <li key={s.name} className="text-sm text-slate-700 font-body flex gap-2 leading-snug">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                          <span><span className="font-semibold text-slate-900">{s.name}</span>{s.note ? ` — ${s.note}` : ""}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => makeTrip(preview)}
                  className="px-6 py-3 rounded-md font-semibold font-body text-white cursor-pointer transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900/30"
                  style={{ backgroundColor: primaryColor }}
                >
                  Make this trip →
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="px-6 py-3 rounded-md font-semibold font-body text-slate-600 border border-[var(--hairline)] hover:bg-white cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
                >
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
