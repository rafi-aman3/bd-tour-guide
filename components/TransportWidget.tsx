"use client";

import { useState } from "react";
import { Bus, Train, Ship, Plane, Calendar, Phone, ExternalLink } from "lucide-react";

interface TransportData {
  available: boolean;
  bookingUrls: { name: string; url: string }[];
  manualBookings: { name: string; phone: string }[];
}

interface TransportWidgetProps {
  data: {
    bus?: TransportData;
    train?: TransportData;
    launch?: TransportData;
    plane?: TransportData;
  };
  primaryColor: string;
  districtName: string;
}

type TabType = 'bus' | 'train' | 'launch' | 'plane';

const MAJOR_CITIES = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh", "Cox's Bazar"];
const CITY_AIR_CODES: Record<string, string> = { "Dhaka": "DAC", "Chittagong": "CGP", "Sylhet": "ZYL", "Cox's Bazar": "CXB", "Rajshahi": "RJH", "Barisal": "BZL" };

// Helper to format date and tokens based on booking engine requirements
const formatBookingUrl = (urlPattern: string, isoDate: string, fromCity: string) => {
  let finalUrl = urlPattern;
  
  // 1. Resolve FROM CITY tokens
  finalUrl = finalUrl.replace(/{fromCityLowercase}/g, fromCity.toLowerCase().replace(/[^a-z]/g, ""));
  finalUrl = finalUrl.replace(/{fromCity}/g, fromCity);
  finalUrl = finalUrl.replace(/{fromCityAir}/g, CITY_AIR_CODES[fromCity] || "DAC");
  
  // 2. Resolve DATE tokens
  
  // Railway and Shohoz require dd-MMM-yyyy (e.g., 04-Apr-2026)
  if (urlPattern.includes("railway.gov.bd") || urlPattern.includes("shohoz.com")) {
    const d = new Date(isoDate);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const engineDate = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    finalUrl = finalUrl.replace('{date}', engineDate);
  } else {
    // Default format YYYY-MM-DD
    finalUrl = finalUrl.replace('{date}', isoDate);
  }

  return finalUrl;
};

export default function TransportWidget({ data, primaryColor, districtName }: TransportWidgetProps) {
  const [activeTab, setActiveTab] = useState<TabType>('bus');
  const [fromCity, setFromCity] = useState<string>("Dhaka");
  
  // Default to tomorrow's date for realistic default interaction
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  
  const [journeyDate, setJourneyDate] = useState<string>(defaultDate);

  const tabs = [
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'train', label: 'Train', icon: Train },
    { id: 'launch', label: 'Launch', icon: Ship },
    { id: 'plane', label: 'Flight', icon: Plane }
  ] as const;

  const currentData = data?.[activeTab];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden mt-12">
      <div className="p-8 border-b border-slate-50">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
          <span className="w-1.5 h-6 mr-3 rounded-full" style={{ backgroundColor: primaryColor }} />
          How to Go There
        </h2>

        {/* Custom Tab Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAvailable = data?.[tab.id as TabType]?.available;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!isAvailable}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap
                  ${isActive 
                    ? 'text-white shadow-md' 
                    : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}
                  ${!isAvailable && 'opacity-40 cursor-not-allowed'}
                `}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-8 bg-slate-50/50">
        
        {/* Booking Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* FROM Input */}
          <div>
            <label className="text-xs uppercase font-black tracking-widest text-slate-400 mb-2 block">Origin (From)</label>
            <select
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer appearance-none"
              style={{ focusRingColor: primaryColor } as any}
            >
              {MAJOR_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* DATE Input */}
          <div>
            <label className="text-xs uppercase font-black tracking-widest text-slate-400 mb-2 block">Journey Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ focusRingColor: primaryColor } as any}
              />
            </div>
          </div>

        </div>

        {/* Action / Bookings Area */}
        {currentData && currentData.available ? (
          <div className="space-y-8">
            {/* Online Bookings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentData.bookingUrls.map((booking, idx) => (
                <a
                  key={idx}
                  href={formatBookingUrl(booking.url, journeyDate, fromCity)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-between items-center w-full p-4 rounded-xl text-white shadow-md transition-transform duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-xl group"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white/95 text-base leading-tight">Book via {booking.name}</span>
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider mt-1">{fromCity} &#8594; {districtName}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md group-hover:bg-white/30 transition-colors border border-white/10 shadow-sm">
                    <span className="font-black text-sm tracking-wide">BOOK</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </a>
              ))}
              {currentData.bookingUrls.length === 0 && (
                <div className="col-span-full py-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-wide">No online partners configured</p>
                </div>
              )}
            </div>

            {/* Offline Counters */}
            <div className="border-t border-slate-200/60 pt-8 mt-8">
              <h4 className="text-xs uppercase font-black tracking-widest text-slate-400 mb-6 flex items-center">
                <Phone className="w-4 h-4 mr-2 opacity-50" />
                Offline Manual Booking Counters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.manualBookings.map((counter, idx) => (
                  <a
                    key={idx}
                    href={`tel:${counter.phone}`}
                    className="flex justify-between items-center p-4 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-800 text-sm">{counter.name}</span>
                      <span className="text-xs font-black text-slate-400 mt-1 tracking-wider">{counter.phone}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors border border-slate-100">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-100 mt-4">
            <span className="font-bold text-slate-400 text-lg">Transport method unavailable for this route.</span>
            <p className="text-sm text-slate-400 mt-2 font-medium">Please select a different tab.</p>
          </div>
        )}
      </div>
    </div>
  );
}
