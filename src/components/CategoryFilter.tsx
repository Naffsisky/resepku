"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

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

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const allCategories = ["Semua", ...categories];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Kategori Masakan
          </h2>
        </div>

        {/* Scroll helper buttons for desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="p-1 rounded-lg border border-gray-200 dark:border-emerald-800/60 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="p-1 rounded-lg border border-gray-200 dark:border-emerald-800/60 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pill buttons list */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allCategories.map((cat) => {
          const isSelected =
            (cat === "Semua" && !selectedCategory) ||
            selectedCategory.toLowerCase() === cat.toLowerCase();

          return (
            <button
              key={cat}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectCategory(cat === "Semua" ? "" : cat)}
              className={`shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 snap-start active:scale-95 ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold"
                  : "bg-white dark:bg-emerald-950/50 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 border border-gray-200/80 dark:border-emerald-800/60"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
