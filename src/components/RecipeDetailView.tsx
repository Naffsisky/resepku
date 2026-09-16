"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
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
  Heart,
} from "lucide-react";
import { ParsedRecipe } from "@/types/recipe";
import { scaleMeasure, FALLBACK_IMAGE } from "@/lib/recipe-utils";
import { useFavorites } from "@/lib/favorites";
import { getCategoryMeta } from "@/lib/category-meta";
import CookingTimer from "./CookingTimer";
import Footer from "./Footer";

interface RecipeDetailViewProps {
  recipe: ParsedRecipe;
}

export default function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const [servings, setServings] = useState<number>(recipe.servings > 0 ? recipe.servings : 2);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showTimer, setShowTimer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState(recipe.image || FALLBACK_IMAGE);

  const { isFavorite, toggle, mounted } = useFavorites();
  const favorite = mounted ? isFavorite(recipe.id) : false;

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
      text: `Cek resep ${recipe.title} di ResepKu!`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
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
    <div className="min-h-screen flex flex-col bg-[#f8faf9] dark:bg-[#0d1512] text-gray-900 dark:text-gray-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 dark:border-emerald-900/60 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-gray-700 hover:text-emerald-600 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-900/40"
              title="Bagikan Resep"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-gray-700 hover:text-emerald-600 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-900/40"
              title="Cetak Resep"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggle(recipe)}
              className={`p-2 rounded-xl transition-all ${
                favorite
                  ? "bg-emerald-600 text-white"
                  : "text-gray-700 hover:text-emerald-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-emerald-900/40"
              }`}
              title={favorite ? "Tersimpan" : "Simpan Resep"}
            >
              <Bookmark className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-emerald-950/40 border border-gray-200/80 dark:border-emerald-900/40 shadow-md mb-8">
          <div className="relative h-72 sm:h-96 w-full bg-gray-100 dark:bg-emerald-950">
            <Image
              src={imgSrc}
              alt={recipe.title}
              fill
              priority
              className="object-cover"
              onError={() => setImgSrc(FALLBACK_IMAGE)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
                  <span>{getCategoryMeta(recipe.category).icon}</span>
                  <span>{recipe.category || "Umum"}</span>
                </span>
                {recipe.region && (
                  <span className="px-3 py-1 text-xs font-medium rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/20">
                    📍 {recipe.region}
                  </span>
                )}
                {recipe.saved > 0 && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-600/80 backdrop-blur-md text-white flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current" /> {recipe.saved} disimpan
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {recipe.title}
              </h1>

              {recipe.author.name && (
                <p className="mt-2 text-xs sm:text-sm text-gray-200 flex items-center gap-2">
                  <span>Oleh: <strong>{recipe.author.name}</strong></span>
                  {recipe.author.url && (
                    <a
                      href={recipe.author.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:text-emerald-200 underline inline-flex items-center gap-0.5"
                    >
                      Profil Cookpad <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <div className="p-6 bg-emerald-50/40 dark:bg-emerald-950/40 border-t border-gray-100 dark:border-emerald-900/40">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                &ldquo;{recipe.description}&rdquo;
              </p>
              {recipe.sourceUrl && (
                <div className="mt-3 text-right">
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
        </div>

        {/* Toolbar: Servings & Timer */}
        <div className="mb-8 p-4 sm:p-5 bg-white dark:bg-emerald-950/40 rounded-2xl border border-gray-200/80 dark:border-emerald-900/40 flex flex-wrap items-center justify-between gap-4 shadow-xs no-print">
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-2xl">
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
                aria-label="Kurangi porsi"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setServings((s) => s + 1)}
                className="p-1 rounded-lg bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-700 shadow-2xs active:scale-90"
                aria-label="Tambah porsi"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTimer((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-95 border ${
              showTimer
                ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
            }`}
          >
            <TimerIcon className="w-4 h-4" />
            <span>{showTimer ? "Sembunyikan Timer" : "Buka Timer Masak"}</span>
          </button>
        </div>

        {showTimer && (
          <div className="mb-8 no-print">
            <CookingTimer />
          </div>
        )}

        {/* Ingredients & Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Ingredients (5 cols) */}
          <div className="md:col-span-5 bg-white dark:bg-emerald-950/40 p-6 rounded-3xl border border-gray-200/80 dark:border-emerald-900/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-emerald-900/60">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
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

            <ul className="space-y-2">
              {recipe.ingredients.map((ing) => {
                const isChecked = checkedIngredients[ing.id];
                const scaledMeasure = scaleMeasure(ing.measure, baseServings, servings);

                return (
                  <li
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-gray-700 dark:text-gray-300 line-through"
                        : "bg-white dark:bg-emerald-900/20 border-gray-100 dark:border-emerald-800/40 hover:border-emerald-300"
                    }`}
                  >
                    <button type="button" className="shrink-0 mt-0.5" aria-label="Toggle ingredient">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300 dark:text-emerald-800" />
                      )}
                    </button>
                    <div className="flex-grow flex justify-between gap-2 text-sm">
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
          </div>

          {/* Instructions (7 cols) */}
          <div className="md:col-span-7 bg-white dark:bg-emerald-950/40 p-6 rounded-3xl border border-gray-200/80 dark:border-emerald-900/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-emerald-900/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
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
                      title="Reset langkah"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {totalSteps > 0 && (
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-emerald-900/40 overflow-hidden no-print">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            <div className="space-y-3">
              {recipe.instructions.map((step, idx) => {
                const isDone = completedSteps[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800"
                        : "bg-white dark:bg-emerald-900/20 border-gray-100 dark:border-emerald-800/40 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                          isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="flex-grow">
                        <p
                          className={`text-sm leading-relaxed ${
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
