import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/shared/api/tasks'

function isPriorityScopeTask(task) {
    return ['available', 'in_progress', 'completed'].includes(task.task_step)
}

export function useCompanyPriorityTasks() {
    return useQuery({
        queryKey: ['company-priority-tasks'],
        queryFn: async () => {
            const tasks = await tasksApi.getAll({ limit: 200 })
            return (tasks ?? []).filter(isPriorityScopeTask)
        },
        staleTime: 1000 * 60,
    })
}
