"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const BangladeshMap = dynamic(() => import("@/components/BangladeshMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 animate-pulse">
      <p className="text-slate-500 font-medium">Loading Map Component...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-4">
            Discover <span className="text-indigo-600">Bangladesh</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore the beauty of various districts across the country through our interactive map.
          </p>
        </header>

        <div className="max-w-5xl h-full mx-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <BangladeshMap />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
