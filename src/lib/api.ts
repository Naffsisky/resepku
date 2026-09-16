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

async function fetchFromApi<T>(path: string): Promise<T | null> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
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
  const data = await fetchFromApi<{ meals: RawRecipe[] | null }>("/random.php");
  if (!data?.meals || data.meals.length === 0) return null;
  return parseRecipe(data.meals[0]);
}

export async function getCategories(): Promise<string[]> {
  const data = await fetchFromApi<{
    categories?: Array<{ strKategori: string }>;
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

export async function getApiStats(): Promise<ApiStats | null> {
  return await fetchFromApi<ApiStats>("/stats");
}
