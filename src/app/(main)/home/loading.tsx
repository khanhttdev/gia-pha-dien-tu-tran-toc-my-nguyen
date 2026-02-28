import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Value Props Loading */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-border/50 text-center relative overflow-hidden">
        <Skeleton className="h-8 sm:h-10 w-3/4 max-w-xl mx-auto mb-4 bg-amber-500/20" />
        <Skeleton className="h-5 w-2/3 max-w-md mx-auto bg-amber-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Action Links */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 sm:h-32 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right Column Loading */}
        <div className="space-y-6 sm:space-y-8">
          {/* Stats Widget */}
          <div className="glass rounded-2xl p-6 border border-border/50">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>

          {/* Recent Updates */}
          <div className="glass rounded-2xl p-6 border border-border/50">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-surface/30"
                >
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
