import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user/model/store'
import { leaderboardApi } from '@/shared/api/leaderboard'

export function useLeaderBoard(filters = {}) {
    const companyId = useAuthStore(s => s.user?.company_id)

    return useQuery({
        queryKey: ['leaderboard', companyId, filters],
        queryFn: () => leaderboardApi.getLeaderBoard(companyId, filters),
        enabled: !!companyId,
        staleTime: 1000 * 60 * 5
    })
}