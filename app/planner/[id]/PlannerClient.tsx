"use client";

import { useEffect, useState } from "react";
import { usePlannerStore } from "@/lib/store/usePlannerStore";
import PlannerSidebar from "@/components/planner/PlannerSidebar";
import dynamic from "next/dynamic";

const MapPanel = dynamic(() => import("@/components/planner/MapPanel"), { ssr: false });

export function PlannerClient({ id, initialDistrict }: { id: string; initialDistrict?: string }) {
  const { trips, createTrip, setActiveTrip } = usePlannerStore();
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!trips[id]) {
      createTrip(id, initialDistrict);
    } else {
      setActiveTrip(id);
    }
  }, [id, initialDistrict, createTrip, setActiveTrip, trips]);

  if (!isMounted) return null; // Hydration safeguard

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen w-full overflow-hidden bg-slate-50">
      <div className="w-full h-1/2 md:h-full md:w-1/3 lg:w-[450px] bg-white shadow-xl z-10 flex flex-col pt-4 md:pt-0 border-t md:border-t-0 md:border-r border-slate-200">
        <PlannerSidebar tripId={id} />
      </div>
      <div className="w-full h-[50dvh] md:h-full md:flex-1 relative z-0">
        <MapPanel />
      </div>
    </div>
  );
}
