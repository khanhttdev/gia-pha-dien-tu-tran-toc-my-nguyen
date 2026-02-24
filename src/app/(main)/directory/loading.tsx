import { Skeleton } from '@/components/ui/skeleton'

export default function DirectoryLoading() {
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
                </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="glass rounded-2xl p-5 sm:p-6 border border-border/50 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                        {/* Header card */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-12 rounded-full ring-2 ring-background border border-amber-500/20" />
                                <div>
                                    <Skeleton className="h-5 w-32 mb-1" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>

                        {/* Info rows */}
                        <div className="space-y-3 mt-4">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-surface/30">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-surface/30">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-surface/30">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-5 pt-4 border-t border-border/30 grid grid-cols-3 gap-2">
                            <Skeleton className="h-9 rounded-xl" />
                            <Skeleton className="h-9 rounded-xl" />
                            <Skeleton className="h-9 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
