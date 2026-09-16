"use client";

import { useSyncExternalStore } from "react";
import { ParsedRecipe } from "@/types/recipe";

const FAVORITES_KEY = "resepku_saved_recipes";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("resepku_favorites_changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("resepku_favorites_changed", callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedSnapshot: ParsedRecipe[] = [];
let cachedRaw: string | null = null;

function getSnapshot(): ParsedRecipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = raw ? JSON.parse(raw) : [];
    }
    return cachedSnapshot;
  } catch {
    return [];
  }
}

const SERVER_SNAPSHOT: ParsedRecipe[] = [];
function getServerSnapshot(): ParsedRecipe[] {
  return SERVER_SNAPSHOT;
}

export function saveFavorite(recipe: ParsedRecipe): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getSnapshot();
    const exists = current.some((r) => r.id === recipe.id);
    let updated: ParsedRecipe[];
    if (exists) {
      updated = current.filter((r) => r.id !== recipe.id);
    } else {
      updated = [recipe, ...current];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("resepku_favorites_changed"));
    return !exists;
  } catch {
    return false;
  }
}

export function isRecipeFavorite(recipeId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getSnapshot();
    return current.some((r) => r.id === recipeId);
  } catch {
    return false;
  }
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = (recipe: ParsedRecipe) => {
    saveFavorite(recipe);
  };

  const isFavorite = (id: string) => {
    return favorites.some((r) => r.id === id);
  };

  return { favorites, isFavorite, toggle, mounted: true };
}
