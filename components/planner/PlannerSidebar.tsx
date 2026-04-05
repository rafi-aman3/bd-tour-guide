"use client";

import { useState } from "react";
import OverviewTab from "./OverviewTab";
import ItineraryTab from "./ItineraryTab";
import BudgetTab from "./BudgetTab";
import { usePlannerStore } from "@/lib/store/usePlannerStore";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type TabType = "Overview" | "Itinerary" | "Budget";

export default function PlannerSidebar({ tripId }: { tripId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const { trips, activeTripId } = usePlannerStore();

  const trip = activeTripId ? trips[activeTripId] : null;

  if (!trip) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 md:p-6 pb-0 shadow-sm z-10 shrink-0">
        <Link 
          href={trip.destinations[0] ? `/district/${trip.destinations[0]}` : "/"} 
          className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to District
        </Link>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 truncate" title={trip.tripName}>
          {trip.tripName}
        </h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 border-b border-slate-100 font-bold overflow-x-auto scrollbar-hide">
          {["Overview", "Itinerary", "Budget"].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as TabType)}
               className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
                 activeTab === tab
                   ? "border-emerald-500 text-emerald-600"
                   : "border-transparent text-slate-500 hover:text-slate-700"
               }`}
             >
               {tab}
             </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
        {activeTab === "Overview" && <OverviewTab tripId={tripId} />}
        {activeTab === "Itinerary" && <ItineraryTab tripId={tripId} />}
        {activeTab === "Budget" && <BudgetTab tripId={tripId} />}
      </div>
    </div>
  );
}
