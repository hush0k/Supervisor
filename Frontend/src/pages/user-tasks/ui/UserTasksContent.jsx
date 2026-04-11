import { useEffect, useMemo, useState } from 'react'
import { BiTask } from 'react-icons/bi'
import { FiCalendar, FiSearch, FiZap } from 'react-icons/fi'
import { MdOutlineTaskAlt, MdPendingActions } from 'react-icons/md'
import { IoCheckmarkDoneCircleOutline } from 'react-icons/io5'
import { useUserTasksBoard } from '@/features/tasks/useUserTasksBoard'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { DashboardTaskPriorityChart } from '@/pages/dashboard/ui/DashboardTaskPriorityChart'
import { DashboardDeadlineChart } from '@/pages/dashboard/ui/DashboardDeadlineChart'
import { tasksApi } from '@/shared/api/tasks'
import { usersApi } from '@/shared/api/users'
import { useAuthStore } from '@/entities/user/model/store'
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

const STEP_UI = {
    available: { label: 'Доступна', className: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'В процессе', className: 'bg-amber-100 text-amber-700' },
    completed: { label: 'На проверке', className: 'bg-violet-100 text-violet-700' },
    verified: { label: 'Подтверждена', className: 'bg-emerald-100 text-emerald-700' },
}

const TABS = [
    { key: 'all', label: 'Все' },
    { key: 'available', label: 'Доступные' },
    { key: 'in_progress', label: 'В процессе' },
    { key: 'completed', label: 'На проверке' },
    { key: 'verified', label: 'Подтверждённые' },
]

function formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('ru-RU')
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('ru-RU')} ₸`
}

function buildGroupPayoutPreview(task, teamSize) {
    const total = Number(task?.payment || 0)
    if (!teamSize || teamSize <= 0) {
        return { head: 0, memberBase: 0, memberMax: 0 }
    }

    if (task?.head_payment === null || task?.head_payment === undefined) {
        const base = Math.floor(total / teamSize)
        const remainder = total - (base * teamSize)
        return {
            head: base + (remainder > 0 ? 1 : 0),
            memberBase: base,
            memberMax: base + (remainder > 1 ? 1 : 0),
        }
    }

    const head = Number(task.head_payment || 0)
    if (teamSize === 1) {
        return { head: total, memberBase: 0, memberMax: 0 }
    }

    const rest = Math.max(total - head, 0)
    const membersCount = teamSize - 1
    const base = Math.floor(rest / membersCount)
    const remainder = rest - (base * membersCount)
    return {
        head,
        memberBase: base,
        memberMax: base + (remainder > 0 ? 1 : 0),
    }
}

function isAssignableCrewMember(emp, currentUserId) {
    if (!emp) return false
    if (emp.id === currentUserId) return false
    const role = String(emp.role || '').toLowerCase()
    if (role === 'admin' || role === 'supervisor') return false
    return true
}

function daysLeft(deadline) {
    const oneDay = 24 * 60 * 60 * 1000
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(deadline)
    target.setHours(0, 0, 0, 0)
    return Math.round((target.getTime() - now.getTime()) / oneDay)
}

function StatCard({ icon, label, value, accent }) {
    return (
        <div className="bg-white border p-4 flex items-center gap-4">
            <div className={`flex items-center justify-center w-11 h-11 shrink-0 ${accent ?? 'bg-primary/10 text-primary'}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-xl font-extrabold leading-tight">{value}</p>
            </div>
        </div>
    )
}

function TaskCard({ task, onOpen, onTake, takingId, canLeadGroup }) {
    const priority = PRIORITY_UI[task.priority] ?? PRIORITY_UI.medium
    const step = STEP_UI[task.task_step] ?? STEP_UI.available
    const left = daysLeft(task.deadline)

    return (
        <article className="bg-white border p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-base leading-tight">{task.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                    <span className={`px-2 py-0.5 text-xs font-semibold ${priority.className}`}>
                        {priority.label}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold ${step.className}`}>
                        {step.label}
                    </span>
                </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-3 min-h-[3.75rem]">{task.description}</p>

            <div className="text-xs border bg-gray-50 p-2.5">
                {task.task_type === 'solo' ? (
                    <p className="text-gray-700">Оплата: <span className="font-semibold">{formatMoney(task.payment)}</span></p>
                ) : task.head_payment === null || task.head_payment === undefined ? (
                    <p className="text-gray-700">
                        Общая сумма: <span className="font-semibold">{formatMoney(task.payment)}</span>. Делится поровну между участниками.
                    </p>
                ) : (
                    <div className="space-y-0.5">
                        <p className="text-gray-700">Общая сумма: <span className="font-semibold">{formatMoney(task.payment)}</span></p>
                        <p className="text-blue-700">Бригадир: <span className="font-semibold">{formatMoney(task.head_payment)}</span></p>
                        <p className="text-emerald-700">
                            {canLeadGroup
                                ? `Остаток команде: ${formatMoney(Math.max((task.payment || 0) - (task.head_payment || 0), 0))}`
                                : 'Для участников: остаток делится поровну'}
                        </p>
                    </div>
                )}
            </div>

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
                <Button variant="outline" size="sm" onClick={() => onOpen(task)}>
                    Посмотреть
                </Button>
                {task.task_step === 'available' && (
                    <Button size="sm" onClick={() => onTake(task)} disabled={takingId === task.id}>
                        {takingId === task.id ? 'Выбор...' : 'Выбрать задачу'}
                    </Button>
                )}
            </div>
        </article>
    )
}

export function UserTasksContent() {
    const currentUser = useAuthStore(s => s.user)
    const canLeadGroup = currentUser?.role === 'head' || !!currentUser?.position?.head_of_group
    const [activeTab, setActiveTab] = useState('all')
    const [search, setSearch] = useState('')
    const [selectedTask, setSelectedTask] = useState(null)
    const [takingId, setTakingId] = useState(null)
    const [actionError, setActionError] = useState('')
    const [crewTask, setCrewTask] = useState(null)
    const [crewMembers, setCrewMembers] = useState([])
    const [employees, setEmployees] = useState([])
    const [employeesLoading, setEmployeesLoading] = useState(false)
    const { data, isLoading, isError, refetch } = useUserTasksBoard()

    useEffect(() => {
        setEmployeesLoading(true)
        usersApi.getEmployees()
            .then(setEmployees)
            .catch(() => setEmployees([]))
            .finally(() => setEmployeesLoading(false))
    }, [])

    async function submitTakeTask(taskId, executorsIds = []) {
        try {
            setActionError('')
            setTakingId(taskId)
            await tasksApi.takeTask(taskId, executorsIds)
            await refetch()
            setSelectedTask(null)
            setCrewTask(null)
            setCrewMembers([])
        } catch (e) {
            const detail = e.response?.data?.detail
            setActionError(detail || 'Не удалось выбрать задачу')
        } finally {
            setTakingId(null)
        }
    }

    function handleTake(task) {
        if (task.task_type === 'group' && canLeadGroup) {
            setCrewTask(task)
            setCrewMembers([])
            return
        }
        submitTakeTask(task.id, [])
    }

    function toggleCrewMember(userId) {
        setCrewMembers(prev => (
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        ))
    }

    const stats = data?.stats ?? {
        total: 0,
        available: 0,
        in_progress: 0,
        completed: 0,
        verified: 0,
    }

    const tasks = useMemo(() => {
        if (!data) return []
        const base = activeTab === 'all' ? data.all : data.byStatus[activeTab] ?? []
        return base.filter(task => {
            const q = search.trim().toLowerCase()
            if (!q) return true
            return (
                task.name.toLowerCase().includes(q) ||
                task.description.toLowerCase().includes(q)
            )
        })
    }, [data, activeTab, search])

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                        <BiTask size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Мои задачи</h1>
                        <p className="text-sm text-gray-500">Все доступные и текущие задачи в одном месте</p>
                    </div>
                </div>
                <div className="text-sm text-gray-500 inline-flex items-center gap-2">
                    <FiZap size={14} className="text-primary" />
                    Приоритет: сначала критичные, потом по дедлайну
                </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
                {actionError && (
                    <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard icon={<BiTask size={20} />} label="Всего" value={stats.total} />
                    <StatCard icon={<MdOutlineTaskAlt size={20} />} label="Доступные" value={stats.available}
                        accent="bg-blue-100 text-blue-600" />
                    <StatCard icon={<MdPendingActions size={20} />} label="В процессе" value={stats.in_progress}
                        accent="bg-amber-100 text-amber-600" />
                    <StatCard icon={<IoCheckmarkDoneCircleOutline size={20} />} label="На проверке" value={stats.completed}
                        accent="bg-violet-100 text-violet-600" />
                    <StatCard icon={<IoCheckmarkDoneCircleOutline size={20} />} label="Подтверждено" value={stats.verified}
                        accent="bg-emerald-100 text-emerald-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white border">
                        <div className="px-5 py-3 border-b bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Распределение по приоритетам
                            </p>
                        </div>
                        <div className="p-5">
                            <DashboardTaskPriorityChart tasks={data?.all ?? []} />
                        </div>
                    </div>

                    <div className="bg-white border">
                        <div className="px-5 py-3 border-b bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Нагрузка по дедлайнам
                            </p>
                        </div>
                        <div className="p-5">
                            <DashboardDeadlineChart tasks={data?.all ?? []} />
                        </div>
                    </div>
                </div>

                <div className="bg-white border p-4 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    activeTab === tab.key
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <Input
                        placeholder="Поиск по названию или описанию задачи..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 text-sm"
                        icon={<FiSearch size={14} />}
                    />
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="h-40 bg-white border animate-pulse" />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="bg-white border p-8 text-center text-sm text-red-600">
                        Не удалось загрузить задачи. Попробуйте обновить страницу.
                    </div>
                )}

                {!isLoading && !isError && tasks.length === 0 && (
                    <div className="bg-white border p-10 text-center">
                        <p className="text-lg font-bold">Задачи не найдены</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Попробуйте сменить фильтр или позже проверьте новые назначения.
                        </p>
                    </div>
                )}

                {!isLoading && !isError && tasks.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                takingId={takingId}
                                onOpen={setSelectedTask}
                                onTake={handleTake}
                                canLeadGroup={canLeadGroup}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold">
                            {selectedTask?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-semibold ${(PRIORITY_UI[selectedTask?.priority] ?? PRIORITY_UI.medium).className}`}>
                                {(PRIORITY_UI[selectedTask?.priority] ?? PRIORITY_UI.medium).label}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-semibold ${(STEP_UI[selectedTask?.task_step] ?? STEP_UI.available).className}`}>
                                {(STEP_UI[selectedTask?.task_step] ?? STEP_UI.available).label}
                            </span>
                        </div>

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
                            <div className="bg-gray-50 border p-3 col-span-2">
                                <p className="text-xs text-gray-500">Оплата</p>
                                {selectedTask?.task_type === 'solo' ? (
                                    <p className="font-semibold">{formatMoney(selectedTask?.payment)}</p>
                                ) : selectedTask?.head_payment === null || selectedTask?.head_payment === undefined ? (
                                    <p className="font-semibold">
                                        {formatMoney(selectedTask?.payment)} · делится поровну между участниками
                                    </p>
                                ) : (
                                    <div className="space-y-0.5">
                                        <p className="font-semibold">Общая сумма: {formatMoney(selectedTask?.payment)}</p>
                                        <p className="text-blue-700">Бригадир: {formatMoney(selectedTask?.head_payment)}</p>
                                        <p className="text-emerald-700">
                                            Участникам: {formatMoney(Math.max((selectedTask?.payment || 0) - (selectedTask?.head_payment || 0), 0))} делится поровну
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTask(null)}>Закрыть</Button>
                        {selectedTask?.task_step === 'available' && (
                            <Button
                                onClick={() => handleTake(selectedTask)}
                                disabled={takingId === selectedTask?.id}
                            >
                                {takingId === selectedTask?.id ? 'Выбор...' : 'Выбрать задачу'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!crewTask} onOpenChange={(open) => !open && setCrewTask(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold">Сформировать бригаду</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Выберите сотрудников, которых хотите добавить в групповую задачу:
                            <span className="font-semibold"> {crewTask?.name}</span>
                        </p>

                        {crewTask?.group_size_limit ? (
                            <p className="text-xs text-gray-500">
                                Лимит группы: {crewTask.group_size_limit} (включая вас).
                            </p>
                        ) : null}

                        {crewTask && (
                            <div className="border bg-gray-50 p-3 text-xs space-y-1">
                                {(() => {
                                    const teamSize = 1 + crewMembers.length
                                    const payout = buildGroupPayoutPreview(crewTask, teamSize)
                                    return (
                                        <>
                                            <p className="text-gray-600">
                                                Текущий состав: <span className="font-semibold">{teamSize}</span>
                                            </p>
                                            <p className="text-blue-700">
                                                Вам (бригадиру): <span className="font-semibold">{formatMoney(payout.head)}</span>
                                            </p>
                                            {teamSize > 1 && (
                                                <p className="text-emerald-700">
                                                    Участникам: <span className="font-semibold">
                                                        {payout.memberBase === payout.memberMax
                                                            ? formatMoney(payout.memberBase)
                                                            : `${formatMoney(payout.memberBase)} – ${formatMoney(payout.memberMax)}`}
                                                    </span> каждому
                                                </p>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                        )}

                        <div className="border max-h-64 overflow-y-auto divide-y">
                            {employeesLoading ? (
                                <div className="p-3 text-sm text-gray-400">Загрузка сотрудников...</div>
                            ) : employees.length === 0 ? (
                                <div className="p-3 text-sm text-gray-400">Нет сотрудников для выбора</div>
                            ) : (
                                employees
                                    .filter(emp => isAssignableCrewMember(emp, currentUser?.id))
                                    .map(emp => {
                                        const checked = crewMembers.includes(emp.id)
                                        const limitReached = crewTask?.group_size_limit
                                            ? crewMembers.length >= Math.max(crewTask.group_size_limit - 1, 0)
                                            : false
                                        const disabled = !checked && limitReached
                                        return (
                                            <button
                                                key={emp.id}
                                                type="button"
                                                onClick={() => !disabled && toggleCrewMember(emp.id)}
                                                className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between ${
                                                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'
                                                } ${checked ? 'bg-primary/5' : ''}`}
                                            >
                                                <span className="truncate">{emp.last_name} {emp.first_name}</span>
                                                <span className="text-xs text-gray-500">{emp.login}</span>
                                            </button>
                                        )
                                    })
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCrewTask(null)}>Отмена</Button>
                        <Button
                            onClick={() => crewTask && submitTakeTask(crewTask.id, crewMembers)}
                            disabled={!crewTask || takingId === crewTask?.id}
                        >
                            {takingId === crewTask?.id ? 'Сохранение...' : 'Взять задачу с бригадой'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
