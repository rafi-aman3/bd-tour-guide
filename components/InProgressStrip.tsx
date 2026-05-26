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
