import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user/model/store'
import { tasksApi } from '@/shared/api/tasks'

function sortByDeadline(tasks) {
    return [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
}

export function useUserActiveTasks(enabled = true) {
    const userId = useAuthStore(s => s.user?.id)

    return useQuery({
        queryKey: ['user-active-tasks', userId],
        queryFn: async () => {
            const tasks = await tasksApi.getTasksInProgress(userId)
            return sortByDeadline(tasks ?? [])
        },
        enabled: !!userId && enabled,
        staleTime: 1000 * 60,
    })
}
