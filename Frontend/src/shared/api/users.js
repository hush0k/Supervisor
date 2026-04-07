import axiosInstance from '@/shared/api/axios'

export const usersApi = {
    getEmployees: () => axiosInstance.get('/user/my-employees').then(r => r.data),
    createUser: (data) => axiosInstance.post('/user/create', data).then(r => r.data),
    updateUser: (id, data) => axiosInstance.patch(`/user/${id}`, data).then(r => r.data),
    deleteUser: (id) => axiosInstance.delete(`/user/${id}`),
}
