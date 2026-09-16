"use client";

import { useState } from "react";
import { Search, X, ChefHat, Sparkles, Flame } from "lucide-react";
import { ApiStats } from "@/types/recipe";

interface HeroBannerProps {
  onSearch: (query: string) => void;
  stats: ApiStats | null;
  onSelectKeyword: (keyword: string) => void;
  onSurpriseMe: () => void;
}

const QUICK_TAGS = ["Ayam", "Soto", "Goreng", "Telur", "Cuciwis", "Kecap", "Sayur"];

export default function HeroBanner({
  onSearch,
  stats,
  onSelectKeyword,
  onSurpriseMe,
}: HeroBannerProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSelectKeyword(tag);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 bg-gradient-to-b from-emerald-50/70 via-emerald-50/30 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/10 dark:to-transparent">
      {/* Decorative subtle ambient circles */}
      <div
        className="pointer-events-none absolute -top-24 -left-20 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-5 shadow-xs border border-emerald-200/50 dark:border-emerald-800/50">
          <ChefHat className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Kumpulan Resep Praktis & Lezat Cookpad</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50 leading-tight">
          Mau Masak Apa <span className="text-emerald-600 dark:text-emerald-400">Hari Ini?</span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed">
          Temukan inspirasi hidangan rumahan khas Nusantara dengan takaran pas, bahan mudah didapat, dan panduan langkah memasak yang praktis.
        </p>

        {/* Search Bar Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 sm:mt-8 max-w-2xl mx-auto relative group"
        >
          <div className="relative flex items-center shadow-lg shadow-emerald-900/5 rounded-2xl bg-white dark:bg-emerald-950/90 border border-emerald-200/70 dark:border-emerald-800/70 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/15 transition-all">
            <div className="pl-4 sm:pl-5 text-gray-700 dark:text-gray-200">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari masakan, bahan (contoh: ayam, telur, santan)..."
              className="w-full py-3.5 sm:py-4 px-3 sm:px-4 bg-transparent text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-700 dark:placeholder:text-gray-200 focus:outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="pr-2 sm:pr-2.5">
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs sm:text-sm shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Cari</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Tag Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Populer:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/90 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-800/50 transition-all active:scale-95"
            >
              {tag}
            </button>
          ))}
          <button
            type="button"
            onClick={onSurpriseMe}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100/90 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200/90 dark:hover:bg-amber-900/60 border border-amber-300/60 dark:border-amber-700/50 transition-all flex items-center gap-1 active:scale-95 ml-1"
          >
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Pilihkan Acak</span>
          </button>
        </div>

        {/* Live stats summary */}
        {stats && (
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-gray-700 dark:text-gray-200 border-t border-emerald-950/5 dark:border-emerald-500/10 pt-4">
            <div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {stats.totalResep}+
              </span>{" "}
              Resep Terdata
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-emerald-800" />
            <div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {stats.totalKategori}
              </span>{" "}
              Kategori Kuliner
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-emerald-800" />
            <div>
              Sumber:{" "}
              <span className="font-medium text-emerald-900 dark:text-emerald-200">
                {stats.source}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
