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
    <div className="p-7 rounded-md border border-[var(--hairline)] bg-white/70 relative overflow-hidden">
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
