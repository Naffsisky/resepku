import { getLatestRecipes, getCategories, getApiStats } from "@/lib/api";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  const [initialRecipes, initialCategories, initialStats] = await Promise.all([
    getLatestRecipes(),
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
