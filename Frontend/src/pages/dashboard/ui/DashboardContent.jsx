import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/entities/user/model/store'
import { useUserDashboard } from '@/features/statistics/useUserDashboard'
import { useDashboardTasks } from '@/features/tasks/useDashboardTasks'
import { DashboardPeriodSelector } from './DashboardPeriodSelector'
import { DashboardPointsChart } from './DashboardPointsChart'
import { DashboardTasksDonut } from './DashboardTasksDonut'
import { DashboardSuccessBar } from './DashboardSuccessBar'
import { DashboardPriorityTasks } from './DashboardPriorityTasks'
import { DashboardTaskPriorityChart } from './DashboardTaskPriorityChart'
import { DashboardDeadlineChart } from './DashboardDeadlineChart'
import { BsStars } from 'react-icons/bs'
import {
    FiArrowRight,
    FiBarChart2,
    FiCheckCircle,
    FiClock,
    FiDollarSign,
    FiTarget,
    FiTrendingUp,
    FiUsers,
} from 'react-icons/fi'

function SectionCard({ title, subtitle, children, className = '', bodyClassName = '' }) {
    return (
        <div className={`bg-white border p-4 flex flex-col ${className}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
                {subtitle ? <span className="text-[11px] text-gray-400">{subtitle}</span> : null}
            </div>
            <div className={`flex-1 ${bodyClassName}`}>{children}</div>
        </div>
    )
}

function AccentStat({ label, value, hint, icon, tone }) {
    const map = {
        blue: { text: 'text-blue-700', border: 'border-blue-200' },
        amber: { text: 'text-amber-700', border: 'border-amber-200' },
        emerald: { text: 'text-emerald-700', border: 'border-emerald-200' },
        rose: { text: 'text-rose-700', border: 'border-rose-200' },
    }
    const classes = map[tone] || map.blue

    return (
        <div className="border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className={`text-[10px] uppercase tracking-wider font-semibold ${classes.text}`}>{label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-gray-900 truncate">{value}</p>
                    {hint ? <p className="mt-1 text-xs text-gray-600 truncate">{hint}</p> : null}
                </div>
                <div className={`w-9 h-9 border bg-gray-50 flex items-center justify-center shrink-0 ${classes.border} ${classes.text}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-28 bg-white border animate-pulse" />
            ))}
        </div>
    )
}

const EMPTY_DASHBOARD_DATA = {
    tasks_in_progress: 0,
    current_month_points: 0,
    last_month_points: 0,
    leaderboard_position: null,
    tasks_available: 0,
    tasks_verified: 0,
    profit_for_period: 0,
    success_rate: 0,
    group_tasks_completed: 0,
    avg_team_size: 0,
    group_success_rate: 0,
}

function hasActivity(data) {
    if (!data) return false
    return (
        data.tasks_verified > 0 ||
        data.tasks_in_progress > 0 ||
        data.current_month_points > 0 ||
        data.tasks_available > 0 ||
        data.profit_for_period > 0
    )
}

function formatMoney(value) {
    return `${Math.round(value || 0).toLocaleString('ru-RU')} ₸`
}

export function DashboardContent() {
    const [period, setPeriod] = useState(30)
    const user = useAuthStore(s => s.user)
    const { data, isLoading, isError } = useUserDashboard(period)
    const { data: tasks = [], isLoading: tasksLoading } = useDashboardTasks()
    const dashboardData = data ?? EMPTY_DASHBOARD_DATA
    const userHasActivity = hasActivity(data)

    if (isLoading) {
        return <DashboardSkeleton />
    }

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                        <BsStars size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Добро пожаловать, {user?.first_name}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Личный дашборд: прогресс, задачи и заработок</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DashboardPeriodSelector value={period} onChange={setPeriod} />
                    <Link
                        to="/my-tasks"
                        className="inline-flex items-center gap-2 h-9 px-3 border bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700"
                    >
                        Мои задачи
                        <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
                <div className="border bg-white p-5">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Personal Snapshot</p>
                            <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                                {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Ваш профиль'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                                Ключевые показатели за выбранный период: очки, подтвержденные задачи, заработок и динамика прогресса.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-[240px]">
                            <div className="bg-white border p-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Очки за период</p>
                                <p className="text-lg font-extrabold mt-1 text-gray-900">
                                    {dashboardData.current_month_points.toLocaleString('ru-RU')}
                                </p>
                            </div>
                            <div className="bg-white border p-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Заработок</p>
                                <p className="text-lg font-extrabold mt-1 text-gray-900">
                                    {formatMoney(dashboardData.profit_for_period)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DashboardPriorityTasks tasks={tasks} isLoading={tasksLoading} />

                {isError && (
                    <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        Не удалось загрузить часть статистики. Показаны базовые значения.
                    </div>
                )}

                {!userHasActivity && (
                    <div className="bg-white border p-5 flex items-start gap-3 text-sm text-gray-600">
                        <FiBarChart2 size={18} className="text-primary mt-0.5 shrink-0" />
                        <p>
                            Здесь будет ваша личная статистика: очки, прогресс по задачам и место в рейтинге.
                            Возьмите первую задачу, чтобы начать наполнять дашборд.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <AccentStat
                        tone="amber"
                        icon={<FiTrendingUp size={16} />}
                        label="Очков за период"
                        value={dashboardData.current_month_points.toLocaleString('ru-RU')}
                        hint={`Прошлый период: ${dashboardData.last_month_points.toLocaleString('ru-RU')}`}
                    />
                    <AccentStat
                        tone="blue"
                        icon={<FiTarget size={16} />}
                        label="Место в рейтинге"
                        value={dashboardData.leaderboard_position ? `#${dashboardData.leaderboard_position}` : '—'}
                        hint="Текущий месяц"
                    />
                    <AccentStat
                        tone="emerald"
                        icon={<FiCheckCircle size={16} />}
                        label="Подтверждено"
                        value={dashboardData.tasks_verified}
                        hint={`Успешность: ${Math.round(dashboardData.success_rate || 0)}%`}
                    />
                    <AccentStat
                        tone="rose"
                        icon={<FiDollarSign size={16} />}
                        label="Заработано"
                        value={formatMoney(dashboardData.profit_for_period)}
                        hint="За выбранный период"
                    />
                    <AccentStat
                        tone="amber"
                        icon={<FiClock size={16} />}
                        label="В работе"
                        value={dashboardData.tasks_in_progress}
                        hint={`Доступно: ${dashboardData.tasks_available}`}
                    />
                    <AccentStat
                        tone="blue"
                        icon={<FiUsers size={16} />}
                        label="Групповых задач"
                        value={dashboardData.group_tasks_completed}
                        hint={`Ср. команда: ${(dashboardData.avg_team_size || 0).toFixed(1)}`}
                    />
                    <AccentStat
                        tone="emerald"
                        icon={<FiBarChart2 size={16} />}
                        label="Успешность"
                        value={`${Math.round(dashboardData.success_rate || 0)}%`}
                        hint="По всем задачам"
                    />
                    <AccentStat
                        tone="rose"
                        icon={<FiTrendingUp size={16} />}
                        label="Групповая успешность"
                        value={`${Math.round(dashboardData.group_success_rate || 0)}%`}
                        hint="Командные задачи"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                        <SectionCard
                            title="Динамика очков по месяцам"
                            subtitle="Последние периоды"
                            className="h-full lg:min-h-[470px]"
                            bodyClassName="h-full"
                        >
                            <DashboardPointsChart />
                        </SectionCard>
                    </div>

                    <SectionCard
                        title="Структура задач"
                        subtitle="Текущий период"
                        className="h-full lg:min-h-[470px]"
                        bodyClassName="h-full"
                    >
                        <DashboardTasksDonut data={dashboardData} />
                    </SectionCard>
                </div>

                <SectionCard title="Процент успешности">
                    <DashboardSuccessBar data={dashboardData} />
                </SectionCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <SectionCard title="Распределение задач по приоритетам" className="min-h-64">
                        <DashboardTaskPriorityChart tasks={tasks} />
                    </SectionCard>

                    <SectionCard title="Нагрузка по дедлайнам" className="min-h-64">
                        <DashboardDeadlineChart tasks={tasks} />
                    </SectionCard>
                </div>
            </div>
        </div>
    )
}
