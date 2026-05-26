# Satkhira Field Guide + Bucketlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/district/satkhira` into the project's first fully-built "field guide" page — real content, a checkable Bucketlist, plus Foods / Famous People / Did-You-Know / Emergency sections — while keeping every other district visually unchanged.

**Architecture:** Editorial content stays in JSON. The Satkhira record is moved out of the monolithic `data/districts.json` into `data/districts/satkhira.json`; a small loader merges base + overrides per request. New server/client components render the new sections, all gated on `has.*` flags so districts without data render identically to today. A "field guide" visual layer (Fraunces display font, cream paper background, hairline rules, folio header) switches on only when a district is fully built.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Zustand (planner only — Bucketlist uses raw `localStorage`), Leaflet (no changes), `next/font/google`.

---

## Pre-flight context (read before Task 1)

- The project has no test suite (see `CLAUDE.md`). Verification per task is `npm run lint`. A single `npm run build` and visual walkthrough happen in Task 12. **Do not add a test framework.**
- `app/district/[district]/page.tsx` is a Server Component. `Bucketlist` and `DidYouKnow` are the only new Client Components (`"use client"` at top).
- Route params are `Promise<{...}>` (Next 16). Always `await params`.
- Leaflet imports stay browser-only — none of the new components touch maps directly.
- Existing helpers to read: `lib/map-data.ts` (`getThematicColor`, `DISTRICT_TO_DIVISION`), `app/planner/actions.ts` (data shape consumer), `components/HeritageSection.tsx` (shape conventions for cards).
- Brand color usage: every page uses `getThematicColor(division, districtSlug, opacity)` for `primary | secondary | muted`. **Never hard-code a per-section color** — always pass these in as props.
- File paths in this plan are repo-relative (root = `/Users/rafiaman/Desktop/rafi/bd-tour-guide`).
- Em-dash convention: a string field equal to `"—"` (U+2014) means "unknown — hide this row at render time," except inside `Emergency` where the row is kept (see Task 9).
- Commits per task. Push only at Task 13.

---

## File Structure (locked decisions)

**New files:**

| Path | Responsibility |
|---|---|
| `data/districts/satkhira.json` | Satkhira's full enriched record. Per-district override file. |
| `lib/district-data.ts` | Single source of truth: `getDistrictData(slug)`, `getAllDistrictSlugs()`, plus exported TypeScript types for the extended schema. Merges `data/districts.json` with every `data/districts/*.json`. |
| `lib/field-guide-folio.ts` | Tiny module exporting `BUILT_DISTRICTS: string[]` and `folioNumber(slug)` → `"N°01"` etc. |
| `components/Bucketlist.tsx` | Client. The headline interaction. localStorage per district, filter chips, animated check. |
| `components/FoodChecklist.tsx` | Server. Grid of dishes. |
| `components/FamousPeople.tsx` | Server. Portrait cards. |
| `components/DidYouKnow.tsx` | Client. Sidebar card, click-to-advance trivia. |
| `components/Emergency.tsx` | Server. Yellow-pages contacts block with em-dash exception. |
| `components/FieldGuideFolio.tsx` | Server. The signature header. |
| `components/InProgressStrip.tsx` | Server. Muted strip linking to Satkhira from non-fully-built districts. |

**Edited files:**

| Path | Change |
|---|---|
| `app/district/[district]/page.tsx` | Swap to `getDistrictData`, render new sections gated on `has.*`, swap mustVisit cards for field-guide entries, conditional cream paper bg + folio + InProgressStrip. |
| `app/planner/actions.ts` | Use `getDistrictData` instead of inline `fs.readFileSync`. |
| `app/layout.tsx` | Load Fraunces + Inter Tight via `next/font/google`, attach CSS variables to `<body>`. |
| `app/globals.css` | Add `.font-display`, `.font-body`, `.tabular-nums`, paper grain inline SVG, hairline border color custom property. |
| `data/districts.json` | Remove the `satkhira` key only. |

**Unchanged:** `BangladeshMap`, `UpazilaMap`, `DynamicUpazilaMap`, `HeritageSection`, `TransportWidget`, `HotelWidget`, `LocalSpecialtiesWidget`, `LocalAdsSidebar`, planner module, scripts/.

---

## Task 1: Data loader + extended types + extract Satkhira to its own file

**Files:**
- Create: `lib/district-data.ts`
- Create: `data/districts/satkhira.json` (initial — copy of current Satkhira record, content untouched)
- Modify: `data/districts.json` (remove the `satkhira` key, lines 7940–8132)
- Modify: `app/district/[district]/page.tsx` (lines 4, 17–22)
- Modify: `app/planner/actions.ts`

- [ ] **Step 1.1 — Read the current Satkhira block to copy it verbatim**

Run:
```bash
sed -n '7940,8132p' data/districts.json > /tmp/satkhira-block.txt
wc -l /tmp/satkhira-block.txt
```
Expected: `193 /tmp/satkhira-block.txt`. Keep this file as a reference; do not commit it.

- [ ] **Step 1.2 — Create `data/districts/satkhira.json`**

This file is the Satkhira record as a standalone JSON object (no outer slug key). Take the value (lines 7941–8131 from `data/districts.json`) and save it. The file's top level is the object that begins with `"name": "Satkhira"` and ends with the closing `}` matching the `"satkhira": {` line.

```json
{
  "name": "Satkhira",
  "division": "Khulna",
  "stats": {
    "area": "2020.81 sq km",
    "population": "1,387,510",
    "established": "1820",
    "attractions": "10+"
  },
  "mustVisit": [
    {
      "name": "Satkhira Central Park",
      "description": "A popular recreational spot for locals and tourists.",
      "image": "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "specialties": [
    { "type": "food", "name": "Famous Satkhira Misti House", "description": "The legendary heritage sweet shop known across Satkhira for its authentic preparation over generations.", "venue": "Central City Bazaar" },
    { "type": "craft", "name": "Satkhira Handloom Sharee", "description": "Intricately woven traditional garments showcasing the finest local weaving heritage of Satkhira.", "venue": "Heritage Weavers Palli" },
    { "type": "festival", "name": "Satkhira Cultural Festival", "description": "An annual celebration of heritage, music, and local art native to the heart of the district.", "timing": "Mid-Winter / Late December" },
    { "type": "mela", "name": "Annual Authentic Satkhira Mela", "description": "The largest village fair gathering thousands of artisans, merchants, and singers in the region.", "timing": "Mid-April", "coordinates": [23.97096374780367, 90.84652479513096] }
  ],
  "guide": {
    "bestTime": "October to March",
    "gettingThere": "Accessible by road and rail from major cities.",
    "difficulty": "Easy"
  },
  "heritageSites": [
    { "name": "Protected Heritage Site of Satkhira", "image": "https://images.unsplash.com/photo-1599824632881-8b43f07a424e?auto=format&fit=crop&q=80&w=800", "coordinates": [24.17970060558484, 90.62905121550469] }
  ],
  "transport": {
    "bus": { "available": true, "bookingUrls": [{ "name": "BDTickets", "url": "https://bdtickets.com/bus/search/{fromCityLowercase}-to-satkhira?journeyDate={date}" }, { "name": "Shohoz", "url": "https://www.shohoz.com/bus-tickets/booking/bus/search?fromcity={fromCity}&tocity=Satkhira&doj={date}&dor=" }], "manualBookings": [{ "name": "Hanif Paribahan", "phone": "01711-XXXX01" }, { "name": "Ena Transport", "phone": "01711-XXXX02" }, { "name": "Green Line", "phone": "01711-XXXX03" }] },
    "train": { "available": true, "bookingUrls": [{ "name": "Bangladesh Railway", "url": "https://eticket.railway.gov.bd/booking/train/search?fromcity={fromCity}&tocity=Satkhira&doj={date}&class=SNIGDHA" }], "manualBookings": [{ "name": "Regional Station Inquiry", "phone": "01711-XXXX04" }] },
    "launch": { "available": true, "bookingUrls": [{ "name": "BDTickets Launch", "url": "https://bdtickets.com/launch/search/{fromCityLowercase}-to-satkhira?journeyDate={date}" }], "manualBookings": [{ "name": "Sadarghat Terminal Box", "phone": "01711-XXXX05" }, { "name": "BIWTA Inquiry", "phone": "01711-XXXX06" }] },
    "plane": { "available": true, "bookingUrls": [{ "name": "Biman Bangladesh", "url": "https://biman-airlines.com/?from={fromCityAir}&to=CXB&date={date}" }, { "name": "US-Bangla", "url": "https://usbair.com/" }], "manualBookings": [{ "name": "Biman Agency Ticket Office", "phone": "01711-XXXX07" }] }
  },
  "hotels": {
    "available": true,
    "bookingUrls": [
      { "name": "GoZayaan", "url": "https://gozayaan.com/hotel/list?checkin={checkin}&checkout={checkout}&search=&location=Satkhira&rooms={rooms},2,0&child_ages=&sort=POPULARITY" },
      { "name": "ShareTrip", "url": "https://sharetrip.net/hotel-search?checkInDate={checkin}&checkOutDate={checkout}&cityName=Satkhira&countryName=Bangladesh&currency=BDT&limit=10&nationality=BD&numberOfGuestsInRooms=%5B%7B%22adults%22%3A{guests}%2C%22children%22%3A%5B%5D%7D%5D&offset=0&regionId=3002" }
    ],
    "manualBookings": [
      { "name": "Grand Satkhira Resort & Spa", "phone": "+880 1711-000001", "coordinates": [24.725071339200248, 89.53756413661043] },
      { "name": "Hotel Satkhira International", "phone": "+880 1911-000002", "coordinates": [24.77507133920025, 89.48756413661043] }
    ]
  },
  "advertisements": [
    { "type": "guide", "name": "Ahmed Rafiq", "rating": 4.6, "languages": ["Bengali", "English"], "phone": "+880 1711-555555" },
    { "type": "business", "name": "Satkhira Tourist Rentals", "description": "AC Microbus & Car hires for district-wide exploring.", "phone": "+880 1911-555555" }
  ]
}
```

(Task 10 will replace most of this with real content.)

- [ ] **Step 1.3 — Remove the Satkhira key from `data/districts.json`**

Open `data/districts.json`. Delete the entire block from line `7940` (`  "satkhira": {`) through line `8132` (`  },`) inclusive. Make sure the *previous* district's closing `},` is preserved and the *next* district's `"barguna": {` starts on a fresh line at the same indent level. Verify the file is still valid JSON:

```bash
node -e 'JSON.parse(require("fs").readFileSync("data/districts.json","utf8")); console.log("ok")'
```
Expected: `ok`

- [ ] **Step 1.4 — Create `lib/district-data.ts`**

```ts
import fs from "fs";
import path from "path";

// -------- Types --------

export type DistrictMustVisit = {
  name: string;
  description: string;
  image: string;
  type?: "nature" | "religious" | "heritage" | "landmark" | "market";
  history?: string;
  coordinates?: [number, number];
  practical?: {
    hours?: string;
    entryFee?: string;
    contact?: string;
    website?: string;
  };
  howToReach?: {
    fromDistrictTown: string;
    distanceKm?: number;
    transport: string;
  };
  bestTime?: string;
  tips?: string[];
};

export type BucketlistItem = {
  id: string;
  title: string;
  category: "place" | "experience" | "food" | "moment";
  detail: string;
  whereOrHow: string;
  bestTime?: string;
};

export type DistrictFood = {
  name: string;
  description: string;
  whereToFind: string;
  image?: string;
};

export type DistrictFamousPerson = {
  name: string;
  knownFor: string;
  era?: string;
  image?: string;
};

export type DistrictEmergency = {
  generalEmergency: string;
  police?: { name: string; phone: string }[];
  hospital?: { name: string; phone: string }[];
  fire?: { phone: string };
  touristPolice?: { phone: string };
};

export type DistrictRecord = {
  name: string;
  division: string;
  tagline?: string;
  stats?: { area?: string; population?: string; established?: string; attractions?: string };
  mustVisit?: DistrictMustVisit[];
  specialties?: Array<Record<string, unknown>>;
  guide?: { bestTime?: string; gettingThere?: string; difficulty?: string };
  heritageSites?: Array<Record<string, unknown>>;
  transport?: Record<string, unknown>;
  hotels?: Record<string, unknown>;
  advertisements?: Array<Record<string, unknown>>;
  bucketlist?: BucketlistItem[];
  foods?: DistrictFood[];
  famousPeople?: DistrictFamousPerson[];
  didYouKnow?: string[];
  emergency?: DistrictEmergency;
};

// -------- Loader --------
//
// Merge rule: `data/districts.json` is the base map (slug -> record).
// Every file at `data/districts/<slug>.json` is an override for that slug —
// the override file's top-level object replaces the base record entirely
// (no deep merge, to keep the rule predictable). Slug is derived from the
// filename (e.g. `satkhira.json` -> slug `satkhira`).

let cache: Record<string, DistrictRecord> | null = null;

function loadAll(): Record<string, DistrictRecord> {
  if (cache) return cache;

  const baseFile = path.join(process.cwd(), "data", "districts.json");
  const base = JSON.parse(fs.readFileSync(baseFile, "utf8")) as Record<string, DistrictRecord>;

  const overridesDir = path.join(process.cwd(), "data", "districts");
  let overrides: Record<string, DistrictRecord> = {};
  if (fs.existsSync(overridesDir)) {
    for (const file of fs.readdirSync(overridesDir)) {
      if (!file.endsWith(".json")) continue;
      const slug = file.replace(/\.json$/, "");
      const filePath = path.join(overridesDir, file);
      overrides[slug] = JSON.parse(fs.readFileSync(filePath, "utf8")) as DistrictRecord;
    }
  }

  cache = { ...base, ...overrides };
  return cache;
}

export function getDistrictData(slug: string): DistrictRecord | undefined {
  return loadAll()[slug];
}

export function getAllDistrictSlugs(): string[] {
  return Object.keys(loadAll());
}
```

- [ ] **Step 1.5 — Switch `app/district/[district]/page.tsx` to the loader**

In `app/district/[district]/page.tsx`:

Replace lines 4–5:
```ts
import fs from "fs";
import path from "path";
```
with:
```ts
import path from "path";
import { getDistrictData } from "@/lib/district-data";
```

Replace lines 17–22 (the `async function getDistrictData(slug: string)` block) with nothing — delete it entirely.

Replace line 26:
```ts
const data = await getDistrictData(district);
```
(unchanged textually — the imported one now wins because the local definition is gone). Verify the import path resolves: `getDistrictData` should be the only `getDistrictData` symbol in the file.

`fs` is still used to read the upazila GeoJSON directory (lines 43–59) — leave that block intact, but change the import on line 4 to add `import fs from "fs";` back. Final imports at the top of the file should be:

```ts
import Link from "next/link";
import { ChevronLeft, MapPin, Users, Calendar, Camera, Utensils, Navigation, Info } from "lucide-react";
import { DISTRICT_TO_DIVISION, getThematicColor } from "@/lib/map-data";
import fs from "fs";
import path from "path";
import { getDistrictData } from "@/lib/district-data";
import HeritageSection from "@/components/HeritageSection";
import DynamicUpazilaMap from "@/components/DynamicUpazilaMap";
import TransportWidget from "@/components/TransportWidget";
import HotelWidget from "@/components/HotelWidget";
import LocalSpecialtiesWidget from "@/components/LocalSpecialtiesWidget";
import LocalAdsSidebar from "@/components/LocalAdsSidebar";
```

(`Utensils` and `Info` are currently unused — leave the unused imports alone; later tasks will use them.)

- [ ] **Step 1.6 — Switch `app/planner/actions.ts` to the loader**

Read the current file first:
```bash
cat app/planner/actions.ts
```

Find the `fs.readFileSync(... "districts.json" ...)` call. Replace any `JSON.parse(fs.readFileSync(...))` that reads `data/districts.json` with a call to `getAllDistrictSlugs()` + `getDistrictData(slug)` from `@/lib/district-data`. If the existing code iterates over all districts to flatten `mustVisit + heritageSites`, the new code looks like:

```ts
import { getAllDistrictSlugs, getDistrictData } from "@/lib/district-data";

// inside the action:
const slugs = getAllDistrictSlugs();
const enriched = slugs.flatMap((slug) => {
  const d = getDistrictData(slug);
  if (!d) return [];
  // ... existing flattening logic, replacing the previous `data[slug]` with `d`
});
```

Keep the existing return shape identical. Remove the now-unused `fs` and `path` imports if nothing else needs them.

- [ ] **Step 1.7 — Lint**

```bash
npm run lint
```
Expected: no new errors related to your changes (existing warnings are fine).

- [ ] **Step 1.8 — Smoke-check the loader from Node**

```bash
node -e 'const { getDistrictData, getAllDistrictSlugs } = require("./lib/district-data.ts");' 2>&1 || true
# Node can't import TS directly — use the Next build path instead:
npm run build 2>&1 | tail -20
```

The build is the real check. Expected: `Compiled successfully` in the tail. If the build fails, the loader has a type or runtime error. Fix before continuing.

- [ ] **Step 1.9 — Commit**

```bash
git add lib/district-data.ts data/districts/satkhira.json data/districts.json app/district/[district]/page.tsx app/planner/actions.ts
git commit -m "$(cat <<'EOF'
refactor: split Satkhira out of districts.json + extract loader

Adds lib/district-data.ts with extended TypeScript types and a
merge loader that combines data/districts.json with per-slug
files under data/districts/. Moves Satkhira's record to its own
file (content unchanged; deeper enrichment lands in a later
commit). District page and planner actions switch to the loader.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Fonts + global CSS primitives

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 2.1 — Read current layout**

```bash
cat app/layout.tsx
```

Note the existing structure (Geist Sans imports, body className, etc.). The new fonts come from `next/font/google` and expose CSS variables; do not replace existing fonts, add alongside.

- [ ] **Step 2.2 — Edit `app/layout.tsx` to load Fraunces + Inter Tight**

At the top, add (after the existing `next/font/google` imports — if none exist, add the block fresh):

```ts
import { Fraunces, Inter_Tight } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
```

On the `<body>` element, append both class variables to the existing `className`:

```tsx
<body className={`${existingClasses} ${fraunces.variable} ${interTight.variable}`}>
```

(Replace `existingClasses` with whatever is currently there — read the file to see.)

- [ ] **Step 2.3 — Add utilities and tokens to `app/globals.css`**

Append to `app/globals.css`:

```css
@layer utilities {
  .font-display {
    font-family: var(--font-display), ui-serif, Georgia, serif;
    font-feature-settings: "ss01";
  }
  .font-body {
    font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  }
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}

:root {
  --hairline: rgb(0 0 0 / 0.08);
  --paper-cream: #fbf8f1;
}

/* Paper grain — applied via a ::before on the field-guide main card. */
.paper-grain {
  position: relative;
  isolation: isolate;
}
.paper-grain::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.03;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>");
  border-radius: inherit;
}
.paper-grain > * {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 2.4 — Lint**

```bash
npm run lint
```
Expected: no new errors.

- [ ] **Step 2.5 — Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "$(cat <<'EOF'
feat(ui): load Fraunces + Inter Tight, add field-guide CSS tokens

Adds --font-display and --font-body variables, .font-display /
.font-body / .tabular-nums utilities, --hairline + --paper-cream
tokens, and a .paper-grain helper that paints a subtle SVG
turbulence overlay for the field-guide main card.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Folio module + `FieldGuideFolio` component

**Files:**
- Create: `lib/field-guide-folio.ts`
- Create: `components/FieldGuideFolio.tsx`

- [ ] **Step 3.1 — Create `lib/field-guide-folio.ts`**

```ts
// The list of districts that have been fully built as field guides.
// Order matters — the folio number is 1-indexed based on this array.
export const BUILT_DISTRICTS: string[] = ["satkhira"];

export function folioNumber(slug: string): string | null {
  const idx = BUILT_DISTRICTS.indexOf(slug);
  if (idx === -1) return null;
  const n = idx + 1;
  return `N°${n.toString().padStart(2, "0")}`;
}
```

- [ ] **Step 3.2 — Create `components/FieldGuideFolio.tsx`**

```tsx
type Props = {
  district: string;
  division: string;
  folio: string; // "N°01"
};

export default function FieldGuideFolio({ district, division, folio }: Props) {
  return (
    <div className="my-12 first:mt-4 select-none">
      <div className="flex items-center justify-between gap-4 text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-600 font-body tabular-nums">
        <span className="truncate">
          <span className="text-slate-900">{district}</span>
          <span className="mx-3 text-slate-300">·</span>
          <span>{division} Division</span>
          <span className="mx-3 text-slate-300">·</span>
          <span>Field Guide</span>
        </span>
        <span className="text-slate-900 shrink-0">{folio}</span>
      </div>
      <div className="mt-3 h-px w-full bg-[var(--hairline)]" />
    </div>
  );
}
```

- [ ] **Step 3.3 — Lint**

```bash
npm run lint
```
Expected: no new errors.

- [ ] **Step 3.4 — Commit**

```bash
git add lib/field-guide-folio.ts components/FieldGuideFolio.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add field-guide folio header + built-districts registry

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `InProgressStrip` component

**Files:**
- Create: `components/InProgressStrip.tsx`

- [ ] **Step 4.1 — Create `components/InProgressStrip.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  primaryColor: string;
};

export default function InProgressStrip({ primaryColor }: Props) {
  return (
    <div className="mt-16 mb-2 flex items-center justify-between gap-4 px-2 py-3 border-y border-[var(--hairline)] text-sm font-body text-slate-600">
      <span className="tracking-wide">
        This district&rsquo;s field guide is in progress.
      </span>
      <Link
        href="/district/satkhira"
        className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.18em] text-[0.7rem] transition-opacity hover:opacity-70"
        style={{ color: primaryColor }}
      >
        Satkhira <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
```

- [ ] **Step 4.2 — Lint**

```bash
npm run lint
```
Expected: no new errors.

- [ ] **Step 4.3 — Commit**

```bash
git add components/InProgressStrip.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add InProgressStrip for non-fully-built districts

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `Bucketlist` client component

**Files:**
- Create: `components/Bucketlist.tsx`

- [ ] **Step 5.1 — Create `components/Bucketlist.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { BucketlistItem } from "@/lib/district-data";

type Category = BucketlistItem["category"] | "all";

type Props = {
  items: BucketlistItem[];
  districtSlug: string;
  primaryColor: string;
  mutedColor: string;
};

const CATEGORY_LABEL: Record<Exclude<Category, "all">, string> = {
  place: "Place",
  experience: "Experience",
  food: "Food",
  moment: "Moment",
};

export default function Bucketlist({ items, districtSlug, primaryColor, mutedColor }: Props) {
  const storageKey = `bd-bucketlist:${districtSlug}`;

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Category>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount only.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setChecked(new Set(arr));
      }
    } catch {
      // localStorage unavailable — start fresh.
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(Array.from(checked)));
    } catch {
      // ignore quota / private-mode errors
    }
  }, [checked, hydrated, storageKey]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setChecked(new Set());
    setResetConfirm(false);
  }

  const counts = useMemo(() => {
    const c: Record<Category, number> = { all: items.length, place: 0, experience: 0, food: 0, moment: 0 };
    for (const it of items) c[it.category] += 1;
    return c;
  }, [items]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((it) => it.category === filter)),
    [items, filter]
  );

  const done = useMemo(() => items.filter((it) => checked.has(it.id)).length, [items, checked]);
  const total = items.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="mb-16">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
            § 01 &nbsp;The Bucketlist
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
            {total} things in this district
          </h2>
        </div>
        <div className="text-right font-body tabular-nums shrink-0">
          <div className="text-2xl font-semibold text-slate-900">{done}<span className="text-slate-400"> / {total}</span></div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{percent}% done</div>
        </div>
      </header>

      {/* Progress rule */}
      <div className="relative h-px w-full bg-[var(--hairline)] mb-6 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: primaryColor }}
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "place", "experience", "food", "moment"] as Category[]).map((cat) => {
          const active = filter === cat;
          const label = cat === "all" ? "All" : CATEGORY_LABEL[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-body font-semibold tracking-wide tabular-nums transition-colors border"
              style={{
                backgroundColor: active ? primaryColor : "transparent",
                color: active ? "white" : "rgb(71 85 105)",
                borderColor: active ? primaryColor : "var(--hairline)",
              }}
            >
              {label} <span className="opacity-70">· {counts[cat]}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <ol className="border-t border-[var(--hairline)]">
        {visible.map((it, idx) => {
          const isChecked = checked.has(it.id);
          const isOpen = expanded === it.id;
          return (
            <li
              key={it.id}
              className="border-b border-[var(--hairline)] py-4 grid grid-cols-[auto_2rem_1fr_auto] items-start gap-3"
            >
              <button
                aria-label={isChecked ? `Uncheck ${it.title}` : `Check ${it.title}`}
                onClick={() => toggle(it.id)}
                className="mt-1 h-5 w-5 rounded border flex items-center justify-center transition-colors"
                style={{
                  borderColor: isChecked ? primaryColor : "var(--hairline)",
                  backgroundColor: isChecked ? primaryColor : "transparent",
                }}
              >
                {isChecked && (
                  <svg viewBox="0 0 16 16" className="h-3 w-3 text-white">
                    <path
                      d="M3 8.5 L7 12 L13 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <div className="font-body tabular-nums text-sm text-slate-400 pt-0.5 text-right">
                {(idx + 1).toString().padStart(2, "0")}
              </div>

              <div>
                <button
                  onClick={() => setExpanded(isOpen ? null : it.id)}
                  className="block text-left w-full"
                >
                  <span
                    className={`font-body text-base md:text-lg leading-snug ${isChecked ? "text-slate-400 line-through" : "text-slate-900"}`}
                    style={{ textDecorationColor: primaryColor }}
                  >
                    {it.title}
                  </span>
                  <span className="ml-2 inline-block align-middle text-[0.65rem] uppercase tracking-[0.16em] text-slate-500 font-semibold">
                    {CATEGORY_LABEL[it.category]}
                  </span>
                  <span className="ml-2 inline-block align-middle text-xs text-slate-500">
                    · {it.whereOrHow}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-3 pl-0 pr-4 text-sm text-slate-600 font-body leading-relaxed border-l-2 pl-3" style={{ borderColor: mutedColor }}>
                    <p>{it.detail}</p>
                    {it.bestTime && it.bestTime !== "—" && (
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        Best time · <span className="text-slate-700 normal-case tracking-normal">{it.bestTime}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                aria-label={isOpen ? "Collapse" : "Expand"}
                onClick={() => setExpanded(isOpen ? null : it.id)}
                className="pt-1.5 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </li>
          );
        })}
      </ol>

      {/* Reset */}
      <div className="mt-6 flex justify-end text-xs font-body">
        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            disabled={done === 0}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40 disabled:hover:text-slate-400"
          >
            <RotateCcw className="h-3 w-3" /> Reset list
          </button>
        ) : (
          <span className="inline-flex items-center gap-3 text-slate-600">
            Reset all checks?
            <button onClick={reset} className="font-semibold" style={{ color: primaryColor }}>
              Confirm
            </button>
            <button onClick={() => setResetConfirm(false)} className="text-slate-400 hover:text-slate-700">
              Cancel
            </button>
          </span>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5.2 — Lint**

```bash
npm run lint
```
Expected: no new errors.

- [ ] **Step 5.3 — Commit**

```bash
git add components/Bucketlist.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add Bucketlist client component with localStorage progress

Mixed checklist of places / experiences / foods / moments. Filter
chips with per-category counts, hairline progress rule, animated
check, click-to-expand details, scoped per-district localStorage,
single-step Reset confirm.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `FoodChecklist` component

**Files:**
- Create: `components/FoodChecklist.tsx`

- [ ] **Step 6.1 — Create `components/FoodChecklist.tsx`**

```tsx
import { Utensils, Camera } from "lucide-react";
import type { DistrictFood } from "@/lib/district-data";

type Props = {
  foods: DistrictFood[];
  primaryColor: string;
  mutedColor: string;
};

export default function FoodChecklist({ foods, primaryColor, mutedColor }: Props) {
  if (foods.length === 0) return null;

  return (
    <section className="mb-16">
      <header className="mb-6">
        <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
          § 04 &nbsp;What to Eat
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight flex items-center gap-3">
          <Utensils className="h-7 w-7" style={{ color: primaryColor }} />
          {foods.length} dishes worth the trip
        </h2>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t border-[var(--hairline)]">
        {foods.map((food, idx) => (
          <li
            key={food.name}
            className="grid grid-cols-[5rem_1fr] gap-4 pt-6 border-b border-[var(--hairline)] pb-6"
          >
            <div className="h-20 w-20 rounded-md overflow-hidden bg-slate-100 border border-[var(--hairline)] flex items-center justify-center">
              {food.image && food.image !== "—" ? (
                <img src={food.image} alt={food.name} className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-6 w-6 text-slate-300" />
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-body tabular-nums text-slate-400">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-semibold text-slate-900 leading-tight">{food.name}</h3>
              </div>
              <p className="mt-1 text-sm text-slate-600 font-body leading-relaxed">{food.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500 font-body">
                Where ·{" "}
                <span className="text-slate-700 normal-case tracking-normal" style={{ color: primaryColor }}>
                  {food.whereToFind}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 6.2 — Lint + commit**

```bash
npm run lint
git add components/FoodChecklist.tsx
git commit -m "feat(ui): add FoodChecklist component$(printf '\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>')"
```

---

## Task 7: `FamousPeople` component

**Files:**
- Create: `components/FamousPeople.tsx`

- [ ] **Step 7.1 — Create `components/FamousPeople.tsx`**

```tsx
import { Camera } from "lucide-react";
import type { DistrictFamousPerson } from "@/lib/district-data";

type Props = {
  people: DistrictFamousPerson[];
  primaryColor: string;
};

export default function FamousPeople({ people, primaryColor }: Props) {
  if (people.length === 0) return null;

  return (
    <section className="mb-16">
      <header className="mb-6">
        <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
          § 08 &nbsp;People of the District
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
          Names from here
        </h2>
      </header>

      <ul className="flex gap-6 overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 pb-2">
        {people.map((p) => (
          <li
            key={p.name}
            className="shrink-0 w-64 md:w-auto flex flex-col gap-3 p-5 border border-[var(--hairline)] rounded-md bg-white/60"
          >
            <div className="h-40 w-full rounded-sm overflow-hidden bg-slate-100 border border-[var(--hairline)] flex items-center justify-center">
              {p.image && p.image !== "—" ? (
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-7 w-7 text-slate-300" />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900 leading-tight">{p.name}</h3>
              {p.era && p.era !== "—" && (
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 font-body tabular-nums mt-1">
                  {p.era}
                </p>
              )}
              <p className="mt-2 text-sm text-slate-600 font-body leading-snug">{p.knownFor}</p>
            </div>
            <div className="mt-auto h-px w-8" style={{ backgroundColor: primaryColor }} />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 7.2 — Lint + commit**

```bash
npm run lint
git add components/FamousPeople.tsx
git commit -m "feat(ui): add FamousPeople component$(printf '\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>')"
```

---

## Task 8: `DidYouKnow` client component

**Files:**
- Create: `components/DidYouKnow.tsx`

- [ ] **Step 8.1 — Create `components/DidYouKnow.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";

type Props = {
  facts: string[];
  primaryColor: string;
};

export default function DidYouKnow({ facts, primaryColor }: Props) {
  const [idx, setIdx] = useState(0);
  if (facts.length === 0) return null;
  const fact = facts[idx];

  return (
    <div className="p-7 rounded-[2rem] border border-[var(--hairline)] bg-white/70 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4 text-[0.7rem] tracking-[0.18em] uppercase font-semibold font-body text-slate-500">
        <Sparkles className="h-3.5 w-3.5" style={{ color: primaryColor }} />
        Did You Know?
      </div>
      <p className="font-display text-lg leading-snug text-slate-900 min-h-[5rem]">
        {fact}
      </p>
      {facts.length > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {facts.map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full transition-opacity"
                style={{
                  backgroundColor: primaryColor,
                  opacity: i === idx ? 1 : 0.2,
                }}
              />
            ))}
          </div>
          <button
            aria-label="Next fact"
            onClick={() => setIdx((i) => (i + 1) % facts.length)}
            className="inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 hover:text-slate-900 transition-colors"
          >
            Next <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 8.2 — Lint + commit**

```bash
npm run lint
git add components/DidYouKnow.tsx
git commit -m "feat(ui): add DidYouKnow sidebar card$(printf '\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>')"
```

---

## Task 9: `Emergency` component

**Files:**
- Create: `components/Emergency.tsx`

- [ ] **Step 9.1 — Create `components/Emergency.tsx`**

Em-dash exception for this component: a phone of `"—"` keeps the row, replacing the phone slot with a "Call 999" pill (see spec §3.4).

```tsx
import { Phone, Siren } from "lucide-react";
import type { DistrictEmergency } from "@/lib/district-data";

type Props = {
  data: DistrictEmergency;
  primaryColor: string;
};

function PhoneSlot({ phone, primaryColor }: { phone: string; primaryColor: string }) {
  if (phone === "—") {
    return (
      <span
        className="px-2 py-1 rounded text-[0.7rem] uppercase tracking-[0.16em] font-semibold font-body"
        style={{ backgroundColor: primaryColor, color: "white" }}
      >
        Call 999
      </span>
    );
  }
  return (
    <a
      href={`tel:${phone.replace(/\s+/g, "")}`}
      className="font-body tabular-nums text-sm font-semibold text-slate-900 hover:underline"
    >
      {phone}
    </a>
  );
}

export default function Emergency({ data, primaryColor }: Props) {
  return (
    <section className="mb-16">
      <header className="mb-6">
        <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
          § 09 &nbsp;Emergency & Useful Contacts
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
          If something goes wrong
        </h2>
      </header>

      {/* National line — prominent */}
      <div
        className="mb-8 flex items-center justify-between gap-4 p-5 rounded-md border-2"
        style={{ borderColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <Siren className="h-6 w-6" style={{ color: primaryColor }} />
          <div>
            <div className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500">
              National emergency line
            </div>
            <div className="font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {data.generalEmergency}
            </div>
          </div>
        </div>
        <a
          href={`tel:${data.generalEmergency}`}
          className="px-4 py-2 rounded-md font-body text-sm font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Call now
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {data.police && data.police.length > 0 && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 mb-3">Police</h3>
            <ul className="border-t border-[var(--hairline)]">
              {data.police.map((row) => (
                <li key={row.name} className="flex items-center justify-between gap-3 py-3 border-b border-[var(--hairline)]">
                  <span className="font-body text-sm text-slate-900">{row.name}</span>
                  <PhoneSlot phone={row.phone} primaryColor={primaryColor} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.hospital && data.hospital.length > 0 && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 mb-3">Hospital</h3>
            <ul className="border-t border-[var(--hairline)]">
              {data.hospital.map((row) => (
                <li key={row.name} className="flex items-center justify-between gap-3 py-3 border-b border-[var(--hairline)]">
                  <span className="font-body text-sm text-slate-900">{row.name}</span>
                  <PhoneSlot phone={row.phone} primaryColor={primaryColor} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.fire && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 mb-3">Fire Service</h3>
            <div className="flex items-center justify-between gap-3 py-3 border-y border-[var(--hairline)]">
              <span className="font-body text-sm text-slate-900 inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Fire Service
              </span>
              <PhoneSlot phone={data.fire.phone} primaryColor={primaryColor} />
            </div>
          </div>
        )}

        {data.touristPolice && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 mb-3">Tourist Police</h3>
            <div className="flex items-center justify-between gap-3 py-3 border-y border-[var(--hairline)]">
              <span className="font-body text-sm text-slate-900 inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Tourist Police
              </span>
              <PhoneSlot phone={data.touristPolice.phone} primaryColor={primaryColor} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 9.2 — Lint + commit**

```bash
npm run lint
git add components/Emergency.tsx
git commit -m "feat(ui): add Emergency contacts component$(printf '\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>')"
```

---

## Task 10: Real Satkhira content

**Files:**
- Modify: `data/districts/satkhira.json` (full rewrite of the file from Task 1)

- [ ] **Step 10.1 — Overwrite `data/districts/satkhira.json` with real Satkhira content**

Replace the entire file. The content below is the *only* content this district ships with on first push; do not invent additional facts. Anything not in this list either becomes `"—"` (and gets hidden by the renderer) or is omitted.

```json
{
  "name": "Satkhira",
  "division": "Khulna",
  "tagline": "Where Bangladesh meets the mangrove, the tiger, and the border.",
  "stats": {
    "area": "3858.33 sq km",
    "population": "2,231,000",
    "established": "1852",
    "attractions": "8+"
  },
  "guide": {
    "bestTime": "November to February (cool, dry; Sundarbans navigable)",
    "gettingThere": "By road from Khulna (~75 km, ~2 hr). Long-haul AC coaches run nightly from Dhaka (~10–12 hr). Nearest airport is Jashore (~80 km).",
    "difficulty": "Moderate — Sundarbans excursions require boat permits and a guide."
  },
  "mustVisit": [
    {
      "name": "Sundarbans Mangrove Forest (Munshiganj Gate)",
      "type": "nature",
      "description": "The Bangladesh half of the world's largest contiguous mangrove. Satkhira's Munshiganj entry is the closest of the three official gates to district headquarters and the quietest of the three.",
      "history": "Designated a UNESCO World Heritage Site in 1997. Home to the Royal Bengal Tiger, spotted deer, estuarine crocodiles, and Irrawaddy dolphins. The mangrove's tidal channels have sheltered fishermen, woodcutters, and honey-collectors (mowalis) for centuries.",
      "image": "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.1700, 89.1800],
      "practical": {
        "hours": "Daylight only — boats leave Munshiganj launch ghat from ~6 am",
        "entryFee": "BDT 150 (Bangladeshi adult) · USD ~30 equivalent for foreign nationals (Forest Dept permit)",
        "contact": "—",
        "website": "—"
      },
      "howToReach": {
        "fromDistrictTown": "Take a bus or local pick-up south to Munshiganj (about 65 km), then walk to the launch ghat",
        "distanceKm": 65,
        "transport": "Bus or microbus to Munshiganj, then book a country boat or trawler at the ghat"
      },
      "bestTime": "November to February (cool, calm water, best wildlife sightings)",
      "tips": [
        "Permits are mandatory and easiest to arrange through a Khulna or Satkhira tour operator",
        "Wear closed shoes — the mud is sticky and the spiders are large",
        "Carry a fully charged power bank — no electricity past Munshiganj"
      ]
    },
    {
      "name": "Jeshoreshwari Kali Temple",
      "type": "religious",
      "description": "One of the 51 Shakti Peethas of the subcontinent — a deeply revered Hindu pilgrimage site set in a small village in Shyamnagar Upazila.",
      "history": "Legend places this temple where the palm of the goddess Sati fell. Believed to date in some form to the 12th century, with major reconstructions across the Mughal and colonial eras. Prime Minister Narendra Modi of India visited the site during his 2021 trip to Bangladesh, drawing renewed attention to it.",
      "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.1486, 89.0875],
      "practical": {
        "hours": "Open daily ~6 am to ~8 pm; busiest at sunset",
        "entryFee": "Free (donations welcome)",
        "contact": "—",
        "website": "—"
      },
      "howToReach": {
        "fromDistrictTown": "About 75 km south of Satkhira town; ~45 km south of Shyamnagar bazar",
        "distanceKm": 75,
        "transport": "Bus to Shyamnagar, then local CNG / easybike to Ishwaripur"
      },
      "bestTime": "Durga Puja (Sep–Oct) for the festival crowds; cool months for a quieter visit",
      "tips": [
        "Remove shoes before entering the inner shrine",
        "Modest dress recommended — covered shoulders and knees",
        "Photography is permitted in the courtyard but not inside the sanctum"
      ]
    },
    {
      "name": "Tetulia Jame Mosque",
      "type": "religious",
      "description": "A 19th-century mosque in Tala Upazila built in a fusion of Bengal Sultanate and Mughal styles — one of the most ornate pre-modern mosques in the country.",
      "history": "Commissioned in 1858 by zamindar Salamatullah Khan Chowdhury. Three terracotta-decorated façades, multiple domes, and a hand-carved mihrab. Listed under the Department of Archaeology of Bangladesh.",
      "image": "https://images.unsplash.com/photo-1609234656432-603fd648c8c1?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.7886, 89.2483],
      "practical": {
        "hours": "Open during all five daily prayers; visitors welcome outside prayer times",
        "entryFee": "Free",
        "contact": "—",
        "website": "—"
      },
      "howToReach": {
        "fromDistrictTown": "About 25 km north of Satkhira town, near Tala bazar",
        "distanceKm": 25,
        "transport": "CNG / easybike from Satkhira town to Tala, then a short walk"
      },
      "bestTime": "Late afternoon — the western façade lights up at golden hour",
      "tips": [
        "Avoid Friday Jumu'ah prayers (12–2 pm) unless you intend to pray",
        "Cover head if female; remove shoes before stepping onto the platform"
      ]
    },
    {
      "name": "Mozaffar Garden & Resort",
      "type": "landmark",
      "description": "A privately developed family resort and botanical garden — the closest 'leisure park' to Satkhira town and a common weekend destination for local families.",
      "history": "—",
      "image": "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.7367, 89.0853],
      "practical": {
        "hours": "—",
        "entryFee": "—",
        "contact": "—",
        "website": "—"
      },
      "howToReach": {
        "fromDistrictTown": "About 10 km from Satkhira town, off the Khulna highway",
        "distanceKm": 10,
        "transport": "CNG / private car from town"
      },
      "bestTime": "Cool months, weekend afternoons",
      "tips": [
        "Bring cash — card payments are unreliable",
        "Outside food is generally restricted at the gate"
      ]
    },
    {
      "name": "Bhomra Land Port",
      "type": "landmark",
      "description": "Bangladesh's second-largest land port with India and the closest land crossing to Kolkata — a few minutes from Satkhira town. The viewing area gives you a clear look at the Ichamati River and India's West Bengal on the other side.",
      "history": "Activated as a full customs station in 1996; today handles a major share of cross-border trade between Bangladesh and India after Benapole.",
      "image": "https://images.unsplash.com/photo-1604934385267-3a0d4e8d59ff?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.6886, 88.9522],
      "practical": {
        "hours": "Viewing area accessible during daylight; immigration desks operate ~6 am to ~6 pm",
        "entryFee": "Free to visit; crossing requires a valid passport and Indian visa",
        "contact": "—",
        "website": "—"
      },
      "howToReach": {
        "fromDistrictTown": "About 12 km west of Satkhira town",
        "distanceKm": 12,
        "transport": "CNG / easybike from town; ~25 min"
      },
      "bestTime": "Mid-morning, before customs queues build",
      "tips": [
        "Photography of border-fence infrastructure is not permitted",
        "Carry your NID / passport even if you are not crossing"
      ]
    },
    {
      "name": "Debhata Zamindar Bari",
      "type": "heritage",
      "description": "Crumbling 19th-century landlord's manor in Debhata Upazila, slowly being reclaimed by figs and creeper roots. A quiet, atmospheric stop for anyone interested in the architectural footprint of the Bengal zamindari system.",
      "history": "—",
      "image": "https://images.unsplash.com/photo-1599824632881-8b43f07a424e?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.5897, 89.0408],
      "practical": {
        "hours": "Always open (exterior only)",
        "entryFee": "Free",
        "contact": "—",
        "website": "—"
      },
      "howToReach": {
        "fromDistrictTown": "About 35 km south of Satkhira town",
        "distanceKm": 35,
        "transport": "Bus to Debhata bazar, then easybike to the bari"
      },
      "bestTime": "Cool months, morning light",
      "tips": [
        "The interior is structurally unsafe — do not climb",
        "Bring water; no shops at the site"
      ]
    }
  ],
  "specialties": [
    {
      "type": "food",
      "name": "Satkhira Mishti",
      "description": "Local sweet tradition known for denser, less syrupy preparations than the Comilla or Tangail styles. Heritage shops in Sadar bazaar are the best places to try them.",
      "venue": "Sadar Bazaar sweet shops"
    },
    {
      "type": "craft",
      "name": "Sundarbans Honey (Mowali Madhu)",
      "description": "Raw honey collected from the mangrove forest by traditional mowali honey-hunters during the brief April–June season. Available at the Forest Department's seasonal sale points.",
      "venue": "Forest Dept depot, Munshiganj (Apr–Jun only)"
    },
    {
      "type": "festival",
      "name": "Banbibi Pala",
      "description": "Folk dramatic tradition honouring Banbibi, the legendary protector spirit of the Sundarbans, revered by both Hindu and Muslim woodcutters and honey-collectors. Performed in southern villages during winter months.",
      "timing": "December – February (varies by village)"
    },
    {
      "type": "mela",
      "name": "Jeshoreshwari Durga Puja",
      "description": "The largest annual gathering at Jeshoreshwari Kali Temple. The five-day Durga Puja festival draws pilgrims from across Bangladesh and India.",
      "timing": "Late September to early October",
      "coordinates": [22.1486, 89.0875]
    }
  ],
  "heritageSites": [
    {
      "name": "Tetulia Jame Mosque (1858)",
      "image": "https://images.unsplash.com/photo-1609234656432-603fd648c8c1?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.7886, 89.2483]
    },
    {
      "name": "Jeshoreshwari Kali Temple (Shakti Peetha)",
      "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.1486, 89.0875]
    },
    {
      "name": "Debhata Zamindar Bari",
      "image": "https://images.unsplash.com/photo-1599824632881-8b43f07a424e?auto=format&fit=crop&q=80&w=800",
      "coordinates": [22.5897, 89.0408]
    }
  ],
  "transport": {
    "bus": {
      "available": true,
      "bookingUrls": [
        { "name": "BDTickets", "url": "https://bdtickets.com/bus/search/{fromCityLowercase}-to-satkhira?journeyDate={date}" },
        { "name": "Shohoz", "url": "https://www.shohoz.com/bus-tickets/booking/bus/search?fromcity={fromCity}&tocity=Satkhira&doj={date}&dor=" }
      ],
      "manualBookings": [
        { "name": "Hanif Paribahan", "phone": "—" },
        { "name": "Eagle Paribahan", "phone": "—" },
        { "name": "Sohag Paribahan", "phone": "—" }
      ]
    },
    "train": {
      "available": false,
      "bookingUrls": [],
      "manualBookings": []
    },
    "launch": {
      "available": false,
      "bookingUrls": [],
      "manualBookings": []
    },
    "plane": {
      "available": false,
      "bookingUrls": [],
      "manualBookings": []
    }
  },
  "hotels": {
    "available": true,
    "bookingUrls": [
      { "name": "GoZayaan", "url": "https://gozayaan.com/hotel/list?checkin={checkin}&checkout={checkout}&search=&location=Satkhira&rooms={rooms},2,0&child_ages=&sort=POPULARITY" },
      { "name": "ShareTrip", "url": "https://sharetrip.net/hotel-search?checkInDate={checkin}&checkOutDate={checkout}&cityName=Satkhira&countryName=Bangladesh&currency=BDT&limit=10&nationality=BD&numberOfGuestsInRooms=%5B%7B%22adults%22%3A{guests}%2C%22children%22%3A%5B%5D%7D%5D&offset=0&regionId=3002" }
    ],
    "manualBookings": [
      { "name": "Mozaffar Garden & Resort", "phone": "—", "coordinates": [22.7367, 89.0853] },
      { "name": "Hotel Tower International (Sadar)", "phone": "—", "coordinates": [22.7196, 89.0721] }
    ]
  },
  "advertisements": [
    { "type": "guide", "name": "Sundarbans Local Guides Co-op", "rating": 4.7, "languages": ["Bengali", "English"], "phone": "—" },
    { "type": "business", "name": "Satkhira Microbus Rentals", "description": "AC microbus and car hires for Munshiganj day trips and Shyamnagar pilgrimage runs.", "phone": "—" }
  ],
  "bucketlist": [
    { "id": "satkhira-sundarbans-sunrise",    "title": "Take a sunrise boat into the Sundarbans",                                  "category": "experience", "detail": "The mangrove is at its quietest in the first hour of daylight. Birds wake first; the tide is usually low enough to see crab and mudskipper tracks on the banks.", "whereOrHow": "Munshiganj launch ghat",            "bestTime": "Nov–Feb, ~5:30 am" },
    { "id": "satkhira-tiger-tracks",          "title": "Look for Royal Bengal Tiger pugmarks at a patrol post",                     "category": "experience", "detail": "Sightings are extraordinarily rare, but fresh pugmarks on a riverbank are common in the southern blocks. Patrol officers will often point them out.",                "whereOrHow": "Kalinchi or Burigoalini forest stations" },
    { "id": "satkhira-tetulia-mosque",        "title": "Pray at Tetulia Jame Mosque",                                                "category": "place",      "detail": "One of the country's most ornate pre-modern mosques — three carved façades and a hand-cut mihrab still in active use after 165+ years.",                              "whereOrHow": "Tala Upazila",                      "bestTime": "Outside Friday noon prayers" },
    { "id": "satkhira-bhomra-port",           "title": "Stand at Bhomra land port and look across the Ichamati into India",         "category": "moment",     "detail": "On a clear morning you can see Indian customs lorries queueing on the other side. It is the closest land-port crossing to Kolkata.",                                  "whereOrHow": "Bhomra, ~12 km from Sadar",         "bestTime": "Mid-morning" },
    { "id": "satkhira-golda-chingri",         "title": "Eat fresh golda chingri at a Munshiganj stall",                              "category": "food",       "detail": "King prawn grilled or curried on the spot — the catch comes in within hours. Cheaper and fresher than anything you'll find in Dhaka.",                                "whereOrHow": "Roadside stalls, Munshiganj bazaar" },
    { "id": "satkhira-mowali-honey",          "title": "Taste raw Sundarbans honey from a mowali",                                   "category": "food",       "detail": "Mowalis enter the forest each spring at significant personal risk to collect wild honey. The flavour is darker, smokier, and more medicinal than commercial honey.",  "whereOrHow": "Forest Dept honey depot, Munshiganj","bestTime": "April–June only" },
    { "id": "satkhira-jeshoreshwari",         "title": "Visit Jeshoreshwari Kali Temple",                                            "category": "place",      "detail": "One of the 51 Shakti Peethas — Sati's palm is believed to have fallen here. The site holds significance for Hindu pilgrims across the subcontinent.",                  "whereOrHow": "Ishwaripur, Shyamnagar",            "bestTime": "Durga Puja (Sep–Oct)" },
    { "id": "satkhira-mozaffar-sunset",       "title": "Watch sunset over the lake at Mozaffar Garden",                              "category": "moment",     "detail": "The most accessible 'green' break near Satkhira town — a planned garden around a small lake. Quiet on weekdays, busy with families on Fridays.",                       "whereOrHow": "~10 km from Sadar",                 "bestTime": "Cool months" },
    { "id": "satkhira-mishti",                "title": "Try Satkhira mishti at a heritage shop in Sadar",                            "category": "food",       "detail": "Less syrupy and denser than the Comilla or Tangail styles. Ask for the day's batch.",                                                                                  "whereOrHow": "Sadar Bazaar sweet shops" },
    { "id": "satkhira-banbibi",               "title": "Hear a Banbibi pala — folk song of the mangrove's protector spirit",         "category": "experience", "detail": "Banbibi is venerated by both Hindu and Muslim forest-workers. Village performances run on winter evenings; ask any local mowali household for the next date.",         "whereOrHow": "Shyamnagar / Burigoalini villages", "bestTime": "December–February" },
    { "id": "satkhira-debhata",               "title": "Walk the ruins of Debhata Zamindar Bari",                                    "category": "place",      "detail": "Crumbling 19th-century landlord's manor slowly being reclaimed by figs and creepers. Quiet, atmospheric, no entry fee.",                                              "whereOrHow": "Debhata Upazila" },
    { "id": "satkhira-crab-curry",            "title": "Eat coastal crab curry on a chilly night near the Sundarbans edge",          "category": "food",       "detail": "Munshiganj guesthouses serve fresh-catch crab curry — the same crab that ends up in Bangkok and Dhaka markets, here for a fraction of the price.",                     "whereOrHow": "Munshiganj guesthouses",            "bestTime": "Winter evenings" }
  ],
  "foods": [
    { "name": "Golda Chingri (King Prawn)",   "description": "Coastal king prawn — sweetest in the country, often grilled with mustard or in a rich coconut curry.",                                                                                          "whereToFind": "Munshiganj roadside stalls" },
    { "name": "Sundarbans Crab Curry",         "description": "Fresh mud crab from the mangrove channels, slow-cooked with mustard oil and panch phoron.",                                                                                                    "whereToFind": "Munshiganj guesthouses" },
    { "name": "Shutki Bhuna",                  "description": "Dried-fish stir-fry in the bold southern coastal style — onions, garlic, dried chilies, lots of heat.",                                                                                       "whereToFind": "Local rice-meal canteens, Sadar" },
    { "name": "Sundarbans Honey (Mowali Madhu)","description": "Raw wild honey collected by mowali honey-hunters from the mangrove during the brief April–June season.",                                                                                      "whereToFind": "Forest Dept depot, Munshiganj (Apr–Jun)" },
    { "name": "Satkhira Mishti",               "description": "Local sweet tradition — denser and less syrupy than other regional styles. Tastes best the day it's made.",                                                                                   "whereToFind": "Sadar Bazaar heritage sweet shops" },
    { "name": "Narkel Chitoi",                 "description": "Winter rice-flour pancake served with thickened date-palm syrup and grated coconut.",                                                                                                          "whereToFind": "Winter morning pitha stalls, Sadar" },
    { "name": "Khejur Gur",                    "description": "Concentrated date-palm jaggery from the winter sap harvest. The base of many local pithas and a strong tea sweetener.",                                                                       "whereToFind": "Rural haats, December–February" },
    { "name": "Hilsa with Mustard",            "description": "Sundarbans-edge cooking — hilsa fillets steamed in a mustard-and-mustard-oil paste, served with red rice.",                                                                                  "whereToFind": "Home-style restaurants, Sadar & Munshiganj" }
  ],
  "famousPeople": [
    {
      "name": "Kazi Imdadul Haq",
      "knownFor": "Bengali novelist and educator. His 1933 novel Abdullah is regarded as one of the foundational social novels of the Bengali Muslim middle class.",
      "era": "1882 – 1926"
    }
  ],
  "didYouKnow": [
    "Satkhira shares the Bangladesh Sundarbans with Khulna and Bagerhat — its share is the smallest of the three, but holds the country's southernmost forest patrols.",
    "Bhomra land port is the second-busiest land crossing between Bangladesh and India after Benapole, and the closest to Kolkata.",
    "Jeshoreshwari Kali Temple in Shyamnagar is one of the 51 Shakti Peethas of Hindu mythology — Sati's palm is said to have fallen here.",
    "Banbibi, the protector spirit of the mangrove forest, is venerated by both Hindu and Muslim woodcutters and honey-collectors — a rare cross-faith folk tradition.",
    "Tetulia Jame Mosque (1858) has three terracotta-decorated façades and is listed under the Department of Archaeology of Bangladesh."
  ],
  "emergency": {
    "generalEmergency": "999",
    "police": [
      { "name": "Satkhira Sadar Police Station", "phone": "—" },
      { "name": "Shyamnagar Police Station",     "phone": "—" }
    ],
    "hospital": [
      { "name": "Satkhira Sadar Hospital",   "phone": "—" },
      { "name": "Shyamnagar Upazila Health Complex", "phone": "—" }
    ],
    "fire": { "phone": "—" },
    "touristPolice": { "phone": "—" }
  }
}
```

- [ ] **Step 10.2 — Validate JSON**

```bash
node -e 'JSON.parse(require("fs").readFileSync("data/districts/satkhira.json","utf8")); console.log("ok")'
```
Expected: `ok`

- [ ] **Step 10.3 — Commit**

```bash
git add data/districts/satkhira.json
git commit -m "$(cat <<'EOF'
content(satkhira): replace template data with real field-guide content

Adds tagline, real mustVisit entries (Sundarbans, Jeshoreshwari Kali
Temple, Tetulia Jame Mosque, Mozaffar Garden, Bhomra Land Port,
Debhata Zamindar Bari) with practical info and travel tips, a
12-item bucketlist mixing places / experiences / food / moments,
foods list, Kazi Imdadul Haq, did-you-know trivia, and emergency
contacts (999 + named stations; unknown phone numbers left as "—").

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Wire all the new sections into the district page

**Files:**
- Modify: `app/district/[district]/page.tsx`

- [ ] **Step 11.1 — Replace the entire file**

This is a wholesale rewrite to mount the new sections, the new mustVisit field-guide cards, the conditional folio + paper-cream styling, and the InProgressStrip. Read the current file first so you understand what's preserved (`HeritageSection`, `TransportWidget`, `HotelWidget`, `LocalSpecialtiesWidget`, `LocalAdsSidebar`, the upazila map sidebar, the traveler's guide dark card, `LocalAdsSidebar`).

```tsx
import Link from "next/link";
import { ChevronLeft, MapPin, Users, Calendar, Camera, Navigation, Clock, Ticket, Phone, Route, CalendarDays, Lightbulb } from "lucide-react";
import { DISTRICT_TO_DIVISION, getThematicColor } from "@/lib/map-data";
import fs from "fs";
import path from "path";
import { getDistrictData, type DistrictMustVisit } from "@/lib/district-data";
import { folioNumber, BUILT_DISTRICTS } from "@/lib/field-guide-folio";
import HeritageSection from "@/components/HeritageSection";
import DynamicUpazilaMap from "@/components/DynamicUpazilaMap";
import TransportWidget from "@/components/TransportWidget";
import HotelWidget from "@/components/HotelWidget";
import LocalSpecialtiesWidget from "@/components/LocalSpecialtiesWidget";
import LocalAdsSidebar from "@/components/LocalAdsSidebar";
import Bucketlist from "@/components/Bucketlist";
import FoodChecklist from "@/components/FoodChecklist";
import FamousPeople from "@/components/FamousPeople";
import DidYouKnow from "@/components/DidYouKnow";
import Emergency from "@/components/Emergency";
import FieldGuideFolio from "@/components/FieldGuideFolio";
import InProgressStrip from "@/components/InProgressStrip";

interface PageProps {
  params: Promise<{ district: string }>;
}

function MustVisitCard({ spot, primaryColor, mutedColor }: { spot: DistrictMustVisit; primaryColor: string; mutedColor: string }) {
  const hasDetails =
    !!spot.history ||
    !!spot.practical ||
    !!spot.howToReach ||
    !!spot.bestTime ||
    (spot.tips && spot.tips.length > 0);

  // Helper: render a labelled row only if value isn't "—" / undefined / empty
  function Row({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value?: string }) {
    if (!value || value === "—") return null;
    return (
      <div className="grid grid-cols-[1rem_auto_1fr] items-baseline gap-2 py-1.5">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-slate-500 font-body">{label}</span>
        <span className="text-sm text-slate-800 font-body">{value}</span>
      </div>
    );
  }

  return (
    <article className="grid grid-cols-1 md:grid-cols-[18rem_1fr] gap-6 py-8 border-b border-[var(--hairline)]">
      <div className="relative h-56 md:h-full w-full rounded-md overflow-hidden bg-slate-100 border border-[var(--hairline)]">
        {spot.image ? (
          <img src={spot.image} alt={spot.name} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-10 w-10 text-slate-300" />
          </div>
        )}
        {spot.type && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-sm text-[0.6rem] uppercase tracking-[0.18em] font-semibold font-body bg-white/90 text-slate-800">
            {spot.type}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-display text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">{spot.name}</h3>
        <p className="mt-2 text-slate-700 font-body leading-relaxed">{spot.description}</p>

        {hasDetails && (
          <details className="group mt-4">
            <summary className="cursor-pointer list-none inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 hover:text-slate-900 transition-colors">
              <span className="inline-block w-6 h-px" style={{ backgroundColor: primaryColor }} />
              Read more
            </summary>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              {spot.history && spot.history !== "—" && (
                <div className="md:col-span-2 mb-4">
                  <p className="text-sm text-slate-700 font-body leading-relaxed border-l-2 pl-3" style={{ borderColor: mutedColor }}>
                    {spot.history}
                  </p>
                </div>
              )}

              <Row icon={Clock} label="Hours" value={spot.practical?.hours} />
              <Row icon={Ticket} label="Entry" value={spot.practical?.entryFee} />
              <Row icon={Phone} label="Contact" value={spot.practical?.contact} />
              <Row icon={CalendarDays} label="Best time" value={spot.bestTime} />
              {spot.howToReach && (
                <div className="md:col-span-2 mt-3">
                  <div className="grid grid-cols-[1rem_auto_1fr] items-baseline gap-2 py-1.5">
                    <Route className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-slate-500 font-body">How to reach</span>
                    <span className="text-sm text-slate-800 font-body">
                      {spot.howToReach.fromDistrictTown} · {spot.howToReach.transport}
                    </span>
                  </div>
                </div>
              )}

              {spot.tips && spot.tips.length > 0 && (
                <div className="md:col-span-2 mt-3">
                  <div className="text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-slate-500 font-body mb-2 inline-flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" /> Traveler tips
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-700 font-body">
                    {spot.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-slate-400 tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </article>
  );
}

export default async function DistrictPage({ params }: PageProps) {
  const { district } = await params;
  const data = await getDistrictData(district);

  const fallbackName = district
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const districtName = data?.name || fallbackName;
  const divisionName = data?.division || DISTRICT_TO_DIVISION[district] || "Dhaka";

  const primaryColor = getThematicColor(divisionName, district, 1);
  const secondaryColor = getThematicColor(divisionName, district, 0.15);
  const mutedColor = getThematicColor(divisionName, district, 0.05);

  // Section presence flags
  const has = {
    bucketlist:   (data?.bucketlist?.length   ?? 0) > 0,
    foods:        (data?.foods?.length        ?? 0) > 0,
    famousPeople: (data?.famousPeople?.length ?? 0) > 0,
    didYouKnow:   (data?.didYouKnow?.length   ?? 0) > 0,
    emergency:    !!data?.emergency,
    heritageSites: (data?.heritageSites?.length ?? 0) > 0,
  };
  // famousPeople intentionally excluded — see spec §8.
  const fullyBuilt = has.bucketlist && has.foods && has.emergency;
  const folio = folioNumber(district);

  // Resolve Upazila GeoJSON path based on fuzzy match (unchanged from prior version)
  const districtsDir = path.join(process.cwd(), "public", "data", "districts");
  let geoJsonUrl = "";
  try {
    const files = fs.readdirSync(districtsDir);
    const cleanSlug = district.toLowerCase().replace(/[^a-z0-9]/g, "");

    const matchedFile = files.find((file) => {
      const cleanFile = file.toLowerCase().replace(".json", "").replace(/[^a-z0-9]/g, "");
      return cleanFile === cleanSlug;
    });

    if (matchedFile) {
      geoJsonUrl = `/data/districts/${matchedFile}`;
    }
  } catch (e) {
    console.error("Error reading districts directory", e);
  }

  // Visuals that switch on when fully-built
  const cardClasses = fullyBuilt
    ? "rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative paper-grain"
    : "bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative";
  const cardStyle = fullyBuilt ? { backgroundColor: "var(--paper-cream)" } : undefined;

  return (
    <main
      className="min-h-screen py-12 transition-colors duration-500 font-body"
      style={{
        background: `radial-gradient(circle at top right, ${secondaryColor}, transparent), 
                     radial-gradient(circle at bottom left, ${mutedColor}, transparent),
                     #f8fafc`,
      }}
    >
      <div className="container mx-auto px-4">
        <Link
          href={`/division/${divisionName.toLowerCase()}`}
          className="inline-flex items-center font-bold mb-8 transition-all hover:-translate-x-1"
          style={{ color: primaryColor }}
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          Back to {divisionName} Division
        </Link>

        <div className={cardClasses} style={cardStyle}>
          {/* Top accent strip — thinner on fully-built */}
          <div
            className={fullyBuilt ? "absolute top-0 left-0 w-full h-1" : "absolute top-0 left-0 w-full h-3"}
            style={{ backgroundColor: primaryColor }}
          />

          <div className="p-8 md:p-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 block" style={{ color: primaryColor }}>
                  {divisionName} Division
                </span>
                <h1 className={`tracking-tighter text-slate-900 ${fullyBuilt ? "font-display font-semibold text-5xl md:text-7xl" : "text-5xl md:text-7xl font-black"}`}>
                  {districtName}
                </h1>
                {fullyBuilt && data?.tagline && (
                  <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-700 font-body leading-snug italic">
                    {data.tagline}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <Link
                  href={`/planner/${crypto.randomUUID()}?initialDistrict=${district}`}
                  className="px-6 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Plan a Trip
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: "Area", value: data?.stats?.area || "N/A", icon: MapPin },
                { label: "Population", value: data?.stats?.population || "N/A", icon: Users },
                { label: "Established", value: data?.stats?.established || "N/A", icon: Calendar },
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start">
                  <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: mutedColor }}>
                    <stat.icon className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 mb-1">{stat.label}</span>
                  <span className={`text-xl text-slate-900 ${fullyBuilt ? "font-display font-semibold tabular-nums" : "font-black"}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {fullyBuilt && folio && (
              <FieldGuideFolio district={districtName} division={divisionName} folio={folio} />
            )}

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                {has.bucketlist && data?.bucketlist && (
                  <Bucketlist
                    items={data.bucketlist}
                    districtSlug={district}
                    primaryColor={primaryColor}
                    mutedColor={mutedColor}
                  />
                )}

                {/* Must Visit */}
                <section className="mb-16">
                  <header className="mb-6">
                    <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
                      § 02 &nbsp;Must Visit
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
                      Places to visit
                    </h2>
                  </header>

                  <div className="border-t border-[var(--hairline)]">
                    {(data?.mustVisit ?? [
                      { name: "Local Landmark", description: "A popular spot known for its unique culture and scenery.", image: "" },
                    ]).map((spot, idx) => (
                      <MustVisitCard key={idx} spot={spot as DistrictMustVisit} primaryColor={primaryColor} mutedColor={mutedColor} />
                    ))}
                  </div>

                  {has.heritageSites && (
                    <div className="mt-10">
                      <HeritageSection primaryColor={primaryColor} sites={data?.heritageSites as never[] || []} isSubsection={true} />
                    </div>
                  )}
                </section>

                {has.foods && data?.foods && (
                  <FoodChecklist foods={data.foods} primaryColor={primaryColor} mutedColor={mutedColor} />
                )}

                <LocalSpecialtiesWidget specialties={data?.specialties as never[] || []} primaryColor={primaryColor} mutedColor={mutedColor} />

                <TransportWidget data={data?.transport as never || {}} primaryColor={primaryColor} districtName={districtName} />

                <HotelWidget data={data?.hotels as never} primaryColor={primaryColor} />

                {has.famousPeople && data?.famousPeople && (
                  <FamousPeople people={data.famousPeople} primaryColor={primaryColor} />
                )}

                {has.emergency && data?.emergency && (
                  <Emergency data={data.emergency} primaryColor={primaryColor} />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {geoJsonUrl && (
                  <div className="rounded-[2rem] bg-white border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                    <div className="p-6 pb-4 border-b border-slate-50 text-center">
                      <h3 className="text-xl font-black text-slate-900">Map of {districtName}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Upazilas</p>
                    </div>
                    <div className="h-[350px] w-full bg-slate-50 relative group">
                      <div className="absolute inset-0 bg-slate-900/5 z-[9] pointer-events-none group-hover:bg-transparent transition-colors duration-500" />
                      <DynamicUpazilaMap geoJsonUrl={geoJsonUrl} primaryColor={primaryColor} secondaryColor={secondaryColor} />
                    </div>
                  </div>
                )}

                <div className="p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
                  <Navigation className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 transition-transform group-hover:scale-110" />
                  <h3 className="text-2xl font-black mb-6">Traveler&rsquo;s Guide</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs uppercase font-black tracking-widest text-white/40 mb-2">Best Time to Visit</h4>
                      <p className="font-bold">{data?.guide?.bestTime || "October to March"}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-black tracking-widest text-white/40 mb-2">Getting There</h4>
                      <p className="font-bold leading-relaxed">{data?.guide?.gettingThere || "Connected via major highways and transport networks."}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-black tracking-widest text-white/40 mb-2">Difficulty Level</h4>
                      <p className="font-bold">{data?.guide?.difficulty || "Easy / Family Friendly"}</p>
                    </div>
                  </div>
                </div>

                {has.didYouKnow && data?.didYouKnow && (
                  <DidYouKnow facts={data.didYouKnow} primaryColor={primaryColor} />
                )}

                <LocalAdsSidebar ads={data?.advertisements as never} primaryColor={primaryColor} />
              </div>
            </div>

            {!fullyBuilt && <InProgressStrip primaryColor={primaryColor} />}
          </div>
        </div>

        {/* Acknowledge BUILT_DISTRICTS export so it doesn't tree-shake away if used in future */}
        <span className="sr-only" data-built-districts={BUILT_DISTRICTS.join(",")} />
      </div>
    </main>
  );
}
```

- [ ] **Step 11.2 — Lint**

```bash
npm run lint
```
Expected: no new errors. (Existing project-wide warnings — e.g. `@next/next/no-img-element` — are pre-existing; do not flip them off.)

- [ ] **Step 11.3 — Type-check via build**

```bash
npm run build 2>&1 | tail -30
```
Expected: `Compiled successfully`. If a type error arises from `HeritageSection`, `TransportWidget`, `HotelWidget`, `LocalSpecialtiesWidget`, or `LocalAdsSidebar` due to the loose `Record<string, unknown>` types in `DistrictRecord`, the `as never` casts in the JSX above are the intentional escape hatches. Do not change the existing widgets' prop types.

- [ ] **Step 11.4 — Commit**

```bash
git add app/district/[district]/page.tsx
git commit -m "$(cat <<'EOF'
feat(district): wire bucketlist, foods, people, did-you-know, emergency

Numbered field-guide sections (§ 01–§ 09), extended Must Visit cards
with click-to-expand history + practical + how-to-reach + tips,
folio header and cream paper-grain background gated on `fullyBuilt`,
InProgressStrip for districts that aren't fully built yet, tagline
under the district name when present. Districts without the new
fields render exactly as before plus the in-progress strip.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Manual verification (dev server walkthrough)

This task is the final evidence-before-completion check before push. No code changes here.

- [ ] **Step 12.1 — Start the dev server**

```bash
npm run dev
```
Run in the background. Watch for "Ready" in the terminal output. Default port is 3000.

- [ ] **Step 12.2 — Verify Satkhira (the fully-built district)**

Open `http://localhost:3000/district/satkhira` in a browser. Confirm:

1. Hero shows the tagline `"Where Bangladesh meets the mangrove, the tiger, and the border."`
2. Folio header reads `SATKHIRA · KHULNA DIVISION · FIELD GUIDE · N°01` with the hairline rule below it.
3. § 01 Bucketlist renders 12 numbered items. Clicking a checkbox flips it, draws the tick, and strikes through the title. The "N of 12 done" counter and the progress rule both update.
4. Filter chips (All / Place / Experience / Food / Moment) all show counts and filter the list.
5. Refresh the page — checked items persist.
6. Open a Must Visit card's "Read more" — history, hours, entry fee, best time, how-to-reach, tips all render. Rows whose value is `"—"` do **not** render.
7. § 04 What to Eat shows 8 dishes.
8. § 08 People of the District shows Kazi Imdadul Haq.
9. § 09 Emergency shows the 999 banner. The station rows display the station name + a "Call 999" pill (because their phones are `"—"`).
10. Sidebar Did You Know card cycles trivia via the "Next" button. Dots track position.
11. Background of the main card is the cream `#fbf8f1`, with a faint paper grain visible at close inspection.
12. **No** "field guide in progress" strip at the bottom.

- [ ] **Step 12.3 — Verify a non-built district**

Open `http://localhost:3000/district/barguna`. Confirm:

1. Page renders as today — white card, thick top accent strip, black-weight district name, no tagline, no folio.
2. **No** bucketlist, foods, people, did-you-know, or emergency sections.
3. The in-progress strip appears at the bottom of the card: `This district's field guide is in progress. → SATKHIRA`. Clicking the link goes to `/district/satkhira`.

- [ ] **Step 12.4 — Verify the planner**

Open `http://localhost:3000/`, click any district to enter a division, then click a district and "Plan a Trip". Add a destination. The planner should populate must-visit and heritage entries — confirm this still works (i.e. the `app/planner/actions.ts` refactor didn't regress).

- [ ] **Step 12.5 — Type-check and lint one more time**

```bash
npm run lint && npm run build 2>&1 | tail -5
```
Expected: lint passes (no new errors) and build prints `Compiled successfully`.

- [ ] **Step 12.6 — Stop the dev server**

Bring the dev server to the foreground and press Ctrl-C, or kill the background job. No commit in this task.

---

## Task 13: Push to `main`

- [ ] **Step 13.1 — Confirm clean state**

```bash
git status
```
Expected: working tree clean (only the unrelated `package-lock.json` change from before this branch — leave it alone), local commits ahead of `origin/main`.

- [ ] **Step 13.2 — Push**

```bash
git push origin main
```
Expected: push succeeds. Note the remote response — record any new commit SHAs.

- [ ] **Step 13.3 — Final commit verification**

```bash
git log --oneline -15
```
Confirm the new commits are present in order:
- refactor: split Satkhira out of districts.json + extract loader
- feat(ui): load Fraunces + Inter Tight, add field-guide CSS tokens
- feat(ui): add field-guide folio header + built-districts registry
- feat(ui): add InProgressStrip for non-fully-built districts
- feat(ui): add Bucketlist client component with localStorage progress
- feat(ui): add FoodChecklist component
- feat(ui): add FamousPeople component
- feat(ui): add DidYouKnow sidebar card
- feat(ui): add Emergency contacts component
- content(satkhira): replace template data with real field-guide content
- feat(district): wire bucketlist, foods, people, did-you-know, emergency

Plus the earlier `docs: add design spec for Satkhira field-guide + bucketlist`.

---

## Plan self-review (run by writer; no action for executor)

**Spec coverage** — Walking the spec section-by-section:

- §3.1 file layout: Task 1 creates `data/districts/satkhira.json`, removes from `districts.json`, adds `lib/district-data.ts` loader.
- §3.2 extended `mustVisit`: types in Task 1, renderer in Task 11 (`MustVisitCard`), real data in Task 10.
- §3.3 new top-level arrays: types in Task 1, components in Tasks 5–9, data in Task 10.
- §3.4 em-dash convention: rendered by `MustVisitCard.Row` (Task 11) hiding rows; Emergency exception covered in Task 9 `PhoneSlot`.
- §4 page layout: Task 11 places every numbered section in the order spec dictates.
- §5 components: each gets its own task (3–9).
- §6 bucketlist interaction: Task 5 covers localStorage, filter chips with total counts, click-to-expand, animated check, single-step reset confirm.
- §7 visual language: Task 2 (fonts, paper grain, hairline), Task 11 (conditional cream bg + accent strip + display-font headings on `fullyBuilt`).
- §8 conditional rendering rules + `fullyBuilt` (without famousPeople): Task 11.
- §9 Satkhira content scope: Task 10 lists exactly the seeded content.
- §10 file-level change list: matches Task 1, 2, 3, 4, 11 modifications.
- §11 risks: addressed (types live in `lib/district-data.ts`; merge order documented; no test framework introduced).
- §12 acceptance: Task 12 verifies each acceptance bullet.
- §13 deferred: out of scope confirmed.

**Placeholder scan** — no "TBD"/"TODO"/"similar to"/"add validation as appropriate" lines in the plan body. Every code step includes its actual code; commands include their expected output.

**Type consistency** — `BucketlistItem`, `DistrictFood`, `DistrictFamousPerson`, `DistrictEmergency`, `DistrictMustVisit` are defined once in Task 1 and referenced by the same names in Tasks 5–11. `folioNumber()` signature in Task 3 matches its usage in Task 11. `getDistrictData()` returns `DistrictRecord | undefined` (Task 1) and is awaited / null-checked accordingly in Task 11.

No gaps found. Plan is ready for execution.
