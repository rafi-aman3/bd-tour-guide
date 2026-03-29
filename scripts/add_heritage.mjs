import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'districts.json');
const rawData = fs.readFileSync(DB_PATH, 'utf8');
const data = JSON.parse(rawData);

for (const key of Object.keys(data)) {
  if (!data[key].heritageSites) {
    data[key].heritageSites = [
      {
        name: `Protected Heritage Site of ${data[key].name}`,
        image: "https://images.unsplash.com/photo-1599824632881-8b43f07a424e?auto=format&fit=crop&q=80&w=800",
        coordinates: [23.8105 + (Math.random() - 0.5), 90.4125 + (Math.random() - 0.5)] // Dummy slightly randomized coord around Dhaka
      }
    ];
  }
}

fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
console.log('Successfully added dummy heritage sites to all districts.');
