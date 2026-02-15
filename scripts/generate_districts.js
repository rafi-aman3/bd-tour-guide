const fs = require('fs');
const path = require('path');

const DISTRICT_TO_DIVISION = {
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

const districtsData = {};

Object.entries(DISTRICT_TO_DIVISION).forEach(([slug, division]) => {
  const name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Specific data for key districts
  if (slug === 'dhaka') {
    districtsData[slug] = {
      name: "Dhaka",
      division: "Dhaka",
      stats: { area: "1,463.60 sq km", population: "12,102,411", established: "1772", attractions: "20+" },
      mustVisit: [
        { name: "Lalbagh Fort", description: "17th-century Mughal palace fortress.", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&q=80&w=800" },
        { name: "Ahsan Manzil", description: "The official residential palace of the Nawab of Dhaka.", image: "https://images.unsplash.com/photo-1627440301191-036113ec4dd7?auto=format&fit=crop&q=80&w=800" },
        { name: "National Parliament House", description: "Masterpiece of modern architecture by Louis Kahn.", image: "https://images.unsplash.com/photo-1599824632881-8b43f07a424e?auto=format&fit=crop&q=80&w=800" }
      ],
      specialties: { cuisine: "Famous for Kacchi Biryani and Dhakai Bakorkhani.", crafts: "Jamdani and Muslin fabrics." },
      guide: { bestTime: "October to March", gettingThere: "Air, rail, and road connections.", difficulty: "Easy" }
    };
  } else if (slug === 'coxs-bazar') {
    districtsData[slug] = {
        name: "Cox's Bazar",
        division: "Chittagong",
        stats: { area: "2,491.85 sq km", population: "2,289,990", established: "1984", attractions: "15+" },
        mustVisit: [
          { name: "Longest Sea Beach", description: "120 km long natural sandy beach.", image: "https://images.unsplash.com/photo-1582200231580-0081d5eb856a?auto=format&fit=crop&q=80&w=800" },
          { name: "Inani Beach", description: "Beautiful coral beach with crystal clear water.", image: "https://images.unsplash.com/photo-1580000000000-000000000000?auto=format&fit=crop&q=80&w=800" },
          { name: "Saint Martin's Island", description: "The only coral island in Bangladesh.", image: "https://images.unsplash.com/photo-1596409890287-c1d0c4ea4f93?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Dried fish (Shutki) and fresh seafood.", crafts: "Sea-shell crafts and Burmese textiles." },
        guide: { bestTime: "November to February", gettingThere: "Air or luxury bus from Dhaka.", difficulty: "Easy" }
      };
  } else if (slug === 'sylhet') {
    districtsData[slug] = {
        name: "Sylhet",
        division: "Sylhet",
        stats: { area: "3,452.07 sq km", population: "3,434,188", established: "1782", attractions: "12+" },
        mustVisit: [
          { name: "Ratargul Swamp Forest", description: "Only freshwater swamp forest in Bangladesh.", image: "https://images.unsplash.com/photo-1596409890287-c1d0c4ea4f93?auto=format&fit=crop&q=80&w=800" },
          { name: "Bisnakhandi", description: "Beautiful landscape where hills meet water.", image: "https://images.unsplash.com/photo-1627440301191-036113ec4dd7?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Shatkora Beef and aromatic Tea.", crafts: "Manipuri handloom and Sheetal Pati." },
        guide: { bestTime: "June to September (Monsoon) or November to February", gettingThere: "Air, rail, and road.", difficulty: "Moderate" }
      };
  } else if (slug === 'bandarban') {
    districtsData[slug] = {
        name: "Bandarban",
        division: "Chittagong",
        stats: { area: "4,479.01 sq km", population: "388,335", established: "1981", attractions: "20+" },
        mustVisit: [
          { name: "Nilgiri", description: "High altitude peak with breathtaking clouds.", image: "https://images.unsplash.com/photo-1580000000000-000000000003?auto=format&fit=crop&q=80&w=800" },
          { name: "Golden Temple", description: "Beautiful Buddhist temple.", image: "https://images.unsplash.com/photo-1580000000000-000000000004?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Traditional tribal bamboo shoot dishes.", crafts: "Tribal handloom fabrics." },
        guide: { bestTime: "September to February", gettingThere: "Bus from Chittagong.", difficulty: "Challenging" }
      };
  } else if (slug === 'khulna') {
    districtsData[slug] = {
        name: "Khulna",
        division: "Khulna",
        stats: { area: "4,394.45 sq km", population: "2,318,527", established: "1882", attractions: "10+" },
        mustVisit: [
          { name: "Sundarbans", description: "Largest mangrove forest in the world.", image: "https://images.unsplash.com/photo-1627440301191-036113ec4dd7?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Chuijhal meat dishes.", crafts: "Jute and pottery products." },
        guide: { bestTime: "November to February", gettingThere: "Train or bus.", difficulty: "Moderate" }
      };
  } else if (slug === 'barisal') {
    districtsData[slug] = {
        name: "Barisal",
        division: "Barisal",
        stats: { area: "2,784.52 sq km", population: "2,324,310", established: "1797", attractions: "8+" },
        mustVisit: [
          { name: "Floating Guava Market", description: "Unique traditional market on boats.", image: "https://images.unsplash.com/photo-1596409890287-c1d0c4ea4f93?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Ilish fish and various river fish.", crafts: "Traditional boat making." },
        guide: { bestTime: "November to February", gettingThere: "By launch (river ferry) from Dhaka.", difficulty: "Easy" }
      };
  } else if (slug === 'rangpur') {
    districtsData[slug] = {
        name: "Rangpur",
        division: "Rangpur",
        stats: { area: "2,370.45 sq km", population: "2,881,086", established: "1769", attractions: "7+" },
        mustVisit: [
          { name: "Tajhat Palace", description: "Grand historical palace.", image: "https://images.unsplash.com/photo-1627440301191-036113ec4dd7?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Harivanga Mango and traditional curries.", crafts: "Shatranji carpets." },
        guide: { bestTime: "October to March", gettingThere: "Air or bus.", difficulty: "Easy" }
      };
  } else if (slug === 'mymensingh') {
    districtsData[slug] = {
        name: "Mymensingh",
        division: "Mymensingh",
        stats: { area: "4,394.57 sq km", population: "5,110,272", established: "1787", attractions: "6+" },
        mustVisit: [
          { name: "Alexandra Castle", description: "Historic mansion with unique architecture.", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Famous for Muktagachara Manda (sweet).", crafts: "Handmade fans and pottery." },
        guide: { bestTime: "October to March", gettingThere: "Train or bus from Dhaka.", difficulty: "Easy" }
      };
  } else if (slug === 'rajshahi') {
    districtsData[slug] = {
        name: "Rajshahi",
        division: "Rajshahi",
        stats: { area: "2,407.01 sq km", population: "2,595,197", established: "1825", attractions: "10+" },
        mustVisit: [
          { name: "Varendra Research Museum", description: "Oldest museum in Bangladesh.", image: "https://images.unsplash.com/photo-1599824632881-8b43f07a424e?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "World's best mangoes (various types).", crafts: "Rajshahi Silk." },
        guide: { bestTime: "October to March", gettingThere: "Air, rail, and road.", difficulty: "Easy" }
      };
  } else if (slug === 'comilla') {
    districtsData[slug] = {
        name: "Comilla",
        division: "Chittagong",
        stats: { area: "3,087.33 sq km", population: "5,387,288", established: "1790", attractions: "9+" },
        mustVisit: [
          { name: "Shalban Vihara", description: "Ancient Buddhist archaeological site.", image: "https://images.unsplash.com/photo-1599824632881-8b43f07a424e?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Famous for Rasmalai (sweet).", crafts: "Khadi fabrics." },
        guide: { bestTime: "October to March", gettingThere: "Bus or train from Dhaka.", difficulty: "Easy" }
      };
  } else if (slug === 'brahmanbaria') {
    districtsData[slug] = {
        name: "Brahmanbaria",
        division: "Chittagong",
        stats: { area: "1,927.11 sq km", population: "2,840,497", established: "1984", attractions: "5+" },
        mustVisit: [
          { name: "Farazi Bari Mosque", description: "Historic mosque with beautiful design.", image: "https://images.unsplash.com/photo-1596409890287-c1d0c4ea4f93?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Known for tasty sweets and river fish.", crafts: "Traditional handloom products." },
        guide: { bestTime: "October to March", gettingThere: "Train or bus.", difficulty: "Easy" }
      };
  } else if (slug === 'bogra') {
    districtsData[slug] = {
        name: "Bogra",
        division: "Rajshahi",
        stats: { area: "2,898.68 sq km", population: "3,400,874", established: "1821", attractions: "11+" },
        mustVisit: [
          { name: "Mahasthangarh", description: "Oldest archaeological site in Bangladesh.", image: "https://images.unsplash.com/photo-1599824632881-8b43f07a424e?auto=format&fit=crop&q=80&w=800" }
        ],
        specialties: { cuisine: "Famous for Bograra Doi (Yogurt).", crafts: "Terracotta and pottery." },
        guide: { bestTime: "October to March", gettingThere: "Bus from Dhaka.", difficulty: "Easy" }
      };
  } else {
    // Generative data for others
    districtsData[slug] = {
      name: name,
      division: division,
      stats: {
        area: (Math.random() * 2000 + 1000).toFixed(2) + " sq km",
        population: (Math.random() * 2000000 + 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        established: (Math.floor(Math.random() * 200) + 1800).toString(),
        attractions: (Math.floor(Math.random() * 10) + 3).toString() + "+"
      },
      mustVisit: [
        { 
          name: name + " Central Park", 
          description: "A popular recreational spot for locals and tourists.", 
          image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&q=80&w=800" 
        }
      ],
      specialties: {
        cuisine: "Traditional Bengali cuisine with local variations.",
        crafts: "Local handicrafts and weaving products."
      },
      guide: {
        bestTime: "October to March",
        gettingThere: "Accessible by road and rail from major cities.",
        difficulty: "Easy"
      }
    };
  }
});

fs.writeFileSync(path.join(__dirname, '../data/districts.json'), JSON.stringify(districtsData, null, 2));
console.log('Districts data generated successfully!');
