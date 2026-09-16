"use client";

import { useState } from "react";
import Image from "next/image";
import { Bookmark, Users, UtensilsCrossed, ArrowRight, Heart } from "lucide-react";
import { ParsedRecipe } from "@/types/recipe";
import { FALLBACK_IMAGE } from "@/lib/recipe-utils";
import { useFavorites } from "@/lib/favorites";
import { getCategoryMeta } from "@/lib/category-meta";

interface RecipeCardProps {
  recipe: ParsedRecipe;
  onSelect: (recipe: ParsedRecipe) => void;
}

export default function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const [imgSrc, setImgSrc] = useState(recipe.image || FALLBACK_IMAGE);
  const { isFavorite, toggle, mounted } = useFavorites();
  const favorite = mounted ? isFavorite(recipe.id) : false;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(recipe);
  };

  const meta = getCategoryMeta(recipe.category);
  const ingredientsCount = recipe.ingredients.length;
  const stepsCount = recipe.instructions.length;

  return (
    <article
      onClick={() => onSelect(recipe)}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-emerald-950/40 border border-gray-200/80 dark:border-emerald-900/40 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500"
    >
      {/* Image Container with aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-emerald-950/80">
        <Image
          src={imgSrc}
          alt={recipe.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          loading="lazy"
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-50 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/95 dark:bg-emerald-950/95 text-emerald-900 dark:text-emerald-200 backdrop-blur-md shadow-xs border border-white/20">
            <span>{meta.icon}</span>
            <span>{recipe.category || "Umum"}</span>
          </span>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl backdrop-blur-md transition-all active:scale-90 ${
              favorite
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-white/85 dark:bg-emerald-950/80 text-gray-700 hover:text-emerald-600 dark:text-gray-200 dark:hover:text-emerald-400"
            }`}
            title={favorite ? "Hapus dari tersimpan" : "Simpan resep"}
            aria-label={favorite ? "Hapus dari tersimpan" : "Simpan resep"}
          >
            <Bookmark className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Region Tag bottom-left over image if available */}
        {recipe.region && (
          <div className="absolute bottom-2.5 left-3">
            <span className="text-[11px] font-medium text-white/90 drop-shadow-md">
              📍 {recipe.region}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-50 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {recipe.title}
          </h3>

          {recipe.description ? (
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-200 line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 italic">
              Koleksi resep khas Indonesia teruji dari Cookpad.
            </p>
          )}
        </div>

        {/* Recipe Meta Info */}
        <div className="pt-3 border-t border-gray-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-200">
            <div className="flex items-center gap-3">
              {recipe.servings > 0 && (
                <span className="flex items-center gap-1" title="Jumlah porsi">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{recipe.servings} porsi</span>
                </span>
              )}

              {ingredientsCount > 0 ? (
                <span className="flex items-center gap-1" title="Jumlah bahan">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{ingredientsCount} bahan</span>
                </span>
              ) : (
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Bahan & Takaran Lengkap
                </span>
              )}
            </div>

            {/* Author Credit or Saved count */}
            {recipe.saved > 0 ? (
              <span className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                <Heart className="w-3 h-3 fill-current text-rose-500" />
                <span>{recipe.saved}</span>
              </span>
            ) : recipe.author.name ? (
              <span className="truncate max-w-[110px] text-[11px] text-gray-700 dark:text-gray-300">
                Oleh {recipe.author.name}
              </span>
            ) : null}
          </div>

          {/* Bottom Action Trigger */}
          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
            <span>{stepsCount > 0 ? `${stepsCount} Langkah Masak` : "Buka Panduan"}</span>
            <span className="flex items-center gap-1 text-xs group-hover:translate-x-1 transition-transform">
              Lihat Resep <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
