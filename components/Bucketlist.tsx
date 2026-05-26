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

      <div className="relative h-px w-full bg-[var(--hairline)] mb-6 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: primaryColor }}
        />
      </div>

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
                  <div className="mt-3 pr-4 text-sm text-slate-600 font-body leading-relaxed border-l-2 pl-3" style={{ borderColor: mutedColor }}>
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
