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
