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
          § 07 &nbsp;People of the District
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
