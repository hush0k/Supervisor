import axiosInstance from '@/shared/api/axios'

export const usersApi = {
    getById: (id) =>
        axiosInstance.get(`/user/${id}`).then(r => r.data),

    getEmployees: () =>
        axiosInstance.get('/user/my-employees').then(r => r.data),

    createUser: (data) =>
        axiosInstance.post('/user/create', data).then(r => r.data),

    updateUser: (id, data) =>
        axiosInstance.patch(`/user/${id}`, data).then(r => r.data),

    deleteUser: (id) =>
        axiosInstance.delete(`/user/${id}`),

    uploadAvatar: (id, file) => {
        const fd = new FormData()
        fd.append('file', file)
        return axiosInstance.post(`/user/${id}/avatar`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data)
    },

    deleteAvatar: (id) =>
        axiosInstance.delete(`/user/${id}/avatar`).then(r => r.data),

    getPositions: () =>
        axiosInstance.get('/position/').then(r => r.data),

    createPosition: (data) =>
        axiosInstance.post('/position/create', data).then(r => r.data),
}
