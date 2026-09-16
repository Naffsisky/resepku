"use client";

import { Home, Search, Sparkles, Bookmark } from "lucide-react";
import { useFavorites } from "@/lib/favorites";

interface BottomNavProps {
  onGoHome: () => void;
  onFocusSearch: () => void;
  onOpenRandom: () => void;
  onOpenFavorites: () => void;
}

export default function BottomNav({
  onGoHome,
  onFocusSearch,
  onOpenRandom,
  onOpenFavorites,
}: BottomNavProps) {
  const { favorites, mounted } = useFavorites();
  const favCount = mounted ? favorites.length : 0;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-emerald-950/95 backdrop-blur-lg border-t border-gray-200/80 dark:border-emerald-900/60 px-4 py-2 shadow-lg no-print">
      <div className="flex items-center justify-around">
        <button
          type="button"
          onClick={onGoHome}
          className="flex flex-col items-center gap-1 py-1 px-3 text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 active:scale-95 transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Beranda</span>
        </button>

        <button
          type="button"
          onClick={onFocusSearch}
          className="flex flex-col items-center gap-1 py-1 px-3 text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 active:scale-95 transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cari</span>
        </button>

        <button
          type="button"
          onClick={onOpenRandom}
          className="flex flex-col items-center gap-1 py-1 px-3 text-amber-600 dark:text-amber-400 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-semibold">Acak</span>
        </button>

        <button
          type="button"
          onClick={onOpenFavorites}
          className="relative flex flex-col items-center gap-1 py-1 px-3 text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 active:scale-95 transition-all"
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] font-medium">Favorit</span>
          {favCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
              {favCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
