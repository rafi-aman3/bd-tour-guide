"use client";

import { useEffect, useState } from "react";
import { usePlannerStore } from "@/lib/store/usePlannerStore";
import { getPlacesForDistricts } from "@/app/planner/actions";
import { CalendarIcon, Plus, X, MapPin, Check } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const ALL_DISTRICTS = [
  "dhaka", "faridpur", "gazipur", "gopalganj", "kishoreganj", 
  "madaripur", "manikganj", "munshiganj", "narayanganj", "narsingdi", 
  "rajbari", "shariatpur", "tangail", "chattogram", "coxsbazar"
]; // A small sample for the MVP dropdown

export default function OverviewTab({ tripId }: { tripId: string }) {
  const { trips, updateActiveTrip, addDestination, removeDestination, addPlace, removePlace } = usePlannerStore();
  const trip = trips[tripId];
  const [suggestedPlaces, setSuggestedPlaces] = useState<any[]>([]);

  useEffect(() => {
    if (trip?.destinations.length > 0) {
      getPlacesForDistricts(trip.destinations).then(setSuggestedPlaces);
    } else {
      setSuggestedPlaces([]);
    }
  }, [trip?.destinations]);

  if (!trip) return null;

  return (
    <div className="space-y-6 pb-20">
      {/* Trip Basics */}
      <div className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Trip Name</label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            value={trip.tripName}
            onChange={(e) => updateActiveTrip({ tripName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Dates</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <span className="text-sm">
                    {trip.dateRange?.from ? (
                      trip.dateRange.to ? (
                        `${format(trip.dateRange.from, "LLL dd")} - ${format(trip.dateRange.to, "LLL dd")}`
                      ) : (
                        format(trip.dateRange.from, "LLL dd")
                      )
                    ) : (
                      "Set Dates"
                    )}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={trip.dateRange?.from}
                  selected={{ from: trip.dateRange?.from, to: trip.dateRange?.to }}
                  onSelect={(range) => updateActiveTrip({ dateRange: range as any })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Travelers</label>
            <div className="flex bg-slate-50 border border-slate-200 rounded-lg mt-1 overflow-hidden">
              <button 
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 transition-colors"
                onClick={() => updateActiveTrip({ travelers: Math.max(1, trip.travelers - 1) })}
              >-</button>
              <div className="flex-1 text-center py-2 font-bold text-sm">{trip.travelers}</div>
              <button 
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 transition-colors"
                onClick={() => updateActiveTrip({ travelers: trip.travelers + 1 })}
              >+</button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Origin (Coming From)</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize leading-snug"
            value={trip.origin || ""}
            onChange={(e) => updateActiveTrip({ origin: e.target.value })}
          >
            <option value="" disabled>Select Starting Point...</option>
            {ALL_DISTRICTS.map(d => <option key={`origin-${d}`} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Destinations Planner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-black text-lg mb-3">Districts in Trip</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {trip.destinations.map(dist => (
            <Badge key={dist} variant="secondary" className="px-3 py-1 capitalize flex items-center bg-slate-100 text-slate-800 hover:bg-slate-200">
              {dist}
              <button onClick={() => removeDestination(dist)} className="ml-2 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <select 
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
          onChange={(e) => {
            if (e.target.value) {
              addDestination(e.target.value);
              e.target.value = "";
            }
          }}
          value=""
        >
          <option value="" disabled>+ Add Another District...</option>
          {ALL_DISTRICTS.filter(d => !trip.destinations.includes(d)).map(d => (
            <option key={`dest-${d}`} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Suggested Places Accordion */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="suggestions" className="border-b-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
              <span className="font-black text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-emerald-500" />
                Suggested Places
                <Badge className="ml-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">{suggestedPlaces.length}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 pt-0">
              <ScrollArea className="h-72 w-full pr-4">
                <div className="space-y-4 mt-2">
                  {suggestedPlaces.length === 0 && (
                    <div className="text-center text-slate-400 py-8">Select destinations to see suggestions!</div>
                  )}
                  {suggestedPlaces.map((place, idx) => {
                    const isAdded = trip.placesToExplore.some(p => p.name === place.name && p.district === place.district);
                    return (
                      <div key={idx} className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="h-16 w-16 rounded-lg bg-slate-200 shrink-0 overflow-hidden">
                          {place.image ? (
                           <img src={place.image} alt={place.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400"><MapPin className="h-6 w-6"/></div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="font-bold text-sm text-slate-900">{place.name}</h4>
                          <span className="text-xs text-slate-500 capitalize">{place.district} • {place.category}</span>
                        </div>
                        <div className="flex items-center">
                          {isAdded ? (
                            <button className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center cursor-default">
                              <Check className="h-4 w-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => addPlace({ 
                                name: place.name, 
                                district: place.district, 
                                coordinates: place.coordinates 
                              })}
                              className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
}
