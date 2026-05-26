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

function MustVisitCard({ spot, primaryColor, mutedColor }: { spot: DistrictMustVisit; primaryColor: string; mutedColor: string }) {
  const hasDetails =
    !!spot.history ||
    !!spot.practical ||
    !!spot.howToReach ||
    !!spot.bestTime ||
    (spot.tips && spot.tips.length > 0);

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
  const data = getDistrictData(district);

  const fallbackName = district
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const districtName = data?.name || fallbackName;
  const divisionName = data?.division || DISTRICT_TO_DIVISION[district] || "Dhaka";

  const primaryColor = getThematicColor(divisionName, district, 1);
  const secondaryColor = getThematicColor(divisionName, district, 0.15);
  const mutedColor = getThematicColor(divisionName, district, 0.05);

  const has = {
    bucketlist:   (data?.bucketlist?.length   ?? 0) > 0,
    foods:        (data?.foods?.length        ?? 0) > 0,
    famousPeople: (data?.famousPeople?.length ?? 0) > 0,
    didYouKnow:   (data?.didYouKnow?.length   ?? 0) > 0,
    emergency:    !!data?.emergency,
    heritageSites: (data?.heritageSites?.length ?? 0) > 0,
  };
  // famousPeople intentionally excluded from fullyBuilt — see spec.
  const fullyBuilt = has.bucketlist && has.foods && has.emergency;
  const folio = folioNumber(district);

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
                      <HeritageSection primaryColor={primaryColor} sites={(data?.heritageSites as never[]) || []} isSubsection={true} />
                    </div>
                  )}
                </section>

                {has.foods && data?.foods && (
                  <FoodChecklist foods={data.foods} primaryColor={primaryColor} mutedColor={mutedColor} />
                )}

                <LocalSpecialtiesWidget specialties={(data?.specialties as never[]) || []} primaryColor={primaryColor} mutedColor={mutedColor} />

                <TransportWidget data={(data?.transport as never) || {}} primaryColor={primaryColor} districtName={districtName} />

                <HotelWidget data={data?.hotels as never} primaryColor={primaryColor} />

                {has.famousPeople && data?.famousPeople && (
                  <FamousPeople people={data.famousPeople} primaryColor={primaryColor} />
                )}

                {has.emergency && data?.emergency && (
                  <Emergency data={data.emergency} primaryColor={primaryColor} />
                )}
              </div>

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

        <span className="sr-only" data-built-districts={BUILT_DISTRICTS.join(",")} />
      </div>
    </main>
  );
}
