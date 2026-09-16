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
    <nav
      aria-label="Navigasi Mobile"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-lg border-t border-gray-200/80 dark:border-emerald-900/60 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-xl no-print"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          type="button"
          onClick={onGoHome}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 active:scale-95 transition-all focus:outline-none"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Beranda</span>
        </button>

        <button
          type="button"
          onClick={onFocusSearch}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 active:scale-95 transition-all focus:outline-none"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Cari</span>
        </button>

        <button
          type="button"
          onClick={onOpenRandom}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-amber-600 dark:text-amber-400 active:scale-95 transition-all focus:outline-none"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-bold mt-0.5">Acak</span>
        </button>

        <button
          type="button"
          onClick={onOpenFavorites}
          className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 active:scale-95 transition-all focus:outline-none"
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Favorit</span>
          {favCount > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
              {favCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
