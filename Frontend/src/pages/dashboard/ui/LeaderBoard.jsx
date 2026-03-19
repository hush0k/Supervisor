import { useState } from 'react'
import { useLeaderboard } from '@/features/leaderboard/useLeaderboard'
import { useAuthStore } from '@/entities/user/model/store'

export function LeaderBoard() {
    const currentUser = useAuthStore(s => s.user)
    const [sortField, setSortField] = useState('total_points')
    const [sortOrder, setSortOrder] = useState('desc')

    const { data, isLoading, isError } = useLeaderboard({sort_field: sortField, sort_order: sortOrder})

    if (isLoading) return <div className="p-6">Загрузка...</div>
    if (isError) return <div className="p-6 text-destructive">Ошибка загрузки</div>

    return (
        <div>

        </div>
    )
}