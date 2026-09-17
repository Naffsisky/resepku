export interface RawRecipe {
  idMakanan: string;
  strMakanan: string;
  strKategori?: string;
  strDaerah?: string;
  strDeskripsi?: string;
  strTags?: string;
  strGambar?: string;
  strYoutube?: string;
  strPenulisID?: string;
  strPenulis?: string;
  strPenulisURL?: string;
  strInstruksi?: string;
  intPorsi?: number;
  strWaktuMasak?: string;
  strWaktuPersiapan?: string;
  strKesulitan?: string;
  intDilihat?: number;
  intDicoba?: number;
  intKomentar?: number;
  intDisimpan?: number;
  strSourceURL?: string;
  dateModified?: string;
  [key: `strBahan${number}`]: string | undefined;
  [key: `strTakaran${number}`]: string | undefined;
}

export interface IngredientItem {
  id: string;
  name: string;
  measure: string;
}

export interface ParsedRecipe {
  id: string;
  title: string;
  category: string;
  region: string;
  description: string;
  tags: string[];
  image: string;
  youtubeId: string;
  author: {
    id: string;
    name: string;
    url: string;
  };
  instructions: string[];
  servings: number;
  cookTime: string;
  prepTime: string;
  difficulty: string;
  views: number;
  tried: number;
  comments: number;
  saved: number;
  sourceUrl: string;
  dateModified: string;
  ingredients: IngredientItem[];
}

export interface CategoryItem {
  strKategori: string;
  strGambarKategori?: string;
  strDeskripsiKategori?: string;
}

export interface ApiStats {
  api: string;
  source: string;
  totalDaerah: number;
  totalKategori: number;
  totalResep: number;
  /** Per-category breakdown returned by /stats */
  kategori?: Array<{ kategori: string; jumlah: number }>;
}

/** Pagination metadata returned by paginated endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Paginated result for recipe lists */
export interface PagedRecipes {
  recipes: ParsedRecipe[];
  meta: PaginationMeta;
}
