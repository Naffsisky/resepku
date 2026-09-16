"use client";

import { useId } from "react";
import Image from "next/image";
import { X, Bookmark, Trash2, ArrowRight } from "lucide-react";
import { ParsedRecipe } from "@/types/recipe";
import { useFavorites } from "@/lib/favorites";
import { FALLBACK_IMAGE } from "@/lib/recipe-utils";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: ParsedRecipe) => void;
}

export default function FavoritesDrawer({
  isOpen,
  onClose,
  onSelectRecipe,
}: FavoritesDrawerProps) {
  const { favorites, toggle } = useFavorites();
  const drawerTitleId = useId();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={drawerTitleId}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-white dark:bg-emerald-950/95 border-l border-gray-200 dark:border-emerald-800/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 id={drawerTitleId} className="font-bold text-base text-emerald-950 dark:text-emerald-50">
                Resep Tersimpan
              </h2>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {favorites.length} resep dalam koleksimu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-900/40"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Bookmark className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                Belum Ada Resep Tersimpan
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 max-w-xs leading-relaxed">
                Tandai resep favoritmu dengan menekan ikon bookmark untuk menyimpannya di sini dan diakses cepat kapan saja.
              </p>
            </div>
          ) : (
            favorites.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => {
                  onSelectRecipe(recipe);
                  onClose();
                }}
                className="group flex items-center gap-3 p-2.5 rounded-2xl border border-gray-200/70 dark:border-emerald-900/40 bg-white dark:bg-emerald-900/20 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-emerald-950 shrink-0">
                  <Image
                    src={recipe.image || FALLBACK_IMAGE}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {recipe.category || "Umum"}
                  </span>
                  <h4 className="font-semibold text-xs sm:text-sm text-emerald-950 dark:text-emerald-50 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {recipe.title}
                  </h4>
                  <p className="text-[11px] text-gray-700 dark:text-gray-300">
                    {recipe.ingredients.length} bahan · {recipe.servings} porsi
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(recipe);
                    }}
                    className="p-2 text-gray-700 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
                    title="Hapus dari koleksi"
                    aria-label="Hapus dari koleksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-1 text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 dark:border-emerald-900/60 bg-gray-50/50 dark:bg-emerald-950/60 text-center">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Disimpan di penyimpanan lokal browsermu
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
