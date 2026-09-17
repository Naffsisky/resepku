import { RawRecipe, ParsedRecipe, ApiStats, PagedRecipes, PaginationMeta } from "@/types/recipe";
import { parseRecipe } from "./recipe-utils";

const PAGE_LIMIT = 24;

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_BASE_URL || "http://43.157.202.20/api/v1";
  }
  return "/api/backend";
}

async function fetchFromApi<T>(path: string, noCache = false): Promise<T | null> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      ...(noCache ? { cache: "no-store" } : { next: { revalidate: 60 } }),
    });
    if (!res.ok) {
      console.warn(`API request failed: ${url} status=${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`API fetch error for ${path}:`, err);
    return null;
  }
}

/** Parse raw paginated API response into typed PagedRecipes */
function parsePaged(data: {
  meals: RawRecipe[] | null;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
} | null, fallbackPage = 1): PagedRecipes {
  const recipes = data?.meals?.map(parseRecipe) ?? [];
  const meta: PaginationMeta = {
    page: data?.page ?? fallbackPage,
    limit: data?.limit ?? PAGE_LIMIT,
    total: data?.total ?? recipes.length,
    totalPages: data?.totalPages ?? 1,
  };
  return { recipes, meta };
}

// ─── Browse all recipes (server-side paginated) ─────────────────────────────

export async function getAllRecipesPaged(
  page = 1,
  limit = PAGE_LIMIT,
  sort: "created_at" | "name" | "views" | "tries" = "created_at",
  order: "asc" | "desc" = "desc"
): Promise<PagedRecipes> {
  const data = await fetchFromApi<{
    meals: RawRecipe[] | null;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>(`/resep?page=${page}&limit=${limit}&sort=${sort}&order=${order}`);
  return parsePaged(data, page);
}

// ─── Search by recipe name (paginated) ─────────────────────────────────────

export async function searchRecipesPaged(
  query: string,
  page = 1,
  limit = PAGE_LIMIT
): Promise<PagedRecipes> {
  if (!query.trim()) return { recipes: [], meta: { page: 1, limit, total: 0, totalPages: 0 } };
  const data = await fetchFromApi<{
    meals: RawRecipe[] | null;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>(`/search.php?s=${encodeURIComponent(query.trim())}&page=${page}&limit=${limit}`);
  return parsePaged(data, page);
}

// ─── Search by ingredient (paginated) ──────────────────────────────────────

export async function searchByIngredientPaged(
  ingredient: string,
  page = 1,
  limit = PAGE_LIMIT
): Promise<PagedRecipes> {
  if (!ingredient.trim()) return { recipes: [], meta: { page: 1, limit, total: 0, totalPages: 0 } };
  const data = await fetchFromApi<{
    meals: RawRecipe[] | null;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>(`/search.php?s=${encodeURIComponent(ingredient.trim())}&mode=ingredient&page=${page}&limit=${limit}`);
  return parsePaged(data, page);
}

// ─── Filter by category (paginated) ────────────────────────────────────────

export async function filterByCategoryPaged(
  category: string,
  page = 1,
  limit = PAGE_LIMIT
): Promise<PagedRecipes> {
  if (!category || category === "Semua") {
    return getAllRecipesPaged(page, limit);
  }
  const data = await fetchFromApi<{
    meals: RawRecipe[] | null;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>(`/filter.php?c=${encodeURIComponent(category)}&page=${page}&limit=${limit}`);
  return parsePaged(data, page);
}

// ─── Filter by ingredient (paginated) ─────────────────────────────────────

export async function filterByIngredientPaged(
  ingredient: string,
  page = 1,
  limit = PAGE_LIMIT
): Promise<PagedRecipes> {
  if (!ingredient.trim()) return { recipes: [], meta: { page: 1, limit, total: 0, totalPages: 0 } };
  const data = await fetchFromApi<{
    meals: RawRecipe[] | null;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>(`/filter.php?i=${encodeURIComponent(ingredient.trim())}&page=${page}&limit=${limit}`);
  return parsePaged(data, page);
}

// ─── Popular recipes ────────────────────────────────────────────────────────

export async function getPopularRecipesPaged(
  page = 1,
  limit = PAGE_LIMIT
): Promise<PagedRecipes> {
  const data = await fetchFromApi<{
    meals: RawRecipe[] | null;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>(`/popular?page=${page}&limit=${limit}`);
  return parsePaged(data, page);
}

// ─── Single recipe detail ───────────────────────────────────────────────────

export async function getRecipeById(id: string): Promise<ParsedRecipe | null> {
  if (!id) return null;
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>(
    `/lookup.php?i=${encodeURIComponent(id)}`
  );
  if (!data?.meals || data.meals.length === 0) return null;
  return parseRecipe(data.meals[0]);
}

// ─── Random recipe(s) ──────────────────────────────────────────────────────

export async function getRandomRecipe(): Promise<ParsedRecipe | null> {
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>(
    `/random.php?_t=${Date.now()}`,
    true
  );
  if (!data?.meals || data.meals.length === 0) return null;
  return parseRecipe(data.meals[0]);
}

// ─── Categories list ────────────────────────────────────────────────────────

export async function getCategories(): Promise<string[]> {
  const data = await fetchFromApi<{
    categories?: Array<{ strKategori: string }>;
  }>("/categories.php");
  if (!data?.categories) return [];
  return data.categories
    .map((c) => c.strKategori?.trim())
    .filter((name): name is string => Boolean(name && name.length > 0));
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export async function getApiStats(): Promise<ApiStats | null> {
  return await fetchFromApi<ApiStats>("/stats");
}

// ─── Ingredients list ───────────────────────────────────────────────────────

export async function getIngredientsList(): Promise<string[]> {
  const data = await fetchFromApi<{ meals?: Array<{ strBahan: string }> }>(
    "/list.php?i=list"
  );
  if (!data?.meals) return [];
  return data.meals
    .map((m) => m.strBahan?.trim())
    .filter((b): b is string => Boolean(b && b.length > 0));
}
