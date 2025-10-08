import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  count?: number
  compact?: boolean
  className?: string
}

export default function LoadingSkeleton({ count = 8, compact = false, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-2 md:mb-4" />
          <div className={cn("bg-gray-200 rounded mb-1 md:mb-2", compact ? "h-3 md:h-4" : "h-4")} />
          <div className={cn("bg-gray-200 rounded w-1/2", compact ? "h-3 md:h-4" : "h-4")} />
        </div>
      ))}
    </div>
  )
}
