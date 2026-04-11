import { PriorityTasksCarousel } from '@/shared/ui/PriorityTasksCarousel'

export function DashboardPriorityTasks({ tasks, isLoading }) {
    return (
        <PriorityTasksCarousel
            tasks={tasks}
            isLoading={isLoading}
            title="Приоритетные задачи"
            subtitle="Сначала критичные + дедлайн, затем дедлайн, затем критичные"
        />
    )
}
