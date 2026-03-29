import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, '..', 'data', 'districts.json');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

for (const [slug, districtData] of Object.entries(data)) {
  const cap = districtData.name;
  
  districtData.transport = {
    bus: {
      available: true,
      bookingUrls: [
        { name: "BDTickets", url: `https://bdtickets.com/bus/search/{fromCityLowercase}-to-${slug}?journeyDate={date}` },
        { name: "Shohoz", url: `https://www.shohoz.com/bus-tickets/booking/bus/search?fromcity={fromCity}&tocity=${cap}&doj={date}&dor=` }
      ],
      manualBookings: [
        { name: "Hanif Paribahan", phone: "01711-XXXX01" },
        { name: "Ena Transport", phone: "01711-XXXX02" },
        { name: "Green Line", phone: "01711-XXXX03" }
      ]
    },
    train: {
      available: true,
      bookingUrls: [
        { name: "Bangladesh Railway", url: `https://eticket.railway.gov.bd/booking/train/search?fromcity={fromCity}&tocity=${cap}&doj={date}&class=SNIGDHA` }
      ],
      manualBookings: [
        { name: "Regional Station Inquiry", phone: "01711-XXXX04" }
      ]
    },
    launch: {
      available: true,
      bookingUrls: [
        { name: "BDTickets Launch", url: `https://bdtickets.com/launch/search/{fromCityLowercase}-to-${slug}?journeyDate={date}` }
      ],
      manualBookings: [
        { name: "Sadarghat Terminal Box", phone: "01711-XXXX05" },
        { name: "BIWTA Inquiry", phone: "01711-XXXX06" }
      ]
    },
    plane: {
      available: true,
      bookingUrls: [
        { name: "Biman Bangladesh", url: `https://biman-airlines.com/?from={fromCityAir}&to=CXB&date={date}` },
        { name: "US-Bangla", url: `https://usbair.com/` }
      ],
      manualBookings: [
        { name: "Biman Agency Ticket Office", phone: "01711-XXXX07" }
      ]
    }
  };
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully injected transport objects for ${Object.keys(data).length} districts.`);
