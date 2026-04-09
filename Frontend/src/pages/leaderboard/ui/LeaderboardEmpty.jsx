import { MdLeaderboard } from 'react-icons/md'

export function LeaderboardEmpty() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <MdLeaderboard size={48} />
            <p className="text-sm font-medium">Пока нет данных</p>
            <p className="text-xs text-center max-w-xs">
                Выполненные задачи сотрудников появятся здесь
            </p>
        </div>
    )
}
