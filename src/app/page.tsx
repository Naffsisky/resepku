import { getAllRecipes, getCategories, getApiStats } from "@/lib/api";
import HomeClient from "@/components/HomeClient";

// Revalidate every 60 seconds so stats & recipe counts stay fresh
export const revalidate = 60;

export default async function HomePage() {
  const [initialRecipes, initialCategories, initialStats] = await Promise.all([
    getAllRecipes(),
    getCategories(),
    getApiStats(),
  ]);

  return (
    <HomeClient
      initialRecipes={initialRecipes}
      initialCategories={initialCategories}
      initialStats={initialStats}
    />
  );
}
