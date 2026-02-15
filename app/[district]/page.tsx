import Link from "next/link";
import { ChevronLeft, MapPin, Users, Calendar, Camera, Utensils, Navigation, Info } from "lucide-react";
import { DISTRICT_TO_DIVISION, getThematicColor } from "@/lib/map-data";
import fs from "fs";
import path from "path";

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
          href="/"
          className="inline-flex items-center font-bold mb-8 transition-all hover:-translate-x-1"
          style={{ color: primaryColor }}
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          Back to Map
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { label: "Area", value: data?.stats?.area || "N/A", icon: MapPin },
                { label: "Population", value: data?.stats?.population || "N/A", icon: Users },
                { label: "Established", value: data?.stats?.established || "N/A", icon: Calendar },
                { label: "Attractions", value: data?.stats?.attractions || "N/A", icon: Camera },
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
                <section className="mb-16">
                  <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center">
                    <span className="w-1.5 h-8 mr-4 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                    Must Visit Places
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(data?.mustVisit || [
                      { name: "Local Landmark", description: "A popular spot known for its unique culture and scenery.", image: "" }
                    ]).map((spot: any, idx: number) => (
                      <div key={idx} className="group cursor-pointer">
                        <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100 transition-shadow group-hover:shadow-xl">
                          {spot.image ? (
                            <img
                              src={spot.image}
                              alt={spot.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                              <Camera className="h-12 w-12 text-slate-300" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-900/80 to-transparent">
                            <h3 className="text-white font-black text-xl">{spot.name}</h3>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{spot.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center">
                    <span className="w-1.5 h-8 mr-4 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                    Local Specialties
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-3xl flex items-start gap-6 border border-slate-100 transition-colors" style={{ backgroundColor: mutedColor }}>
                      <div className="p-4 rounded-2xl bg-white shadow-sm">
                        <Utensils className="h-8 w-8" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Famous Cuisine</h3>
                        <p className="text-slate-600">{data?.specialties?.cuisine || "Discover the unique local flavors and traditional dishes of this region."}</p>
                      </div>
                    </div>
                    <div className="p-8 rounded-3xl flex items-start gap-6 border border-slate-100 transition-colors" style={{ backgroundColor: mutedColor }}>
                      <div className="p-4 rounded-2xl bg-white shadow-sm">
                        <Info className="h-8 w-8" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Traditional Crafts</h3>
                        <p className="text-slate-600">{data?.specialties?.crafts || "Explore the rich heritage of craftsmanship and local artisanal products."}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
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
                    <button className="w-full py-4 bg-white font-black rounded-xl transition-all hover:bg-opacity-90 active:scale-95" style={{ color: "#0f172a" }}>Download Offline Guide</button>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                  <h3 className="text-lg font-bold text-slate-400 mb-4 italic">"Explore the heart of {districtName} and its amazing heritage."</h3>
                  <div className="flex justify-center -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200"></div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">+2k</div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-tighter">Visited recently</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
