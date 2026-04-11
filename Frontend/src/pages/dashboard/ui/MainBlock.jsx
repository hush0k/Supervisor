import { useAuthStore } from '@/entities/user/model/store'
import { EmptyPageForAdmin } from '@/pages/dashboard/ui/EmptyPageForAdmin'
import { DashboardContent } from '@/pages/dashboard/ui/DashboardContent'
import { ManagerDashboardContent } from '@/pages/dashboard/ui/ManagerDashboardContent'

export function MainBlock() {
    const role = useAuthStore(s => s.user?.role)
    const isManager = role === 'admin' || role === 'supervisor'

    if (isManager) {
        return <ManagerDashboardContent />
    }

    if (role === 'user' || role === 'head') {
        return <DashboardContent />
    }

    return <EmptyPageForAdmin />
}
