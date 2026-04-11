import { FiAlertTriangle, FiClock } from 'react-icons/fi'

const PRIORITY_UI = {
    critical: { label: 'Критичный', className: 'bg-red-100 text-red-700' },
    high: { label: 'Высокий', className: 'bg-amber-100 text-amber-700' },
    medium: { label: 'Средний', className: 'bg-blue-100 text-blue-700' },
    low: { label: 'Низкий', className: 'bg-gray-100 text-gray-600' },
}

const STEP_UI = {
    in_progress: { label: 'В процессе', className: 'bg-amber-100 text-amber-700' },
    available: { label: 'Доступна', className: 'bg-emerald-100 text-emerald-700' },
}

function formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('ru-RU')
}

function daysLeft(deadline) {
    const dayMs = 24 * 60 * 60 * 1000
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(deadline)
    target.setHours(0, 0, 0, 0)
    return Math.round((target.getTime() - now.getTime()) / dayMs)
}

function DeadlineBadge({ deadline }) {
    const left = daysLeft(deadline)
    if (left < 0) {
        return <span className="text-xs font-semibold text-red-600">Просрочено</span>
    }
    if (left === 0) {
        return <span className="text-xs font-semibold text-red-600">Сегодня дедлайн</span>
    }
    if (left <= 3) {
        return <span className="text-xs font-semibold text-amber-600">Осталось {left} дн.</span>
    }
    return <span className="text-xs text-gray-500">Осталось {left} дн.</span>
}

export function DashboardPriorityTasks({ tasks, isLoading }) {
    if (isLoading) {
        return (
            <div className="bg-white border p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-14 bg-gray-100 animate-pulse" />
                ))}
            </div>
        )
    }

    if (!tasks?.length) {
        return (
            <div className="bg-white border p-6 flex items-center gap-3 text-sm text-gray-500">
                <FiAlertTriangle size={18} className="text-primary shrink-0" />
                <p>Список приоритетных задач появится здесь сразу после назначения задач.</p>
            </div>
        )
    }

    const visibleTasks = tasks.slice(0, 6)

    return (
        <div className="bg-white border">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Приоритетные задачи
                </p>
                <p className="text-xs text-gray-500">Сначала критичные, затем по дедлайну</p>
            </div>

            <div className="p-4 space-y-3">
                {visibleTasks.map(task => {
                    const priority = PRIORITY_UI[task.priority] ?? PRIORITY_UI.medium
                    const step = STEP_UI[task.task_step] ?? STEP_UI.available

                    return (
                        <div key={task.id} className="border p-3 bg-white">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{task.name}</p>
                                    <p className="text-xs text-gray-500 mt-1 truncate">{task.description}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <span className={`px-2 py-0.5 text-xs font-medium ${priority.className}`}>
                                        {priority.label}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-medium ${step.className}`}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <span className="text-gray-500 inline-flex items-center gap-1">
                                    <FiClock size={12} />
                                    Дедлайн: {formatDate(task.deadline)}
                                </span>
                                <DeadlineBadge deadline={task.deadline} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
