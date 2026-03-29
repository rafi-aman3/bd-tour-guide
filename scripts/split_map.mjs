import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';

const INPUT_FILE = path.join(process.cwd(), 'public/data/BD_Districts.json');
const OUTPUT_DIR = path.join(process.cwd(), 'public/data/divisions');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read large GeoJSON
console.log('Reading BD_Districts.json...');
const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
const geoData = JSON.parse(rawData);

const divisionsMap = {};

// Group features by Division
geoData.features.forEach(feature => {
  const divisionName = feature.properties.ADM1_EN;
  if (!divisionName) return;
  
  const slug = divisionName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  if (!divisionsMap[slug]) {
    divisionsMap[slug] = {
      type: "FeatureCollection",
      features: []
    };
  }
  
  divisionsMap[slug].features.push(feature);
});

console.log('Writing individual division JSONs...');
// Write each division out and build a master division collection
const masterDivisions = {
  type: "FeatureCollection",
  features: []
};

for (const [slug, collection] of Object.entries(divisionsMap)) {
  const outPath = path.join(OUTPUT_DIR, `${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(collection));
  console.log(`Saved ${slug}.json with ${collection.features.length} districts.`);

  // Merge features to create a single Division shape
  try {
    let merged = collection.features[0];
    for (let i = 1; i < collection.features.length; i++) {
      merged = turf.union(turf.featureCollection([merged, collection.features[i]]));
    }
    
    // Simplify slightly to reduce file size further, if needed.
    // Turf's union sometimes messes properties up, let's restore the basic properties
    if (merged) {
      merged.properties = {
        ADM1_EN: collection.features[0].properties.ADM1_EN,
        slug: slug
      };
      masterDivisions.features.push(merged);
    }
  } catch(e) {
    console.warn(`Failed to merge polygons for ${slug}, error: ${e.message}`);
    // If union fails, just push the original disjoint features but we remove district properties
    collection.features.forEach(f => {
       const clone = JSON.parse(JSON.stringify(f));
       clone.properties = { ADM1_EN: f.properties.ADM1_EN, slug: slug };
       masterDivisions.features.push(clone);
    });
  }
}

console.log(`Writing BD_Divisions.json...`);
fs.writeFileSync(path.join(process.cwd(), 'public/data/BD_Divisions.json'), JSON.stringify(masterDivisions));
console.log(`Done!`);
