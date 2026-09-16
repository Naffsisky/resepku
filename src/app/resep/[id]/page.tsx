import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipeById } from "@/lib/api";
import RecipeDetailView from "@/components/RecipeDetailView";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    return {
      title: "Resep Tidak Ditemukan - ResepKu",
    };
  }

  return {
    title: `${recipe.title} - ResepKu Nusantara`,
    description:
      recipe.description ||
      `Resep dan panduan memasak ${recipe.title} khas Nusantara dengan takaran dan langkah lengkap.`,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: recipe.image ? [{ url: recipe.image }] : [],
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return <RecipeDetailView recipe={recipe} />;
}
