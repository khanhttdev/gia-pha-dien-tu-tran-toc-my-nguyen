import { Skeleton } from "@/components/ui/skeleton";

export default function PeopleLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20" />
          <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
          <Skeleton className="h-10 w-10 sm:w-32 rounded-xl" />
        </div>
      </div>

      {/* Content List */}
      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 bg-muted/30 border-b flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24 hidden sm:block" />
        </div>
        <div className="divide-y divide-border/30">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 sm:w-48 mb-2" />
                  <Skeleton className="h-4 w-24 sm:w-32" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 sm:w-20 rounded-lg hidden sm:block" />
                <Skeleton className="h-8 w-8 sm:w-20 rounded-lg hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
