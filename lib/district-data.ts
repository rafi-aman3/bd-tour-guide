import fs from "fs";
import path from "path";

// -------- Types --------

export type DistrictMustVisit = {
  name: string;
  description: string;
  image: string;
  type?: "nature" | "religious" | "heritage" | "landmark" | "market";
  history?: string;
  coordinates?: [number, number];
  practical?: {
    hours?: string;
    entryFee?: string;
    contact?: string;
    website?: string;
  };
  howToReach?: {
    fromDistrictTown: string;
    distanceKm?: number;
    transport: string;
  };
  bestTime?: string;
  tips?: string[];
};

export type BucketlistItem = {
  id: string;
  title: string;
  category: "place" | "experience" | "food" | "moment";
  detail: string;
  whereOrHow: string;
  bestTime?: string;
};

export type DistrictFood = {
  name: string;
  description: string;
  whereToFind: string;
  image?: string;
};

export type DistrictFamousPerson = {
  name: string;
  knownFor: string;
  era?: string;
  image?: string;
};

export type DistrictEmergency = {
  generalEmergency: string;
  police?: { name: string; phone: string }[];
  hospital?: { name: string; phone: string }[];
  fire?: { phone: string };
  touristPolice?: { phone: string };
};

export type DistrictSpecialty = {
  type: "food" | "craft" | "festival" | "mela" | "produce";
  name: string;
  description: string;
  venue?: string;
  timing?: string;
  coordinates?: [number, number];
};

export type DistrictHeritageSite = {
  name: string;
  image: string;
  coordinates: [number, number];
  [key: string]: unknown;
};

export type DistrictTransportMode = {
  available: boolean;
  bookingUrls: { name: string; url: string }[];
  manualBookings: { name: string; phone: string; [key: string]: unknown }[];
};

export type DistrictTransport = {
  bus?: DistrictTransportMode;
  train?: DistrictTransportMode;
  launch?: DistrictTransportMode;
  plane?: DistrictTransportMode;
};

export type DistrictHotels = {
  available: boolean;
  bookingUrls: { name: string; url: string }[];
  manualBookings: { name: string; phone: string; coordinates: [number, number] }[];
};

export type DistrictAd = {
  type: "guide" | "business";
  name: string;
  description?: string;
  rating?: number;
  languages?: string[];
  phone: string;
};

export type DistrictRecord = {
  name: string;
  division: string;
  tagline?: string;
  stats?: { area?: string; population?: string; established?: string; attractions?: string };
  mustVisit?: DistrictMustVisit[];
  specialties?: DistrictSpecialty[];
  guide?: { bestTime?: string; gettingThere?: string; difficulty?: string };
  heritageSites?: DistrictHeritageSite[];
  transport?: DistrictTransport;
  hotels?: DistrictHotels;
  advertisements?: DistrictAd[];
  bucketlist?: BucketlistItem[];
  foods?: DistrictFood[];
  famousPeople?: DistrictFamousPerson[];
  didYouKnow?: string[];
  emergency?: DistrictEmergency;
};

// -------- Loader --------
//
// Merge rule: `data/districts.json` is the base map (slug -> record).
// Every file at `data/districts/<slug>.json` is an override for that slug —
// the override file's top-level object replaces the base record entirely
// (no deep merge, to keep the rule predictable). Slug is derived from the
// filename (e.g. `satkhira.json` -> slug `satkhira`).

let cache: Record<string, DistrictRecord> | null = null;

function loadAll(): Record<string, DistrictRecord> {
  if (cache) return cache;

  const baseFile = path.join(process.cwd(), "data", "districts.json");
  const base = JSON.parse(fs.readFileSync(baseFile, "utf8")) as Record<string, DistrictRecord>;

  const overridesDir = path.join(process.cwd(), "data", "districts");
  const overrides: Record<string, DistrictRecord> = {};
  if (fs.existsSync(overridesDir)) {
    for (const file of fs.readdirSync(overridesDir)) {
      if (!file.endsWith(".json")) continue;
      const slug = file.replace(/\.json$/, "");
      const filePath = path.join(overridesDir, file);
      try {
        overrides[slug] = JSON.parse(fs.readFileSync(filePath, "utf8")) as DistrictRecord;
      } catch (e) {
        console.error(`[district-data] Failed to parse ${filePath}:`, e);
      }
    }
  }

  cache = { ...base, ...overrides };
  return cache;
}

export function getDistrictData(slug: string): DistrictRecord | undefined {
  return loadAll()[slug];
}

export function getAllDistrictSlugs(): string[] {
  return Object.keys(loadAll());
}
