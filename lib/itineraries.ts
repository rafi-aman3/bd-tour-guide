import fs from "fs";
import path from "path";

export interface ItineraryStop {
  name: string;
  coordinates?: [number, number];
  note?: string;
}

export interface ItineraryDay {
  day: number; // 1-indexed
  title: string;
  district: string; // slug; must appear in itinerary.districts
  stops: ItineraryStop[];
}

export interface Itinerary {
  id: string;
  title: string;
  subtitle?: string;
  durationDays: number;
  bestSeason: string;
  seasonNote?: string;
  pace: "Easy" | "Moderate" | "Active";
  themeTags: string[];
  districts: string[]; // unique district slugs, in route order
  coverImage?: string;
  summary: string;
  days: ItineraryDay[];
}

interface DivisionItinerariesFile {
  division: string;
  itineraries: Itinerary[];
}

const cache = new Map<string, Itinerary[]>();

export function getDivisionItineraries(divisionSlug: string): Itinerary[] {
  if (cache.has(divisionSlug)) return cache.get(divisionSlug)!;
  const filePath = path.join(process.cwd(), "data", "itineraries", `${divisionSlug}.json`);
  let result: Itinerary[] = [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as DivisionItinerariesFile;
    result = Array.isArray(parsed.itineraries) ? parsed.itineraries : [];
  } catch {
    result = []; // no file for this division yet → page renders without § 01
  }
  cache.set(divisionSlug, result);
  return result;
}
