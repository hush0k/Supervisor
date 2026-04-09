import { DashboardKPICard } from './DashboardKPICard'
import { FiAward, FiCheckCircle, FiTrendingUp, FiDollarSign, FiClock, FiUsers } from 'react-icons/fi'
import { MdLeaderboard } from 'react-icons/md'
import { BiTask } from 'react-icons/bi'

export function DashboardKPIGrid({ data }) {
    const pointsDelta = data.current_month_points - data.last_month_points

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardKPICard
                icon={<FiAward size={20} />}
                label="Очков за месяц"
                value={data.current_month_points.toLocaleString('ru-RU')}
                trend={pointsDelta}
                trendSuffix=" vs прошлый"
                sub={`Прошлый месяц: ${data.last_month_points.toLocaleString('ru-RU')}`}
                accent="bg-amber-100 text-amber-600"
            />

            <DashboardKPICard
                icon={<MdLeaderboard size={20} />}
                label="Место в рейтинге"
                value={data.leaderboard_position ? `#${data.leaderboard_position}` : '—'}
                sub="Текущий месяц"
                accent="bg-violet-100 text-violet-600"
            />

            <DashboardKPICard
                icon={<FiCheckCircle size={20} />}
                label="Подтверждено"
                value={data.tasks_verified}
                sub={`Успешность: ${Math.round(data.success_rate)}%`}
                accent="bg-emerald-100 text-emerald-600"
            />

            <DashboardKPICard
                icon={<FiDollarSign size={20} />}
                label="Заработано (₸)"
                value={data.profit_for_period.toLocaleString('ru-RU')}
                accent="bg-blue-100 text-blue-600"
            />

            <DashboardKPICard
                icon={<FiClock size={20} />}
                label="В процессе"
                value={data.tasks_in_progress}
                sub="Активных задач"
                accent="bg-orange-100 text-orange-600"
            />

            <DashboardKPICard
                icon={<BiTask size={20} />}
                label="Доступно"
                value={data.tasks_available}
                sub="Можно взять"
            />

            <DashboardKPICard
                icon={<FiUsers size={20} />}
                label="Групповых задач"
                value={data.group_tasks_completed}
                sub={`Ср. размер команды: ${data.avg_team_size.toFixed(1)}`}
                accent="bg-cyan-100 text-cyan-600"
            />

            <DashboardKPICard
                icon={<FiTrendingUp size={20} />}
                label="Успех в группе"
                value={`${Math.round(data.group_success_rate)}%`}
                sub="Групповые задачи"
                accent="bg-rose-100 text-rose-600"
            />
        </div>
    )
}
