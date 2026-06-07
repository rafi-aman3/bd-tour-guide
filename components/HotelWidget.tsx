"use client";

import { useState } from "react";
import { BedDouble, Calendar, Users, MapPin, Building, Phone } from "lucide-react";
import HeritageMapModal from "./HeritageMapModal";

interface HotelData {
  available: boolean;
  bookingUrls: { name: string; url: string }[];
  manualBookings: { name: string; phone: string; coordinates: [number, number] }[];
}

interface HotelWidgetProps {
  data?: HotelData;
  primaryColor: string;
}

const formatBookingUrl = (urlPattern: string, checkin: string, checkout: string, rooms: number, guests: number) => {
  return urlPattern
    .replace(/{checkin}/g, checkin)
    .replace(/{checkout}/g, checkout)
    .replace(/{rooms}/g, String(rooms))
    .replace(/{guests}/g, String(guests));
};

export default function HotelWidget({ data, primaryColor }: HotelWidgetProps) {
  // Setup default dates spanning 2 nights starting tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckin = tomorrow.toISOString().split("T")[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);
  const defaultCheckout = dayAfter.toISOString().split("T")[0];

  const [checkin, setCheckin] = useState(defaultCheckin);
  const [checkout, setCheckout] = useState(defaultCheckout);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    name: string;
    coordinates: [number, number] | null;
  }>({ isOpen: false, name: "", coordinates: null });

  if (!data || !data.available) return null;

  const hasOnline = data.bookingUrls.length > 0;

  const fieldClasses = "flex flex-col gap-1.5";
  const labelClasses = "text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-slate-500 font-body";
  const controlClasses =
    "w-full pl-9 pr-2 py-2.5 rounded-md border border-[var(--hairline)] bg-white font-body text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:border-transparent transition-all";

  return (
    <section className="mb-16">
      <header className="mb-6">
        <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
          § 06 &nbsp;Where to Stay
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
          Find a place to sleep
        </h2>
      </header>

      {/* Search form — only when online partners exist (the inputs feed the search URLs) */}
      {hasOnline && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={fieldClasses}>
          <label className={labelClasses}>Check in</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className={controlClasses} />
          </div>
        </div>

        <div className={fieldClasses}>
          <label className={labelClasses}>Check out</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} className={controlClasses} />
          </div>
        </div>

        <div className={fieldClasses}>
          <label className={labelClasses}>Rooms</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={rooms}
              onChange={(e) => setRooms(parseInt(e.target.value))}
              className={`${controlClasses} cursor-pointer appearance-none`}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Room{n > 1 && "s"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={fieldClasses}>
          <label className={labelClasses}>Guests</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className={`${controlClasses} cursor-pointer appearance-none`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} Guest{n > 1 && "s"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      )}

      {/* Online bookings */}
      {hasOnline && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {data.bookingUrls.map((booking, idx) => (
          <a
            key={idx}
            href={formatBookingUrl(booking.url, checkin, checkout, rooms, guests)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-5 py-4 rounded-md text-white font-body transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="flex flex-col text-left">
              <span className="font-semibold text-sm leading-tight">Search {booking.name}</span>
              <span className="text-[0.6rem] font-semibold text-white/70 uppercase tracking-[0.16em] mt-1">Live availability</span>
            </span>
            <BedDouble className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </a>
        ))}
      </div>
      )}

      {/* Offline verified hotels */}
      {data.manualBookings.length > 0 && (
        <div>
          <h4 className="text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-slate-500 font-body mb-4">
            Verified local hotels
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 border-t border-[var(--hairline)]">
            {data.manualBookings.map((hotel, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 py-5 border-b border-[var(--hairline)]"
              >
                <div className="min-w-0">
                  <h5 className="font-display text-lg font-semibold text-slate-900 leading-tight">{hotel.name}</h5>
                  <button
                    type="button"
                    onClick={() => setModalData({ isOpen: true, name: hotel.name, coordinates: hotel.coordinates })}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.16em] font-semibold font-body text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    View on map
                  </button>
                </div>
                <a
                  href={`tel:${hotel.phone}`}
                  className="group flex shrink-0 items-center justify-center w-10 h-10 rounded-md border border-[var(--hairline)] text-slate-400 hover:text-slate-900 transition-colors"
                  aria-label={`Call ${hotel.name}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalData.coordinates && (
        <HeritageMapModal
          isOpen={modalData.isOpen}
          onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
          coordinates={modalData.coordinates}
          name={modalData.name}
        />
      )}
    </section>
  );
}
