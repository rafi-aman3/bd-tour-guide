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

2. **Editorial content** lives in `data/districts.json` and `data/divisions.json` and is read **server-side** via `fs.readFileSync(process.cwd() + "/data/...")`. This is keyed by the URL slug (`dhaka`, `coxs-bazar`, etc.) and contains `name`, `division`, `stats`, `mustVisit`, `heritageSites`, `transport`, `hotels`, `specialties`, `guide`, `advertisements`.

The `lib/map-data.ts` `DISTRICT_TO_DIVISION` map is a **third** independent source of truth used as a fallback when the JSON doesn't supply `division`. If you add/rename a district, update all three: `data/districts.json`, `lib/map-data.ts`, and `scripts/generate_districts.js`.

### Routing

App Router with three dynamic segments:
- `/` — country map, click a division → `/division/[division]`
- `/division/[division]` — division overview + districts map, click a district → `/district/[district]`
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
