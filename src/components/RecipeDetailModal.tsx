"use client";

import { useState, useEffect, useId } from "react";
import Image from "next/image";
import {
  X,
  Bookmark,
  Share2,
  Printer,
  ExternalLink,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  Circle,
  Clock,
  ChevronUp,
  ChevronDown,
  Timer as TimerIcon,
  Check,
  RotateCcw,
  Loader2,
  Heart,
  ChefHat,
} from "lucide-react";
import { ParsedRecipe } from "@/types/recipe";
import { scaleMeasure, FALLBACK_IMAGE } from "@/lib/recipe-utils";
import { useFavorites } from "@/lib/favorites";
import { getRecipeById } from "@/lib/api";
import CookingTimer from "./CookingTimer";

interface RecipeDetailModalProps {
  recipe: ParsedRecipe | null;
  onClose: () => void;
}

export default function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <RecipeModalContent
      key={recipe.id}
      initialRecipe={recipe}
      onClose={onClose}
    />
  );
}

function RecipeModalContent({
  initialRecipe,
  onClose,
}: {
  initialRecipe: ParsedRecipe;
  onClose: () => void;
}) {
  const [recipe, setRecipe] = useState<ParsedRecipe>(initialRecipe);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(
    initialRecipe.instructions.length === 0 && initialRecipe.ingredients.length === 0
  );
  const [servings, setServings] = useState<number>(
    initialRecipe.servings > 0 ? initialRecipe.servings : 2
  );
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showTimer, setShowTimer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(initialRecipe.image || FALLBACK_IMAGE);
  const titleId = useId();

  const { isFavorite, toggle, mounted } = useFavorites();
  const favorite = mounted ? isFavorite(recipe.id) : false;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    let cancelled = false;
    if (initialRecipe.instructions.length === 0 && initialRecipe.ingredients.length === 0) {
      getRecipeById(initialRecipe.id).then((full) => {
        if (!cancelled && full) {
          setRecipe(full);
          if (full.servings > 0) setServings(full.servings);
          if (full.image) setImgSrc(full.image);
          setLoadingDetails(false);
        }
      });
    }

    return () => {
      cancelled = true;
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [initialRecipe.id, initialRecipe.instructions.length, initialRecipe.ingredients.length, onClose]);

  const baseServings = recipe.servings > 0 ? recipe.servings : 2;

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleShare = async () => {
    const shareData = {
      title: `${recipe.title} - ResepKu`,
      text: `Lihat resep ${recipe.title} di ResepKu!`,
      url: typeof window !== "undefined" ? `${window.location.origin}/resep/${recipe.id}` : "",
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          typeof window !== "undefined" ? `${window.location.origin}/resep/${recipe.id}` : ""
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = recipe.instructions.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="recipe-modal-content relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl md:max-w-4xl bg-white dark:bg-emerald-950/95 sm:rounded-3xl border border-gray-200/80 dark:border-emerald-800/80 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 no-print">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/90 dark:bg-emerald-900/90 text-gray-700 hover:text-emerald-700 dark:text-gray-200 dark:hover:text-emerald-300 backdrop-blur-md shadow-md border border-gray-200/50 dark:border-emerald-800/50 transition-all active:scale-90"
            title="Bagikan Resep"
            aria-label="Bagikan resep"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 rounded-full bg-white/90 dark:bg-emerald-900/90 text-gray-700 hover:text-emerald-700 dark:text-gray-200 dark:hover:text-emerald-300 backdrop-blur-md shadow-md border border-gray-200/50 dark:border-emerald-800/50 transition-all active:scale-90"
            title="Cetak Resep"
            aria-label="Cetak resep"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => toggle(recipe)}
            className={`p-2.5 rounded-full backdrop-blur-md shadow-md border transition-all active:scale-90 ${
              favorite
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-white/90 dark:bg-emerald-900/90 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-emerald-800/50 hover:text-emerald-600"
            }`}
            title={favorite ? "Tersimpan" : "Simpan Resep"}
            aria-label="Simpan resep"
          >
            <Bookmark className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md shadow-md transition-all active:scale-90"
            title="Tutup (Esc)"
            aria-label="Tutup jendela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-grow divide-y divide-gray-100 dark:divide-emerald-900/30">
          {/* Header Image & Main Title */}
          <div className="relative">
            <div className="relative h-64 sm:h-80 w-full bg-gray-100 dark:bg-emerald-950">
              <Image
                src={imgSrc}
                alt={recipe.title}
                fill
                priority
                className="object-cover"
                onError={() => setImgSrc(FALLBACK_IMAGE)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
                    {recipe.category || "Umum"}
                  </span>
                  {recipe.region && (
                    <span className="px-3 py-1 text-xs font-medium rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/20">
                      📍 {recipe.region}
                    </span>
                  )}
                  {recipe.saved > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-lg bg-rose-600/80 backdrop-blur-md text-white flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" /> {recipe.saved} disimpan
                    </span>
                  )}
                </div>

                <h1 id={titleId} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                  {recipe.title}
                </h1>

                {recipe.author.name && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-200 flex items-center gap-1.5 drop-shadow-xs">
                    <span>Oleh: <strong>{recipe.author.name}</strong></span>
                    {recipe.author.url && (
                      <a
                        href={recipe.author.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-300 hover:text-emerald-200 underline inline-flex items-center gap-0.5"
                      >
                        Profil <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Cookpad Link */}
          {recipe.description && (
            <div className="p-5 sm:p-6 bg-emerald-50/40 dark:bg-emerald-950/40">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                &ldquo;{recipe.description}&rdquo;
              </p>
              {recipe.sourceUrl && (
                <div className="mt-2 text-right">
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Buka resep asli di Cookpad <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Recipe Interactive Toolbar (Portion Scaler & Timer Trigger) */}
          <div className="p-4 sm:p-6 bg-white dark:bg-emerald-950/80 flex flex-wrap items-center justify-between gap-4 no-print">
            {/* Portion Adjuster */}
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/80 px-3.5 py-2 rounded-2xl">
              <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-950 dark:text-emerald-100">
                  {servings} Porsi
                </span>
                {servings !== baseServings && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                    (Asli: {baseServings} porsi)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="p-1 rounded-lg bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-700 shadow-2xs active:scale-90"
                  title="Kurangi porsi"
                  aria-label="Kurangi porsi"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setServings((s) => s + 1)}
                  className="p-1 rounded-lg bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-700 shadow-2xs active:scale-90"
                  title="Tambah porsi"
                  aria-label="Tambah porsi"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timer Toggle Button */}
            <button
              type="button"
              onClick={() => setShowTimer((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-95 border ${
                showTimer
                  ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100"
              }`}
            >
              <TimerIcon className="w-4 h-4" />
              <span>{showTimer ? "Sembunyikan Timer" : "Buka Timer Masak"}</span>
            </button>
          </div>

          {/* Conditional Timer Widget */}
          {showTimer && (
            <div className="p-4 sm:p-6 bg-amber-50/40 dark:bg-amber-950/20 border-b border-amber-200/40 no-print">
              <CookingTimer />
            </div>
          )}

          {/* Loading details state or content */}
          {loadingDetails ? (
            <div className="p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                Memuat takaran bahan dan langkah memasak...
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Mengambil data resep dari database Cookpad
              </p>
            </div>
          ) : (
            /* Ingredients & Instructions Grid */
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
              {/* Ingredients Column (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-emerald-900/60">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                      Bahan-Bahan
                    </h2>
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {recipe.ingredients.length} item
                  </span>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300 italic no-print">
                  Tip: Ketuk bahan untuk menandai yang sudah disiapkan.
                </p>

                {/* Ingredients List */}
                {recipe.ingredients.length === 0 ? (
                  <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                    Bahan-bahan tercantum dalam instruksi memasak.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ing) => {
                      const isChecked = checkedIngredients[ing.id];
                      const scaledMeasure = scaleMeasure(ing.measure, baseServings, servings);

                      return (
                        <li
                          key={ing.id}
                          onClick={() => toggleIngredient(ing.id)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-gray-700 dark:text-gray-300 line-through"
                              : "bg-white dark:bg-emerald-900/20 border-gray-100 dark:border-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-700"
                          }`}
                        >
                          <button
                            type="button"
                            className="shrink-0 mt-0.5"
                            aria-label={isChecked ? "Uncheck" : "Check"}
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-300 dark:text-emerald-800" />
                            )}
                          </button>

                          <div className="flex-grow flex justify-between gap-2 text-xs sm:text-sm">
                            <span className="font-medium text-emerald-950 dark:text-emerald-100">
                              {ing.name}
                            </span>
                            {scaledMeasure && (
                              <span className="shrink-0 font-semibold text-emerald-700 dark:text-emerald-300">
                                {scaledMeasure}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Instructions Column (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-emerald-900/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                      Langkah Memasak
                    </h2>
                  </div>

                  {totalSteps > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {progressPercent}% Selesai
                      </span>
                      {completedStepsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setCompletedSteps({})}
                          className="p-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                          title="Reset progres memasak"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Step Progress Bar */}
                {totalSteps > 0 && (
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-emerald-900/40 overflow-hidden no-print">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}

                {/* Steps List */}
                {recipe.instructions.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-gray-50 dark:bg-emerald-900/20 text-gray-700 dark:text-gray-300 text-xs">
                    <ChefHat className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                    <p>Buka resep asli di Cookpad untuk melihat panduan video atau gambar langkah lengkap.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recipe.instructions.map((step, idx) => {
                      const isDone = completedSteps[idx];

                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                            isDone
                              ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800"
                              : "bg-white dark:bg-emerald-900/20 border-gray-200/70 dark:border-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-700"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                                isDone
                                  ? "bg-emerald-600 text-white"
                                  : "bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                              }`}
                            >
                              {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>

                            <div className="flex-grow">
                              <p
                                className={`text-xs sm:text-sm leading-relaxed ${
                                  isDone
                                    ? "text-gray-700 dark:text-gray-300 line-through"
                                    : "text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {step}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-emerald-950 border-t border-gray-200/80 dark:border-emerald-900/60 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 no-print">
          <span>ResepKu Nusantara · Sumber Cookpad ID</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-emerald-900/80 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-emerald-800 transition-colors"
          >
            Selesai Membaca
          </button>
        </div>
      </div>
    </div>
  );
}
