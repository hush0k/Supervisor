import axiosInstance from '@/shared/api/axios'

export const companyApi = {
    getMyCompanyOverview: () =>
        axiosInstance.get('/company/my-company/overview').then(r => r.data),
}
