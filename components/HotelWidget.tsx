"use client";

import { useState } from "react";
import { BedDouble, Calendar, Users, MapPin, Building, ExternalLink, Phone } from "lucide-react";
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
  const defaultCheckin = tomorrow.toISOString().split('T')[0];
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);
  const defaultCheckout = dayAfter.toISOString().split('T')[0];

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

  return (
    <section className="mt-16 mb-16 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: primaryColor }} />

      <div className="p-8 md:p-10 border-b border-slate-50 relative z-10">
        <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center">
          <span className="w-1.5 h-8 mr-4 rounded-full" style={{ backgroundColor: primaryColor }}></span>
          Where to Live
        </h2>
        <p className="text-slate-500 font-medium ml-5 pl-1 mb-8">Secure your accommodation instantly online or through offline verification.</p>

        {/* Form Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
          
          {/* Check-In */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 block">Check In</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full pl-9 pr-2 py-2 font-bold text-slate-800 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Check-Out */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 block">Check Out</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full pl-9 pr-2 py-2 font-bold text-slate-800 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 block">Rooms</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={rooms}
                onChange={(e) => setRooms(parseInt(e.target.value))}
                className="w-full pl-9 pr-2 py-2 font-bold text-slate-800 focus:outline-none bg-transparent appearance-none"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Room{n > 1 && 's'}</option>)}
              </select>
            </div>
          </div>

          {/* Guests */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 block">Guests Total</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full pl-9 pr-2 py-2 font-bold text-slate-800 focus:outline-none bg-transparent appearance-none"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Guest{n > 1 && 's'}</option>)}
              </select>
            </div>
          </div>

        </div>
      </div>

      <div className="p-8 md:p-10 relative z-10">
        
        {/* Bookings Area */}
        <div className="space-y-8">
          
          {/* Online CTA grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.bookingUrls.map((booking, idx) => (
              <a
                key={idx}
                href={formatBookingUrl(booking.url, checkin, checkout, rooms, guests)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 rounded-2xl text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex flex-col text-left">
                  <span className="font-black text-white text-lg tracking-tight">Search {booking.name}</span>
                  <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest mt-1">Live Availability</span>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md group-hover:bg-white/30 transition-colors border border-white/10">
                  <BedDouble className="w-5 h-5" />
                </div>
              </a>
            ))}
          </div>

          <div className="w-full h-px bg-slate-100 my-8"></div>

          {/* Manual / Offline Grid */}
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center mb-6">
              <span className="w-1.5 h-4 mr-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
              Offline Verified Hotels
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.manualBookings.map((hotel, idx) => (
                <div key={idx} className="flex flex-col p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-slate-800 text-lg leading-tight">{hotel.name}</span>
                    <a href={`tel:${hotel.phone}`} className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-100">
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                  
                  <button 
                    onClick={() => setModalData({ isOpen: true, name: hotel.name, coordinates: hotel.coordinates })}
                    className="flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest mt-auto pt-4 border-t border-slate-50 w-fit"
                  >
                    <MapPin className="w-4 h-4 mr-1.5" style={{ color: primaryColor }} />
                    View Map Coordinates
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalData.coordinates && (
        <HeritageMapModal
          isOpen={modalData.isOpen}
          onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
          coordinates={modalData.coordinates}
          name={modalData.name}
        />
      )}
    </section>
  );
}
