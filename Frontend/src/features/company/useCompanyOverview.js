import { useQuery } from '@tanstack/react-query'
import { companyApi } from '@/shared/api/company'

export function useCompanyOverview() {
    return useQuery({
        queryKey: ['company-overview'],
        queryFn: companyApi.getMyCompanyOverview,
        staleTime: 1000 * 60 * 2,
    })
}
