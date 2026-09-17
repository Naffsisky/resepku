"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { ParsedRecipe, ApiStats, PaginationMeta } from "@/types/recipe";
import {
  getAllRecipesPaged,
  searchRecipesPaged,
  searchByIngredientPaged,
  filterByCategoryPaged,
  filterByIngredientPaged,
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
  initialMeta: PaginationMeta;
  initialCategories: string[];
  initialStats: ApiStats | null;
}

type SortOption = "default" | "az" | "za" | "views" | "tries";
type ViewMode = "all" | "popular" | "search" | "category" | "ingredient";

const PAGE_LIMIT = 24;

/** Clamp page to valid range */
function clamp(p: number, max: number) {
  return Math.min(Math.max(1, p), Math.max(1, max));
}

/** Build numbered page range with ellipsis */
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
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) addNum(i);
  if (current < total - 2) addDots();
  addNum(total);
  return pages;
}

export default function HomeClient({
  initialRecipes,
  initialMeta,
  initialCategories,
  initialStats,
}: HomeClientProps) {
  const [recipes, setRecipes] = useState<ParsedRecipe[]>(initialRecipes);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [stats, setStats] = useState<ApiStats | null>(initialStats);

  // What the user is viewing
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchMode, setSearchMode] = useState<"recipe" | "ingredient">("recipe");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [page, setPage] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & drawers
  const [selectedRecipe, setSelectedRecipe] = useState<ParsedRecipe | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isRandomOpen, setIsRandomOpen] = useState<boolean>(false);

  const recipesSectionRef = useRef<HTMLDivElement>(null);

  // Live-refresh stats & categories on mount
  useEffect(() => {
    getApiStats().then((s) => { if (s) setStats(s); });
    getCategories().then((cats) => { if (cats.length > 0) setCategories(cats); });
  }, []);

  // ─── Core fetch dispatcher ─────────────────────────────────────────────────

  const fetchPage = useCallback(async (
    mode: ViewMode,
    query: string,
    sMode: "recipe" | "ingredient",
    category: string,
    sort: SortOption,
    targetPage: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (mode === "popular") {
        result = await getAllRecipesPaged(targetPage, PAGE_LIMIT, "views", "desc");
      } else if (mode === "search") {
        if (sMode === "ingredient") {
          result = await searchByIngredientPaged(query, targetPage, PAGE_LIMIT);
        } else {
          result = await searchRecipesPaged(query, targetPage, PAGE_LIMIT);
        }
      } else if (mode === "category") {
        result = await filterByCategoryPaged(category, targetPage, PAGE_LIMIT);
      } else if (mode === "ingredient") {
        result = await filterByIngredientPaged(query, targetPage, PAGE_LIMIT);
      } else {
        // "all" — apply sort
        const sortMap: Record<SortOption, { sort: "created_at" | "name" | "views" | "tries"; order: "asc" | "desc" }> = {
          default: { sort: "created_at", order: "desc" },
          az: { sort: "name", order: "asc" },
          za: { sort: "name", order: "desc" },
          views: { sort: "views", order: "desc" },
          tries: { sort: "tries", order: "desc" },
        };
        const { sort: s, order: o } = sortMap[sort] ?? sortMap.default;
        result = await getAllRecipesPaged(targetPage, PAGE_LIMIT, s, o);
      }

      setRecipes(result.recipes);
      setMeta(result.meta);
      setPage(result.meta.page);
    } catch {
      setError("Gagal memuat resep. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string, mode: "recipe" | "ingredient" = "recipe") => {
    if (!query.trim()) {
      setViewMode("all");
      setSearchQuery("");
      setSelectedCategory("");
      await fetchPage("all", "", mode, "", sortBy, 1);
      return;
    }
    setViewMode("search");
    setSearchQuery(query);
    setSearchMode(mode);
    setSelectedCategory("");
    await fetchPage("search", query, mode, "", sortBy, 1);
  }, [fetchPage, sortBy]);

  const handleSelectCategory = useCallback(async (cat: string) => {
    if (!cat) {
      setViewMode("all");
      setSelectedCategory("");
      setSearchQuery("");
      await fetchPage("all", "", searchMode, "", sortBy, 1);
      return;
    }
    setViewMode("category");
    setSelectedCategory(cat);
    setSearchQuery("");
    await fetchPage("category", "", searchMode, cat, sortBy, 1);
  }, [fetchPage, searchMode, sortBy]);

  const handleReset = useCallback(async () => {
    setViewMode("all");
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("default");
    await fetchPage("all", "", "recipe", "", "default", 1);
  }, [fetchPage]);

  const handleSortChange = useCallback(async (newSort: SortOption) => {
    setSortBy(newSort);
    // Sort only applies in "all" view — switch to it
    setViewMode("all");
    setSearchQuery("");
    setSelectedCategory("");
    await fetchPage("all", "", "recipe", "", newSort, 1);
  }, [fetchPage]);

  const goToPage = useCallback(async (targetPage: number) => {
    const clamped = clamp(targetPage, meta.totalPages);
    await fetchPage(viewMode, searchQuery, searchMode, selectedCategory, sortBy, clamped);
    recipesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fetchPage, viewMode, searchQuery, searchMode, selectedCategory, sortBy, meta.totalPages]);

  const scrollToRecipes = () => {
    recipesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Derived values ────────────────────────────────────────────────────────

  const totalPages = meta.totalPages;
  const currentPage = clamp(page, totalPages);
  const pageRange = buildPageRange(currentPage, totalPages);
  const activeCategoryMeta = selectedCategory ? getCategoryMeta(selectedCategory) : null;

  const sectionTitle = (() => {
    if (viewMode === "popular") return "Resep Terpopuler";
    if (viewMode === "search") return `Hasil ${searchMode === "ingredient" ? "Bahan" : "Pencarian"}: "${searchQuery}"`;
    if (viewMode === "category") return `Kategori: ${selectedCategory}`;
    if (sortBy === "views") return "Paling Banyak Dilihat";
    if (sortBy === "az") return "Semua Resep (A–Z)";
    if (sortBy === "za") return "Semua Resep (Z–A)";
    return "Semua Resep";
  })();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] dark:bg-[#0d1512] text-gray-900 dark:text-gray-100 selection:bg-emerald-500/20 selection:text-emerald-700">
      <Navbar
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenRandom={() => setIsRandomOpen(true)}
      />

      <HeroBanner
        onSearch={(q, m) => { handleSearch(q, m); scrollToRecipes(); }}
        stats={stats}
        onSelectKeyword={(kw, m) => { handleSearch(kw, m); scrollToRecipes(); }}
        onSurpriseMe={() => setIsRandomOpen(true)}
      />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => { handleSelectCategory(cat); scrollToRecipes(); }}
        isLoading={isLoading}
        stats={stats}
      />

      <main ref={recipesSectionRef} className="flex-grow max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 pb-28 sm:pb-12 w-full">

        {/* Section Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/60 dark:border-emerald-900/40">
          <div>
            <div className="flex items-center gap-2">
              {activeCategoryMeta && <span className="text-xl sm:text-2xl">{activeCategoryMeta.icon}</span>}
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight">
                {sectionTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
              {isLoading ? "Memuat resep lezat..." : (
                <>
                  {meta.total > 0 && (
                    <>
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        {meta.total.toLocaleString("id-ID")}
                      </strong>{" "}resep ditemukan
                      {totalPages > 1 && (
                        <> · Halaman{" "}
                          <strong className="text-emerald-700 dark:text-emerald-400">{currentPage}</strong>
                          {" "}dari{" "}
                          <strong className="text-emerald-700 dark:text-emerald-400">{totalPages.toLocaleString("id-ID")}</strong>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Popular tab */}
            <button
              type="button"
              onClick={async () => {
                setViewMode("popular");
                setSearchQuery("");
                setSelectedCategory("");
                await fetchPage("popular", "", "recipe", "", "default", 1);
                scrollToRecipes();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 shadow-2xs ${
                viewMode === "popular"
                  ? "bg-amber-500 border-amber-500 text-white shadow-amber-500/20"
                  : "bg-white dark:bg-emerald-950/60 border-gray-200 dark:border-emerald-800/80 text-gray-700 dark:text-gray-200 hover:bg-amber-50"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Populer</span>
            </button>

            {/* Sort (only for "all" mode) */}
            {(viewMode === "all" || viewMode === "popular") && viewMode !== "popular" && (
              <div className="relative inline-flex items-center">
                <label htmlFor="sort-select" className="sr-only">Urutkan Berdasarkan</label>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-emerald-950/60 rounded-xl border border-gray-200 dark:border-emerald-800/80 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-2xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Urut:</span>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="bg-transparent focus:outline-none cursor-pointer pr-4 font-semibold text-emerald-900 dark:text-emerald-200"
                  >
                    <option value="default" className="dark:bg-emerald-950">Terbaru</option>
                    <option value="az" className="dark:bg-emerald-950">Nama (A–Z)</option>
                    <option value="za" className="dark:bg-emerald-950">Nama (Z–A)</option>
                    <option value="views" className="dark:bg-emerald-950">Terbanyak Dilihat</option>
                    <option value="tries" className="dark:bg-emerald-950">Terbanyak Dicoba</option>
                  </select>
                </div>
              </div>
            )}

            {/* Reset button */}
            {(searchQuery || selectedCategory || viewMode === "popular") && (
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
            <button type="button" onClick={handleReset} className="px-3 py-1 bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg text-xs font-semibold">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
            {Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
          </div>
        ) : recipes.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">Tidak Ada Resep yang Cocok</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              Kami tidak menemukan resep untuk &ldquo;{searchQuery || selectedCategory}&rdquo;. Coba gunakan kata kunci bahan seperti &ldquo;ayam&rdquo;, &ldquo;telur&rdquo;, atau &ldquo;santan&rdquo;.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button type="button" onClick={handleReset} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md active:scale-95 transition-all">
                Kembali ke Semua Resep
              </button>
              <button type="button" onClick={() => setIsRandomOpen(true)} className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pilihkan Acak</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onSelect={setSelectedRecipe} />
              ))}
            </div>

            {/* Numbered pagination */}
            {totalPages > 1 && (
              <nav aria-label="Navigasi halaman resep" className="mt-10 flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  aria-label="Halaman sebelumnya"
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {pageRange.map((item, idx) =>
                  item === "…" ? (
                    <span key={`e-${idx}`} className="px-1.5 text-gray-400 dark:text-gray-600 text-xs select-none">…</span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      disabled={isLoading}
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

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  aria-label="Halaman berikutnya"
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </nav>
            )}

            {totalPages > 1 && (
              <p className="mt-3 text-center text-[11px] text-gray-500 dark:text-gray-400">
                Menampilkan {((currentPage - 1) * PAGE_LIMIT) + 1}–{Math.min(currentPage * PAGE_LIMIT, meta.total)} dari{" "}
                {meta.total.toLocaleString("id-ID")} resep
              </p>
            )}
          </>
        )}
      </main>

      <Footer />

      <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      <FavoritesDrawer isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} onSelectRecipe={setSelectedRecipe} />
      <RandomRecipeModal isOpen={isRandomOpen} onClose={() => setIsRandomOpen(false)} onSelectRecipe={setSelectedRecipe} />
      <BottomNav
        onGoHome={handleReset}
        onFocusSearch={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onOpenRandom={() => setIsRandomOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
      />
    </div>
  );
}
