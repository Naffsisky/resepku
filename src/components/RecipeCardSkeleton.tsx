export default function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-emerald-900/40 bg-white dark:bg-emerald-950/40 overflow-hidden shadow-xs animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-emerald-900/30" />

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 dark:bg-emerald-900/30 rounded-md" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-emerald-900/30 rounded-md" />
        </div>

        <div className="h-5 w-3/4 bg-gray-200 dark:bg-emerald-900/30 rounded-md" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-emerald-900/30 rounded-md" />

        <div className="pt-2 border-t border-gray-100 dark:border-emerald-900/30 flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 dark:bg-emerald-900/30 rounded-md" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-emerald-900/30 rounded-md" />
        </div>
      </div>
    </div>
  );
}
