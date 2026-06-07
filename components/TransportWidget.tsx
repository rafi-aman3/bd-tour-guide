"use client";

import { useState } from "react";
import { Bus, Train, Ship, Plane, Calendar, Phone, ArrowRight } from "lucide-react";

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

type TabType = "bus" | "train" | "launch" | "plane";

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
    const engineDate = `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
    finalUrl = finalUrl.replace("{date}", engineDate);
  } else {
    // Default format YYYY-MM-DD
    finalUrl = finalUrl.replace("{date}", isoDate);
  }

  return finalUrl;
};

export default function TransportWidget({ data, primaryColor, districtName }: TransportWidgetProps) {
  const [activeTab, setActiveTab] = useState<TabType>("bus");
  const [fromCity, setFromCity] = useState<string>("Dhaka");

  // Default to tomorrow's date for realistic default interaction
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  const [journeyDate, setJourneyDate] = useState<string>(defaultDate);

  const tabs = [
    { id: "bus", label: "Bus", icon: Bus },
    { id: "train", label: "Train", icon: Train },
    { id: "launch", label: "Launch", icon: Ship },
    { id: "plane", label: "Flight", icon: Plane },
  ] as const;

  const currentData = data?.[activeTab];
  const hasOnline = !!currentData?.bookingUrls?.length;
  const inputClasses =
    "w-full px-4 py-3 rounded-md border border-[var(--hairline)] bg-white font-body text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:border-transparent transition-all";

  return (
    <section className="mb-16">
      <header className="mb-6">
        <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
          § 05 &nbsp;Getting There
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
          How to reach {districtName}
        </h2>
      </header>

      {/* Underline tab selector */}
      <div className="flex gap-6 overflow-x-auto border-b border-[var(--hairline)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAvailable = data?.[tab.id as TabType]?.available;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!isAvailable}
              className={`flex items-center gap-2 pb-3 -mb-px border-b-2 font-body text-sm font-semibold whitespace-nowrap transition-colors
                ${isActive ? "text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"}
                ${!isAvailable ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
              style={isActive ? { borderColor: primaryColor } : { borderColor: "transparent" }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-8">
        {/* Booking Form — only when online partners exist (origin/date feed the booking URLs) */}
        {hasOnline && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-slate-500 font-body mb-2 block">
                Origin (from)
              </label>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className={`${inputClasses} cursor-pointer appearance-none`}
              >
                {MAJOR_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-slate-500 font-body mb-2 block">
                Journey date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className={`${inputClasses} pl-10`}
                />
              </div>
            </div>
          </div>
        )}

        {currentData && currentData.available ? (
          <div className="space-y-8">
            {/* Online bookings */}
            {hasOnline && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentData.bookingUrls.map((booking, idx) => (
                  <a
                    key={idx}
                    href={formatBookingUrl(booking.url, journeyDate, fromCity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex justify-between items-center w-full px-5 py-4 rounded-md text-white font-body transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="flex flex-col text-left">
                      <span className="font-semibold text-sm leading-tight">Book via {booking.name}</span>
                      <span className="text-[0.6rem] font-semibold text-white/70 uppercase tracking-[0.16em] mt-1">
                        {fromCity} &rarr; {districtName}
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            )}

            {/* Offline counters */}
            {currentData.manualBookings.length > 0 && (
              <div>
                <h4 className="text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-slate-500 font-body mb-4 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  Manual booking counters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0 border-t border-[var(--hairline)]">
                  {currentData.manualBookings.map((counter, idx) => (
                    <a
                      key={idx}
                      href={`tel:${counter.phone}`}
                      className="group flex justify-between items-center gap-3 py-4 border-b border-[var(--hairline)] transition-colors"
                    >
                      <span className="flex flex-col text-left">
                        <span className="font-body text-sm font-semibold text-slate-900">{counter.name}</span>
                        <span className="font-body tabular-nums text-xs text-slate-400 mt-0.5">{counter.phone}</span>
                      </span>
                      <Phone
                        className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-slate-700 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Available, but no online or offline options listed */}
            {!hasOnline && currentData.manualBookings.length === 0 && (
              <div className="py-6 text-center border border-dashed border-[var(--hairline)] rounded-md">
                <p className="text-slate-400 font-body text-xs uppercase tracking-[0.16em] font-semibold">
                  Runs on this route — book locally at the ghat / counter
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-[var(--hairline)] rounded-md">
            <span className="font-display text-lg font-semibold text-slate-700">Not available on this route</span>
            <p className="text-sm text-slate-400 mt-1 font-body">Try a different mode of transport.</p>
          </div>
        )}
      </div>
    </section>
  );
}
