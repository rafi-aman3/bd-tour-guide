# Satkhira "Yellow Book" Field Guide — Design Spec

- **Date:** 2026-05-26
- **Status:** Approved (pending user review of this written spec)
- **Scope:** Make `/district/satkhira` a complete, info-rich field guide. Add a Bucketlist section and supporting yellow-book sections (Foods, Famous People, Did You Know, Emergency Contacts). Other districts stay on placeholder data but render the same code paths.
- **Out of scope:** SQLite / DB migration, enrichment of any non-Satkhira district, auth, server-side bucketlist persistence.

---

## 1. Problem

The current `/district/satkhira` page is functional but its content is template-generated placeholder ("Satkhira Central Park", "Famous Satkhira Misti House", `+880 1711-XXXX01` phones, generic image URLs). A visitor leaves with no actual information. The user wants Satkhira to behave like a "yellow book" — a comprehensive, scannable field guide a traveler can rely on — and to add a Bucketlist of iconic things to do, eat, and see.

This iteration is the first fully-built district. Other districts continue to render as today.

## 2. Decisions locked in during brainstorming

| Topic | Decision |
|---|---|
| Data layer | **Stay JSON** for editorial content. Defer SQLite/Postgres until user-generated data appears (saved lists, reviews, accounts). |
| Bucketlist shape | **Mixed checklist** — places + experiences + foods + moments, numbered, category-tagged, checkable. |
| Per-place depth | Add `type`, `history`, `coordinates`, `practical { hours, entryFee, contact, website }`, `howToReach`, `bestTime`, `tips[]`. |
| Sourcing | Fill what is known confidently. Unknown values = `"—"` (em-dash). Renderer hides em-dash fields. |
| New page sections | Emergency contacts, Famous people, Did You Know trivia card, Foods checklist. |
| UI direction | **Field Guide / yellow-pages aesthetic** — editorial serif display + tight grotesque body + hairline rules + tabular numerals. |
| Non-Satkhira districts | Same code path; new sections render only when data exists. Mute "field guide in progress" strip at page bottom links visitors to Satkhira. |

## 3. Data model

### 3.1 File layout

Satkhira's entry is **broken out of `data/districts.json` into its own file** to keep the monolithic JSON manageable as enrichment expands.

```
data/
  districts.json              # remains, minus the satkhira key
  divisions.json              # unchanged
  districts/
    satkhira.json             # NEW — full enriched record
    (future per-district overrides go here)
```

A new loader `lib/district-data.ts` merges `data/districts.json` with every file under `data/districts/*.json`, per-district file taking precedence. `app/district/[district]/page.tsx` and `app/planner/actions.ts` both switch to this loader. No behavior change for non-Satkhira pages.

### 3.2 Extended `mustVisit[]` entry

```ts
{
  name: string;
  description: string;
  image: string;

  // NEW — all optional, "—" means "unknown, render as dash or hide row"
  type?: "nature" | "religious" | "heritage" | "landmark" | "market";
  history?: string;                          // 1–3 sentences
  coordinates?: [number, number];            // [lat, lng]
  practical?: {
    hours?: string;                          // "Daily 6 am – 6 pm"
    entryFee?: string;                       // "BDT 50 (foreigners BDT 1000)" or "Free"
    contact?: string;                        // phone or office
    website?: string;
  };
  howToReach?: {
    fromDistrictTown: string;                // "45 km southwest of Satkhira town"
    distanceKm?: number;
    transport: string;                       // "Local bus to Munshiganj, then a boat"
  };
  bestTime?: string;                         // "Nov–Feb (cool, dry)"
  tips?: string[];                           // 2–4 short bullets
}
```

### 3.3 New top-level arrays on a district record

```ts
bucketlist?: {
  id: string;                                // stable slug, e.g. "satkhira-sundarbans-boat"
  title: string;                             // imperative — "Take a sunrise boat into the Sundarbans"
  category: "place" | "experience" | "food" | "moment";
  detail: string;                            // 1–2 sentence why-this-matters
  whereOrHow: string;                        // "Munshiganj launch ghat" / "Any Sadar stall"
  bestTime?: string;
}[];

foods?: {
  name: string;
  description: string;
  whereToFind: string;
  image?: string;
}[];

famousPeople?: {
  name: string;
  knownFor: string;                          // "Actor (Bangla cinema, 1990s–)"
  era?: string;                              // "Born 1974"
  image?: string;
}[];

didYouKnow?: string[];                       // short trivia, 1 line each

emergency?: {
  generalEmergency: "999" | string;
  police?: { name: string; phone: string }[];
  hospital?: { name: string; phone: string }[];
  fire?: { phone: string };
  touristPolice?: { phone: string };
};
```

All new fields are optional. Other districts (no schema change) render exactly as today.

### 3.4 Renderer convention for `"—"`

When a string field equals `"—"`, the renderer omits the row entirely (does not show "Entry fee: —"). This lets the JSON act as a checklist of "what's still missing" without leaking placeholders to the page.

**Emergency component exception:** for police / hospital / tourist-police entries, if the phone is `"—"` the row is *kept* — the station name stays visible and the phone slot is replaced with a small "Call 999" pill. Faking emergency numbers would be unsafe, but hiding the whole row would also hide useful "ask a local for this place" information.

## 4. Page layout (`/district/satkhira`)

Top-to-bottom reading order. **Bold** = new section.

1. Back link → Khulna Division
2. Hero — Division eyebrow, district name, **tagline / epigraph** (one short sentence), Plan Trip CTA
3. Stats row (Area / Population / Established) — unchanged
4. **§ 00 Folio header** (Satkhira only) — `SATKHIRA · KHULNA DIVISION · FIELD GUIDE · N°01` with hairline rule
5. **§ 01 THE BUCKETLIST** — first content section (most prominent)
6. § 02 MUST VISIT — extended field-guide entry cards
7. § 03 HERITAGE SITES — existing `HeritageSection` component, unchanged
8. **§ 04 WHAT TO EAT** — food checklist
9. § 05 LOCAL SPECIALTIES — existing `LocalSpecialtiesWidget`, unchanged
10. § 06 GETTING THERE — existing `TransportWidget`, unchanged
11. § 07 WHERE TO STAY — existing `HotelWidget`, unchanged
12. **§ 08 PEOPLE OF SATKHIRA** — famous people
13. **§ 09 EMERGENCY & USEFUL CONTACTS** — yellow-pages contacts block

Sidebar (right column, sticky-feeling on desktop):
- Upazila map (unchanged)
- Traveler's Guide dark card (unchanged)
- **Did You Know? card** — new
- Local Ads (unchanged)

For non-Satkhira districts, only sections backed by data render. Result: Barguna et al. look identical to today, plus the in-progress strip at page bottom.

## 5. Components

### New

- `components/Bucketlist.tsx` — **client**. Props: `items: BucketlistItem[]`, `districtSlug: string`, `primaryColor`, `mutedColor`. Internal state: `Set<itemId>` of checked items, hydrated from `localStorage["bd-bucketlist:" + districtSlug]` inside `useEffect`. Category filter chips, live "N of M done" counter with a hairline progress rule. Reset link with single-step confirm.
- `components/FoodChecklist.tsx` — server. Photo grid with name + description + where-to-find.
- `components/FamousPeople.tsx` — server. Horizontal scroll row of portrait cards on mobile; grid on desktop.
- `components/DidYouKnow.tsx` — **client**. Sidebar card. Shows one trivia line at a time. If `didYouKnow.length > 1`, a "Next" affordance (chevron + dot pagination) advances on click. No auto-rotation — the card stays put unless the visitor asks for the next one.
- `components/Emergency.tsx` — server. Two-column phone list (Police / Hospital), Fire and Tourist Police as single rows, `999` as a bold prominent row at top.
- `components/FieldGuideFolio.tsx` — server. The signature header. Takes `district`, `division`, `number`. Only mounted when the district is fully built.
- `components/InProgressStrip.tsx` — server. Single muted strip for non-Satkhira districts: "This district's field guide is in progress. → Satkhira".

### Edited

- `app/district/[district]/page.tsx` — swap inline `fs.readFileSync` → `getDistrictData()`. Mount new sections gated on a `has` object. Mount folio + skip InProgressStrip when district is fully built; reverse for others. Apply paper-cream background only on the fully-built district.
- `app/layout.tsx` — `next/font/google` for **Fraunces** (display) and **Inter Tight** (body), exposed as `--font-display` and `--font-body`.
- `app/globals.css` — `.font-display` and `.font-body` Tailwind layer utilities, tabular-nums utility, paper grain SVG via inline data URL (3% opacity), hairline border color token.
- `app/planner/actions.ts` — replace its `fs.readFileSync` with the new loader. No behavior change.

### Unchanged

- `BangladeshMap`, `UpazilaMap`, `DynamicUpazilaMap`, `HeritageSection`, `TransportWidget`, `HotelWidget`, `LocalSpecialtiesWidget`, `LocalAdsSidebar`, planner module.

## 6. Bucketlist interaction details

- **Storage key**: `bd-bucketlist:<districtSlug>`. Value is a JSON-serialized array of checked `id`s.
- **Hydration**: render all unchecked on first paint; rehydrate in `useEffect`. Avoids server/client mismatch (same pattern as `usePlannerStore`).
- **Check animation**: 180ms ease-out. Tick stroke draws via `stroke-dashoffset`. Title gets a left-to-right strikethrough. Opacity → 0.5. No bounce, no haptics.
- **Filter chips**: All / Place / Experience / Food / Moment. Each chip shows the **total** count of items in that category (not "remaining unchecked"). Filter selection lives in component state only (not stored across reloads).
- **Counter**: "4 of 12 done · 33%". Hairline rule above grows from left in `primaryColor` as items are checked.
- **Reset**: Tiny "Reset list" link, opens an inline confirm (replaces link text with "Confirm reset?" + "Cancel"). On confirm, clears storage and state.

## 7. Visual language

### Type

- **Display**: Fraunces (variable, opsz + soft axes used). `font-feature-settings: "ss01"`.
- **Body**: Inter Tight (variable). Tabular numerals enabled site-wide on numerical UI (`.tabular-nums`).
- **Micro-labels** (§ 00, BUCKETLIST, EMERGENCY): `text-[0.7rem] tracking-[0.18em] uppercase font-semibold`.

### Color

- Existing `getThematicColor()` system stays. Khulna hues remain Khulna hues; Satkhira's per-district shade is unchanged.
- Fully-built district uses a cream paper background (`#fbf8f1`) for the main card; others remain on the current white. Paper grain via SVG `feTurbulence` at ~3% opacity, fixed-position behind the card.
- Hairline rules: `rgb(0 0 0 / 0.08)` between bucketlist rows and below section headings.
- Hero accent: 4px bar in `primaryColor` under the district name (replaces the existing 12px top-of-card strip on Satkhira only).

### Motion

- No entrance animations on page load — the page is a reference document.
- Hover lifts removed for Satkhira's field-guide sections; replaced with single-pixel border-color shifts.
- Bucketlist check animation is the only meaningful motion event.
- Must Visit history/practical block expands via native `<details>` with `interpolate-size: allow-keywords` — zero JS.

### Folio

- One-line header inserted between hero and § 01.
- Format: `SATKHIRA   ·   KHULNA DIVISION   ·   FIELD GUIDE   ·   N°01`.
- Em-dash separators, tabular numerals on the folio number.
- N°XX increments as future districts are fully built. Numbering source: an array `lib/field-guide-folio.ts → BUILT_DISTRICTS = ["satkhira"]`, index + 1.

## 8. Conditional rendering rules

```ts
const has = {
  bucketlist:   (data?.bucketlist?.length   ?? 0) > 0,
  foods:        (data?.foods?.length        ?? 0) > 0,
  famousPeople: (data?.famousPeople?.length ?? 0) > 0,
  didYouKnow:   (data?.didYouKnow?.length   ?? 0) > 0,
  emergency:    !!data?.emergency,
};
// `famousPeople` is intentionally NOT part of the gate — knowable famous people
// vary widely per district and we'd rather omit the section than fabricate names.
const fullyBuilt = has.bucketlist && has.foods && has.emergency;
```

- Each new section renders only when its flag is true.
- Folio + cream paper background + accent bar restyle apply only when `fullyBuilt`.
- `InProgressStrip` renders only when `!fullyBuilt`.

## 9. Satkhira content scope

Real-content seeds (final wording lives in `data/districts/satkhira.json`):

- **Must Visit** — Sundarbans (Munshiganj gate), Jeshoreshwari Kali Temple, Tetulia Jame Mosque, Mozaffar Garden & Resort, Debhata Zamindar Bari, Mahmudpur Forest, Pranasayar Dighi, Bhomra Land Port viewpoint.
- **Heritage** — Tetulia Mosque, Jeshoreshwari Kali Temple (also doubles as heritage), Debhata Zamindar Bari.
- **Bucketlist (~10–14 items)** — sunrise boat into the Sundarbans, spot a Royal Bengal Tiger / fresh tracks, eat fresh golda chingri at a Munshiganj stall, taste Sundarbans honey (mowali madhu), pray at Tetulia Jame Mosque, witness Durga Puja at Jeshoreshwari, walk to the Bhomra land port and see India across the Ichamati river, eat Satkhira mishti at a heritage shop, ride a nouka through the mangrove channels at dusk, try crab curry by the coast.
- **Foods** — Golda chingri (king prawn), crab curry, shutki bhuna, kewra fruit / juice, Sundarbans honey, Satkhira mishti, narkel chitoi (winter), date palm jaggery (winter).
- **Famous people** — to be filled with confidently known names; unknowns left out rather than guessed.
- **Did You Know** — Satkhira shares the Bangladesh Sundarbans with Khulna and Bagerhat; Bhomra is one of the busiest land ports between Bangladesh and India; Jeshoreshwari Kali Temple is one of the 51 Shakti Peethas; the district is known for the legend of Banbibi, protector spirit of the mangrove forest.
- **Emergency** — `999` general, district hospital, Sadar police station, fire service. Tourist Police if confidently known; otherwise omitted (not faked).

Any phone, fee, or hours value not known with high confidence → `"—"` → field omitted from render.

## 10. File-level change list

**New**
- `data/districts/satkhira.json`
- `lib/district-data.ts`
- `lib/field-guide-folio.ts`
- `components/Bucketlist.tsx`
- `components/FoodChecklist.tsx`
- `components/FamousPeople.tsx`
- `components/DidYouKnow.tsx`
- `components/Emergency.tsx`
- `components/FieldGuideFolio.tsx`
- `components/InProgressStrip.tsx`

**Edited**
- `app/district/[district]/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/planner/actions.ts`
- `data/districts.json` (remove the `satkhira` key only)

## 11. Risks & non-risks

- **Risk — typing dependence**: many components read newly optional fields. Extended types live inline in `lib/district-data.ts` and are exported from there. No codegen, no runtime validation.
- **Risk — loader merging order**: `data/districts/<slug>.json` always wins over `data/districts.json`. Loader is the single source of this rule. Documented in the file header.
- **Non-risk — performance**: per-request `fs.readFileSync` for ~64 small JSON files is well within Next.js's tolerance and runs on Vercel Functions without issue.
- **Non-risk — hydration**: the only client component is Bucketlist; its state is hydrated in `useEffect`, identical to the planner's existing pattern.

## 12. Acceptance

- Visiting `/district/satkhira` shows the full field-guide treatment described above, with real Satkhira content and no template placeholders.
- Visiting any other district renders identically to today, plus the in-progress strip at the bottom.
- Bucketlist progress persists across reloads in localStorage per district.
- `npm run lint` and `npm run build` both succeed.
- One commit, pushed to `main`.

## 13. Deferred (explicit non-goals for this iteration)

- SQLite or Postgres migration.
- Enrichment of any non-Satkhira district.
- Auth, server-side persistence of bucketlist, sharing checked lists, social features.
- Editor / CMS workflow for content updates.
