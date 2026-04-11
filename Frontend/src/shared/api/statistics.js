import axiosInstance from '@/shared/api/axios'

export const statisticsApi = {
    getDashboard: (userId, periodType) =>
        axiosInstance.get(`/user_statistics/dashboard/${userId}`, { params: { period_type: periodType } })
            .then(r => r.data),

    getChart: (userId, metric = 'total_points') =>
        axiosInstance.get(`/user_statistics/chart/${userId}`, { params: { metric } })
            .then(r => r.data),

    getTaskPointsHistoryAll: () =>
        axiosInstance.get('/task_points_history/all').then(r => r.data),

    getTaskPointsHistoryByUser: (userId) =>
        axiosInstance.get(`/task_points_history/user/${userId}`).then(r => r.data),
}
