import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar skeleton */}
      <div className="w-[260px] border-r bg-sidebar-background p-3 space-y-4 hidden md:block">
        <div className="flex items-center gap-2.5 px-1 mb-6">
          <Skeleton className="h-8 w-8 rounded-md bg-sidebar-muted" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 bg-sidebar-muted" />
            <Skeleton className="h-2.5 w-14 bg-sidebar-muted" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md bg-sidebar-muted" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center gap-3 border-b px-4">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2.5 w-48 hidden sm:block" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </main>
      </div>
    </div>
  );
}
