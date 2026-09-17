import { getAllRecipesPaged, getCategories, getApiStats } from "@/lib/api";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  const [initialPaged, initialCategories, initialStats] = await Promise.all([
    getAllRecipesPaged(1, 24, "created_at", "desc"),
    getCategories(),
    getApiStats(),
  ]);

  return (
    <HomeClient
      initialRecipes={initialPaged.recipes}
      initialMeta={initialPaged.meta}
      initialCategories={initialCategories}
      initialStats={initialStats}
    />
  );
}
