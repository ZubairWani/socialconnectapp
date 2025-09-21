import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader component that mimics the layout of a PostCard.
 * It provides a better user experience by showing a placeholder of the
 * content that is about to load.
 */
export function PostCardSkeleton() {
  return (
    <div className="p-4 flex gap-4 border-b w-full">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="w-full space-y-3">
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}