export interface CategoryMetaItem {
  icon: string;
  color: string;
  bg: string;
  description: string;
}

export const CATEGORY_META: Record<string, CategoryMetaItem> = {
  "Ayam": {
    icon: "🍗",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    description: "Olahan berbahan dasar ayam: goreng, bakar, opor, soto ayam, dan sejenisnya.",
  },
  "Daging Sapi": {
    icon: "🥩",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/50",
    description: "Hidangan berbahan daging sapi seperti rendang, semur, empal, dan kornet.",
  },
  "Kambing": {
    icon: "🐐",
    color: "text-stone-700 dark:text-stone-400",
    bg: "bg-stone-50 dark:bg-stone-950/50",
    description: "Olahan daging kambing, termasuk gulai, tengkleng, dan tongseng.",
  },
  "Ikan & Seafood": {
    icon: "🐟",
    color: "text-cyan-700 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/50",
    description: "Ikan air tawar/laut, udang, cumi, kepiting, dan hasil laut lainnya.",
  },
  "Sayur & Vegetarian": {
    icon: "🥗",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/50",
    description: "Sayuran, tempe, tahu, dan hidangan vegetarian.",
  },
  "Nasi & Bubur": {
    icon: "🍚",
    color: "text-amber-800 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    description: "Nasi, bubur, lontong, ketupat, dan olahan beras/ketan.",
  },
  "Mie & Pasta": {
    icon: "🍜",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    description: "Mie, bihun, soun, kwetiau, makaroni, dan pasta.",
  },
  "Sup & Soto": {
    icon: "🥣",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    description: "Sup, soto, bakso, dan hidangan berkuah lainnya.",
  },
  "Kue & Dessert": {
    icon: "🍰",
    color: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    description: "Kue, roti, puding, dan hidangan penutup.",
  },
  "Minuman": {
    icon: "🍹",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    description: "Minuman seperti es, jus, teh, kopi, dan jamu.",
  },
  "Sambal & Bumbu": {
    icon: "🌶️",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/50",
    description: "Sambal, saus, kecap, dan bumbu dasar.",
  },
  "Snack & Gorengan": {
    icon: "🥟",
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/50",
    description: "Camilan dan gorengan seperti risol, cilok, kerupuk, dan bakwan.",
  },
  "Lainnya": {
    icon: "🍲",
    color: "text-slate-700 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950/50",
    description: "Resep yang belum masuk kategori spesifik mana pun.",
  },
};

export function getCategoryMeta(categoryName: string): CategoryMetaItem {
  return (
    CATEGORY_META[categoryName] || {
      icon: "🍽️",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      description: "Resep pilihan masakan nusantara.",
    }
  );
}
