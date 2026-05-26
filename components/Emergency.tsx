import { Phone, Siren } from "lucide-react";
import type { DistrictEmergency } from "@/lib/district-data";

type Props = {
  data: DistrictEmergency;
  primaryColor: string;
};

function PhoneSlot({ phone, primaryColor }: { phone: string; primaryColor: string }) {
  if (phone === "—") {
    return (
      <span
        className="px-2 py-1 rounded text-[0.7rem] uppercase tracking-[0.16em] font-semibold font-body"
        style={{ backgroundColor: primaryColor, color: "white" }}
      >
        Call 999
      </span>
    );
  }
  return (
    <a
      href={`tel:${phone.replace(/\s+/g, "")}`}
      className="font-body tabular-nums text-sm font-semibold text-slate-900 hover:underline"
    >
      {phone}
    </a>
  );
}

export default function Emergency({ data, primaryColor }: Props) {
  return (
    <section className="mb-16">
      <header className="mb-6">
        <div className="text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-slate-500 font-body">
          § 09 &nbsp;Emergency & Useful Contacts
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mt-2 tracking-tight">
          If something goes wrong
        </h2>
      </header>

      <div
        className="mb-8 flex items-center justify-between gap-4 p-5 rounded-md border-2"
        style={{ borderColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <Siren className="h-6 w-6" style={{ color: primaryColor }} />
          <div>
            <div className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500">
              National emergency line
            </div>
            <div className="font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {data.generalEmergency}
            </div>
          </div>
        </div>
        <a
          href={`tel:${data.generalEmergency}`}
          className="px-4 py-2 rounded-md font-body text-sm font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Call now
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {data.police && data.police.length > 0 && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 mb-3">Police</h3>
            <ul className="border-t border-[var(--hairline)]">
              {data.police.map((row) => (
                <li key={row.name} className="flex items-center justify-between gap-3 py-3 border-b border-[var(--hairline)]">
                  <span className="font-body text-sm text-slate-900">{row.name}</span>
                  <PhoneSlot phone={row.phone} primaryColor={primaryColor} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.hospital && data.hospital.length > 0 && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 mb-3">Hospital</h3>
            <ul className="border-t border-[var(--hairline)]">
              {data.hospital.map((row) => (
                <li key={row.name} className="flex items-center justify-between gap-3 py-3 border-b border-[var(--hairline)]">
                  <span className="font-body text-sm text-slate-900">{row.name}</span>
                  <PhoneSlot phone={row.phone} primaryColor={primaryColor} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.fire && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 mb-3">Fire Service</h3>
            <div className="flex items-center justify-between gap-3 py-3 border-y border-[var(--hairline)]">
              <span className="font-body text-sm text-slate-900 inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Fire Service
              </span>
              <PhoneSlot phone={data.fire.phone} primaryColor={primaryColor} />
            </div>
          </div>
        )}

        {data.touristPolice && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold font-body text-slate-500 mb-3">Tourist Police</h3>
            <div className="flex items-center justify-between gap-3 py-3 border-y border-[var(--hairline)]">
              <span className="font-body text-sm text-slate-900 inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Tourist Police
              </span>
              <PhoneSlot phone={data.touristPolice.phone} primaryColor={primaryColor} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
