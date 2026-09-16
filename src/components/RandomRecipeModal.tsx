"use client";

import { useState, useEffect, useId } from "react";
import Image from "next/image";
import {
  Sparkles,
  X,
  Shuffle,
  ArrowRight,
  Loader2,
  Bookmark,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { ParsedRecipe } from "@/types/recipe";
import { getRandomRecipe } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/recipe-utils";
import { getCategoryMeta } from "@/lib/category-meta";
import { useFavorites } from "@/lib/favorites";

interface RandomRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: ParsedRecipe) => void;
}

export default function RandomRecipeModal({
  isOpen,
  onClose,
  onSelectRecipe,
}: RandomRecipeModalProps) {
  if (!isOpen) return null;

  return (
    <RandomRecipeModalContent
      onClose={onClose}
      onSelectRecipe={onSelectRecipe}
    />
  );
}

function RandomRecipeModalContent({
  onClose,
  onSelectRecipe,
}: {
  onClose: () => void;
  onSelectRecipe: (recipe: ParsedRecipe) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [randomMeal, setRandomMeal] = useState<ParsedRecipe | null>(null);
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_IMAGE);
  const titleId = useId();

  const { isFavorite, toggle, mounted } = useFavorites();
  const favorite = randomMeal && mounted ? isFavorite(randomMeal.id) : false;

  // Initial fetch on mount
  useEffect(() => {
    let ignore = false;
    getRandomRecipe().then((res) => {
      if (!ignore) {
        if (res) {
          setRandomMeal(res);
          setImgSrc(res.image || FALLBACK_IMAGE);
        }
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const handleShuffle = async () => {
    setLoading(true);
    try {
      const res = await getRandomRecipe();
      if (res) {
        setRandomMeal(res);
        setImgSrc(res.image || FALLBACK_IMAGE);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const meta = randomMeal ? getCategoryMeta(randomMeal.category) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-emerald-950 rounded-3xl border border-gray-200/80 dark:border-emerald-800/80 shadow-2xl p-6 sm:p-7 text-center overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-emerald-900/60"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sparkle Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <h2
          id={titleId}
          className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-50 mt-2"
        >
          Inspirasi Masakan Acak
        </h2>

        <p className="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 max-w-xs mx-auto">
          Pilihan resep kejutan untuk menu masakan hari ini!
        </p>

        {/* Content area */}
        <div className="mt-5 min-h-[300px] flex flex-col justify-center">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <Shuffle className="w-4 h-4 text-emerald-700 absolute" />
              </div>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 font-semibold">
                Mengocok resep pilihan nusantara...
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Memilih secara acak dari 8.700+ resep
              </p>
            </div>
          ) : randomMeal ? (
            <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-900/20 p-4 text-left space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-emerald-950">
                <Image
                  src={imgSrc}
                  alt={randomMeal.title}
                  fill
                  className="object-cover"
                  onError={() => setImgSrc(FALLBACK_IMAGE)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow-xs">
                    {meta && <span>{meta.icon}</span>}
                    <span>{randomMeal.category}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(randomMeal);
                    }}
                    className={`p-1.5 rounded-lg backdrop-blur-md transition-all active:scale-90 ${
                      favorite
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-white/80 dark:bg-emerald-950/80 text-gray-700 hover:text-emerald-600"
                    }`}
                    title={favorite ? "Tersimpan" : "Simpan resep"}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${favorite ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-50 leading-snug">
                  {randomMeal.title}
                </h3>
                {randomMeal.description && (
                  <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2 mt-1 leading-relaxed">
                    {randomMeal.description}
                  </p>
                )}
              </div>

              {/* Quick stats */}
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs text-gray-700 dark:text-gray-200">
                <div className="flex items-center gap-3">
                  {randomMeal.servings > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{randomMeal.servings} porsi</span>
                    </span>
                  )}
                  {randomMeal.ingredients.length > 0 && (
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{randomMeal.ingredients.length} bahan</span>
                    </span>
                  )}
                </div>

                {randomMeal.author.name && (
                  <span className="truncate max-w-[120px] text-[11px] text-gray-700 dark:text-gray-300">
                    Oleh: {randomMeal.author.name}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectRecipe(randomMeal);
                    onClose();
                  }}
                  className="flex-grow py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span>Buka Resep Lengkap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShuffle}
                  className="p-3 rounded-xl bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-2xs active:scale-95 transition-all"
                  title="Acak resep lain"
                  aria-label="Acak resep lain"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6">
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                Gagal memuat resep acak. Silakan coba lagi.
              </p>
              <button
                type="button"
                onClick={handleShuffle}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 mx-auto"
              >
                <Shuffle className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}
        </div>

        {randomMeal && !loading && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleShuffle}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Belum cocok? Kocok resep lain</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
