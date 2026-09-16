"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Layers, LayoutGrid, X } from "lucide-react";
import { getCategoryMeta } from "@/lib/category-meta";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  isLoading?: boolean;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const allCategories = ["Semua", ...categories];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-100">
            Kategori Pilihan ({categories.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View All Categories Button */}
          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all active:scale-95"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Lihat Semua ({categories.length})</span>
          </button>

          {/* Scroll helper buttons for desktop */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-emerald-800/60 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-emerald-800/60 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Pill bar */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allCategories.map((cat) => {
          const isSelected =
            (cat === "Semua" && !selectedCategory) ||
            selectedCategory.toLowerCase() === cat.toLowerCase();

          const meta = cat === "Semua" ? { icon: "🍽️" } : getCategoryMeta(cat);

          return (
            <button
              key={cat}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectCategory(cat === "Semua" ? "" : cat)}
              className={`shrink-0 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-2xl transition-all duration-200 snap-start active:scale-95 flex items-center gap-2 ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold scale-[1.02]"
                  : "bg-white dark:bg-emerald-950/50 text-gray-700 dark:text-gray-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/40 border border-gray-200/80 dark:border-emerald-800/60"
              }`}
            >
              <span className="text-sm">{meta.icon}</span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Modal / Grid for All 25 Categories */}
      {showAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowAllModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-emerald-950 rounded-3xl border border-gray-200 dark:border-emerald-800/80 shadow-2xl p-5 sm:p-6 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-emerald-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-50">
                    Semua Kategori Kuliner
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    Pilih kategori untuk memfilter resep
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-900/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories Grid */}
            <div className="overflow-y-auto py-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory("");
                  setShowAllModal(false);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  !selectedCategory
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-gray-50 dark:bg-emerald-900/20 border-gray-200/80 dark:border-emerald-800/50 hover:border-emerald-400"
                }`}
              >
                <span className="text-2xl">🍽️</span>
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Semua Resep</div>
                  <div className={`text-[10px] ${!selectedCategory ? "text-emerald-100" : "text-gray-700 dark:text-gray-300"}`}>
                    8.700+ resep
                  </div>
                </div>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                const meta = getCategoryMeta(cat);

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat);
                      setShowAllModal(false);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-gray-50 dark:bg-emerald-900/20 border-gray-200/80 dark:border-emerald-800/50 hover:border-emerald-400"
                    }`}
                  >
                    <span className="text-2xl">{meta.icon}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm truncate">
                        {cat}
                      </div>
                      <div className={`text-[10px] line-clamp-1 ${isSelected ? "text-emerald-100" : "text-gray-700 dark:text-gray-300"}`} title={meta.description}>
                        {meta.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-emerald-900/60 text-right">
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-emerald-900/60 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-emerald-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
