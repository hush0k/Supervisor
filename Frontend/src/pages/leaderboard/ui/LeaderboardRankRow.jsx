import { LeaderboardAvatar } from './LeaderboardAvatar'

export function LeaderboardRankRow({ entry, index }) {
    const isEven = index % 2 === 0

    return (
        <div className={`flex items-center gap-4 px-6 py-3 border-b last:border-0 transition-colors hover:bg-accent/60 ${isEven ? 'bg-white' : 'bg-gray-50/50'}`}>
            <span className="w-6 text-center text-sm font-bold text-gray-400 shrink-0">
                {entry.rank_position}
            </span>

            <LeaderboardAvatar entry={entry} size="md" />

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                    {entry.user_first_name} {entry.user_last_name}
                </p>
                <p className="text-xs text-gray-400">
                    {Math.round(entry.success_rate)}% успешных задач
                </p>
            </div>

            <div className="flex flex-col items-end shrink-0">
                <span className="text-sm font-extrabold text-primary">
                    {entry.total_points.toLocaleString('ru-RU')}
                </span>
                <span className="text-xs text-gray-400">очков</span>
            </div>
        </div>
    )
}
