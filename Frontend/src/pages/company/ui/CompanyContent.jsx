import { BsBuildingFill } from 'react-icons/bs'
import { FiBarChart2 } from 'react-icons/fi'
import { useCompanyOverview } from '@/features/company/useCompanyOverview'
import { DashboardContent } from '@/pages/dashboard/ui/DashboardContent'
import { CompanyKPIGrid } from '@/pages/company/ui/CompanyKPIGrid'
import { CompanyTasksChart } from '@/pages/company/ui/CompanyTasksChart'
import { CompanyDistributionPanel } from '@/pages/company/ui/CompanyDistributionPanel'

function SectionCard({ title, children }) {
    return (
        <div className="bg-white border">
            <div className="px-5 py-3 border-b bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
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
        data.monthly_task_stats.length > 0
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
    const { data, isLoading, isError } = useCompanyOverview()

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
                <div className="text-sm text-gray-500">
                    Дата основания: {new Date(data.company.date_established).toLocaleDateString('ru-RU')}
                </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
                <CompanyKPIGrid data={data} />

                <SectionCard title="Динамика выполнения задач по месяцам">
                    <CompanyTasksChart data={data.monthly_task_stats} />
                </SectionCard>

                <SectionCard title="Структура команды">
                    <CompanyDistributionPanel
                        roleDistribution={data.role_distribution}
                        positionDistribution={data.position_distribution}
                        employeesCount={data.employees_count}
                    />
                </SectionCard>

                <div className="bg-white border p-5 flex items-start gap-3 text-sm text-gray-600">
                    <FiBarChart2 size={18} className="text-primary mt-0.5 shrink-0" />
                    <p>
                        Описание: {data.company.description || 'Описание компании пока не заполнено.'}
                    </p>
                </div>
            </div>
        </div>
    )
}
