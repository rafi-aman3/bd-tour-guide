"use client";

import dynamic from "next/dynamic";

const DynamicUpazilaMapWrapper = dynamic(() => import("./UpazilaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 animate-pulse rounded-[2rem]">
      <p className="text-slate-400 font-medium">Loading Interactive Map...</p>
    </div>
  ),
});

interface UpazilaMapProps {
  geoJsonUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function DynamicUpazilaMap(props: UpazilaMapProps) {
  return <DynamicUpazilaMapWrapper {...props} />;
}
