export const CATEGORY_META: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  "Ayam": { icon: "🍗", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  "Buka Puasa": { icon: "🌙", color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/50" },
  "Cemilan": { icon: "🍟", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/50" },
  "Daging Sapi": { icon: "🥩", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50" },
  "Hidangan penutup": { icon: "🍨", color: "text-pink-700 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-950/50" },
  "Hidangan utama": { icon: "🍲", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  "Ikan & Seafood": { icon: "🐟", color: "text-cyan-700 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/50" },
  "Kambing": { icon: "🐐", color: "text-stone-700 dark:text-stone-400", bg: "bg-stone-50 dark:bg-stone-950/50" },
  "Kue & Dessert": { icon: "🍰", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50" },
  "MPASI": { icon: "🥣", color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/50" },
  "Makan malam": { icon: "🍽️", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/50" },
  "Makan siang": { icon: "🍱", color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/50" },
  "Masakan Indonesia": { icon: "🇮🇩", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50" },
  "Masakan Rumahan": { icon: "🏡", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  "Mie & Pasta": { icon: "🍜", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  "Minuman": { icon: "🍹", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50" },
  "Nasi & Bubur": { icon: "🍚", color: "text-amber-800 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  "Sambal & Bumbu": { icon: "🌶️", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50" },
  "Sarapan": { icon: "🍳", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/50" },
  "Sayur & Vegetarian": { icon: "🥗", color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/50" },
  "Sayuran": { icon: "🥬", color: "text-lime-700 dark:text-lime-400", bg: "bg-lime-50 dark:bg-lime-950/50" },
  "Sederhana": { icon: "✨", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  "Snack & Gorengan": { icon: "🥟", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  "Sup & Soto": { icon: "🥣", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  "Untuk Anak": { icon: "👶", color: "text-sky-700 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/50" },
};

export function getCategoryMeta(categoryName: string) {
  return (
    CATEGORY_META[categoryName] || {
      icon: "🍽️",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    }
  );
}
