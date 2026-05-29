# Division Detail Page + Predefined Itineraries — Design Spec

**Date:** 2026-05-30
**Status:** Approved (brainstorming) → ready for implementation plan
**Scope of this spec:** Rebuild the division detail page (`/division/[division]`) into an editorial "atlas" layout whose hero is a set of **predefined trip itineraries**, and wire a one-click handoff that seeds a fully day-by-day trip into the existing planner. Author content for **Rangpur division only**; the other 7 divisions are content-only follow-ups (one file each, like district field guides).

---

## 1. Problem & goals

The division page (`app/division/[division]/page.tsx`) is the only page still in the **old brutalist design** (`rounded-[2rem]`, `font-black`, `shadow-2xl`, dark slate boxes) and reads a sparse, partly-placeholder `data/divisions.json`. It is visually inconsistent with the rest of the site (district pages use the editorial "field guide" language) and offers little beyond a map.

Goals:
1. Redesign the division page so it is **coherent with the field-guide design DNA but distinct from the district page** — a wide "atlas / trip-planning cover", not the district's vertical numbered folio.
2. Add **predefined itineraries** per division: each has a best season ("suitable for which time"), duration, and pace; a user previews it and clicks **"Make this trip"** to land in the planner with the whole plan pre-filled.
3. Reuse the existing planner data model and the already-built, verified district content — **no fabrication** (see content-integrity rule).

Non-goals (YAGNI):
- No editing/saving/sharing of itineraries — they are static authored data.
- No new persisted fields on `TripData` beyond what already exists.
- No itinerary auto-generation — itineraries are hand-authored from verified field-guide places.
- This spec implements the page + handoff + **Rangpur** content only. Divisions 2–8 are later content files.

---

## 2. Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Handoff depth | **Full day-by-day** — seed trip name + all districts as `destinations` + every stop pre-assigned to its day via `dayOffset`. |
| Page emphasis | **Itinerary hub + atlas** — itineraries are the hero; drop the old fabricated "tourists/year" and placeholder cuisine/crafts filler. |
| Itineraries per division | **3** — a short weekend, a classic multi-day, and a themed (heritage / nature) trip. |
| Itinerary span | **Multi-district within the division** (stays inside the one division). |
| Handoff mechanism | **Store action** `createTripFromTemplate` + client `router.push` (Approach A). |
| Itinerary preview | **Modal sheet** on the division page showing the day-by-day, with the CTA. |

---

## 3. Architecture overview

```
data/itineraries/<division>.json   ── authored static itineraries (self-contained: names+coords)
            │ (read server-side in the page)
            ▼
app/division/[division]/page.tsx   ── SERVER: reads divisions.json (stats/name) + itineraries
            │                          + derives district list; renders atlas layout
            ├── <DivisionItineraries divisionSlug itineraries primaryColor/>  (CLIENT)
            │        │ card → preview modal → "Make this trip"
            │        ▼
            │   usePlannerStore.createTripFromTemplate(uuid, template)  ── seeds TripData
            │        │
            │        ▼  router.push(`/planner/${uuid}`)
            │   /planner/[id] → PlannerClient finds trips[id] already seeded → setActiveTrip
            ├── <DynamicMap mode="division-districts" activeDivision={slug}/>  (existing)
            └── Districts index grid → /district/<slug> (folio numbers from field-guide-folio)
```

Key property: the itinerary template is **self-contained** (embeds place `name` + `coordinates`), so the handoff needs no server action and no district lookup. Zustand state lives in memory across client navigation, so by the time `PlannerClient` mounts, `trips[id]` exists.

---

## 4. Data model

### 4.1 Itinerary file — `data/itineraries/<division>.json`

One file per division (mirrors the per-district override pattern; lets us add divisions one at a time). Shape:

```jsonc
{
  "division": "rangpur",
  "itineraries": [
    {
      "id": "rangpur-heritage-loop",          // stable, kebab-case, used as React key + dedupe
      "title": "North Bengal Heritage Loop",   // becomes the planner tripName
      "subtitle": "Terracotta temples, palaces & the Teesta",
      "durationDays": 4,
      "bestSeason": "October–February",         // the "suitable for which time" badge
      "seasonNote": "Cool & dry; clearest Kanchenjunga dawns Dec–Jan",  // optional, shown in preview
      "pace": "Moderate",                        // "Easy" | "Moderate" | "Active"
      "themeTags": ["Heritage", "Architecture"], // 1–3 short tags
      "districts": ["rangpur", "dinajpur", "thakurgaon"],  // unique district slugs, in route order
      "coverImage": "https://images.unsplash.com/…",       // decorative, same source family as guides
      "summary": "One paragraph: what the trip shows and who it suits.",
      "days": [
        {
          "day": 1,                               // 1-indexed
          "title": "Rangpur town — palace & college",
          "district": "rangpur",                  // slug; must appear in districts[]
          "stops": [
            { "name": "Tajhat Palace", "coordinates": [25.69, 89.28], "note": "Crown-shaped palace, now Rangpur Museum" },
            { "name": "Carmichael College", "coordinates": [25.73, 89.27], "note": "1916 colonial campus" }
          ]
        }
      ]
    }
  ]
}
```

Authoring rules:
- `name` + `coordinates` for every stop are copied from the **already-built district field guide** (`data/districts/<slug>.json` `mustVisit`/`heritageSites`) so they are verified and map-accurate. Do not invent new places.
- `districts[]` = the unique set of `days[].district`, in visiting order.
- `bestSeason`/`pace`/`themeTags` are honest, derived from the field guides' `guide.bestTime` and the nature of the stops.
- A division with no itinerary file yet → the page renders without the Trip Plans section (graceful).

### 4.2 TypeScript types — `lib/itineraries.ts` (new)

```ts
export interface ItineraryStop { name: string; coordinates?: [number, number]; note?: string }
export interface ItineraryDay { day: number; title: string; district: string; stops: ItineraryStop[] }
export interface Itinerary {
  id: string; title: string; subtitle?: string; durationDays: number;
  bestSeason: string; seasonNote?: string; pace: "Easy" | "Moderate" | "Active";
  themeTags: string[]; districts: string[]; coverImage?: string; summary: string;
  days: ItineraryDay[];
}
export interface DivisionItineraries { division: string; itineraries: Itinerary[] }

// Server-only reader, mirrors getDistrictData's fs+cache pattern.
export function getDivisionItineraries(divisionSlug: string): Itinerary[]
```

`getDivisionItineraries` reads `data/itineraries/<slug>.json` with `fs` at request time (server component), returns `[]` if the file is missing. Module-level cache acceptable (same caveat as `district-data.ts`: restart dev server after JSON edits).

### 4.3 Planner store — extend `lib/store/usePlannerStore.ts`

Add to the `PlannerStore` interface and implementation:

```ts
createTripFromTemplate: (id: string, template: Itinerary) => void;
```

Behavior (single `set`, guard against overwrite like `createTrip`):
- If `trips[id]` already exists → no-op except `activeTripId = id`.
- Else build a `TripData`:
  - `tripName = template.title`
  - `destinations = template.districts` (already unique, in order)
  - `placesToExplore = template.days.flatMap(d => d.stops.map(s => ({ id: uuidv4(), name: s.name, district: d.district, coordinates: s.coordinates, dayOffset: d.day - 1 })))`
  - `dateRange = {}` (user picks their real dates), `travelers = 1`, `origin = ""`
  - `notes = `Prefilled from "${template.title}" · Best season: ${template.bestSeason}.``
  - `createdAt = new Date().toISOString()`
  - `activeTripId = id`

`dayOffset` is 0-indexed to match the planner's existing convention (`ItineraryTab`/`updatePlaceDay`). Verify the planner's day rendering treats `dayOffset = 0` as "Day 1" before shipping; if it instead treats `dayOffset` as a 1-indexed day number, seed `dayOffset = d.day` instead. (Confirm against `components/planner/ItineraryTab.tsx` during implementation — this is the one cross-component contract to pin down.)

No change to the `persist`/`merge` logic: no new `Date`-valued fields are introduced.

---

## 5. Division page layout (editorial "atlas")

Rebuild `app/division/[division]/page.tsx` (server component). Keep the field-guide design tokens — cream paper-grain background, `font-display` (Fraunces) headings at `font-semibold` (not `font-black`), `§ 0X` uppercase overlines, hairline rules (`border-[var(--hairline)]`), `rounded-md` cards on `bg-white/60–70`, no heavy shadows / no `rounded-[2rem]` / no dark slate boxes — and a single `primaryColor` accent from `getThematicColor(divisionName, divisionName, …)`.

Distinct-from-district layout = a **wide horizontal atlas plate**, not a vertical numbered folio:

1. **Cover band** — back-link to country map; kicker `Bangladesh · Division`; very large division wordmark; one-line orientation sentence; a row of small stat chips (`N districts · area · best season`). A faint map/contour motif distinguishes it from the district folio header. Stats pulled from `data/divisions.json` (verified fields only); drop placeholder/fabricated values.
2. **§ 01 Trip Plans** *(hero — `<DivisionItineraries/>` client component)* — the 3 itinerary cards: cover image, title + subtitle, a duration pill, a best-season pill, a pace marker, theme tags, and district chips. Card click → preview modal.
3. **§ 02 The Map** — existing `DynamicMap mode="division-districts" activeDivision={slug}` inside a framed editorial plate.
4. **§ 03 Districts** — index grid of the division's districts, each a small card linking to `/district/<slug>`, showing the field-guide folio number via `folioNumber(slug)` when built.

District-list source: derive the division's district slugs from `DISTRICT_TO_DIVISION` in `lib/map-data.ts` (filter entries whose value matches the division name), so it stays correct without a new data source.

### 5.1 `DivisionItineraries.tsx` (client component)

- Props: `{ divisionSlug: string; itineraries: Itinerary[]; primaryColor; secondaryColor; mutedColor }`.
- Renders the card grid + a controlled preview modal (reuse `components/ui` dialog/sheet if present; otherwise a lightweight in-file modal consistent with the editorial language).
- Preview modal shows: summary, best-season + season-note, pace, total stops, and the **day-by-day list** (Day N · title · district · stops with notes).
- **"Make this trip"** handler:
  ```ts
  const id = crypto.randomUUID();
  createTripFromTemplate(id, itinerary);
  router.push(`/planner/${id}`);
  ```
- Uses `usePlannerStore` selector for `createTripFromTemplate`. No SSR concerns (client component); guard any `window`/`crypto` use to the click handler.

### 5.2 Visual build

Use the **`/ui-ux-pro-max`** skill during implementation to design the itinerary card and cover-band treatment (within the established editorial tokens). The card must read clearly as a *trip* (duration + season + pace foremost), not as a place card.

---

## 6. Rangpur content (`data/itineraries/rangpur.json`)

Rangpur division districts (8): rangpur, dinajpur, gaibandha, kurigram, lalmonirhat, nilphamari, panchagarh, thakurgaon. All have built field guides — stops are copied from them.

1. **Rangpur City Weekend** — `durationDays: 2`, `pace: "Easy"`, `bestSeason: "All year (best Oct–Feb)"`, tags `["City break","Heritage"]`, districts `["rangpur"]`.
   Day 1: Tajhat Palace (Rangpur Museum), Carmichael College, town. Day 2: Begum Rokeya Memorial (Payrabondh, Mithapukur), Vinno Jagat, Mithapukur Mosque.
2. **North Bengal Heritage Loop** — `durationDays: 4`, `pace: "Moderate"`, `bestSeason: "October–February"`, tags `["Heritage","Architecture"]`, districts `["rangpur","dinajpur","thakurgaon"]`.
   Day 1 Rangpur (Tajhat, Carmichael) → Day 2 Dinajpur (Kantajew Temple, Dinajpur Rajbari) → Day 3 Dinajpur (Ramsagar) → Day 4 Thakurgaon (Suryapuri mango tree, Jamalpur Zamindar Bari Mosque).
3. **Far-North Frontier & Hills** — `durationDays: 4`, `pace: "Active"`, `bestSeason: "October–February (Kanchenjunga clearest Dec–Jan)"`, tags `["Nature","Frontier"]`, districts `["panchagarh","thakurgaon","lalmonirhat"]`.
   Panchagarh (Kanchenjunga view at Tetulia, Banglabandha Zero Point, Bhitargarh fort city, Tetulia tea) → Thakurgaon (Suryapuri tree / Raja Tonknath Rajbari) → Lalmonirhat (Tin Bigha Corridor / Dahagram, Teesta Barrage at Doani).

Exact stop names + coordinates copied verbatim from each district's `data/districts/<slug>.json` during implementation.

---

## 7. Files touched

| File | Change |
|---|---|
| `lib/itineraries.ts` | **new** — types + `getDivisionItineraries` server reader. |
| `data/itineraries/rangpur.json` | **new** — 3 Rangpur itineraries. |
| `lib/store/usePlannerStore.ts` | add `createTripFromTemplate` action + interface entry. |
| `app/division/[division]/page.tsx` | **rebuild** into the atlas layout (editorial tokens); read itineraries + derive districts. |
| `components/DivisionItineraries.tsx` | **new** — client itinerary gallery + preview modal + handoff. |
| (maybe) `components/ui/*` | reuse existing dialog/sheet if available. |

Out of scope here: `data/itineraries/{other 7}.json` (later, one at a time).

---

## 8. Risks / things to verify during implementation

1. **`dayOffset` indexing contract** — confirm `ItineraryTab` renders `dayOffset = 0` as "Day 1". Adjust seed (`day-1` vs `day`) accordingly. This is the single most important correctness check.
2. **Store rehydration timing** — confirm in-memory zustand state survives the client `router.push` to `/planner/{id}` (it should; same tab, no full reload). If the planner is ever hit via hard navigation, the localStorage persist covers it.
3. **`getThematicColor` keys** — division names must match the `DIVISION_COLORS` keys (e.g. "Chittagong" not "Chattogram") — already handled for Rangpur.
4. **Cache caveat** — `getDivisionItineraries` caches at startup like `district-data.ts`; document "restart dev server after editing itinerary JSON."
5. **Graceful absence** — divisions without an itinerary file render the page minus § 01.

---

## 9. Acceptance criteria

- Visiting `/division/rangpur` shows the new atlas layout in the editorial language, visibly distinct from a district page, with no fabricated stats.
- § 01 shows 3 Rangpur itinerary cards, each with duration, best season, and pace.
- Clicking a card opens a day-by-day preview; "Make this trip" navigates to `/planner/<uuid>` with: tripName set, all districts in destinations, and every stop present and assigned to the correct day in the planner's itinerary view.
- `npx tsc --noEmit` clean; one commit (or a small series) straight to main.
- The other 7 divisions still render (without § 01) and are unbroken.
