# Division Atlas Page + Predefined Itineraries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/division/[division]` into an editorial "atlas" page whose hero is predefined trip itineraries, and let one click seed a full day-by-day trip into the existing planner — content authored for Rangpur.

**Architecture:** A new per-division JSON file holds self-contained itineraries (place names + coordinates copied from the already-built district field guides). The division page (server component) reads them and renders a client gallery; clicking "Make this trip" calls a new `createTripFromTemplate` zustand action and routes to `/planner/{uuid}`, which finds the seeded trip already in memory.

**Tech Stack:** Next.js 16 App Router (server + client components), Zustand (persisted), TypeScript, Tailwind v4, lucide-react. Spec: `docs/superpowers/specs/2026-05-30-division-page-itineraries-design.md`.

> **Repo note — verification model:** This repo has **no test suite** (per CLAUDE.md). So tasks verify with `npx tsc --noEmit`, `node -e "JSON.parse(...)"`, and an explicit dev-server walkthrough — not TDD. Editorial design tokens already exist in `app/globals.css`: `--hairline: rgb(0 0 0 / 0.08)`, `--paper-cream: #fbf8f1`, `.font-display` (Fraunces), `.font-body`, `.paper-grain`. Section overline pattern: `text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body` + `§ 0X Label`.

---

## File structure

| File | Responsibility |
|---|---|
| `lib/itineraries.ts` | **new** — Itinerary types + `getDivisionItineraries(slug)` server reader. No store dependency. |
| `data/itineraries/rangpur.json` | **new** — 3 Rangpur itineraries; stops copied verbatim from built district guides. |
| `lib/store/usePlannerStore.ts` | **modify** — add `createTripFromTemplate(id, template)` action + interface entry; import `Itinerary` type. |
| `components/planner/ItineraryTab.tsx` | **modify** — day count also derives from max `dayOffset` so seeded multi-day plans render without preset dates. |
| `components/DivisionItineraries.tsx` | **new** — client gallery of itinerary cards + preview modal + "Make this trip" handoff. |
| `app/division/[division]/page.tsx` | **rebuild** — editorial atlas layout: cover band, § 01 Trip Plans, § 02 Map, § 03 Districts. |

---

## Task 1: Itinerary types + server reader

**Files:**
- Create: `lib/itineraries.ts`

- [ ] **Step 1: Create `lib/itineraries.ts`**

```ts
import fs from "fs";
import path from "path";

export interface ItineraryStop {
  name: string;
  coordinates?: [number, number];
  note?: string;
}

export interface ItineraryDay {
  day: number; // 1-indexed
  title: string;
  district: string; // slug; must appear in itinerary.districts
  stops: ItineraryStop[];
}

export interface Itinerary {
  id: string;
  title: string;
  subtitle?: string;
  durationDays: number;
  bestSeason: string;
  seasonNote?: string;
  pace: "Easy" | "Moderate" | "Active";
  themeTags: string[];
  districts: string[]; // unique district slugs, in route order
  coverImage?: string;
  summary: string;
  days: ItineraryDay[];
}

interface DivisionItinerariesFile {
  division: string;
  itineraries: Itinerary[];
}

const cache = new Map<string, Itinerary[]>();

export function getDivisionItineraries(divisionSlug: string): Itinerary[] {
  if (cache.has(divisionSlug)) return cache.get(divisionSlug)!;
  const filePath = path.join(process.cwd(), "data", "itineraries", `${divisionSlug}.json`);
  let result: Itinerary[] = [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as DivisionItinerariesFile;
    result = Array.isArray(parsed.itineraries) ? parsed.itineraries : [];
  } catch {
    result = []; // no file for this division yet → page renders without § 01
  }
  cache.set(divisionSlug, result);
  return result;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean (no errors).

- [ ] **Step 3: Commit**

```bash
git add lib/itineraries.ts
git commit -m "feat(itineraries): add itinerary types + division reader"
```

---

## Task 2: Rangpur itinerary content

**Files:**
- Create: `data/itineraries/rangpur.json`
- Read (to copy exact coordinates): `data/districts/rangpur.json`, `data/districts/dinajpur.json`, `data/districts/thakurgaon.json`, `data/districts/panchagarh.json`, `data/districts/lalmonirhat.json`

> **Authoring rule:** For every stop, open the listed district file and copy the **exact** `name` and `coordinates` from its matching `mustVisit` (or `heritageSites`) entry. Do not invent coordinates or places. `districts[]` = the unique set of `days[].district` in order. `coverImage` reuses an Unsplash URL already present in the corresponding district guide.

- [ ] **Step 1: Read the source coordinates**

Run:
```bash
node -e "const f=require('./data/districts/rangpur.json'); f.mustVisit.forEach(m=>console.log(m.name,'|',JSON.stringify(m.coordinates)))"
node -e "const f=require('./data/districts/dinajpur.json'); f.mustVisit.forEach(m=>console.log(m.name,'|',JSON.stringify(m.coordinates)))"
node -e "const f=require('./data/districts/thakurgaon.json'); f.mustVisit.forEach(m=>console.log(m.name,'|',JSON.stringify(m.coordinates)))"
node -e "const f=require('./data/districts/panchagarh.json'); f.mustVisit.forEach(m=>console.log(m.name,'|',JSON.stringify(m.coordinates)))"
node -e "const f=require('./data/districts/lalmonirhat.json'); f.mustVisit.forEach(m=>console.log(m.name,'|',JSON.stringify(m.coordinates)))"
```
Expected: prints each guide's place names + coordinates. Use these exact values below.

- [ ] **Step 2: Create `data/itineraries/rangpur.json`**

Build this structure, filling each stop's `coordinates` from Step 1 output (and choosing stops by the names below, which exist in those guides). Use the matching guide's existing image URL for `coverImage`.

```jsonc
{
  "division": "rangpur",
  "itineraries": [
    {
      "id": "rangpur-city-weekend",
      "title": "Rangpur City Weekend",
      "subtitle": "Palace, college lawns & Begum Rokeya's village",
      "durationDays": 2,
      "bestSeason": "All year (best October–February)",
      "seasonNote": "Comfortable any season; coolest and clearest Oct–Feb.",
      "pace": "Easy",
      "themeTags": ["City break", "Heritage"],
      "districts": ["rangpur"],
      "coverImage": "<copy Tajhat Palace image URL from data/districts/rangpur.json>",
      "summary": "A relaxed two days in and around Rangpur town — the crown-shaped Tajhat Palace and its museum, the colonial lawns of Carmichael College, and a pilgrimage to Begum Rokeya's birthplace at Payrabondh.",
      "days": [
        {
          "day": 1,
          "title": "Rangpur town — palace & college",
          "district": "rangpur",
          "stops": [
            { "name": "Tajhat Palace", "coordinates": [/* from guide */], "note": "Crown-shaped palace, now the Rangpur Museum." },
            { "name": "Carmichael College", "coordinates": [/* from guide */], "note": "1916 colonial campus with long red-brick façades." }
          ]
        },
        {
          "day": 2,
          "title": "Payrabondh & Mithapukur",
          "district": "rangpur",
          "stops": [
            { "name": "Begum Rokeya Memorial", "coordinates": [/* from guide */], "note": "Birthplace of the pioneering woman writer and reformer." },
            { "name": "Mithapukur Mosque", "coordinates": [/* from guide */], "note": "1802 terracotta mosque." }
          ]
        }
      ]
    },
    {
      "id": "rangpur-heritage-loop",
      "title": "North Bengal Heritage Loop",
      "subtitle": "Terracotta temples, palaces & old estates",
      "durationDays": 4,
      "bestSeason": "October–February",
      "seasonNote": "Cool, dry touring weather across the north.",
      "pace": "Moderate",
      "themeTags": ["Heritage", "Architecture"],
      "districts": ["rangpur", "dinajpur", "thakurgaon"],
      "coverImage": "<copy Kantajew Temple image URL from data/districts/dinajpur.json>",
      "summary": "Four days tracing the great monuments of the north — from Rangpur's palace to Dinajpur's terracotta Kantajew Temple and the vast Ramsagar tank, ending among Thakurgaon's old estates and the giant Suryapuri mango tree.",
      "days": [
        { "day": 1, "title": "Rangpur — Tajhat & Carmichael", "district": "rangpur",
          "stops": [
            { "name": "Tajhat Palace", "coordinates": [/* from guide */], "note": "Rangpur Museum in a crown-shaped palace." },
            { "name": "Carmichael College", "coordinates": [/* from guide */], "note": "1916 colonial campus." }
          ] },
        { "day": 2, "title": "Dinajpur — Kantajew & Rajbari", "district": "dinajpur",
          "stops": [
            { "name": "Kantajew Temple", "coordinates": [/* from guide */], "note": "Late-medieval terracotta temple." },
            { "name": "Dinajpur Rajbari", "coordinates": [/* from guide */], "note": "Ruined royal palace complex." }
          ] },
        { "day": 3, "title": "Dinajpur — Ramsagar", "district": "dinajpur",
          "stops": [
            { "name": "Ramsagar", "coordinates": [/* from guide */], "note": "Huge 18th-century man-made tank and park." }
          ] },
        { "day": 4, "title": "Thakurgaon — tree & estate", "district": "thakurgaon",
          "stops": [
            { "name": "Suryapuri Mango Tree", "coordinates": [/* from guide; use exact name in guide */], "note": "~200-year-old mango tree, among Asia's largest." },
            { "name": "Jamalpur Zamindar Bari Jame Mosque", "coordinates": [/* from guide; use exact name */], "note": "1867 mosque with many minarets." }
          ] }
      ]
    },
    {
      "id": "rangpur-frontier-hills",
      "title": "Far-North Frontier & Hills",
      "subtitle": "Kanchenjunga views, tea & the Teesta",
      "durationDays": 4,
      "bestSeason": "October–February (Kanchenjunga clearest Dec–Jan)",
      "seasonNote": "Go on a clear winter dawn for the mountain view from Tetulia.",
      "pace": "Active",
      "themeTags": ["Nature", "Frontier"],
      "districts": ["panchagarh", "thakurgaon", "lalmonirhat"],
      "coverImage": "<copy a Panchagarh image URL from data/districts/panchagarh.json>",
      "summary": "The country's far north — distant Kanchenjunga from Tetulia at dawn, the Banglabandha land border, the ancient fort-city of Bhitargarh and the tea gardens, then east to the Tin Bigha Corridor and the Teesta Barrage.",
      "days": [
        { "day": 1, "title": "Panchagarh — Tetulia & the view", "district": "panchagarh",
          "stops": [
            { "name": "Kanchenjunga View Point, Tetulia", "coordinates": [/* from guide; exact name */], "note": "Dawn views of Kanchenjunga in clear winter weather." },
            { "name": "Banglabandha Zero Point", "coordinates": [/* from guide */], "note": "Land border toward Nepal and Bhutan." }
          ] },
        { "day": 2, "title": "Panchagarh — fort city & tea", "district": "panchagarh",
          "stops": [
            { "name": "Bhitargarh Fort City", "coordinates": [/* from guide; exact name */], "note": "5th–6th-century fortified city, the district's namesake." },
            { "name": "Tetulia Tea Gardens", "coordinates": [/* from guide; exact name */], "note": "The country's second tea belt." }
          ] },
        { "day": 3, "title": "Thakurgaon — estate & tree", "district": "thakurgaon",
          "stops": [
            { "name": "Suryapuri Mango Tree", "coordinates": [/* from guide; exact name */], "note": "Giant ancient mango tree." }
          ] },
        { "day": 4, "title": "Lalmonirhat — corridor & barrage", "district": "lalmonirhat",
          "stops": [
            { "name": "Tin Bigha Corridor", "coordinates": [/* from guide; exact name */], "note": "Corridor to the Dahagram–Angarpota exclave." },
            { "name": "Teesta Barrage", "coordinates": [/* from guide; exact name at Doani */], "note": "The country's largest irrigation barrage." }
          ] }
      ]
    }
  ]
}
```

> If a named stop above is not present in the guide under that exact name, substitute the closest real `mustVisit` entry from the same district guide and keep its exact name + coordinates. Never leave a `/* from guide */` placeholder in the committed file.

- [ ] **Step 3: Validate JSON + cross-check districts**

Run:
```bash
node -e "
const f=require('./data/itineraries/rangpur.json');
f.itineraries.forEach(it=>{
  const dayDistricts=[...new Set(it.days.map(d=>d.district))];
  const ok=dayDistricts.every(d=>it.districts.includes(d));
  const noPlaceholder=JSON.stringify(it).indexOf('from guide')===-1;
  const allCoords=it.days.every(d=>d.stops.every(s=>Array.isArray(s.coordinates)&&s.coordinates.length===2));
  console.log(it.id,'| daysDistrictsCovered',ok,'| noPlaceholder',noPlaceholder,'| allCoords',allCoords,'| dur',it.durationDays);
});
"
```
Expected: every line shows `daysDistrictsCovered true | noPlaceholder true | allCoords true`, and `dur` matches the number of days.

- [ ] **Step 4: Commit**

```bash
git add data/itineraries/rangpur.json
git commit -m "content(rangpur): add 3 predefined division itineraries"
```

---

## Task 3: `createTripFromTemplate` store action

**Files:**
- Modify: `lib/store/usePlannerStore.ts`

- [ ] **Step 1: Add the import + interface entry**

At the top with the other imports add:
```ts
import type { Itinerary } from "@/lib/itineraries";
```

In the `PlannerStore` interface, directly under `createTrip: (id: string, initialDistrict?: string) => void;` add:
```ts
  createTripFromTemplate: (id: string, template: Itinerary) => void;
```

- [ ] **Step 2: Implement the action**

In the store object, immediately after the `createTrip: (...) => set(...)` block, add:
```ts
      createTripFromTemplate: (id, template) =>
        set((state) => {
          if (state.trips[id]) {
            return { activeTripId: id };
          }
          const placesToExplore = template.days.flatMap((d) =>
            d.stops.map((s) => ({
              id: uuidv4(),
              name: s.name,
              district: d.district,
              coordinates: s.coordinates,
              dayOffset: d.day - 1, // ItineraryTab is 0-indexed: Day 1 === offset 0
            }))
          );
          const trip: TripData = {
            id,
            tripName: template.title,
            dateRange: {},
            travelers: 1,
            origin: "",
            destinations: [...template.districts],
            placesToExplore,
            budgetItems: [],
            notes: `Prefilled from "${template.title}" · Best season: ${template.bestSeason}.`,
            createdAt: new Date().toISOString(),
          };
          return {
            trips: { ...state.trips, [id]: trip },
            activeTripId: id,
          };
        }),
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. (Confirms `TripData`/`Place` shapes match — `coordinates?: [number,number]` and `dayOffset?: number` already exist on `Place`.)

- [ ] **Step 4: Commit**

```bash
git add lib/store/usePlannerStore.ts
git commit -m "feat(planner): seed a full trip from an itinerary template"
```

---

## Task 4: Render seeded multi-day plans without preset dates

**Files:**
- Modify: `components/planner/ItineraryTab.tsx:19-34`

Problem: `ItineraryTab` only builds `totalDays` day-sections, and `totalDays` stays 1 unless `dateRange.from` AND `.to` are both set — so seeded stops with `dayOffset >= 1` would render in no section. Fix: also derive the day count from the largest assigned `dayOffset`.

- [ ] **Step 1: Replace the `totalDays` computation**

Find:
```ts
  let totalDays = 1;
  let startDate = new Date(); // Use today as default if none set just for UI preview if they didn't pick dates
  
  if (dateRange?.from) {
    startDate = dateRange.from;
    if (dateRange.to) {
      totalDays = differenceInDays(dateRange.to, dateRange.from) + 1;
    }
  }
```
Replace with:
```ts
  let totalDays = 1;
  let startDate = new Date(); // Use today as default if none set just for UI preview if they didn't pick dates

  if (dateRange?.from) {
    startDate = dateRange.from;
    if (dateRange.to) {
      totalDays = differenceInDays(dateRange.to, dateRange.from) + 1;
    }
  }

  // Also account for places already assigned to days (e.g. seeded from a division itinerary)
  // so the full plan is visible even before the user picks travel dates.
  const maxAssignedOffset = placesToExplore.reduce(
    (max, p) => (p.dayOffset !== undefined && p.dayOffset > max ? p.dayOffset : max),
    -1
  );
  totalDays = Math.max(totalDays, maxAssignedOffset + 1);
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/planner/ItineraryTab.tsx
git commit -m "fix(planner): show all assigned days even without a date range"
```

---

## Task 5: `DivisionItineraries` client gallery + handoff

**Files:**
- Create: `components/DivisionItineraries.tsx`

This is the interactive hero. Cards summarize each itinerary (duration / best season / pace foremost); clicking opens a preview modal with the day-by-day; "Make this trip" seeds the planner and navigates.

> **Visual build:** Use the `/ui-ux-pro-max` skill to refine the card + modal treatment within the editorial tokens (cream/hairline/`font-display`/`rounded-md`, single `primaryColor` accent). The structure + behavior below are the contract; the skill polishes the visuals. The card must read as a *trip* (duration + season + pace prominent), not a place card.

- [ ] **Step 1: Create the component (baseline; ui-ux-pro-max refines styling only)**

```tsx
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
```

- [ ] **Step 2: (Optional polish) Invoke `/ui-ux-pro-max`** to refine card/modal visuals only — keep the props, the `§ 01 Trip Plans` heading, and the `makeTrip` behavior intact.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/DivisionItineraries.tsx
git commit -m "feat(division): itinerary gallery with preview + planner handoff"
```

---

## Task 6: Rebuild the division page (editorial atlas)

**Files:**
- Modify (full rewrite): `app/division/[division]/page.tsx`

Replace the brutalist layout with the editorial atlas. Keep reading `data/divisions.json` for the name + verified stats; derive the district list from `DISTRICT_TO_DIVISION`; render the itinerary gallery, the map, and a districts index. Drop the fabricated "tourists/year", placeholder cuisine/crafts, and `mustVisit` placeholder blocks.

- [ ] **Step 1: Rewrite the page**

```tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import fs from "fs";
import path from "path";
import { DISTRICT_TO_DIVISION, getThematicColor } from "@/lib/map-data";
import { folioNumber } from "@/lib/field-guide-folio";
import { getDivisionItineraries } from "@/lib/itineraries";
import DynamicMap from "@/components/DynamicMap";
import DivisionItineraries from "@/components/DivisionItineraries";

interface PageProps {
  params: Promise<{ division: string }>;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function getDivisionData(slug: string) {
  try {
    const filePath = path.join(process.cwd(), "data", "divisions.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data[slug];
  } catch {
    return undefined;
  }
}

export default async function DivisionPage({ params }: PageProps) {
  const { division } = await params;
  const data = await getDivisionData(division);

  const fallbackName = division
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const divisionName = data?.name || fallbackName;

  const primaryColor = getThematicColor(divisionName, divisionName, 1);
  const secondaryColor = getThematicColor(divisionName, divisionName, 0.15);
  const mutedColor = getThematicColor(divisionName, divisionName, 0.05);

  const itineraries = getDivisionItineraries(division);

  // Districts in this division, derived from the single source of truth.
  const districts = Object.entries(DISTRICT_TO_DIVISION)
    .filter(([, div]) => div === divisionName)
    .map(([slug]) => slug)
    .sort();

  const stats = [
    { label: "Districts", value: String(districts.length) },
    { label: "Area", value: data?.stats?.area || "—" },
    { label: "Trip plans", value: String(itineraries.length) },
  ].filter((s) => s.value && s.value !== "—");

  return (
    <main className="min-h-screen paper-grain" style={{ backgroundColor: "var(--paper-cream)" }}>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[0.7rem] tracking-[0.18em] uppercase font-semibold font-body text-slate-500 hover:text-slate-900 transition-colors mb-10"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to country map
        </Link>

        {/* Cover band */}
        <header className="mb-16">
          <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold font-body text-slate-500">
            Bangladesh · Division
          </div>
          <h1 className="mt-3 font-display text-5xl md:text-7xl font-semibold tracking-tight text-slate-900">
            {divisionName}
          </h1>
          <div className="mt-4 h-px w-full bg-[var(--hairline)]" />
          <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[0.6rem] uppercase tracking-[0.16em] font-semibold text-slate-400 font-body">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold text-slate-900 tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* § 01 Trip Plans */}
        <DivisionItineraries
          itineraries={itineraries}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          mutedColor={mutedColor}
        />

        {/* § 02 The Map */}
        <section className="mb-20">
          <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body mb-6">
            § 02 &nbsp;The Map
          </div>
          <div className="rounded-md overflow-hidden border border-[var(--hairline)] bg-white">
            <DynamicMap mode="division-districts" activeDivision={division} />
          </div>
        </section>

        {/* § 03 Districts */}
        <section className="mb-12">
          <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body mb-6">
            § 03 &nbsp;Districts
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {districts.map((slug) => {
              const folio = folioNumber(slug);
              const name = slug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
              return (
                <Link
                  key={slug}
                  href={`/district/${slug}`}
                  className="group rounded-md border border-[var(--hairline)] bg-white/70 hover:bg-white transition-colors p-4 flex flex-col gap-2"
                >
                  <span className="text-[0.6rem] uppercase tracking-[0.16em] font-semibold font-body text-slate-400 tabular-nums">
                    {folio || "Guide"}
                  </span>
                  <span className="font-display text-lg font-semibold text-slate-900 leading-tight">{name}</span>
                  <span className="text-[0.7rem] font-body transition-colors" style={{ color: primaryColor }}>
                    Open field guide →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: (Polish) Invoke `/ui-ux-pro-max`** to refine the cover band + districts grid visuals only — keep the `getDivisionItineraries` read, the `DivisionItineraries` props, the `DynamicMap` usage, and the `DISTRICT_TO_DIVISION`-derived district list intact.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/division/[division]/page.tsx
git commit -m "feat(division): rebuild as editorial atlas with trip plans"
```

---

## Task 7: Integration verification

**Files:** none (manual verification).

- [ ] **Step 1: Build + start dev server**

Run: `npm run dev` (the itinerary JSON is read at startup; restart after any edit to it).

- [ ] **Step 2: Division page check**

Open `http://localhost:3000/division/rangpur`. Expected:
- Cream paper background, large `Rangpur` wordmark, stat chips (Districts 8 · Area · Trip plans 3).
- § 01 shows 3 itinerary cards, each with a duration pill, best-season, pace, theme tags.
- § 02 shows the districts map; § 03 lists 8 district cards with folio numbers (e.g. N°13, N°27, N°37…) linking to `/district/<slug>`.
- No fabricated "tourists/year" or placeholder cuisine blocks.

- [ ] **Step 3: Handoff check**

Click a card → preview modal shows the day-by-day with stops + notes. Click **"Make this trip"**. Expected:
- Lands on `/planner/<uuid>`.
- Sidebar header shows the itinerary title as the trip name.
- **Itinerary tab**: every stop appears under the correct **Day N** (Day 1 = first day), with none stranded — even though no travel dates are set yet.
- **Overview tab**: all districts of the itinerary appear as destinations.

- [ ] **Step 4: Regression check**

Open `http://localhost:3000/division/sylhet` (no itinerary file). Expected: page renders the cover band, an empty/absent § 01 (no crash), the map, and the Sylhet districts index. Open one district guide from § 03 to confirm links resolve.

- [ ] **Step 5: Final type-check + push**

Run: `npx tsc --noEmit` → clean.
```bash
git push
```

---

## Self-review

- **Spec coverage:** data model (Task 1–2), `createTripFromTemplate` full day-by-day handoff (Task 3), multi-day visibility (Task 4, a discovered refinement honoring the spec's empty-`dateRange` choice), atlas layout with § 01/02/03 (Task 5–6), Rangpur content (Task 2), graceful absence for other divisions (Task 7 Step 4). ✅
- **Placeholders:** the only `/* from guide */` markers are in Task 2's template and Step 3 explicitly fails the build check (`noPlaceholder`) if any survive — they must be replaced with real copied coordinates. ✅
- **Type consistency:** `Itinerary`/`ItineraryDay`/`ItineraryStop` defined in Task 1 are used identically in Tasks 3, 5, 6; `createTripFromTemplate(id, template: Itinerary)` signature matches between the interface entry and the gallery call; `dayOffset = day - 1` (0-indexed) matches `ItineraryTab`'s `day.offset`. ✅
