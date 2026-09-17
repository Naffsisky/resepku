"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ParsedRecipe, ApiStats } from "@/types/recipe";
import {
  searchRecipes,
  filterByCategory,
  filterByIngredient,
  getAllRecipes,
  getApiStats,
  getCategories,
} from "@/lib/api";
import { getCategoryMeta } from "@/lib/category-meta";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import RecipeDetailModal from "@/components/RecipeDetailModal";
import FavoritesDrawer from "@/components/FavoritesDrawer";
import RandomRecipeModal from "@/components/RandomRecipeModal";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

interface HomeClientProps {
  initialRecipes: ParsedRecipe[];
  initialCategories: string[];
  initialStats: ApiStats | null;
}

type SortOption = "default" | "az" | "za" | "servings-desc" | "ingredients-asc";

const PAGE_SIZE = 24;

/** Clamp a page number into [1, max] */
function clampPage(page: number, max: number) {
  return Math.min(Math.max(1, page), Math.max(1, max));
}

/** Generate page-number range with ellipsis — always show first, last, ±2 of current */
function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [];
  const addNum = (n: number) => {
    if (pages[pages.length - 1] !== n) pages.push(n);
  };
  const addDots = () => {
    if (pages[pages.length - 1] !== "…") pages.push("…");
  };
  addNum(1);
  if (current > 3) addDots();
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
    addNum(i);
  }
  if (current < total - 2) addDots();
  addNum(total);
  return pages;
}

export default function HomeClient({
  initialRecipes,
  initialCategories,
  initialStats,
}: HomeClientProps) {
  const [recipes, setRecipes] = useState<ParsedRecipe[]>(initialRecipes);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [stats, setStats] = useState<ApiStats | null>(initialStats);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchMode, setSearchMode] = useState<"recipe" | "ingredient">("recipe");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedRecipe, setSelectedRecipe] = useState<ParsedRecipe | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isRandomOpen, setIsRandomOpen] = useState<boolean>(false);

  const recipesSectionRef = useRef<HTMLDivElement>(null);

  // Refresh stats & categories from API client-side on mount (so they stay live)
  useEffect(() => {
    getApiStats().then((s) => {
      if (s) setStats(s);
    });
    getCategories().then((cats) => {
      if (cats.length > 0) setCategories(cats);
    });
  }, []);

  // Reset page whenever recipes list changes
  const resetPage = useCallback(() => setPage(1), []);

  // --- Handlers ---

  const handleSearch = useCallback(
    async (query: string, mode: "recipe" | "ingredient" = "recipe") => {
      setSearchQuery(query);
      setSearchMode(mode);
      setSelectedCategory("");
      setError(null);
      resetPage();

      if (!query.trim()) {
        setIsLoading(true);
        try {
          const data = await getAllRecipes();
          setRecipes(data);
        } catch {
          setError("Gagal memuat semua resep.");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        let results: ParsedRecipe[];
        if (mode === "ingredient") {
          results = await filterByIngredient(query.trim());
        } else {
          results = await searchRecipes(query.trim());
        }
        setRecipes(results);
      } catch {
        setError("Terjadi kesalahan saat mencari resep.");
      } finally {
        setIsLoading(false);
      }
    },
    [resetPage]
  );

  const handleSelectCategory = useCallback(
    async (cat: string) => {
      setSelectedCategory(cat);
      setSearchQuery("");
      setError(null);
      resetPage();
      setIsLoading(true);

      try {
        if (!cat) {
          const data = await getAllRecipes();
          setRecipes(data);
        } else {
          const data = await filterByCategory(cat);
          setRecipes(data);
        }
      } catch {
        setError("Gagal memfilter resep berdasarkan kategori.");
      } finally {
        setIsLoading(false);
      }
    },
    [resetPage]
  );

  const handleReset = async () => {
    setSearchQuery("");
    setSelectedCategory("");
    setError(null);
    resetPage();
    setIsLoading(true);
    try {
      const data = await getAllRecipes();
      setRecipes(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRecipe = (recipe: ParsedRecipe) => {
    setSelectedRecipe(recipe);
  };

  const scrollToRecipes = () => {
    recipesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Sorting & Pagination ---

  const sortedRecipes = useMemo(() => {
    const list = [...recipes];
    switch (sortBy) {
      case "az":
        return list.sort((a, b) => a.title.localeCompare(b.title, "id"));
      case "za":
        return list.sort((a, b) => b.title.localeCompare(a.title, "id"));
      case "servings-desc":
        return list.sort((a, b) => b.servings - a.servings);
      case "ingredients-asc":
        return list.sort((a, b) => a.ingredients.length - b.ingredients.length);
      default:
        return list;
    }
  }, [recipes, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedRecipes.length / PAGE_SIZE));
  const currentPage = clampPage(page, totalPages);

  const displayedRecipes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedRecipes.slice(start, start + PAGE_SIZE);
  }, [sortedRecipes, currentPage]);

  const pageRange = useMemo(() => buildPageRange(currentPage, totalPages), [currentPage, totalPages]);

  const goToPage = (p: number) => {
    const clamped = clampPage(p, totalPages);
    setPage(clamped);
    scrollToRecipes();
  };

  const activeCategoryMeta = selectedCategory ? getCategoryMeta(selectedCategory) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] dark:bg-[#0d1512] text-gray-900 dark:text-gray-100 selection:bg-emerald-500/20 selection:text-emerald-700">
      {/* Top Navigation */}
      <Navbar
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenRandom={() => setIsRandomOpen(true)}
      />

      {/* Hero Header Section */}
      <HeroBanner
        onSearch={handleSearch}
        stats={stats}
        onSelectKeyword={(kw, mode) => {
          handleSearch(kw, mode);
          scrollToRecipes();
        }}
        onSurpriseMe={() => setIsRandomOpen(true)}
      />

      {/* Categories Filter Strip */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          handleSelectCategory(cat);
          scrollToRecipes();
        }}
        isLoading={isLoading}
      />

      {/* Main Recipe Section */}
      <main ref={recipesSectionRef} className="flex-grow max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 pb-28 sm:pb-12 w-full">
        {/* Section Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/60 dark:border-emerald-900/40">
          <div>
            <div className="flex items-center gap-2">
              {activeCategoryMeta && (
                <span className="text-xl sm:text-2xl">{activeCategoryMeta.icon}</span>
              )}
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight">
                {searchQuery
                  ? `Hasil ${searchMode === "ingredient" ? "Bahan" : "Pencarian"}: "${searchQuery}"`
                  : selectedCategory
                  ? `Kategori: ${selectedCategory}`
                  : "Semua Resep"}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
              {isLoading ? (
                "Memuat resep lezat..."
              ) : (
                <>
                  Ditemukan{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {recipes.length.toLocaleString("id-ID")}
                  </strong>{" "}
                  resep
                  {totalPages > 1 && (
                    <>
                      {" "}· Halaman{" "}
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        {currentPage}
                      </strong>{" "}
                      dari{" "}
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        {totalPages.toLocaleString("id-ID")}
                      </strong>
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Action Toolbar: Sorting and Reset */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="relative inline-flex items-center">
              <label htmlFor="sort-select" className="sr-only">
                Urutkan Berdasarkan
              </label>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-emerald-950/60 rounded-xl border border-gray-200 dark:border-emerald-800/80 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Urutkan:</span>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    resetPage();
                  }}
                  className="bg-transparent focus:outline-none cursor-pointer pr-4 font-semibold text-emerald-900 dark:text-emerald-200"
                >
                  <option value="default" className="dark:bg-emerald-950">Paling Sesuai</option>
                  <option value="az" className="dark:bg-emerald-950">Nama (A - Z)</option>
                  <option value="za" className="dark:bg-emerald-950">Nama (Z - A)</option>
                  <option value="servings-desc" className="dark:bg-emerald-950">Porsi Terbanyak</option>
                  <option value="ingredients-asc" className="dark:bg-emerald-950">Bahan Paling Sedikit</option>
                </select>
              </div>
            </div>

            {/* Reset Button */}
            {(searchQuery || selectedCategory) && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800/80 transition-all active:scale-95 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Semua Resep</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1 bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg text-xs font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Recipe Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
              Tidak Ada Resep yang Cocok
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              Kami tidak menemukan resep untuk &ldquo;{searchQuery || selectedCategory}&rdquo;. Coba gunakan kata kunci bahan seperti &ldquo;ayam&rdquo;, &ldquo;telur&rdquo;, atau &ldquo;santan&rdquo;.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                Kembali ke Semua Resep
              </button>
              <button
                type="button"
                onClick={() => setIsRandomOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pilihkan Acak</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
              {displayedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={handleOpenRecipe}
                />
              ))}
            </div>

            {/* Numbered Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Navigasi halaman resep"
                className="mt-10 flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap"
              >
                {/* Prev */}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Halaman sebelumnya"
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Numbers */}
                {pageRange.map((item, idx) =>
                  item === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 text-gray-400 dark:text-gray-600 text-xs select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      aria-current={item === currentPage ? "page" : undefined}
                      className={`min-w-[2.25rem] h-9 px-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 shadow-2xs ${
                        item === currentPage
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20"
                          : "bg-white dark:bg-emerald-950/60 border-gray-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Halaman berikutnya"
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </nav>
            )}

            {/* Page info below pagination */}
            {totalPages > 1 && (
              <p className="mt-3 text-center text-[11px] text-gray-500 dark:text-gray-400">
                Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, recipes.length)} dari{" "}
                {recipes.length.toLocaleString("id-ID")} resep
              </p>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectRecipe={handleOpenRecipe}
      />

      {/* Random Recipe Modal */}
      <RandomRecipeModal
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
        onSelectRecipe={handleOpenRecipe}
      />

      {/* Bottom Nav Bar (Mobile only) */}
      <BottomNav
        onGoHome={handleReset}
        onFocusSearch={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenRandom={() => setIsRandomOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
      />
    </div>
  );
}
