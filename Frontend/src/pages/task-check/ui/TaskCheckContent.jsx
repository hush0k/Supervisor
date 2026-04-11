import { useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/shared/api/tasks'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select'
import { AiFillControl } from 'react-icons/ai'
import { FiSearch, FiFilter } from 'react-icons/fi'
import { MdOutlineTaskAlt, MdOutlineCancel, MdPendingActions } from 'react-icons/md'
import { HiOutlineClipboardCheck } from 'react-icons/hi'
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5'

const TYPE_CONFIG = {
    solo:  { label: 'Соло',   className: 'bg-violet-100 text-violet-700' },
    group: { label: 'Группа', className: 'bg-cyan-100 text-cyan-700' },
}

const PRIORITY_CONFIG = {
    low:      { label: 'Низкий',    className: 'bg-gray-100 text-gray-500',   order: 1 },
    medium:   { label: 'Средний',   className: 'bg-blue-100 text-blue-600',   order: 2 },
    high:     { label: 'Высокий',   className: 'bg-amber-100 text-amber-700', order: 3 },
    critical: { label: 'Критичный', className: 'bg-red-100 text-red-600',     order: 4 },
}

const CITIES = {
    almaty: 'Алматы', astana: 'Астана', shymkent: 'Шымкент',
    karaganda: 'Қарағанды', aktobe: 'Ақтөбе', taraz: 'Тараз',
    pavlodar: 'Павлодар', oskemen: 'Өскемен', semey: 'Семей',
    kostanay: 'Қостанай', kyzylorda: 'Қызылорда', atyrau: 'Атырау',
    oral: 'Орал', petropavl: 'Петропавл', turkistan: 'Түркістан',
}

function formatPayment(v) {
    if (!v && v !== 0) return '—'
    return Number(v).toLocaleString('ru-RU') + ' ₸'
}

function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('ru-RU')
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

export function TaskCheckContent() {
    const queryClient = useQueryClient()
    const [tasks, setTasks]           = useState([])
    const [loading, setLoading]       = useState(true)
    const [fetchError, setFetchError] = useState('')
    const [actionError, setActionError] = useState('')

    const [search, setSearch]             = useState('')
    const [typeFilter, setTypeFilter]     = useState('ALL')
    const [priorityFilter, setPriorityFilter] = useState('ALL')
    const [sortBy, setSortBy]             = useState('priority_desc')

    // detail modal
    const [detailTask, setDetailTask] = useState(null)

    // confirm dialogs
    const [verifyTarget, setVerifyTarget] = useState(null)
    const [rejectTarget, setRejectTarget] = useState(null)
    const [acting, setActing]             = useState(false)

    useEffect(() => { loadTasks() }, [])

    async function loadTasks() {
        setLoading(true)
        setFetchError('')
        try {
            const data = await tasksApi.getAll({ task_step: 'completed', limit: 200 })
            setTasks(data)
        } catch (e) {
            if (e.response?.status === 404) setTasks([])
            else setFetchError('Не удалось загрузить задачи')
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => ({
        pending:  tasks.length,
    }), [tasks])

    const filtered = useMemo(() => {
        let list = tasks.filter(t => {
            const matchSearch   = t.name.toLowerCase().includes(search.toLowerCase())
            const matchType     = typeFilter === 'ALL' || t.task_type === typeFilter
            const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
            return matchSearch && matchType && matchPriority
        })
        if (sortBy === 'priority_desc') list = [...list].sort((a, b) => (PRIORITY_CONFIG[b.priority]?.order ?? 2) - (PRIORITY_CONFIG[a.priority]?.order ?? 2))
        if (sortBy === 'priority_asc')  list = [...list].sort((a, b) => (PRIORITY_CONFIG[a.priority]?.order ?? 2) - (PRIORITY_CONFIG[b.priority]?.order ?? 2))
        if (sortBy === 'deadline_asc')  list = [...list].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        if (sortBy === 'deadline_desc') list = [...list].sort((a, b) => new Date(b.deadline) - new Date(a.deadline))
        if (sortBy === 'payment_desc')  list = [...list].sort((a, b) => b.payment - a.payment)
        return list
    }, [tasks, search, typeFilter, priorityFilter, sortBy])

    async function handleVerify() {
        if (!verifyTarget) return
        setActing(true)
        try {
            setActionError('')
            await tasksApi.verify(verifyTarget.id)
            setTasks(prev => prev.filter(t => t.id !== verifyTarget.id))
            setVerifyTarget(null)
            setDetailTask(null)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['leaderboard'] }),
                queryClient.invalidateQueries({ queryKey: ['user-dashboard'] }),
                queryClient.invalidateQueries({ queryKey: ['user-chart'] }),
                queryClient.invalidateQueries({ queryKey: ['user-tasks-board'] }),
                queryClient.invalidateQueries({ queryKey: ['user-active-tasks'] }),
            ])
        } catch (e) {
            const detail = e.response?.data?.detail
            setActionError(detail || 'Не удалось принять задачу')
        } finally {
            setActing(false)
        }
    }

    async function handleReject() {
        if (!rejectTarget) return
        setActing(true)
        try {
            setActionError('')
            await tasksApi.reject(rejectTarget.id)
            setTasks(prev => prev.filter(t => t.id !== rejectTarget.id))
            setRejectTarget(null)
            setDetailTask(null)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['leaderboard'] }),
                queryClient.invalidateQueries({ queryKey: ['user-dashboard'] }),
                queryClient.invalidateQueries({ queryKey: ['user-chart'] }),
                queryClient.invalidateQueries({ queryKey: ['user-tasks-board'] }),
                queryClient.invalidateQueries({ queryKey: ['user-active-tasks'] }),
            ])
        } catch (e) {
            const detail = e.response?.data?.detail
            setActionError(detail || 'Не удалось отклонить задачу')
        } finally {
            setActing(false)
        }
    }

    return (
        <div className="flex flex-col w-full min-h-full">

            {/* Hero header */}
            <div className="bg-white border-b px-6 py-5 flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                    <AiFillControl size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Проверка задач</h1>
                    <p className="text-sm text-gray-500">Задачи ожидающие подтверждения</p>
                </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
                {actionError && (
                    <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={<MdPendingActions size={22} />}
                        label="Ожидают проверки"
                        value={stats.pending}
                        accent="bg-amber-100 text-amber-600"
                    />
                    <StatCard
                        icon={<IoCheckmarkCircleOutline size={22} />}
                        label="Подтвердить"
                        value={filtered.length}
                        accent="bg-emerald-100 text-emerald-600"
                    />
                    <StatCard
                        icon={<HiOutlineClipboardCheck size={22} />}
                        label="Отображено"
                        value={filtered.length}
                    />
                </div>

                {/* Filters */}
                <div className="bg-white border p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1 flex-1 min-w-44">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <FiSearch size={11} /> Поиск
                        </Label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <Input
                                placeholder="Название задачи..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 h-9 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-36">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <FiFilter size={11} /> Тип
                        </Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Все типы</SelectItem>
                                <SelectItem value="solo">Соло</SelectItem>
                                <SelectItem value="group">Группа</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-40">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <FiFilter size={11} /> Важность
                        </Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Все</SelectItem>
                                {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                                    <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-48">
                        <Label className="text-xs text-gray-500">Сортировка</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="priority_desc">Важность: высокая</SelectItem>
                                <SelectItem value="priority_asc">Важность: низкая</SelectItem>
                                <SelectItem value="deadline_asc">Дедлайн: ближайший</SelectItem>
                                <SelectItem value="deadline_desc">Дедлайн: дальний</SelectItem>
                                <SelectItem value="payment_desc">Оплата: высокая</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Загрузка...</div>
                    ) : fetchError ? (
                        <div className="flex items-center justify-center h-52 text-red-500 text-sm">{fetchError}</div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-52 gap-3 text-gray-400">
                            <MdOutlineTaskAlt size={44} />
                            <p className="text-sm font-medium">
                                {search || typeFilter !== 'ALL'
                                    ? 'Ничего не найдено по фильтрам'
                                    : 'Нет задач, ожидающих проверки'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="w-10 text-center">#</TableHead>
                                    <TableHead>Название</TableHead>
                                    <TableHead>Тип</TableHead>
                                    <TableHead>Город</TableHead>
                                    <TableHead>Важность</TableHead>
                                    <TableHead>Дедлайн</TableHead>
                                    <TableHead>Выполнено</TableHead>
                                    <TableHead>Оплата</TableHead>
                                    <TableHead className="text-right w-48">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((task, idx) => {
                                    const type = TYPE_CONFIG[task.task_type] ?? { label: task.task_type, className: 'bg-gray-100 text-gray-600' }
                                    const isLate = task.completed_at && task.deadline &&
                                        new Date(task.completed_at) > new Date(task.deadline)

                                    return (
                                        <TableRow
                                            key={task.id}
                                            className="hover:bg-accent/50 transition-colors cursor-pointer"
                                            onClick={() => setDetailTask(task)}
                                        >
                                            <TableCell className="text-center text-gray-400 text-sm font-mono">{idx + 1}</TableCell>
                                            <TableCell className="font-semibold text-sm">{task.name}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-sm ${type.className}`}>
                                                    {type.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">{CITIES[task.city] ?? task.city}</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium
                                                    return (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-sm ${p.className}`}>
                                                            {p.label}
                                                        </span>
                                                    )
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-700">{formatDate(task.deadline)}</TableCell>
                                            <TableCell>
                                                <span className={`text-sm font-medium ${isLate ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {formatDate(task.completed_at)}
                                                    {isLate && <span className="ml-1 text-xs">⚠ просрочено</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-semibold text-sm">{formatPayment(task.payment)}</TableCell>
                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setVerifyTarget(task)}
                                                        className="gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    >
                                                        <IoCheckmarkCircleOutline size={15} />
                                                        Принять
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setRejectTarget(task)}
                                                        className="gap-1.5 h-8 border-red-300 text-red-600 hover:bg-red-50"
                                                    >
                                                        <IoCloseCircleOutline size={15} />
                                                        Отклонить
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ───────────────────────────────────────── */}
            <Dialog open={!!detailTask} onOpenChange={open => !open && setDetailTask(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold text-lg leading-snug">
                            {detailTask?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {detailTask && (
                        <div className="space-y-4 py-1">
                            <p className="text-sm text-gray-600 leading-relaxed">{detailTask.description}</p>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Тип',       value: TYPE_CONFIG[detailTask.task_type]?.label ?? detailTask.task_type },
                                    { label: 'Город',     value: CITIES[detailTask.city] ?? detailTask.city },
                                    { label: 'Дедлайн',   value: formatDate(detailTask.deadline) },
                                    { label: 'Выполнено', value: formatDate(detailTask.completed_at) },
                                    { label: 'Оплата',    value: formatPayment(detailTask.payment) },
                                    { label: 'Длит-сть',  value: `${detailTask.duration} нед.` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 p-2.5">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                                        <p className="font-semibold text-sm mt-0.5">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {(() => {
                                const isLate = detailTask.completed_at && detailTask.deadline &&
                                    new Date(detailTask.completed_at) > new Date(detailTask.deadline)
                                return isLate ? (
                                    <p className="text-sm text-red-500 font-medium">
                                        ⚠ Задача выполнена с опозданием
                                    </p>
                                ) : (
                                    <p className="text-sm text-emerald-600 font-medium">
                                        ✓ Задача выполнена в срок
                                    </p>
                                )
                            })()}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5"
                            onClick={() => { setRejectTarget(detailTask); setDetailTask(null) }}
                        >
                            <IoCloseCircleOutline size={16} /> Отклонить
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            onClick={() => { setVerifyTarget(detailTask); setDetailTask(null) }}
                        >
                            <IoCheckmarkCircleOutline size={16} /> Принять
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Verify Confirm ─────────────────────────────────────── */}
            <Dialog open={!!verifyTarget} onOpenChange={open => !open && setVerifyTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold text-emerald-700">Принять задачу?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Подтвердить выполнение задачи{' '}
                        <span className="font-semibold">«{verifyTarget?.name}»</span>?
                        Сотрудник получит оплату и очки.
                    </p>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setVerifyTarget(null)}>Отмена</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleVerify}
                            disabled={acting}
                        >
                            {acting ? 'Подтверждение...' : 'Принять'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reject Confirm ─────────────────────────────────────── */}
            <Dialog open={!!rejectTarget} onOpenChange={open => !open && setRejectTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold text-red-600">Отклонить задачу?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Отклонить выполнение задачи{' '}
                        <span className="font-semibold">«{rejectTarget?.name}»</span>?
                        Задача получит статус «Отклонена».
                    </p>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setRejectTarget(null)}>Отмена</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={acting}>
                            {acting ? 'Отклонение...' : 'Отклонить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
