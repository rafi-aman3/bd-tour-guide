"use server";

import fs from "fs";
import path from "path";

export async function getPlacesForDistricts(districts: string[]) {
  const filePath = path.join(process.cwd(), "data", "districts.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(jsonData);
  
  const places: any[] = [];
  
  for (const dist of districts) {
    if (data[dist]) {
      const mustVisit = data[dist].mustVisit || [];
      const heritageSites = data[dist].heritageSites || [];
      
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
  }
  
  return places;
}
