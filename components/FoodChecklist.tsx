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
          § 03 &nbsp;What to Eat
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
                <span className="normal-case tracking-normal" style={{ color: primaryColor }}>
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
