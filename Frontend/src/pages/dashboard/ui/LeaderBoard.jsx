import { useLeaderBoard } from '@/features/leaderboard/useLeaderBoard'
import { MdLeaderboard } from 'react-icons/md'

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

const AVATAR_COLORS = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500',
]

function avatarColor(id) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function getInitials(first, last) {
    return `${(first?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}`
}

export function LeaderBoard() {
    const { data, isLoading, isError } = useLeaderBoard({ sort_field: 'total_points', sort_order: 'desc', limit: 10 })

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3 px-4 pb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 h-10 animate-pulse">
                        <div className="w-5 h-5 bg-gray-200 rounded" />
                        <div className="w-8 h-8 bg-gray-200 rounded" />
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="h-3 bg-gray-200 rounded w-24" />
                            <div className="h-2.5 bg-gray-100 rounded w-16" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                <MdLeaderboard size={32} />
                <p className="text-xs text-center px-4">Не удалось загрузить лидерборд</p>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                <MdLeaderboard size={32} />
                <p className="text-xs text-center px-4">Пока нет данных — выполненные задачи появятся здесь</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1 pb-6">
            {data.map((entry) => (
                <div
                    key={entry.user_id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors"
                >
                    <span className="w-5 text-center text-sm shrink-0">
                        {MEDAL[entry.rank_position] ?? (
                            <span className="text-xs font-bold text-gray-400">{entry.rank_position}</span>
                        )}
                    </span>

                    {entry.avatar_url ? (
                        <img
                            src={entry.avatar_url}
                            alt=""
                            className="w-8 h-8 object-cover shrink-0"
                        />
                    ) : (
                        <div className={`w-8 h-8 shrink-0 flex items-center justify-center text-white text-xs font-bold ${avatarColor(entry.user_id)}`}>
                            {getInitials(entry.user_first_name, entry.user_last_name)}
                        </div>
                    )}

                    <div className="flex flex-col min-w-0">
                        <p className="font-semibold text-sm truncate leading-tight">
                            {entry.user_first_name} {entry.user_last_name}
                        </p>
                        <p className="text-xs text-gray-400">{entry.total_points} pts · {Math.round(entry.success_rate)}%</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
