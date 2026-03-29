"use client";

import DynamicMap from "@/components/DynamicMap";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-4">
            Discover <span className="text-indigo-600">Bangladesh</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore the beauty of various divisions across the country through our interactive map.
          </p>
        </header>

        <div className="max-w-5xl h-full mx-auto">
          <DynamicMap />
        </div>
      </section>
    </main>
  );
}
