import { useQuery } from '@tanstack/react-query'
import { companyApi } from '@/shared/api/company'

export function useCompanyOverview(days = 30) {
    return useQuery({
        queryKey: ['company-overview', days],
        queryFn: () => companyApi.getMyCompanyOverview(days),
        staleTime: 1000 * 60 * 2,
    })
}
