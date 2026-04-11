import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user/model/store'
import { tasksApi } from '@/shared/api/tasks'

function uniqueById(tasks) {
    const map = new Map()
    for (const task of tasks) {
        map.set(task.id, task)
    }
    return Array.from(map.values())
}

function sortByPriorityAndDeadline(tasks) {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return [...tasks].sort((a, b) => {
        const priorityDiff = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
        if (priorityDiff !== 0) return priorityDiff
        return new Date(a.deadline) - new Date(b.deadline)
    })
}

async function fetchUserTasks(userId) {
    const [availableRes, inProgressRes, completedRes, verifiedRes] = await Promise.allSettled([
        tasksApi.getAccessedTasks(userId),
        tasksApi.getTasksInProgress(userId),
        tasksApi.getTasksCompleted(userId),
        tasksApi.getVerifiedTasks(userId),
    ])

    const available = availableRes.status === 'fulfilled' ? availableRes.value : []
    const inProgress = inProgressRes.status === 'fulfilled' ? inProgressRes.value : []
    const completed = completedRes.status === 'fulfilled' ? completedRes.value : []
    const verified = verifiedRes.status === 'fulfilled' ? verifiedRes.value : []

    const byStatus = {
        available: sortByPriorityAndDeadline(available),
        in_progress: sortByPriorityAndDeadline(inProgress),
        completed: sortByPriorityAndDeadline(completed),
        verified: sortByPriorityAndDeadline(verified),
    }

    const all = sortByPriorityAndDeadline(uniqueById([
        ...byStatus.available,
        ...byStatus.in_progress,
        ...byStatus.completed,
        ...byStatus.verified,
    ]))

    return {
        byStatus,
        all,
        stats: {
            total: all.length,
            available: byStatus.available.length,
            in_progress: byStatus.in_progress.length,
            completed: byStatus.completed.length,
            verified: byStatus.verified.length,
        },
    }
}

export function useUserTasksBoard(enabled = true) {
    const userId = useAuthStore(s => s.user?.id)

    return useQuery({
        queryKey: ['user-tasks-board', userId],
        queryFn: () => fetchUserTasks(userId),
        enabled: !!userId && enabled,
        staleTime: 1000 * 60,
    })
}
