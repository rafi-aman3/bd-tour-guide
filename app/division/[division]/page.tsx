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

        {/* Cover band — atlas plate */}
        <header className="mb-16">
          <div className="flex items-start justify-between gap-4">
            <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold font-body text-slate-500">
              Bangladesh · Division
            </div>
            <div className="text-[0.65rem] tracking-[0.18em] uppercase font-semibold font-body text-slate-400 tabular-nums">
              Atlas · Plate
            </div>
          </div>
          <h1 className="mt-3 font-display text-5xl md:text-7xl font-semibold tracking-tight text-slate-900">
            {divisionName}
          </h1>
          <p className="mt-3 max-w-xl text-slate-600 font-body leading-relaxed">
            {districts.length} districts — field guides and ready-made trips across the division.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-1 w-12 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="h-px flex-1 bg-[var(--hairline)]" />
          </div>
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
                  className="group rounded-md border border-[var(--hairline)] bg-white/70 hover:bg-white cursor-pointer transition-colors duration-200 p-4 flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900/30"
                >
                  <span className="text-[0.6rem] uppercase tracking-[0.16em] font-semibold font-body text-slate-400 tabular-nums">
                    {folio || "Guide"}
                  </span>
                  <span className="font-display text-lg font-semibold text-slate-900 leading-tight">{name}</span>
                  <span className="inline-flex items-center gap-1 text-[0.7rem] font-body font-semibold transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" style={{ color: primaryColor }}>
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
