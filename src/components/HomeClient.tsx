"use client";

import { useState, useCallback, useRef } from "react";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import { ParsedRecipe, ApiStats } from "@/types/recipe";
import {
  searchRecipes,
  filterByCategory,
  getLatestRecipes,
  getRecipeById,
} from "@/lib/api";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedRecipe, setSelectedRecipe] = useState<ParsedRecipe | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isRandomOpen, setIsRandomOpen] = useState<boolean>(false);

  const recipesSectionRef = useRef<HTMLDivElement>(null);

  // Load recipes for search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setSelectedCategory("");
    setError(null);

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
      const results = await searchRecipes(query.trim());
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
    setIsLoading(true);
    try {
      const data = await getLatestRecipes();
      setRecipes(data);
    } finally {
      setIsLoading(false);
    }
  };

  // Open recipe: if it lacks instructions, fetch full details via lookup.php
  const handleOpenRecipe = async (recipe: ParsedRecipe) => {
    if (recipe.instructions.length === 0 || recipe.ingredients.length === 0) {
      // Need full lookup
      setSelectedRecipe(recipe); // open immediately with preview
      try {
        const full = await getRecipeById(recipe.id);
        if (full) {
          setSelectedRecipe(full);
        }
      } catch {
        // keep preview
      }
    } else {
      setSelectedRecipe(recipe);
    }
  };

  const scrollToRecipes = () => {
    recipesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        onSelectKeyword={(kw) => {
          handleSearch(kw);
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
        {/* Section Title & Status Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight">
              {searchQuery
                ? `Hasil Pencarian: "${searchQuery}"`
                : selectedCategory
                ? `Kategori: ${selectedCategory}`
                : "Resep Pilihan & Terbaru"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 mt-0.5">
              {isLoading
                ? "Memuat resep lezat..."
                : `${recipes.length} resep masakan ditemukan`}
            </p>
          </div>

          {(searchQuery || selectedCategory) && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800/80 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tampilkan Semua</span>
            </button>
          )}
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
              Kami tidak menemukan resep untuk pencarian atau filter ini. Coba gunakan kata kunci yang lebih umum seperti &ldquo;ayam&rdquo;, &ldquo;telur&rdquo;, atau &ldquo;kecap&rdquo;.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              Kembali ke Semua Resep
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={handleOpenRecipe}
              />
            ))}
          </div>
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
