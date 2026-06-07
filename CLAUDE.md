# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the built app
- `npm run lint` — run ESLint (uses `eslint-config-next` via `eslint.config.mjs`)
- `node scripts/split_map.mjs` — regenerate `public/data/divisions/*.json` and `public/data/BD_Divisions.json` from `public/data/BD_Districts.json` (uses `@turf/turf` to union district polygons into division polygons)
- `node scripts/generate_districts.js` — regenerate the base `data/districts.json` from the hard-coded `DISTRICT_TO_DIVISION` map plus per-district overrides defined in the script
- `node scripts/add_*.mjs` (`add_data_v2`, `add_heritage`, `add_hotels`, `add_transport`) — additive enrichers that mutate `data/districts.json` in place; they are idempotent only by overwrite, so re-running replaces the fields they own

There is no test suite.

## Architecture

### Two data pipelines (don't confuse them)

1. **GeoJSON for maps** lives in `public/` and is fetched from the client at runtime.
   - `public/data/BD_Divisions.json` — country-level divisions (merged polygons, has `ADM1_EN`).
   - `public/data/divisions/<slug>.json` — districts within one division (each feature has `ADM1_EN` + `ADM2_EN`).
   - `public/data/districts/<DistrictName>.json` — upazila polygons inside one district. Filenames are PascalCase (e.g. `Bagerhat.json`), not slugified, so `app/district/[district]/page.tsx` does a normalized fuzzy match (strip non-alphanumerics, lowercase) to find the right file.

2. **Editorial content** is read **server-side** through `getDistrictData(slug)` in `lib/district-data.ts`, which merges two layers:
   - `data/districts.json` — the base map (slug → record) holding generic placeholder content for every district.
   - `data/districts/<slug>.json` — a per-district **override file** whose top-level object *fully replaces* the base record for that slug (no deep merge). Filenames are the URL slug (e.g. `satkhira.json`). This is where a fully-built "field guide" lives.

   A record contains `name`, `division`, `stats`, `mustVisit`, `heritageSites`, `transport`, `hotels`, `specialties`, `guide`, `advertisements`, plus the field-guide fields `bucketlist`, `foods`, `famousPeople`, `didYouKnow`, `emergency`.

   **Cache caveat:** `loadAll()` in `lib/district-data.ts` holds a module-level `cache` populated once at startup. Editing a JSON file does **not** hot-reload it — the dev server must be restarted to pick up content changes (the `.ts` folio registry does hot-reload).

   **Division itineraries** are a parallel editorial read: `data/itineraries/<divisionSlug>.json` via `getDivisionItineraries(slug)` in `lib/itineraries.ts` (same `fs` + module-cache, same restart-to-refresh caveat; returns `[]` when no file exists). See "Division pages & predefined itineraries" below.

The `lib/map-data.ts` `DISTRICT_TO_DIVISION` map is a **third** independent source of truth used as a fallback when the JSON doesn't supply `division`. If you add/rename a district, update all three: `data/districts.json`, `lib/map-data.ts`, and `scripts/generate_districts.js`.

### Building a district field guide

Districts are upgraded one at a time from the generic placeholder to a full field guide. **All 64 districts are now built (N°01 Satkhira → N°64 Tangail)** and every one of the eight divisions is complete: Rangpur (8/8), Mymensingh (4/4), Sylhet (4/4), Khulna (10/10), Barisal (6/6), Rajshahi (8/8), Chittagong (11/11) and Dhaka (13/13). The authoritative, folio-ordered list is `BUILT_DISTRICTS` in `lib/field-guide-folio.ts`. For reference, the workflow used to build each one:

0. **Pre-flight slug check** — before building, confirm the override slug matches `slugify(GeoJSON ADM2_EN)` for that division (`public/data/divisions/<division>.json`), because the district page links to `/district/${slugify(ADM2_EN)}` and `getDistrictData` is an exact key lookup (no fuzzy match). **Build the override file under `slugify(ADM2_EN)`, even when the base `data/districts.json` key uses a different/"correct" spelling — the base key is then just orphaned.** Real cases hit so far: GeoJSON `Nawabganj`→`nawabganj` (base key was `chapainawabganj`); GeoJSON `Brahamanbaria`→`brahamanbaria` with the extra 'a' (base key was `brahmanbaria`); and the misspelled `bagherhat`→`bagerhat` rename. When you add such a slug, also add it to `DISTRICT_TO_DIVISION` in `lib/map-data.ts` (a mismatch otherwise falls the division back to the hardcoded "Dhaka" default). Also: Chittagong-division overrides must use `division: "Chittagong"` (the `DIVISION_COLORS`/`DISTRICT_TO_DIVISION` key), **not** "Chattogram", or `getThematicColor` falls through to the default blue palette.
1. **Research first, never fabricate** — verify places, stats, history, food and people via web search before writing (Banglapedia + Wikipedia for stats; local/news sources for sites, food, people). Use `"—"` for any phone/fee/hours/contact you can't verify (hidden at render; Emergency keeps the row with a "Call 999" pill). Don't invent hotels, bus operators, or businesses — leave `manualBookings`/`advertisements` empty instead. **The base `data/districts.json` stats are frequently wrong** — especially `established` (often a subdivision/municipality date) and `population`/`area` (often pre-2022). Always override with Banglapedia/Wikipedia and the 2022 census; the override fully replaces the base record.
2. **People discipline** — keep `famousPeople` apolitical: exclude recently-charged/active politicians (e.g. skipped Asaduzzaman Noor for Nilphamari, Shamim Osman for Narayanganj) and verify birthplace before claiming someone — several "famous from X" web hits are misattributions (Shakib Khan was born in Gopalganj not Narayanganj; Asad Chowdhury is Mehendiganj/Barisal not Barguna; Munier Chowdhury/Ferdousi Majumdar were born elsewhere but their family bari is in Raipur, so frame as "family home"). One well-attributed name beats three shaky ones. For sensitive regions (CHT — Rangamati), prefer apolitical religious/cultural figures and add tactful travel/permission notes; don't editorialize.
3. Write `data/districts/<slug>.json` mirroring an existing field guide's shape (e.g. `satkhira.json`), ~6 `mustVisit`, ~12 `bucketlist`, real `foods`/`famousPeople`/`didYouKnow`/`emergency`. Coordinates are approximate map pins. Set the `transport` availability flags honestly per district (bus everywhere; `train`/`launch`/`plane` only where real — e.g. Dhaka all four, Nilphamari air+rail via Saidpur, coastal/delta districts launch). Keep the override slug matching the base `data/districts.json` key (verify with `node -e "..."`). **Online vs offline booking:** each transport mode and the `hotels` block carry both `bookingUrls` (online aggregators, with `{token}` placeholders) and `manualBookings` (offline counters). For a district with no real online ticketing, leave `bookingUrls: []` and fill `manualBookings` with verified counter names + phones — `TransportWidget`/`HotelWidget` then hide the search form (origin/date, or check-in/out/rooms/guests) and online grid, rendering only the call-to-book list. **Hotel `manualBookings` entries require `coordinates: [lat, lng]`** (powers a "View on map" pin); bus/launch `manualBookings` are just `{ name, phone }`. A mode with `available: true` but neither list shows a "book locally" fallback.
4. Add the slug to `BUILT_DISTRICTS` in `lib/field-guide-folio.ts` — this gates field-guide rendering and auto-assigns the folio number (N°02, N°03 …).
5. Validate (`node -e "JSON.parse(...)"`) and `npx tsc --noEmit`, then commit straight to main (one commit per district: `content(<slug>): build out field guide N°NN with real data`).

### Division pages & predefined itineraries

`app/division/[division]/page.tsx` is an editorial **"atlas"** page (same field-guide tokens — see Thematic colors / UI conventions — but a distinct wide cover-plate layout, NOT the district's vertical folio). Sections: cover band · **§ 01 Trip Plans** · § 02 The Map (`DynamicMap mode="division-districts"`) · § 03 Districts index (links to `/district/<slug>` with `folioNumber()`; the district list is derived from `DISTRICT_TO_DIVISION` filtered by division name). It reads `data/divisions.json` only for the name + verified stats — don't reintroduce the old fabricated "tourists/year"/placeholder cuisine blocks.

**Predefined itineraries** live in `data/itineraries/<divisionSlug>.json` (`{ division, itineraries: [...] }`), typed by `Itinerary` in `lib/itineraries.ts`. Each itinerary: `id`, `title`, `subtitle`, `durationDays`, `bestSeason` (the "suitable for which time" badge), `seasonNote`, `pace` (`Easy|Moderate|Active`), `themeTags[]`, `districts[]` (unique, route order), `coverImage`, `summary`, `days[]` (`day` 1-indexed, `title`, `district` slug, `stops[{ name, coordinates, note }]`). **Stops must be copied verbatim (name + coordinates) from the already-built district field guides — never fabricate** (cross-check with a `node -e` against `data/districts/<slug>.json`).

**Planner handoff:** the client component `components/DivisionItineraries.tsx` renders the cards + a preview modal; "Make this trip" mints `crypto.randomUUID()`, calls `usePlannerStore.createTripFromTemplate(id, itinerary)`, then `router.push('/planner/'+id)`. The store action builds a full `TripData` (tripName=title, destinations=districts, `placesToExplore` = days→stops with **`dayOffset = day - 1`, 0-indexed to match `ItineraryTab`** which filters `p.dayOffset === day.offset`). Zustand is a module singleton so state survives the client nav. `ItineraryTab` was patched so its day count also derives from the max `dayOffset` (`totalDays = Math.max(totalDays, maxAssignedOffset + 1)`) — otherwise multi-day seeded plans are invisible until the user sets a date range.

**Status:** **Rangpur** (3 itineraries) and **Dhaka** (6 itineraries — all 13 districts covered; includes a single-district "Shariatpur Heritage Loop" built verbatim from a user-supplied Google Maps route) are built. The other 6 divisions are pending content — add a `data/itineraries/<slug>.json` each, one at a time (same cadence/discipline as district guides). Spec/plan: `docs/superpowers/specs/2026-05-30-division-page-itineraries-design.md`, `docs/superpowers/plans/2026-05-30-division-page-itineraries.md`.

### Routing

App Router with three dynamic segments:
- `/` — country map, click a division → `/division/[division]`
- `/division/[division]` — editorial atlas page: predefined trip itineraries (§ 01) + districts map + districts index; click a district → `/district/[district]` (see "Division pages & predefined itineraries")
- `/district/[district]` — district detail page with upazila map
- `/planner/[id]` — client-only trip planner; `id` is a UUID minted at the "Plan a Trip" link and used as the persistence key

Route params are `Promise<{...}>` (Next 16). Always `await params` and `await searchParams` in page components.

### Map components

Leaflet is browser-only — never import `BangladeshMap`, `UpazilaMap`, or `planner/MapPanel` directly into a server component. The pattern is:

- `components/DynamicMap.tsx` — wraps `BangladeshMap` with `next/dynamic({ ssr: false })`
- `components/DynamicUpazilaMap.tsx` — same wrapper for `UpazilaMap`
- `app/planner/[id]/PlannerClient.tsx` — dynamically imports `MapPanel` with `ssr: false`

`BangladeshMap` has a `mode` prop: `"divisions"` (country view, reads `BD_Divisions.json`) or `"division-districts"` (one division's districts, reads `divisions/<slug>.json`). It computes label centroids manually and uses a `FitBoundsHelper` child of `MapContainer` to fit bounds on mount/resize.

### Thematic color system

Every page derives its color palette from `getThematicColor(divisionName, districtName, opacity)` in `lib/map-data.ts`. Each division has a fixed HSL hue/saturation; per-district lightness is offset by a hash of the district name so neighbouring districts get visually distinct shades while staying in the division's color family. District/division pages pass three opacities (1, 0.15, 0.05) as `primaryColor` / `secondaryColor` / `mutedColor` into child widgets — keep this convention when adding new themed UI.

### Planner state

`lib/store/usePlannerStore.ts` is a Zustand store persisted to `localStorage` under `bd-tour-planner-storage`. Trips are keyed by UUID; all mutator actions (`addDestination`, `addPlace`, `addBudgetItem`, …) operate on `activeTripId`. The store has custom `merge` logic to rehydrate `Date` objects in `dateRange` from their serialized strings — preserve this when adding new `Date`-valued fields.

`PlannerClient` mounts, creates the trip if missing, then sets it active; it returns `null` until `isMounted` is true to avoid hydration mismatches from the persisted store.

Server-side place enrichment for the planner goes through `app/planner/actions.ts` (`"use server"`), which reads `data/districts.json` and returns flattened `mustVisit` + `heritageSites` entries.

### UI conventions

- shadcn/ui in `components/ui/` with the `new-york` style, base color `zinc`, alias `@/components/ui` (see `components.json`)
- Tailwind v4 (PostCSS plugin `@tailwindcss/postcss`); global styles in `app/globals.css`
- Path alias: `@/*` → repo root (`tsconfig.json`)
- Icons from `lucide-react`
