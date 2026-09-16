import { Utensils, Heart, BookOpen } from "lucide-react";
import { GithubIcon } from "@/components/Icons";

export default function Footer() {
  return (
    <footer className="w-full border-t border-emerald-950/10 dark:border-emerald-500/10 bg-white/50 dark:bg-emerald-950/50 backdrop-blur-xs py-10 mt-16 mb-16 sm:mb-0 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo & Info */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-950 dark:text-emerald-50">
                Resep<span className="text-emerald-600 dark:text-emerald-400">Ku</span> Nusantara
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-200">
                Data resep bersumber dari Cookpad Indonesia · MealDB Indo v1
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-700 dark:text-gray-200 font-medium">
            <a
              href="http://43.157.202.20/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dokumentasi API</span>
            </a>
            <a
              href="https://github.com/Naffsisky/resepku"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-700 dark:text-gray-200 text-center sm:text-left">
          <p>© {new Date().getFullYear()} ResepKu. Dibangun dengan Next.js, Tailwind CSS & di-deploy di Vercel.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3 h-3 text-red-500 fill-current" /> untuk pecinta kuliner
          </p>
        </div>
      </div>
    </footer>
  );
}
