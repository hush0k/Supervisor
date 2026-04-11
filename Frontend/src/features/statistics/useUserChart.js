import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user/model/store'
import { statisticsApi } from '@/shared/api/statistics'

export function useUserChart(metric = 'total_points') {
    const userId = useAuthStore(s => s.user?.id)

    return useQuery({
        queryKey: ['user-chart', userId, metric],
        queryFn: () => statisticsApi.getChart(userId, metric),
        enabled: !!userId,
        staleTime: 1000 * 15,
    })
}
