import { useMemo, useState } from 'react'
import { BiTask } from 'react-icons/bi'
import { FiCalendar, FiCheckCircle, FiSearch } from 'react-icons/fi'
import { useUserActiveTasks } from '@/features/tasks/useUserActiveTasks'
import { tasksApi } from '@/shared/api/tasks'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { DashboardTaskPriorityChart } from '@/pages/dashboard/ui/DashboardTaskPriorityChart'
import { DashboardDeadlineChart } from '@/pages/dashboard/ui/DashboardDeadlineChart'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/ui/dialog'

const PRIORITY_UI = {
    critical: { label: 'Критичный', className: 'bg-red-100 text-red-700' },
    high: { label: 'Высокий', className: 'bg-amber-100 text-amber-700' },
    medium: { label: 'Средний', className: 'bg-blue-100 text-blue-700' },
    low: { label: 'Низкий', className: 'bg-gray-100 text-gray-600' },
}

function formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('ru-RU')
}

function daysLeft(deadline) {
    const oneDay = 24 * 60 * 60 * 1000
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(deadline)
    target.setHours(0, 0, 0, 0)
    return Math.round((target.getTime() - now.getTime()) / oneDay)
}

export function ActiveTasksContent() {
    const [search, setSearch] = useState('')
    const [actionError, setActionError] = useState('')
    const [completingId, setCompletingId] = useState(null)
    const [selectedTask, setSelectedTask] = useState(null)
    const [completeTarget, setCompleteTarget] = useState(null)
    const { data = [], isLoading, isError, refetch } = useUserActiveTasks()

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return data
        return data.filter(task =>
            task.name.toLowerCase().includes(q) ||
            task.description.toLowerCase().includes(q)
        )
    }, [data, search])

    async function handleComplete(task) {
        try {
            setActionError('')
            setCompletingId(task.id)
            await tasksApi.completeTask(task.id)
            setCompleteTarget(null)
            setSelectedTask(null)
            await refetch()
        } catch (e) {
            const detail = e.response?.data?.detail
            setActionError(detail || 'Не удалось завершить задачу')
        } finally {
            setCompletingId(null)
        }
    }

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                        <BiTask size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Активные задачи</h1>
                        <p className="text-sm text-gray-500">Задачи, которые сейчас у вас в работе</p>
                    </div>
                </div>
                <div className="text-sm text-gray-500 inline-flex items-center gap-2">
                    <FiCheckCircle size={14} className="text-primary" />
                    Завершайте задачи сразу после выполнения
                </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
                {actionError && (
                    <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                <div className="bg-white border p-4">
                    <Input
                        placeholder="Поиск по названию или описанию..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 text-sm"
                        icon={<FiSearch size={14} />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white border">
                        <div className="px-5 py-3 border-b bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Приоритеты активных задач
                            </p>
                        </div>
                        <div className="p-5">
                            <DashboardTaskPriorityChart tasks={filtered} />
                        </div>
                    </div>

                    <div className="bg-white border">
                        <div className="px-5 py-3 border-b bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Ближайшие дедлайны
                            </p>
                        </div>
                        <div className="p-5">
                            <DashboardDeadlineChart tasks={filtered} />
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="h-40 bg-white border animate-pulse" />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="bg-white border p-8 text-center text-sm text-red-600">
                        Не удалось загрузить активные задачи. Попробуйте обновить страницу.
                    </div>
                )}

                {!isLoading && !isError && filtered.length === 0 && (
                    <div className="bg-white border p-10 text-center">
                        <p className="text-lg font-bold">Активных задач нет</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Когда вы возьмете задачу в работу, она появится здесь.
                        </p>
                    </div>
                )}

                {!isLoading && !isError && filtered.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filtered.map(task => {
                            const priority = PRIORITY_UI[task.priority] ?? PRIORITY_UI.medium
                            const left = daysLeft(task.deadline)
                            return (
                                <article key={task.id} className="bg-white border p-4 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-bold text-base leading-tight">{task.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-semibold ${priority.className}`}>
                                            {priority.label}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-3 min-h-[3.75rem]">{task.description}</p>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="inline-flex items-center gap-1 text-gray-500">
                                            <FiCalendar size={13} />
                                            Дедлайн: {formatDate(task.deadline)}
                                        </span>
                                        {left < 0 ? (
                                            <span className="font-semibold text-red-600">Просрочено</span>
                                        ) : left === 0 ? (
                                            <span className="font-semibold text-red-600">Сегодня</span>
                                        ) : left <= 3 ? (
                                            <span className="font-semibold text-amber-600">{left} дн.</span>
                                        ) : (
                                            <span className="text-gray-500">{left} дн.</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                                            Посмотреть
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => setCompleteTarget(task)}
                                            disabled={completingId === task.id}
                                        >
                                            {completingId === task.id ? 'Завершение...' : 'Завершить'}
                                        </Button>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>

            <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold">{selectedTask?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTask?.description}</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 border p-3">
                                <p className="text-xs text-gray-500">Дедлайн</p>
                                <p className="font-semibold">{formatDate(selectedTask?.deadline)}</p>
                            </div>
                            <div className="bg-gray-50 border p-3">
                                <p className="text-xs text-gray-500">Тип задачи</p>
                                <p className="font-semibold">{selectedTask?.task_type === 'group' ? 'Групповая' : 'Соло'}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTask(null)}>Закрыть</Button>
                        {selectedTask && (
                            <Button onClick={() => setCompleteTarget(selectedTask)} disabled={completingId === selectedTask.id}>
                                {completingId === selectedTask.id ? 'Завершение...' : 'Завершить'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!completeTarget} onOpenChange={(open) => !open && setCompleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold">Завершить задачу?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Задача <span className="font-semibold">{completeTarget?.name}</span> будет отправлена на проверку.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCompleteTarget(null)}>Отмена</Button>
                        {completeTarget && (
                            <Button onClick={() => handleComplete(completeTarget)} disabled={completingId === completeTarget.id}>
                                {completingId === completeTarget.id ? 'Завершение...' : 'Подтвердить'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
