import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user/model/store'
import { statisticsApi } from '@/shared/api/statistics'

export function useUserDashboard(periodType = 30, enabled = true) {
    const userId = useAuthStore(s => s.user?.id)

    return useQuery({
        queryKey: ['user-dashboard', userId, periodType],
        queryFn: () => statisticsApi.getDashboard(userId, periodType),
        enabled: !!userId && enabled,
        staleTime: 1000 * 60 * 2,
    })
}
