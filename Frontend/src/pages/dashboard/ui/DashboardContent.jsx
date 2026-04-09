import { useState } from 'react'
import { useAuthStore } from '@/entities/user/model/store'
import { useUserDashboard } from '@/features/statistics/useUserDashboard'
import { DashboardPeriodSelector } from './DashboardPeriodSelector'
import { DashboardKPIGrid } from './DashboardKPIGrid'
import { DashboardPointsChart } from './DashboardPointsChart'
import { DashboardTasksDonut } from './DashboardTasksDonut'
import { DashboardSuccessBar } from './DashboardSuccessBar'

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

export function DashboardContent() {
    const [period, setPeriod] = useState(30)
    const user = useAuthStore(s => s.user)
    const { data, isLoading } = useUserDashboard(period)

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
                {isLoading ? (
                    <KPISkeleton />
                ) : data ? (
                    <>
                        <DashboardKPIGrid data={data} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2">
                                <SectionCard title="Динамика очков по месяцам">
                                    <DashboardPointsChart />
                                </SectionCard>
                            </div>

                            <SectionCard title="Задачи">
                                <DashboardTasksDonut data={data} />
                            </SectionCard>
                        </div>

                        <SectionCard title="Процент успешности">
                            <DashboardSuccessBar data={data} />
                        </SectionCard>
                    </>
                ) : null}
            </div>
        </div>
    )
}
