"use client";

import dynamic from "next/dynamic";

const DynamicBangladeshMap = dynamic(() => import("./BangladeshMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[500px] w-full items-center justify-center rounded-[2rem] bg-slate-100 animate-pulse border border-slate-200">
      <p className="text-slate-500 font-medium">Loading Map...</p>
    </div>
  ),
});

interface DynamicMapProps {
  mode?: "divisions" | "division-districts";
  activeDivision?: string;
}

export default function DynamicMap(props: DynamicMapProps) {
  return <DynamicBangladeshMap {...props} />;
}
