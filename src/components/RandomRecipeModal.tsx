"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { Sparkles, X, Shuffle, ArrowRight, Loader2 } from "lucide-react";
import { ParsedRecipe } from "@/types/recipe";
import { getRandomRecipe } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/recipe-utils";

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
  const [loading, setLoading] = useState(false);
  const [randomMeal, setRandomMeal] = useState<ParsedRecipe | null>(null);
  const titleId = useId();

  const handleFetchRandom = async () => {
    setLoading(true);
    try {
      const res = await getRandomRecipe();
      setRandomMeal(res);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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

        {/* Sparkle Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/10 mb-4">
          <Sparkles className="w-7 h-7 animate-pulse" />
        </div>

        <h2 id={titleId} className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-50">
          Inspirasi Masakan Acak
        </h2>

        <p className="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-200 max-w-xs mx-auto">
          Bingung mau masak apa? Biarkan kami pilihkan satu resep istimewa untukmu!
        </p>

        {/* Content area */}
        <div className="mt-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Mengocok resep pilihan...
              </p>
            </div>
          ) : randomMeal ? (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-900/20 p-4 text-left space-y-3">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-emerald-950">
                <Image
                  src={randomMeal.image || FALLBACK_IMAGE}
                  alt={randomMeal.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-600 text-white">
                  {randomMeal.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-50">
                  {randomMeal.title}
                </h3>
                {randomMeal.description && (
                  <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2 mt-1">
                    {randomMeal.description}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-gray-700 dark:text-gray-200">
                <span>{randomMeal.ingredients.length} bahan pilihan</span>
                <span>Oleh: {randomMeal.author.name}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectRecipe(randomMeal);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Buka Resep Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="py-6">
              <button
                type="button"
                onClick={handleFetchRandom}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 mx-auto active:scale-95 transition-all"
              >
                <Shuffle className="w-4 h-4" />
                <span>Pilihkan Resep Sekarang</span>
              </button>
            </div>
          )}
        </div>

        {randomMeal && !loading && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleFetchRandom}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Kocok lagi resep lain</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
