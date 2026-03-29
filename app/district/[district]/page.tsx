import Link from "next/link";
import { ChevronLeft, MapPin, Users, Calendar, Camera, Utensils, Navigation, Info } from "lucide-react";
import { DISTRICT_TO_DIVISION, getThematicColor } from "@/lib/map-data";
import fs from "fs";
import path from "path";
import HeritageSection from "@/components/HeritageSection";
import DynamicUpazilaMap from "@/components/DynamicUpazilaMap";
import TransportWidget from "@/components/TransportWidget";
import HotelWidget from "@/components/HotelWidget";

interface PageProps {
  params: Promise<{ district: string }>;
}

async function getDistrictData(slug: string) {
  const filePath = path.join(process.cwd(), "data", "districts.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(jsonData);
  return data[slug];
}

export default async function DistrictPage({ params }: PageProps) {
  const { district } = await params;
  const data = await getDistrictData(district);

  // Fallback name if data is missing (shouldn't happen)
  const fallbackName = district
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const districtName = data?.name || fallbackName;
  const divisionName = data?.division || DISTRICT_TO_DIVISION[district] || "Dhaka";

  // Color tokens
  const primaryColor = getThematicColor(divisionName, district, 1);
  const secondaryColor = getThematicColor(divisionName, district, 0.15);
  const mutedColor = getThematicColor(divisionName, district, 0.05);

  // Resolve Upazila GeoJSON path based on fuzzy match
  const districtsDir = path.join(process.cwd(), "public", "data", "districts");
  let geoJsonUrl = "";
  try {
    const files = fs.readdirSync(districtsDir);
    const cleanSlug = district.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    const matchedFile = files.find(file => {
      const cleanFile = file.toLowerCase().replace(".json", "").replace(/[^a-z0-9]/g, "");
      return cleanFile === cleanSlug;
    });

    if (matchedFile) {
      geoJsonUrl = `/data/districts/${matchedFile}`;
    }
  } catch(e) {
    console.error("Error reading districts directory", e);
  }

  return (
    <main
      className="min-h-screen py-12 transition-colors duration-500"
      style={{
        background: `radial-gradient(circle at top right, ${secondaryColor}, transparent), 
                     radial-gradient(circle at bottom left, ${mutedColor}, transparent),
                     #f8fafc`
      }}
    >
      <div className="container mx-auto px-4">
        <Link
          href={`/division/${divisionName.toLowerCase()}`}
          className="inline-flex items-center font-bold mb-8 transition-all hover:-translate-x-1"
          style={{ color: primaryColor }}
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          Back to {divisionName} Division
        </Link>

        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative">
          {/* Header Accent */}
          <div
            className="absolute top-0 left-0 w-full h-3"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="p-8 md:p-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 block" style={{ color: primaryColor }}>{divisionName} Division</span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900">{districtName}</h1>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>Plan a Trip</button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { label: "Area", value: data?.stats?.area || "N/A", icon: MapPin },
                { label: "Population", value: data?.stats?.population || "N/A", icon: Users },
                { label: "Established", value: data?.stats?.established || "N/A", icon: Calendar },
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start transition-transform hover:-translate-y-1">
                  <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: mutedColor }}>
                    <stat.icon className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 mb-1">{stat.label}</span>
                  <span className="text-xl font-black text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <section className="mb-16 bg-slate-50/40 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 opacity-50 blur-3xl pointer-events-none" style={{ background: `linear-gradient(to bottom right, ${secondaryColor}, transparent)` }} />
                  
                  <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center relative z-10">
                    <span className="w-1.5 h-8 mr-4 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                    Places to Visit
                  </h2>

                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
                      <span className="w-1.5 h-6 mr-3 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                      Must Visit
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(data?.mustVisit || [
                        { name: "Local Landmark", description: "A popular spot known for its unique culture and scenery.", image: "" }
                      ]).map((spot: any, idx: number) => (
                        <div key={idx} className="group cursor-pointer">
                          <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-white mb-4 shadow-sm border border-slate-100 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                            {spot.image ? (
                              <img
                                src={spot.image}
                                alt={spot.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                                <Camera className="h-12 w-12 text-slate-300" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-900/80 to-transparent">
                              <h3 className="text-white font-black text-xl">{spot.name}</h3>
                            </div>
                          </div>
                          <p className="text-slate-600 leading-relaxed pl-2 border-l-2" style={{ borderColor: mutedColor }}>{spot.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <HeritageSection primaryColor={primaryColor} sites={data?.heritageSites || []} isSubsection={true} />
                  </div>
                </section>

                <TransportWidget data={data?.transport || {}} primaryColor={primaryColor} districtName={districtName} />
                <HotelWidget data={data?.hotels} primaryColor={primaryColor} />


              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                {geoJsonUrl && (
                  <div className="rounded-[2rem] bg-white border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                    <div className="p-6 pb-4 border-b border-slate-50 text-center">
                      <h3 className="text-xl font-black text-slate-900">Map of {districtName}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Upazilas</p>
                    </div>
                    <div className="h-[350px] w-full bg-slate-50 relative group">
                      <div className="absolute inset-0 bg-slate-900/5 z-[9] pointer-events-none group-hover:bg-transparent transition-colors duration-500" />
                      <DynamicUpazilaMap 
                        geoJsonUrl={geoJsonUrl} 
                        primaryColor={primaryColor} 
                        secondaryColor={secondaryColor} 
                      />
                    </div>
                  </div>
                )}

                <div className="p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
                  <Navigation className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 transition-transform group-hover:scale-110" />
                  <h3 className="text-2xl font-black mb-6">Traveler's Guide</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs uppercase font-black tracking-widest text-white/40 mb-2">Best Time to Visit</h4>
                      <p className="font-bold">{data?.guide?.bestTime || "October to March"}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-black tracking-widest text-white/40 mb-2">Getting There</h4>
                      <p className="font-bold leading-relaxed">{data?.guide?.gettingThere || "Connected via major highways and transport networks."}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-black tracking-widest text-white/40 mb-2">Difficulty Level</h4>
                      <p className="font-bold">{data?.guide?.difficulty || "Easy / Family Friendly"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-white border border-slate-100 shadow-xl overflow-hidden flex flex-col p-6 md:p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
                    <span className="w-1.5 h-6 mr-3 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                    Local Specialties
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div className="p-6 rounded-3xl border border-slate-100 transition-colors group relative overflow-hidden" style={{ backgroundColor: mutedColor }}>
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br from-transparent to-current blur-2xl pointer-events-none" style={{ color: primaryColor }} />
                      <div className="flex items-start gap-5 relative z-10">
                        <div className="p-3.5 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                          <Utensils className="h-6 w-6" style={{ color: primaryColor }} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1.5 leading-tight">Famous Cuisine</h4>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">{data?.specialties?.cuisine || "Discover the unique local flavors and traditional dishes of this region."}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl border border-slate-100 transition-colors group relative overflow-hidden" style={{ backgroundColor: mutedColor }}>
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-bl from-transparent to-current blur-2xl pointer-events-none" style={{ color: primaryColor }} />
                      <div className="flex items-start gap-5 relative z-10">
                        <div className="p-3.5 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                          <Info className="h-6 w-6" style={{ color: primaryColor }} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1.5 leading-tight">Traditional Crafts</h4>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">{data?.specialties?.crafts || "Explore the rich heritage of craftsmanship and local artisanal products."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
