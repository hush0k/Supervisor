import axiosInstance from '@/shared/api/axios'

export const tasksApi = {
    getAll: (params = {}) => axiosInstance.get('/task/', { params }).then(r => r.data),
    getById: (id) => axiosInstance.get(`/task/${id}`).then(r => r.data),
    create: (task_in, task_operation_in = { accessed_users_ids: [], executors_ids: [] }) =>
        axiosInstance.post('/task/create', { task_in, task_operation_in }).then(r => r.data),
    update: (id, data) => axiosInstance.patch(`/task/${id}`, data).then(r => r.data),
    delete: (id) => axiosInstance.delete(`/task/${id}`),
    verify: (id) => axiosInstance.post(`/task/${id}/verify`).then(r => r.data),
    reject: (id) => axiosInstance.post(`/task/${id}/reject`).then(r => r.data),
}
