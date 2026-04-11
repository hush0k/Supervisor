import { useMemo, useState } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { FiAlertTriangle, FiClock } from 'react-icons/fi'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/shared/ui/carousel'
import { TaskDetailsDialog } from '@/shared/ui/TaskDetailsDialog'

const PRIORITY_UI = {
    critical: { label: 'Критичный', className: 'bg-red-100 text-red-700' },
    high: { label: 'Высокий', className: 'bg-amber-100 text-amber-700' },
    medium: { label: 'Средний', className: 'bg-blue-100 text-blue-700' },
    low: { label: 'Низкий', className: 'bg-gray-100 text-gray-600' },
}

const STEP_UI = {
    in_progress: { label: 'В процессе', className: 'bg-amber-100 text-amber-700' },
    available: { label: 'Доступна', className: 'bg-emerald-100 text-emerald-700' },
    completed: { label: 'Ожидает проверки', className: 'bg-indigo-100 text-indigo-700' },
    verified: { label: 'Подтверждена', className: 'bg-emerald-100 text-emerald-700' },
    failed: { label: 'Отклонена', className: 'bg-rose-100 text-rose-700' },
}

const CITY_LABELS = {
    almaty: 'Алматы',
    astana: 'Астана',
    shymkent: 'Шымкент',
    karaganda: 'Қарағанды',
    aktobe: 'Ақтөбе',
    taraz: 'Тараз',
    pavlodar: 'Павлодар',
    oskemen: 'Өскемен',
    semey: 'Семей',
    kostanay: 'Қостанай',
    kyzylorda: 'Қызылорда',
    atyrau: 'Атырау',
    oral: 'Орал',
    petropavl: 'Петропавл',
    turkistan: 'Түркістан',
}

const PRIORITY_ORDER = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
}

function isValidDate(value) {
    if (!value) return false
    const ts = new Date(value).getTime()
    return !Number.isNaN(ts)
}

function deadlineTs(value) {
    const ts = new Date(value).getTime()
    return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts
}

function rankTask(task) {
    const critical = task.priority === 'critical'
    const hasDeadline = isValidDate(task.deadline)
    if (critical && hasDeadline) return 0
    if (hasDeadline) return 1
    if (critical) return 2
    return 3
}

function sortTaskForPriority(a, b) {
    const rankDiff = rankTask(a) - rankTask(b)
    if (rankDiff !== 0) return rankDiff

    const deadlineDiff = deadlineTs(a.deadline) - deadlineTs(b.deadline)
    if (deadlineDiff !== 0) return deadlineDiff

    const priorityDiff = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
    if (priorityDiff !== 0) return priorityDiff

    return (a.name || '').localeCompare(b.name || '')
}

function formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('ru-RU')
}

function cityLabel(value) {
    if (!value) return '—'
    return CITY_LABELS[value] || value
}

function daysLeft(deadline) {
    if (!deadline || !isValidDate(deadline)) return null
    const dayMs = 24 * 60 * 60 * 1000
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(deadline)
    target.setHours(0, 0, 0, 0)
    return Math.round((target.getTime() - now.getTime()) / dayMs)
}

function DeadlineBadge({ deadline }) {
    const left = daysLeft(deadline)
    if (left === null) return <span className="text-xs text-gray-500">Без дедлайна</span>
    if (left < 0) return <span className="text-xs font-semibold text-red-600">Просрочено</span>
    if (left === 0) return <span className="text-xs font-semibold text-red-600">Сегодня дедлайн</span>
    if (left <= 3) return <span className="text-xs font-semibold text-amber-600">Осталось {left} дн.</span>
    return <span className="text-xs text-gray-500">Осталось {left} дн.</span>
}

export function PriorityTasksCarousel({
    tasks = [],
    isLoading = false,
    title = 'Приоритетные задачи',
    subtitle = 'Сначала критичные + дедлайн, затем дедлайн, затем критичные',
}) {
    const [selectedTask, setSelectedTask] = useState(null)
    const visibleTasks = useMemo(() => {
        return [...tasks]
            .sort(sortTaskForPriority)
            .slice(0, 10)
    }, [tasks])

    if (isLoading) {
        return (
            <div className="bg-white border p-5 space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-24 bg-gray-100 animate-pulse" />
                ))}
            </div>
        )
    }

    if (!visibleTasks.length) {
        return (
            <div className="bg-white border p-6 flex items-center gap-3 text-sm text-gray-500">
                <FiAlertTriangle size={18} className="text-primary shrink-0" />
                <p>Список приоритетных задач появится здесь сразу после назначения задач.</p>
            </div>
        )
    }

    return (
        <div className="bg-white border">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-xs text-gray-500">{subtitle}</p>
            </div>

            <div className="p-4">
                <Carousel
                    opts={{ align: 'start', loop: true }}
                    plugins={[Autoplay({ delay: 3500, stopOnInteraction: false })]}
                    className="px-10"
                >
                    <CarouselContent>
                        {visibleTasks.map((task, idx) => {
                            const priority = PRIORITY_UI[task.priority] ?? PRIORITY_UI.medium
                            const step = STEP_UI[task.task_step] ?? STEP_UI.available
                            return (
                                <CarouselItem key={task.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTask(task)}
                                        className="w-full text-left border p-3 bg-white min-h-[128px] hover:border-primary/40 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm line-clamp-1">{task.name}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                                            </div>
                                            <div className="text-xs text-gray-400 shrink-0">#{idx + 1}</div>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            <span className={`px-2 py-0.5 text-xs font-medium ${priority.className}`}>
                                                {priority.label}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-medium ${step.className}`}>
                                                {step.label}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-xs">
                                            <span className="text-gray-500 inline-flex items-center gap-1">
                                                <FiClock size={12} />
                                                Дедлайн: {formatDate(task.deadline)}
                                            </span>
                                            <DeadlineBadge deadline={task.deadline} />
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Город: {cityLabel(task.city)}
                                        </div>
                                    </button>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="left-1 top-1/2 -translate-y-1/2 h-8 w-8" />
                    <CarouselNext className="right-1 top-1/2 -translate-y-1/2 h-8 w-8" />
                </Carousel>
            </div>

            <TaskDetailsDialog
                task={selectedTask}
                open={!!selectedTask}
                onOpenChange={open => !open && setSelectedTask(null)}
            />
        </div>
    )
}
