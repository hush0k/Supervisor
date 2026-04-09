import { MdLeaderboard } from 'react-icons/md'
import { FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi'

function StatCard({ icon, label, value, accent }) {
    return (
        <div className="bg-white border p-4 flex items-center gap-4">
            <div className={`flex items-center justify-center w-11 h-11 shrink-0 ${accent ?? 'bg-primary/10 text-primary'}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-xl font-extrabold leading-tight">{value}</p>
            </div>
        </div>
    )
}

export function LeaderboardStatsBar({ data }) {
    const totalParticipants = data.length
    const totalPoints = data.reduce((sum, e) => sum + e.total_points, 0)
    const avgSuccess = data.length
        ? Math.round(data.reduce((sum, e) => sum + e.success_rate, 0) / data.length)
        : 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
                icon={<FiUsers size={20} />}
                label="Участников"
                value={totalParticipants}
            />
            <StatCard
                icon={<FiAward size={20} />}
                label="Всего очков"
                value={totalPoints.toLocaleString('ru-RU')}
                accent="bg-amber-100 text-amber-600"
            />
            <StatCard
                icon={<FiTrendingUp size={20} />}
                label="Ср. успешность"
                value={`${avgSuccess}%`}
                accent="bg-emerald-100 text-emerald-600"
            />
        </div>
    )
}
