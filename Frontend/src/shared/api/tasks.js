import axiosInstance from '@/shared/api/axios'

export const tasksApi = {
    getAll: (params = {}) => axiosInstance.get('/task/', { params }).then(r => r.data),
    getById: (id) => axiosInstance.get(`/task/${id}`).then(r => r.data),
    getParticipants: (id) => axiosInstance.get(`/task/${id}/participants`).then(r => r.data),
    create: (task_in, task_operation_in = { accessed_users_ids: [], executors_ids: [] }) =>
        axiosInstance.post('/task/create', { task_in, task_operation_in }).then(r => r.data),
    update: (id, data) => axiosInstance.patch(`/task/${id}`, data).then(r => r.data),
    getAccessedUsers: (id) => axiosInstance.get(`/task/${id}/accessed-users`).then(r => r.data),
    updateAccessedUsers: (id, accessed_users_ids = []) =>
        axiosInstance.patch(`/task/${id}/accessed-users`, { accessed_users_ids }).then(r => r.data),
    delete: (id) => axiosInstance.delete(`/task/${id}`),
    completeTask: (id) => axiosInstance.post(`/task/${id}/complete`).then(r => r.data),
    verify: (id) => axiosInstance.post(`/task/${id}/verify`).then(r => r.data),
    reject: (id) => axiosInstance.post(`/task/${id}/reject`).then(r => r.data),
    takeTask: (id, executors_ids = []) => axiosInstance.post(`/task/${id}/take`, { executors_ids }).then(r => r.data),
    getAccessedTasks: (userId) => axiosInstance.get(`/task/${userId}/accessed-tasks`).then(r => r.data),
    getTasksInProgress: (userId) => axiosInstance.get(`/task/${userId}/tasks-in-progress`).then(r => r.data),
    getTasksCompleted: (userId) => axiosInstance.get(`/task/${userId}/tasks-completed`).then(r => r.data),
    getVerifiedTasks: (userId) => axiosInstance.get(`/task/${userId}/verified-tasks`).then(r => r.data),
}
