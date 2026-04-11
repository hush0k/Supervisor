import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user/model/store'
import { DashboardPeriodSelector } from '@/pages/dashboard/ui/DashboardPeriodSelector'
import { ProfileHeroCard } from '@/pages/profile/ui/ProfileHeroCard.jsx'
import { ProfileIdentityPanel } from '@/pages/profile/ui/ProfileIdentityPanel.jsx'
import { ProfileKPIGrid } from '@/pages/profile/ui/ProfileKPIGrid.jsx'
import { ProfileSectionCard } from '@/pages/profile/ui/ProfileSectionCard.jsx'
import { ProfilePointsTrendChart } from '@/pages/profile/ui/ProfilePointsTrendChart.jsx'
import { ProfileTaskFlow } from '@/pages/profile/ui/ProfileTaskFlow.jsx'
import { ProfileProgressPanel } from '@/pages/profile/ui/ProfileProgressPanel.jsx'
import { ProfileQuickActions } from '@/pages/profile/ui/ProfileQuickActions.jsx'
import { usersApi } from '@/shared/api/users'
import { statisticsApi } from '@/shared/api/statistics'

const EMPTY_DASHBOARD = {
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

function PageSkeleton() {
    return (
        <div className="p-6 space-y-4">
            <div className="h-28 bg-white border animate-pulse" />
            <div className="h-28 bg-white border animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white border animate-pulse" />)}
            </div>
            <div className="h-80 bg-white border animate-pulse" />
        </div>
    )
}

export function ProfileContent() {
    const [period, setPeriod] = useState(30)
    const authUser = useAuthStore(s => s.user)
    const { userId } = useParams()
    const parsedUserId = userId ? Number(userId) : null
    const hasUserIdParam = typeof userId === 'string'
    const hasValidUserId = parsedUserId !== null && Number.isFinite(parsedUserId) && parsedUserId > 0
    const targetUserId = hasValidUserId ? parsedUserId : authUser?.id
    const isOwnProfile = !hasValidUserId || targetUserId === authUser?.id
    const isManager = authUser?.role === 'admin' || authUser?.role === 'supervisor'

    const userQuery = useQuery({
        queryKey: ['profile-user', targetUserId],
        queryFn: () => usersApi.getById(targetUserId),
        enabled: !!targetUserId && !isOwnProfile,
    })

    const dashboardQuery = useQuery({
        queryKey: ['profile-dashboard', targetUserId, period],
        queryFn: () => statisticsApi.getDashboard(targetUserId, period),
        enabled: !!targetUserId,
    })

    const chartQuery = useQuery({
        queryKey: ['profile-chart', targetUserId],
        queryFn: () => statisticsApi.getChart(targetUserId, 'total_points'),
        enabled: !!targetUserId,
    })

    const viewedUser = isOwnProfile ? authUser : userQuery.data
    const isLoading = (!isOwnProfile && userQuery.isLoading) || dashboardQuery.isLoading || chartQuery.isLoading
    const dashboardData = dashboardQuery.data ?? EMPTY_DASHBOARD
    const points = useMemo(() => chartQuery.data?.data ?? [], [chartQuery.data])

    if (hasUserIdParam && !hasValidUserId) {
        return <div className="p-6 text-sm text-red-500">Некорректный ID пользователя</div>
    }

    if (!targetUserId) {
        return <div className="p-6 text-sm text-red-500">Не удалось определить пользователя</div>
    }

    if (isLoading) return <PageSkeleton />

    if (!viewedUser) {
        return <div className="p-6 text-sm text-red-500">Профиль пользователя не найден</div>
    }

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        {isOwnProfile ? 'Мой профиль' : `Профиль: ${viewedUser.last_name} ${viewedUser.first_name}`}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Подробная аналитика личного прогресса и эффективности
                    </p>
                </div>
                <DashboardPeriodSelector value={period} onChange={setPeriod} />
            </div>

            <div className="p-6 flex flex-col gap-5">
                <ProfileHeroCard user={viewedUser} />

                <ProfileSectionCard title="Личные данные" subtitle="Базовая информация">
                    <ProfileIdentityPanel user={viewedUser} />
                </ProfileSectionCard>

                <ProfileKPIGrid data={dashboardData} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <ProfileSectionCard
                        title="Динамика очков"
                        subtitle="По месяцам"
                        className="xl:col-span-2 min-h-[470px]"
                        bodyClassName="h-full"
                    >
                        <ProfilePointsTrendChart points={points} isLoading={chartQuery.isLoading} />
                    </ProfileSectionCard>

                    <ProfileSectionCard title="Индикаторы прогресса" subtitle="Проценты и KPI" className="min-h-[470px]">
                        <ProfileProgressPanel data={dashboardData} />
                    </ProfileSectionCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <ProfileSectionCard title="Поток задач" subtitle="Доступные, в работе, подтвержденные">
                        <ProfileTaskFlow data={dashboardData} />
                    </ProfileSectionCard>

                    <ProfileSectionCard title="Быстрые действия" subtitle="Навигация по ключевым разделам">
                        <ProfileQuickActions isManager={isManager} />
                    </ProfileSectionCard>
                </div>
            </div>
        </div>
    )
}
