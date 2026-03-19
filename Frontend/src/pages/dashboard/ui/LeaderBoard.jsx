import { useState } from 'react'
import { useLeaderBoard } from '@/features/leaderboard/useLeaderBoard'
import { useAuthStore } from '@/entities/user/model/store'

export function LeaderBoard() {
    const currentUser = useAuthStore(s => s.user)
    const [sortField, setSortField] = useState('total_points')
    const [sortOrder, setSortOrder] = useState('desc')

    const { data, isLoading, isError } = useLeaderBoard({sort_field: sortField, sort_order: sortOrder, limit: 10})

    if (isLoading) return <div className="p-6">Загрузка...</div>
    if (isError) return <div className="p-6 text-destructive-foreground">Ошибка загрузки</div>

    return (
        <div className="flex flex-col space-y-4 mb-10 text-sm">
            {data?.map((entry) => (
                <div key={entry.user_id} className="flex flex-row h-10 px-[16px] gap-4">
                    <div className="flex items-center font-bold text-muted-foreground">
                        {entry.rank_position}
                    </div>

                    <div className="h-full">
                        <img src={entry?.avatar_url} alt="avatar" className="h-full" />
                    </div>

                    <div className="flex flex-col">
                        <p className="font-bold">{entry.user_first_name} {entry.user_last_name}</p>
                        <p className="text-muted-foreground">{entry.total_points} pts</p>
                    </div>


                </div>
            ))}
        </div>
    )
}