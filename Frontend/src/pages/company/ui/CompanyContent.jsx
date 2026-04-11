import { useState } from 'react'
import { BsBuildingFill } from 'react-icons/bs'
import { useCompanyOverview } from '@/features/company/useCompanyOverview'
import { useCompanyPriorityTasks } from '@/features/tasks/useCompanyPriorityTasks'
import { DashboardContent } from '@/pages/dashboard/ui/DashboardContent'
import { DashboardPeriodSelector } from '@/pages/dashboard/ui/DashboardPeriodSelector'
import { CompanyKPIGrid } from '@/pages/company/ui/CompanyKPIGrid'
import { CompanyTasksChart } from '@/pages/company/ui/CompanyTasksChart'
import { CompanyDistributionPanel } from '@/pages/company/ui/CompanyDistributionPanel'
import { CompanyCompensationChart } from '@/pages/company/ui/CompanyCompensationChart'
import { CompanyFinanceSummary } from '@/pages/company/ui/CompanyFinanceSummary'
import { CompanyPositionsPanel } from '@/pages/company/ui/CompanyPositionsPanel'
import { PriorityTasksCarousel } from '@/shared/ui/PriorityTasksCarousel'

function SectionCard({ title, children, action }) {
    return (
        <div className="bg-white border">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                {action}
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}

function Skeleton() {
    return (
        <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-24 bg-white border animate-pulse" />
            ))}
        </div>
    )
}

function hasCompanyStats(data) {
    if (!data) return false
    return (
        data.tasks_total > 0 ||
        data.tasks_verified > 0 ||
        data.tasks_failed > 0 ||
        (data.monthly_task_stats?.length ?? 0) > 0 ||
        (data.monthly_compensation_stats?.length ?? 0) > 0
    )
}

function CompanyFallbackState() {
    return (
        <div className="w-full p-6">
            <div className="bg-white border p-6">
                <h2 className="text-xl font-extrabold">Статистика компании недоступна</h2>
                <p className="text-sm text-gray-500 mt-2">Попробуйте позже или проверьте, что у пользователя есть привязка к компании.</p>
            </div>
        </div>
    )
}

export function CompanyContent({ fallbackToUserDashboard = true }) {
    const [period, setPeriod] = useState(30)
    const { data, isLoading, isError } = useCompanyOverview(period)
    const {
        data: priorityTasks = [],
        isLoading: isPriorityTasksLoading,
    } = useCompanyPriorityTasks()

    if (isLoading) return <Skeleton />

    if (isError || !data) {
        if (!fallbackToUserDashboard) return <CompanyFallbackState />
        return <DashboardContent />
    }

    if (fallbackToUserDashboard && !hasCompanyStats(data)) {
        return <DashboardContent />
    }

    return (
        <div className="flex flex-col w-full min-h-full">
            {/* Header */}
            <div className="bg-white border-b px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                        <BsBuildingFill size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">{data.company.name}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Полная статистика вашей компании</p>
                    </div>
                </div>
                <DashboardPeriodSelector value={period} onChange={setPeriod} />
            </div>

            <div className="flex flex-col gap-5 p-6">
                <CompanyKPIGrid data={data} />

                <PriorityTasksCarousel
                    tasks={priorityTasks}
                    isLoading={isPriorityTasksLoading}
                    title="Приоритетные задачи компании"
                    subtitle="Максимум 10 задач: критичные + дедлайн, затем дедлайн, затем критичные"
                />

                <SectionCard title="Финансовая сводка">
                    <CompanyFinanceSummary data={data} />
                </SectionCard>

                <SectionCard title="Динамика зарплат и бонусов">
                    <CompanyCompensationChart data={data.monthly_compensation_stats} />
                </SectionCard>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                        <SectionCard title="Динамика задач по периоду">
                            <CompanyTasksChart data={data.monthly_task_stats} />
                        </SectionCard>
                    </div>
                    <SectionCard title="О компании">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Основана</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {new Date(data.company.date_established).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            {data.company.description && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Описание</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">{data.company.description}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Сотрудников</p>
                                <p className="text-2xl font-extrabold text-gray-800">{data.employees_count}</p>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                <SectionCard title="Структура команды">
                    <CompanyDistributionPanel
                        roleDistribution={data.role_distribution}
                        positionDistribution={data.position_distribution}
                        employeesCount={data.employees_count}
                    />
                </SectionCard>

                <SectionCard title="Должности и бригадиры">
                    <CompanyPositionsPanel />
                </SectionCard>
            </div>
        </div>
    )
}
