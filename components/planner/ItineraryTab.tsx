"use client";

import { usePlannerStore } from "@/lib/store/usePlannerStore";
import { format, addDays, differenceInDays } from "date-fns";
import { MapPin, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ItineraryTab({ tripId }: { tripId: string }) {
  const { trips, updatePlaceDay, removePlace } = usePlannerStore();
  const trip = trips[tripId];

  if (!trip) return null;

  const { dateRange, placesToExplore } = trip;
  
  // Calculate total days
  // If dates are not set, we'll default to just showing "Unassigned" and maybe "Day 1"
  let totalDays = 1;
  let startDate = new Date(); // Use today as default if none set just for UI preview if they didn't pick dates
  
  if (dateRange?.from) {
    startDate = dateRange.from;
    if (dateRange.to) {
      totalDays = differenceInDays(dateRange.to, dateRange.from) + 1;
    }
  }

  // Create an array of days
  const days = Array.from({ length: totalDays }, (_, i) => ({
    dayNumber: i + 1,
    date: dateRange?.from ? addDays(startDate, i) : null,
    offset: i,
  }));

  const unassignedPlaces = placesToExplore.filter((p) => p.dayOffset === undefined);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Unassigned Bucket */}
      <div className="bg-slate-100 rounded-2xl p-4 border border-dashed border-slate-300">
        <h3 className="font-black text-sm uppercase text-slate-500 mb-3 flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Unassigned Places
          <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-600">
            {unassignedPlaces.length}
          </Badge>
        </h3>
        
        <div className="space-y-2">
          {unassignedPlaces.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">All places assigned!</p>
          )}
          {unassignedPlaces.map((place) => (
            <PlaceCard 
              key={place.id} 
              place={place} 
              days={days} 
              onAssign={(offset) => updatePlaceDay(place.id, offset)}
              onRemove={() => removePlace(place.id)}
            />
          ))}
        </div>
      </div>

      {/* Days Breakdown */}
      {days.map((day) => {
        const placesForDay = placesToExplore.filter((p) => p.dayOffset === day.offset);
        
        return (
          <div key={`day-${day.dayNumber}`} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 pb-2">
            <div className="flex justify-between items-end mb-4 border-b border-slate-50 pb-3">
              <h3 className="font-black text-xl text-slate-900">
                Day {day.dayNumber}
              </h3>
              {day.date && (
                <span className="text-sm font-bold text-slate-400">
                  {format(day.date, "EEEE, LLL dd")}
                </span>
              )}
            </div>

            <div className="space-y-3 mb-3">
              {placesForDay.length === 0 && (
                <div className="h-20 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-sm font-bold text-slate-300">
                  No places assigned yet
                </div>
              )}
              {placesForDay.map((place) => (
                <PlaceCard 
                  key={place.id} 
                  place={place} 
                  days={days} 
                  onAssign={(offset) => updatePlaceDay(place.id, offset)}
                  onRemove={() => removePlace(place.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlaceCard({ 
  place, 
  days, 
  onAssign, 
  onRemove 
}: { 
  place: any, 
  days: any[], 
  onAssign: (val: number | undefined) => void,
  onRemove: () => void 
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all group">
      <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
        <MapPin className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-800 truncate">{place.name}</h4>
        <p className="text-xs text-slate-500 capitalize">{place.district}</p>
      </div>
      
      <Select 
        value={place.dayOffset === undefined ? "unassigned" : place.dayOffset.toString()}
        onValueChange={(val) => onAssign(val === "unassigned" ? undefined : parseInt(val))}
      >
        <SelectTrigger className="w-[110px] h-8 text-xs bg-slate-50 focus:ring-emerald-500">
          <SelectValue placeholder="Assign" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned" className="text-slate-400">Unassigned</SelectItem>
          {days.map((d) => (
            <SelectItem key={d.offset} value={d.offset.toString()}>
              Day {d.dayNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button onClick={onRemove} className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
