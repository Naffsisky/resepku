"use client";

import Link from "next/link";
import { Utensils, Sparkles, Bookmark, BookOpen } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { useFavorites } from "@/lib/favorites";

interface NavbarProps {
  onOpenFavorites: () => void;
  onOpenRandom: () => void;
}

export default function Navbar({ onOpenFavorites, onOpenRandom }: NavbarProps) {
  const { favorites, mounted } = useFavorites();
  const favCount = mounted ? favorites.length : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/10 dark:border-emerald-500/10 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-emerald-950 dark:text-emerald-50">
                Resep<span className="text-emerald-600 dark:text-emerald-400">Ku</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Nusantara
              </span>
            </div>
            <p className="text-[11px] text-gray-700 dark:text-gray-200 hidden sm:block">
              Inspirasi Masakan Harian Rumahan
            </p>
          </div>
        </Link>

        {/* Action Buttons (Desktop & Tablet) */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Inspirasi Acak Button */}
          <button
            onClick={onOpenRandom}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/60 transition-all hover:shadow-xs active:scale-95"
            title="Dapatkan 1 resep acak inspiratif"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="hidden md:inline">Inspirasi Acak</span>
            <span className="md:hidden">Acak</span>
          </button>

          {/* Favorit Button with Badge */}
          <button
            onClick={onOpenFavorites}
            type="button"
            className="relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/60 transition-all hover:shadow-xs active:scale-95"
            title="Lihat resep favorit yang disimpan"
          >
            <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Tersimpan</span>
            {favCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-xs font-bold rounded-full bg-emerald-600 text-white min-w-[20px] text-center">
                {favCount}
              </span>
            )}
          </button>

          {/* API Docs link */}
          <a
            href="http://43.157.202.20/api/v1/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </a>

          {/* GitHub repo */}
          <a
            href="https://github.com/Naffsisky/resepku"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-700 hover:text-emerald-900 dark:text-gray-200 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-900/40 transition-colors"
            title="Lihat Repository GitHub"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
