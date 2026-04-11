import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user/model/store'
import { tasksApi } from '@/shared/api/tasks'

const PRIORITY_ORDER = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
}

function priorityWeight(priority) {
    return PRIORITY_ORDER[priority] ?? 99
}

function deadlineTimestamp(deadline) {
    const ts = new Date(deadline).getTime()
    return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts
}

function sortByPriorityAndDeadline(a, b) {
    const priorityDiff = priorityWeight(a.priority) - priorityWeight(b.priority)
    if (priorityDiff !== 0) return priorityDiff

    const deadlineDiff = deadlineTimestamp(a.deadline) - deadlineTimestamp(b.deadline)
    if (deadlineDiff !== 0) return deadlineDiff

    return a.name.localeCompare(b.name)
}

function dedupeTasks(tasks) {
    const map = new Map()
    for (const task of tasks) {
        const prev = map.get(task.id)
        if (!prev) {
            map.set(task.id, task)
            continue
        }
        if (prev.task_step !== 'in_progress' && task.task_step === 'in_progress') {
            map.set(task.id, task)
        }
    }
    return Array.from(map.values())
}

async function fetchTasksForDashboard(userId) {
    const [availableRes, inProgressRes] = await Promise.allSettled([
        tasksApi.getAccessedTasks(userId),
        tasksApi.getTasksInProgress(userId),
    ])

    const available = availableRes.status === 'fulfilled' ? availableRes.value : []
    const inProgress = inProgressRes.status === 'fulfilled' ? inProgressRes.value : []

    const tasks = dedupeTasks([...inProgress, ...available]).sort(sortByPriorityAndDeadline)

    return tasks
}

export function useDashboardTasks(enabled = true) {
    const userId = useAuthStore(s => s.user?.id)

    return useQuery({
        queryKey: ['dashboard-tasks', userId],
        queryFn: () => fetchTasksForDashboard(userId),
        enabled: !!userId && enabled,
        staleTime: 1000 * 60,
    })
}
