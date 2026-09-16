import { RawRecipe, ParsedRecipe, IngredientItem } from "@/types/recipe";

export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80";

export function parseRecipe(raw: RawRecipe): ParsedRecipe {
  const ingredients: IngredientItem[] = [];

  for (let i = 1; i <= 20; i++) {
    const rawName = raw[`strBahan${i}`]?.trim();
    const rawMeasure = raw[`strTakaran${i}`]?.trim() || "";

    if (rawName && rawName.length > 0) {
      ingredients.push({
        id: `ing-${i}-${raw.idMakanan}`,
        name: rawName,
        measure: rawMeasure,
      });
    }
  }

  // Parse instructions into individual steps
  const rawInstructions = raw.strInstruksi || "";
  const instructions = rawInstructions
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter((step) => step.length > 0)
    .map((step) => {
      // Remove leading "1. ", "Step 1: ", etc. if already numbered so UI can render clean step cards
      return step.replace(/^(\d+[\.\)]\s*|Langkah\s*\d+[:\.]\s*)/i, "").trim();
    })
    .filter((step) => step.length > 0);

  // If no step splitting worked or was empty, provide a fallback
  if (instructions.length === 0 && rawInstructions.trim().length > 0) {
    instructions.push(rawInstructions.trim());
  }

  // Parse tags
  const rawTags = raw.strTags || "";
  const tags = rawTags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return {
    id: raw.idMakanan,
    title: raw.strMakanan || "Resep Tanpa Judul",
    category: raw.strKategori || "Umum",
    region: raw.strDaerah || "Nusantara",
    description: raw.strDeskripsi || "",
    tags,
    image: raw.strGambar && raw.strGambar.startsWith("http") ? raw.strGambar : FALLBACK_IMAGE,
    youtubeId: raw.strYoutube || "",
    author: {
      id: raw.strPenulisID || "",
      name: raw.strPenulis || "Koki Cookpad",
      url: raw.strPenulisURL || "",
    },
    instructions,
    servings: raw.intPorsi && raw.intPorsi > 0 ? raw.intPorsi : 2,
    cookTime: raw.strWaktuMasak || "",
    prepTime: raw.strWaktuPersiapan || "",
    difficulty: raw.strKesulitan || "Mudah",
    views: raw.intDilihat || 0,
    tried: raw.intDicoba || 0,
    comments: raw.intKomentar || 0,
    saved: raw.intDisimpan || 0,
    sourceUrl: raw.strSourceURL || "",
    dateModified: raw.dateModified || "",
    ingredients,
  };
}

/**
 * Dynamically scales quantity in ingredient measurement string based on servings ratio
 * e.g., "100 gr" with 2 -> 4 servings becomes "200 gr"
 * e.g., "1/2 sdt" with 2 -> 4 servings becomes "1 sdt"
 */
export function scaleMeasure(measure: string, baseServings: number, targetServings: number): string {
  if (!measure || baseServings <= 0 || targetServings <= 0 || baseServings === targetServings) {
    return measure;
  }

  const ratio = targetServings / baseServings;

  // Replace fractions like 1/2, 1/4, 3/4
  const fractionMatch = measure.match(/^(\d+)\/(\d+)(.*)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    const rest = fractionMatch[3];
    const newQty = (num / den) * ratio;
    return `${formatQuantity(newQty)}${rest}`;
  }

  // Replace standard decimals or integers at start
  const numberMatch = measure.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (numberMatch) {
    const qty = parseFloat(numberMatch[1]);
    const rest = numberMatch[2];
    const newQty = qty * ratio;
    return `${formatQuantity(newQty)}${rest}`;
  }

  return measure;
}

function formatQuantity(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  // Check common fractions
  const rounded = Math.round(num * 100) / 100;
  if (Math.abs(rounded - 0.5) < 0.05) return "1/2";
  if (Math.abs(rounded - 0.25) < 0.05) return "1/4";
  if (Math.abs(rounded - 0.75) < 0.05) return "3/4";
  if (Math.abs(rounded - 0.33) < 0.05) return "1/3";
  if (Math.abs(rounded - 0.67) < 0.05) return "2/3";
  if (rounded === Math.floor(rounded)) return rounded.toString();
  return rounded.toFixed(1).replace(/\.0$/, "");
}
