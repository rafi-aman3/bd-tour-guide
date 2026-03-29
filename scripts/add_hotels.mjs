import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, '..', 'data', 'districts.json');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

for (const [slug, districtData] of Object.entries(data)) {
  const cap = districtData.name;
  
  // 21.0 to 26.0 lat, 88.0 to 92.0 lng roughly bd bounds
  const dummyLat = 21 + Math.random() * 5;
  const dummyLng = 88 + Math.random() * 4;
  
  districtData.hotels = {
    available: true,
    bookingUrls: [
      { 
        name: "GoZayaan", 
        url: `https://gozayaan.com/hotel/list?checkin={checkin}&checkout={checkout}&search=&location=${cap.replace(/\s+/g, '+')}&rooms={rooms},2,0&child_ages=&sort=POPULARITY` 
      },
      { 
        name: "ShareTrip", 
        url: `https://sharetrip.net/hotel-search?checkInDate={checkin}&checkOutDate={checkout}&cityName=${cap.replace(/\s+/g, '%20')}&countryName=Bangladesh&currency=BDT&limit=10&nationality=BD&numberOfGuestsInRooms=%5B%7B%22adults%22%3A{guests}%2C%22children%22%3A%5B%5D%7D%5D&offset=0&regionId=3002` 
      }
    ],
    manualBookings: [
      { 
        name: `Grand ${cap} Resort & Spa`, 
        phone: "+880 1711-000001",
        coordinates: [dummyLat, dummyLng]
      },
      { 
        name: `Hotel ${cap} International`, 
        phone: "+880 1911-000002",
        coordinates: [dummyLat + 0.05, dummyLng - 0.05]
      }
    ]
  };
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully injected hotel booking profiles for ${Object.keys(data).length} districts.`);
