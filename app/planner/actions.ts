"use server";

import { getDistrictData } from "@/lib/district-data";

export async function getPlacesForDistricts(districts: string[]) {
  const places: any[] = [];

  for (const dist of districts) {
    const d = getDistrictData(dist);
    if (!d) continue;

    const mustVisit = d.mustVisit || [];
    const heritageSites = d.heritageSites || [];

    mustVisit.forEach((item: any) => {
      places.push({
        name: item.name,
        description: item.description,
        image: item.image,
        coordinates: item.coordinates,
        district: dist,
        category: "Must Visit"
      });
    });

    heritageSites.forEach((item: any) => {
      places.push({
        name: item.name,
        image: item.image,
        coordinates: item.coordinates,
        district: dist,
        category: "Heritage Site"
      });
    });
  }

  return places;
}
