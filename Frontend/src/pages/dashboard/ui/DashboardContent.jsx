import { useState } from 'react'
import { useAuthStore } from '@/entities/user/model/store'
import { useUserDashboard } from '@/features/statistics/useUserDashboard'
import { useDashboardTasks } from '@/features/tasks/useDashboardTasks'
import { DashboardPeriodSelector } from './DashboardPeriodSelector'
import { DashboardKPIGrid } from './DashboardKPIGrid'
import { DashboardPointsChart } from './DashboardPointsChart'
import { DashboardTasksDonut } from './DashboardTasksDonut'
import { DashboardSuccessBar } from './DashboardSuccessBar'
import { DashboardPriorityTasks } from './DashboardPriorityTasks'
import { DashboardTaskPriorityChart } from './DashboardTaskPriorityChart'
import { DashboardDeadlineChart } from './DashboardDeadlineChart'
import { FiBarChart2 } from 'react-icons/fi'

function SectionCard({ title, children, className = '', bodyClassName = '' }) {
    return (
        <div className={`bg-white border flex flex-col ${className}`}>
            <div className="px-5 py-3 border-b flex items-center gap-2">
                <span className="w-0.5 h-3.5 bg-primary shrink-0" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</p>
            </div>
            <div className={`p-5 flex-1 ${bodyClassName}`}>{children}</div>
        </div>
    )
}

function KPISkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border p-5 h-24 animate-pulse">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-2 mt-1">
                            <div className="h-5 bg-gray-200 rounded w-16" />
                            <div className="h-3 bg-gray-100 rounded w-24" />
                        </div>
                    </div>
                </div>
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

export function DashboardContent() {
    const [period, setPeriod] = useState(30)
    const user = useAuthStore(s => s.user)
    const { data, isLoading, isError } = useUserDashboard(period)
    const { data: tasks = [], isLoading: tasksLoading } = useDashboardTasks()
    const dashboardData = data ?? EMPTY_DASHBOARD_DATA
    const userHasActivity = hasActivity(data)

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Добро пожаловать, {user?.first_name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Ваша статистика и прогресс</p>
                </div>
                <DashboardPeriodSelector value={period} onChange={setPeriod} />
            </div>

            <div className="flex flex-col gap-5 p-6">
                <DashboardPriorityTasks tasks={tasks} isLoading={tasksLoading} />

                {isLoading ? (
                    <KPISkeleton />
                ) : (
                    <>
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

                        <DashboardKPIGrid data={dashboardData} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2">
                                <SectionCard
                                    title="Динамика очков по месяцам"
                                    className="h-full lg:min-h-[470px]"
                                    bodyClassName="h-full"
                                >
                                    <DashboardPointsChart />
                                </SectionCard>
                            </div>

                            <SectionCard
                                title="Задачи"
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
                    </>
                )}
            </div>
        </div>
    )
}
