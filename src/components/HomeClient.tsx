"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Search, RefreshCw, AlertCircle, ArrowUpDown, ChevronDown, Sparkles } from "lucide-react";
import { ParsedRecipe, ApiStats } from "@/types/recipe";
import {
  searchRecipes,
  filterByCategory,
  filterByIngredient,
  getLatestRecipes,
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

const PAGE_SIZE = 12;

export default function HomeClient({
  initialRecipes,
  initialCategories,
  initialStats,
}: HomeClientProps) {
  const [recipes, setRecipes] = useState<ParsedRecipe[]>(initialRecipes);
  const [categories] = useState<string[]>(initialCategories);
  const [stats] = useState<ApiStats | null>(initialStats);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchMode, setSearchMode] = useState<"recipe" | "ingredient">("recipe");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedRecipe, setSelectedRecipe] = useState<ParsedRecipe | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isRandomOpen, setIsRandomOpen] = useState<boolean>(false);

  const recipesSectionRef = useRef<HTMLDivElement>(null);

  // Load recipes for search
  const handleSearch = useCallback(async (query: string, mode: "recipe" | "ingredient" = "recipe") => {
    setSearchQuery(query);
    setSearchMode(mode);
    setSelectedCategory("");
    setError(null);
    setVisibleCount(PAGE_SIZE);

    if (!query.trim()) {
      setIsLoading(true);
      try {
        const data = await getLatestRecipes();
        setRecipes(data);
      } catch {
        setError("Gagal memuat resep terbaru.");
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
  }, []);

  // Category selection
  const handleSelectCategory = useCallback(async (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery("");
    setError(null);
    setVisibleCount(PAGE_SIZE);
    setIsLoading(true);

    try {
      if (!cat) {
        const data = await getLatestRecipes();
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
  }, []);

  // Reset to default latest
  const handleReset = async () => {
    setSearchQuery("");
    setSelectedCategory("");
    setError(null);
    setVisibleCount(PAGE_SIZE);
    setIsLoading(true);
    try {
      const data = await getLatestRecipes();
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

  // Sorting logic
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

  const displayedRecipes = useMemo(() => {
    return sortedRecipes.slice(0, visibleCount);
  }, [sortedRecipes, visibleCount]);

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
      <main ref={recipesSectionRef} className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
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
                  : "Resep Pilihan & Terbaru"}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
              {isLoading ? (
                "Memuat resep lezat..."
              ) : (
                <>
                  Ditemukan <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{recipes.length}</strong> resep masakan
                  {recipes.length > visibleCount && ` (menampilkan ${displayedRecipes.length})`}
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
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {displayedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={handleOpenRecipe}
                />
              ))}
            </div>

            {/* Load More Button if results exceed initial page */}
            {recipes.length > visibleCount && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold text-xs sm:text-sm border border-emerald-300/80 dark:border-emerald-800 shadow-sm active:scale-95 transition-all"
                >
                  <span>Tampilkan Lebih Banyak ({recipes.length - visibleCount} resep lagi)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
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
