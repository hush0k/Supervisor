import axiosInstance from '@/shared/api/axios'

export const companyApi = {
    getMyCompanyOverview: (days = 30) =>
        axiosInstance.get('/company/my-company/overview', { params: { days } }).then(r => r.data),
}
