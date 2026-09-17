import { RawRecipe, ParsedRecipe, ApiStats } from "@/types/recipe";
import { parseRecipe } from "./recipe-utils";

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Running on server (SSR/SSG)
    return process.env.API_BASE_URL || "http://43.157.202.20/api/v1";
  }
  // Running in browser -> use local proxy to avoid Mixed Content / CORS
  return "/api/backend";
}

async function fetchFromApi<T>(path: string, noCache = false): Promise<T | null> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
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

export async function getLatestRecipes(): Promise<ParsedRecipe[]> {
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>("/latest");
  if (!data?.meals) return [];
  return data.meals.map(parseRecipe);
}

export async function searchRecipes(query: string): Promise<ParsedRecipe[]> {
  if (!query.trim()) return [];
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>(
    `/search.php?s=${encodeURIComponent(query.trim())}`
  );
  if (!data?.meals) return [];
  return data.meals.map(parseRecipe);
}

export async function getRecipeById(id: string): Promise<ParsedRecipe | null> {
  if (!id) return null;
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>(
    `/lookup.php?i=${encodeURIComponent(id)}`
  );
  if (!data?.meals || data.meals.length === 0) return null;
  return parseRecipe(data.meals[0]);
}

export async function getRandomRecipe(): Promise<ParsedRecipe | null> {
  const timestamp = Date.now();
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>(
    `/random.php?_t=${timestamp}`,
    true // always fresh, never cache
  );
  if (!data?.meals || data.meals.length === 0) return null;
  return parseRecipe(data.meals[0]);
}

export async function getCategories(): Promise<string[]> {
  const data = await fetchFromApi<{
    categories?: Array<{ strKategori: string; strDeskripsiKategori?: string }>;
  }>("/categories.php");

  if (!data?.categories) return [];
  return data.categories
    .map((c) => c.strKategori?.trim())
    .filter((name): name is string => Boolean(name && name.length > 0));
}

export async function filterByCategory(category: string): Promise<ParsedRecipe[]> {
  if (!category || category === "Semua") {
    return getLatestRecipes();
  }
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>(
    `/filter.php?c=${encodeURIComponent(category)}`
  );
  if (!data?.meals) return [];
  return data.meals.map(parseRecipe);
}

// Canonical category list used as fallback when API doesn't respond
const CANONICAL_CATEGORIES = [
  "Ayam",
  "Daging Sapi",
  "Kambing",
  "Ikan & Seafood",
  "Sayur & Vegetarian",
  "Nasi & Bubur",
  "Mie & Pasta",
  "Sup & Soto",
  "Kue & Dessert",
  "Minuman",
  "Sambal & Bumbu",
  "Snack & Gorengan",
  "Lainnya",
];

/**
 * Fetch all recipes by fetching every category in parallel, then deduplicating.
 * Because the API caps each category at 50 results, this yields up to ~650 summary recipes.
 * The results are ordered by category so pagination is coherent.
 */
export async function getAllRecipes(): Promise<ParsedRecipe[]> {
  // Fetch category list dynamically so it stays in sync with the DB
  const catData = await fetchFromApi<{
    categories?: Array<{ strKategori: string }>;
  }>("/categories.php");

  const categoryNames =
    catData?.categories
      ?.map((c) => c.strKategori?.trim())
      .filter((n): n is string => Boolean(n && n.length > 0)) ??
    CANONICAL_CATEGORIES;

  // Fetch all categories in parallel
  const results = await Promise.allSettled(
    categoryNames.map((cat) =>
      fetchFromApi<{ meals: RawRecipe[] | null }>(
        `/filter.php?c=${encodeURIComponent(cat)}`
      )
    )
  );

  const seen = new Set<string>();
  const combined: ParsedRecipe[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value?.meals) {
      result.value.meals.forEach((raw) => {
        if (!seen.has(raw.idMakanan)) {
          seen.add(raw.idMakanan);
          combined.push(parseRecipe(raw));
        }
      });
    }
  });

  return combined;
}

export async function filterByIngredient(ingredient: string): Promise<ParsedRecipe[]> {
  if (!ingredient.trim()) return [];
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>(
    `/filter.php?i=${encodeURIComponent(ingredient.trim())}`
  );
  if (!data?.meals) return [];
  return data.meals.map(parseRecipe);
}

export async function filterCombined(params: {
  category?: string;
  area?: string;
  ingredient?: string;
}): Promise<ParsedRecipe[]> {
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== "Semua") searchParams.set("c", params.category);
  if (params.area) searchParams.set("a", params.area);
  if (params.ingredient) searchParams.set("i", params.ingredient);

  const queryStr = searchParams.toString();
  if (!queryStr) return getLatestRecipes();

  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>(
    `/filter.php?${queryStr}`
  );
  if (!data?.meals) return [];
  return data.meals.map(parseRecipe);
}

export async function getIngredientsList(): Promise<string[]> {
  const data = await fetchFromApi<{ meals?: Array<{ strBahan: string }> }>(
    "/list.php?i=list"
  );
  if (!data?.meals) return [];
  return data.meals
    .map((m) => m.strBahan?.trim())
    .filter((b): b is string => Boolean(b && b.length > 0));
}

export async function getApiStats(): Promise<ApiStats | null> {
  return await fetchFromApi<ApiStats>("/stats");
}
