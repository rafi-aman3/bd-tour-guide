export const DEFAULT_CENTER: [number, number] = [23.685, 90.3563]; // Center of Bangladesh
export const DEFAULT_ZOOM = 7;
export const BD_BOUNDS: [[number, number], [number, number]] = [
  [21.0, 88.0], // South-West
  [26.3, 92.7]  // North-East
];

export const DIVISION_COLORS: Record<string, { h: number; s: number; l: number }> = {
  "Dhaka": { h: 224, s: 76, l: 48 },      // Indigo
  "Chittagong": { h: 181, s: 84, l: 32 }, // Teal
  "Rajshahi": { h: 24, s: 95, l: 50 },    // Orange/Amber
  "Khulna": { h: 142, s: 71, l: 45 },     // Emerald
  "Sylhet": { h: 322, s: 81, l: 43 },     // Rose/Pink
  "Barisal": { h: 199, s: 89, l: 48 },    // Blue
  "Rangpur": { h: 45, s: 93, l: 47 },     // Amber/Yellow
  "Mymensingh": { h: 262, s: 83, l: 58 }, // Violet/Purple
};

export const DISTRICT_TO_DIVISION: Record<string, string> = {
  // Dhaka Division
  "dhaka": "Dhaka", "faridpur": "Dhaka", "gazipur": "Dhaka", "gopalganj": "Dhaka", "kishoreganj": "Dhaka", 
  "madaripur": "Dhaka", "manikganj": "Dhaka", "munshiganj": "Dhaka", "narayanganj": "Dhaka", 
  "narsingdi": "Dhaka", "rajbari": "Dhaka", "shariatpur": "Dhaka", "tangail": "Dhaka",

  // Chittagong Division
  "bandarban": "Chittagong", "brahmanbaria": "Chittagong", "chandpur": "Chittagong", "chittagong": "Chittagong",
  "comilla": "Chittagong", "coxs-bazar": "Chittagong", "feni": "Chittagong", "khagrachhari": "Chittagong",
  "lakshmipur": "Chittagong", "noakhali": "Chittagong", "rangamati": "Chittagong",

  // Rajshahi Division
  "bogra": "Rajshahi", "chapainawabganj": "Rajshahi", "joypurhat": "Rajshahi", "naogaon": "Rajshahi",
  "natore": "Rajshahi", "pabna": "Rajshahi", "rajshahi": "Rajshahi", "sirajganj": "Rajshahi",

  // Khulna Division
  "bagherhat": "Khulna", "chuadanga": "Khulna", "jessore": "Khulna", "jhenaidah": "Khulna",
  "khulna": "Khulna", "kushtia": "Khulna", "magura": "Khulna", "meherpur": "Khulna",
  "narail": "Khulna", "satkhira": "Khulna",

  // Barisal Division
  "barguna": "Barisal", "barisal": "Barisal", "bhola": "Barisal", "jhalokati": "Barisal",
  "patuakhali": "Barisal", "pirojpur": "Barisal",

  // Sylhet Division
  "habiganj": "Sylhet", "moulvibazar": "Sylhet", "sunamganj": "Sylhet", "sylhet": "Sylhet",

  // Rangpur Division
  "dinajpur": "Rangpur", "gaibandha": "Rangpur", "kurigram": "Rangpur", "lalmonirhat": "Rangpur",
  "nilphamari": "Rangpur", "panchagarh": "Rangpur", "rangpur": "Rangpur", "thakurgaon": "Rangpur",

  // Mymensingh Division
  "jamalpur": "Mymensingh", "mymensingh": "Mymensingh", "netrokona": "Mymensingh", "sherpur": "Mymensingh"
};

export function getThematicColor(divisionName: string, districtName: string, opacity: number = 1) {
  const base = DIVISION_COLORS[divisionName] || { h: 224, s: 76, l: 48 };
  
  let hash = 0;
  for (let i = 0; i < districtName.length; i++) {
    hash = districtName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const lOffset = (hash % 20) - 10;
  const l = Math.max(20, Math.min(80, base.l + lOffset));
  
  return `hsla(${base.h}, ${base.s}%, ${l}%, ${opacity})`;
}
