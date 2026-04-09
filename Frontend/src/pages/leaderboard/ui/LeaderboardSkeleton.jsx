export function LeaderboardPodiumSkeleton() {
    return (
        <div className="flex items-end justify-center gap-4 py-10">
            {[80, 112, 64].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div style={{ height: h }} className="w-24 bg-gray-200 animate-pulse" />
                </div>
            ))}
        </div>
    )
}

export function LeaderboardRowSkeleton() {
    return (
        <div className="flex items-center gap-4 px-6 py-3 border-b last:border-0">
            <div className="w-6 h-4 bg-gray-200 rounded animate-pulse shrink-0" />
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
            </div>
            <div className="h-3.5 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
    )
}
