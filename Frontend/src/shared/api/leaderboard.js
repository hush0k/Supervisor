import axiosInstance from '@/shared/api/axios'

export const leaderboardApi = {
    getLeaderBoard: (companyId, params = {}) =>
        axiosInstance.get(`/company_statistics/leaderboard/${companyId}`, { params })
            .then(r => r.data)
}