import { useUserDashboard } from '@/features/statistics/useUserDashboard'
import { useAuthStore } from '@/entities/user/model/store'
import { EmptyPageForAdmin } from '@/pages/dashboard/ui/EmptyPageForAdmin'
import { DashboardContent } from '@/pages/dashboard/ui/DashboardContent'
import { CompanyContent } from '@/pages/company/ui/CompanyContent'

function hasActivity(data) {
    if (!data) return false
    return (
        data.tasks_verified > 0 ||
        data.tasks_in_progress > 0 ||
        data.current_month_points > 0 ||
        data.tasks_available > 0
    )
}

export function MainBlock() {
    const role = useAuthStore(s => s.user?.role)
    const isManager = role === 'admin' || role === 'supervisor'
    const { data, isLoading } = useUserDashboard(30, !isManager)

    if (isManager) {
        return <CompanyContent fallbackToUserDashboard={false} />
    }

    if (isLoading) {
        return (
            <div className="flex flex-col w-full justify-center items-center">
                <div className="w-full max-w-4xl p-6 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 bg-white border animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (hasActivity(data)) {
        return <DashboardContent />
    }

    return (
        <div className="flex flex-col w-full justify-center items-center">
            <EmptyPageForAdmin />
        </div>
    )
}
