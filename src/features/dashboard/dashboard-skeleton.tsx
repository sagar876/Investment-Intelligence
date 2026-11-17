import { Skeleton } from "@/components/ui/skeleton"

export function BodySkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-lg bg-card shadow-card" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-[420px] rounded-lg bg-card shadow-card" />
          <Skeleton className="h-[380px] rounded-lg bg-card shadow-card" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-[460px] rounded-lg bg-card shadow-card" />
          <Skeleton className="h-[300px] rounded-lg bg-card shadow-card" />
        </div>
      </div>
    </div>
  )
}
