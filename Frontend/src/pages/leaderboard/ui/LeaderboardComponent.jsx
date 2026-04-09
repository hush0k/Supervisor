import { useState } from 'react'
import { MdLeaderboard } from 'react-icons/md'
import { useLeaderBoard } from '@/features/leaderboard/useLeaderBoard'
import { LeaderboardFilters } from './LeaderboardFilters'
import { LeaderboardPodium } from './LeaderboardPodium'
import { LeaderboardRankRow } from './LeaderboardRankRow'
import { LeaderboardStatsBar } from './LeaderboardStatsBar'
import { LeaderboardEmpty } from './LeaderboardEmpty'
import { LeaderboardPodiumSkeleton, LeaderboardRowSkeleton } from './LeaderboardSkeleton'

export function LeaderboardComponent() {
    const [limit, setLimit] = useState(10)
    const [sortOrder, setSortOrder] = useState('desc')

    const { data, isLoading, isError } = useLeaderBoard({
        sort_field: 'total_points',
        sort_order: sortOrder,
        limit,
    })

    const ranked = data ?? []
    const belowPodium = ranked.filter(e => e.rank_position > 3)

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                    <MdLeaderboard size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Таблица лидеров</h1>
                    <p className="text-sm text-gray-500">Рейтинг сотрудников по очкам за выполненные задачи</p>
                </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
                {isLoading ? null : isError ? null : ranked.length > 0 && (
                    <LeaderboardStatsBar data={ranked} />
                )}

                <LeaderboardFilters
                    limit={limit}
                    onLimitChange={setLimit}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                />

                {isError && (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400 bg-white border">
                        <MdLeaderboard size={40} />
                        <p className="text-sm">Не удалось загрузить данные</p>
                    </div>
                )}

                {isLoading && (
                    <div className="bg-white border">
                        <LeaderboardPodiumSkeleton />
                        <div className="divide-y">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <LeaderboardRowSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                )}

                {!isLoading && !isError && ranked.length === 0 && <LeaderboardEmpty />}

                {!isLoading && !isError && ranked.length > 0 && (
                    <>
                        <LeaderboardPodium data={ranked} />

                        {belowPodium.length > 0 && (
                            <div className="bg-white border">
                                <div className="px-6 py-3 border-b bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Остальные участники
                                    </p>
                                </div>
                                {belowPodium.map((entry, idx) => (
                                    <LeaderboardRankRow key={entry.user_id} entry={entry} index={idx} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
