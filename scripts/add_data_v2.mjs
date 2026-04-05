import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, '..', 'data', 'districts.json');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

for (const [slug, districtData] of Object.entries(data)) {
  const cap = districtData.name;
  
  const dummyLat = 21 + Math.random() * 5;
  const dummyLng = 88 + Math.random() * 4;

  districtData.specialties = [
    { 
      type: "food", 
      name: `Famous ${cap} Misti House`, 
      description: `The legendary heritage sweet shop known across ${cap} for its authentic preparation over generations.`, 
      venue: "Central City Bazaar" 
    },
    { 
      type: "craft", 
      name: `${cap} Handloom Sharee`, 
      description: `Intricately woven traditional garments showcasing the finest local weaving heritage of ${cap}.`, 
      venue: "Heritage Weavers Palli" 
    },
    { 
      type: "festival", 
      name: `${cap} Cultural Festival`, 
      description: `An annual celebration of heritage, music, and local art native to the heart of the district.`, 
      timing: "Mid-Winter / Late December" 
    },
    { 
      type: "mela", 
      name: `Annual Authentic ${cap} Mela`, 
      description: `The largest village fair gathering thousands of artisans, merchants, and singers in the region.`, 
      timing: "Mid-April", 
      coordinates: [dummyLat, dummyLng] 
    }
  ];

  districtData.advertisements = [
    { 
      type: "guide", 
      name: "Ahmed Rafiq", 
      rating: +(4.2 + (Math.random() * 0.7)).toFixed(1), // e.g. 4.9
      languages: ["Bengali", "English"], 
      phone: "+880 1711-555555" 
    },
    { 
      type: "business", 
      name: `${cap} Tourist Rentals`, 
      description: "AC Microbus & Car hires for district-wide exploring.", 
      phone: "+880 1911-555555" 
    }
  ];
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully injected polymorphic data arrays for ${Object.keys(data).length} districts.`);
