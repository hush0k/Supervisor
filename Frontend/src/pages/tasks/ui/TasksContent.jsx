import { useState, useEffect, useMemo } from 'react'
import { tasksApi } from '@/shared/api/tasks'
import { usersApi } from '@/shared/api/users'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
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
import { BiTask } from 'react-icons/bi'
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiFilter } from 'react-icons/fi'
import { MdOutlineTaskAlt, MdPendingActions } from 'react-icons/md'
import { HiOutlineClipboardList } from 'react-icons/hi'
import { IoCheckmarkDoneCircleOutline } from 'react-icons/io5'

// ── Constants ──────────────────────────────────────────────────────────────

const STEP_CONFIG = {
    available:   { label: 'Доступна',    className: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'В процессе',  className: 'bg-amber-100 text-amber-700' },
    completed:   { label: 'Выполнена',   className: 'bg-gray-100 text-gray-600' },
    verified:    { label: 'Подтверждена',className: 'bg-emerald-100 text-emerald-700' },
    failed:      { label: 'Отклонена',   className: 'bg-red-100 text-red-600' },
}

const TYPE_CONFIG = {
    solo:  { label: 'Соло',   className: 'bg-violet-100 text-violet-700' },
    group: { label: 'Группа', className: 'bg-cyan-100 text-cyan-700' },
}

const CITIES = [
    { value: 'almaty',     label: 'Алматы' },
    { value: 'astana',     label: 'Астана' },
    { value: 'shymkent',   label: 'Шымкент' },
    { value: 'karaganda',  label: 'Қарағанды' },
    { value: 'aktobe',     label: 'Ақтөбе' },
    { value: 'taraz',      label: 'Тараз' },
    { value: 'pavlodar',   label: 'Павлодар' },
    { value: 'oskemen',    label: 'Өскемен' },
    { value: 'semey',      label: 'Семей' },
    { value: 'kostanay',   label: 'Қостанай' },
    { value: 'kyzylorda',  label: 'Қызылорда' },
    { value: 'atyrau',     label: 'Атырау' },
    { value: 'oral',       label: 'Орал' },
    { value: 'petropavl',  label: 'Петропавл' },
    { value: 'turkistan',  label: 'Түркістан' },
]

const PRIORITY_CONFIG = {
    low:      { label: 'Низкий',     className: 'bg-gray-100 text-gray-500' },
    medium:   { label: 'Средний',    className: 'bg-blue-100 text-blue-600' },
    high:     { label: 'Высокий',    className: 'bg-amber-100 text-amber-700' },
    critical: { label: 'Критичный',  className: 'bg-red-100 text-red-600' },
}

const EMPTY_FORM = {
    name: '',
    description: '',
    deadline: '',
    payment: '',
    task_type: 'solo',
    city: 'almaty',
    priority: 'medium',
    is_active: true,
    accessed_user_ids: [],
}

function formatPayment(v) {
    if (!v && v !== 0) return '—'
    return Number(v).toLocaleString('ru-RU') + ' ₸'
}

function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('ru-RU')
}

function isOverdue(deadline, step) {
    if (!deadline || step === 'verified' || step === 'failed') return false
    return new Date(deadline) < new Date()
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

// ── Component ──────────────────────────────────────────────────────────────

export function TasksContent() {
    const [tasks, setTasks]           = useState([])
    const [loading, setLoading]       = useState(true)
    const [fetchError, setFetchError] = useState('')

    // filters
    const [search, setSearch]         = useState('')
    const [stepFilter, setStepFilter] = useState('ALL')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [cityFilter, setCityFilter] = useState('ALL')
    const [sortBy, setSortBy]         = useState('deadline_asc')

    // modal
    const [showModal, setShowModal]   = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [form, setForm]             = useState(EMPTY_FORM)
    const [formError, setFormError]   = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [employeeSearch, setEmployeeSearch] = useState('')

    // employees for group task picker
    const [employees, setEmployees] = useState([])

    // delete
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting]         = useState(false)

    useEffect(() => { loadTasks() }, [])

    useEffect(() => {
        usersApi.getEmployees().then(setEmployees).catch(() => setEmployees([]))
    }, [])

    async function loadTasks() {
        setLoading(true)
        setFetchError('')
        try {
            const data = await tasksApi.getAll({ limit: 200 })
            setTasks(data)
        } catch (e) {
            if (e.response?.status === 404) setTasks([])
            else setFetchError('Не удалось загрузить задачи')
        } finally {
            setLoading(false)
        }
    }

    // ── Derived stats ──────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total:      tasks.length,
        active:     tasks.filter(t => t.task_step === 'available').length,
        inProgress: tasks.filter(t => t.task_step === 'in_progress').length,
        verified:   tasks.filter(t => t.task_step === 'verified').length,
    }), [tasks])

    // ── Filtered list ──────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = tasks.filter(t => {
            const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
            const matchStep   = stepFilter === 'ALL' || t.task_step === stepFilter
            const matchType   = typeFilter === 'ALL' || t.task_type === typeFilter
            const matchCity   = cityFilter === 'ALL' || t.city === cityFilter
            return matchSearch && matchStep && matchType && matchCity
        })

        if (sortBy === 'deadline_asc')  list = [...list].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        if (sortBy === 'deadline_desc') list = [...list].sort((a, b) => new Date(b.deadline) - new Date(a.deadline))
        if (sortBy === 'payment_desc')  list = [...list].sort((a, b) => b.payment - a.payment)
        if (sortBy === 'name_asc')      list = [...list].sort((a, b) => a.name.localeCompare(b.name))

        return list
    }, [tasks, search, stepFilter, typeFilter, cityFilter, sortBy])

    // ── Modal helpers ──────────────────────────────────────────────────────
    function openAdd() {
        setEditTarget(null)
        setForm(EMPTY_FORM)
        setFormError('')
        setEmployeeSearch('')
        setShowModal(true)
    }

    function openEdit(task) {
        setEditTarget(task)
        setForm({
            name:              task.name,
            description:       task.description,
            deadline:          task.deadline?.slice(0, 10) ?? '',
            payment:           String(task.payment),
            task_type:         task.task_type,
            city:              task.city,
            priority:          task.priority ?? 'medium',
            is_active:         task.is_active,
            accessed_user_ids: [],
        })
        setFormError('')
        setEmployeeSearch('')
        setShowModal(true)
    }

    function toggleEmployee(id) {
        setForm(f => ({
            ...f,
            accessed_user_ids: f.accessed_user_ids.includes(id)
                ? f.accessed_user_ids.filter(x => x !== id)
                : [...f.accessed_user_ids, id],
        }))
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
        setFormError('')
    }

    function handlePaymentChange(e) {
        const raw = e.target.value.replace(/\D/g, '')
        setForm(f => ({ ...f, payment: raw }))
        setFormError('')
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setFormError('')

        const payload = {
            name:        form.name.trim(),
            description: form.description.trim(),
            deadline:    form.deadline,
            payment:     Number(form.payment) || 0,
            task_type:   form.task_type,
            city:        form.city,
            priority:    form.priority,
            is_active:   form.is_active,
        }

        try {
            if (editTarget) {
                const updated = await tasksApi.update(editTarget.id, payload)
                setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
            } else {
                const taskOperation = {
                    accessed_users_ids: form.task_type === 'group' ? form.accessed_user_ids : [],
                    executors_ids: [],
                }
                const created = await tasksApi.create(payload, taskOperation)
                setTasks(prev => [created, ...prev])
            }
            setShowModal(false)
        } catch (err) {
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) setFormError(detail.map(d => d.msg).join('; '))
            else setFormError(detail || 'Ошибка при сохранении')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await tasksApi.delete(deleteTarget.id)
            setTasks(prev => prev.filter(t => t.id !== deleteTarget.id))
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col w-full min-h-full">

            {/* Hero header */}
            <div className="bg-white border-b px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                        <BiTask size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Задачи</h1>
                        <p className="text-sm text-gray-500">Управление задачами компании</p>
                    </div>
                </div>
                <Button onClick={openAdd} className="gap-2 self-start md:self-auto shrink-0">
                    <FiPlus size={16} />
                    Создать задачу
                </Button>
            </div>

            <div className="flex flex-col gap-5 p-6">

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={<HiOutlineClipboardList size={20} />} label="Всего задач"  value={stats.total} />
                    <StatCard icon={<MdPendingActions size={20} />}       label="Доступны"    value={stats.active}
                        accent="bg-blue-100 text-blue-600" />
                    <StatCard icon={<BiTask size={20} />}                 label="В процессе"  value={stats.inProgress}
                        accent="bg-amber-100 text-amber-600" />
                    <StatCard icon={<IoCheckmarkDoneCircleOutline size={20} />} label="Подтверждено" value={stats.verified}
                        accent="bg-emerald-100 text-emerald-600" />
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

                    <div className="flex flex-col gap-1 w-full sm:w-40">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <FiFilter size={11} /> Статус
                        </Label>
                        <Select value={stepFilter} onValueChange={setStepFilter}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Все статусы</SelectItem>
                                {Object.entries(STEP_CONFIG).map(([val, cfg]) => (
                                    <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-36">
                        <Label className="text-xs text-gray-500">Тип</Label>
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
                        <Label className="text-xs text-gray-500">Город</Label>
                        <Select value={cityFilter} onValueChange={setCityFilter}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Все города</SelectItem>
                                {CITIES.map(c => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-48">
                        <Label className="text-xs text-gray-500">Сортировка</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="deadline_asc">Дедлайн: ближайший</SelectItem>
                                <SelectItem value="deadline_desc">Дедлайн: дальний</SelectItem>
                                <SelectItem value="payment_desc">Оплата: высокая</SelectItem>
                                <SelectItem value="name_asc">Название (А–Я)</SelectItem>
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
                            <BiTask size={44} />
                            <p className="text-sm font-medium">
                                {search || stepFilter !== 'ALL' || typeFilter !== 'ALL' || cityFilter !== 'ALL'
                                    ? 'Ничего не найдено по фильтрам'
                                    : 'Задач пока нет — создайте первую'}
                            </p>
                            {!search && stepFilter === 'ALL' && typeFilter === 'ALL' && cityFilter === 'ALL' && (
                                <Button variant="outline" size="sm" onClick={openAdd} className="gap-1">
                                    <FiPlus size={14} /> Создать
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="w-10 text-center">#</TableHead>
                                    <TableHead>Название</TableHead>
                                    <TableHead>Тип</TableHead>
                                    <TableHead>Город</TableHead>
                                    <TableHead>Дедлайн</TableHead>
                                    <TableHead>Оплата</TableHead>
                                    <TableHead>Важность</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead className="text-right w-24">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((task, idx) => {
                                    const step = STEP_CONFIG[task.task_step] ?? { label: task.task_step, className: 'bg-gray-100 text-gray-600' }
                                    const type = TYPE_CONFIG[task.task_type] ?? { label: task.task_type, className: 'bg-gray-100 text-gray-600' }
                                    const overdue = isOverdue(task.deadline, task.task_step)
                                    const city = CITIES.find(c => c.value === task.city)?.label ?? task.city

                                    return (
                                        <TableRow key={task.id} className="hover:bg-accent/50 transition-colors group">
                                            <TableCell className="text-center text-gray-400 text-sm font-mono">{idx + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{task.name}</span>
                                                    {!task.is_active && (
                                                        <span className="text-xs text-gray-400">неактивна</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-sm ${type.className}`}>
                                                    {type.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">{city}</TableCell>
                                            <TableCell>
                                                <span className={`text-sm font-medium ${overdue ? 'text-red-500' : 'text-gray-700'}`}>
                                                    {formatDate(task.deadline)}
                                                    {overdue && <span className="ml-1 text-xs">⚠</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-semibold text-sm">{formatPayment(task.payment)}</TableCell>
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
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-sm ${step.className}`}>
                                                    {step.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => openEdit(task)}
                                                        className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => setDeleteTarget(task)}
                                                        className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                                                    >
                                                        <FiTrash2 size={14} />
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

            {/* ── Add / Edit Modal ──────────────────────────────────── */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
                            <BiTask className="text-primary" />
                            {editTarget ? 'Редактировать задачу' : 'Создать задачу'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 overflow-y-auto flex-1 pr-1">
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="name">Название</Label>
                                <Input id="name" name="name" placeholder="Разработка дизайна..."
                                    value={form.name} onChange={handleChange} required />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="description">Описание</Label>
                                <Textarea id="description" name="description"
                                    placeholder="Подробное описание задачи..."
                                    value={form.description} onChange={handleChange}
                                    className="resize-none h-16" required />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="deadline">Дедлайн</Label>
                                <Input id="deadline" name="deadline" type="date"
                                    value={form.deadline} onChange={handleChange} required />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="payment">Оплата (₸)</Label>
                                <Input id="payment" name="payment" type="text" placeholder="50 000"
                                    value={form.payment ? Number(form.payment).toLocaleString('ru-RU') : ''}
                                    onChange={handlePaymentChange} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Тип задачи</Label>
                                <Select value={form.task_type} onValueChange={v => setForm(f => ({ ...f, task_type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solo">Соло</SelectItem>
                                        <SelectItem value="group">Группа</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Город</Label>
                                <Select value={form.city} onValueChange={v => setForm(f => ({ ...f, city: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CITIES.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Важность</Label>
                                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                                            <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {form.task_type === 'group' && (
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="flex items-center gap-1">
                                        Допущенные сотрудники
                                        {form.accessed_user_ids.length > 0 && (
                                            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary text-white rounded-full">
                                                {form.accessed_user_ids.length}
                                            </span>
                                        )}
                                    </Label>

                                    {employees.length === 0 ? (
                                        <p className="text-sm text-gray-400 py-2">Нет сотрудников в компании</p>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                                                <Input
                                                    placeholder="Поиск сотрудника..."
                                                    value={employeeSearch}
                                                    onChange={e => setEmployeeSearch(e.target.value)}
                                                    className="pl-8 h-8 text-sm"
                                                />
                                            </div>
                                            <div className="border rounded-sm max-h-32 overflow-y-auto divide-y">
                                                {employees
                                                    .filter(e => `${e.first_name} ${e.last_name} ${e.login}`
                                                        .toLowerCase()
                                                        .includes(employeeSearch.toLowerCase()))
                                                    .map(emp => {
                                                        const checked = form.accessed_user_ids.includes(emp.id)
                                                        return (
                                                            <button
                                                                key={emp.id}
                                                                type="button"
                                                                onClick={() => toggleEmployee(emp.id)}
                                                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-accent ${checked ? 'bg-primary/5' : ''}`}
                                                            >
                                                                <div className={`w-4 h-4 shrink-0 border-2 flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                                    {checked && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                                                                </div>
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <div className="w-6 h-6 shrink-0 flex items-center justify-center bg-gray-200 text-gray-600 text-xs font-bold">
                                                                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                                    </div>
                                                                    <span className="truncate font-medium">{emp.last_name} {emp.first_name}</span>
                                                                    <span className="text-gray-400 text-xs shrink-0">{emp.login}</span>
                                                                </div>
                                                            </button>
                                                        )
                                                    })
                                                }
                                            </div>
                                            {form.accessed_user_ids.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, accessed_user_ids: [] }))}
                                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    Снять всех ({form.accessed_user_ids.length})
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3 sm:col-span-2 pt-1">
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-primary"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">Задача активна (видна сотрудникам)</Label>
                            </div>
                        </div>

                        {formError && <p className="text-sm text-red-500 mt-1">{formError}</p>}

                        <DialogFooter className="shrink-0 pt-3">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Отмена</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Сохранение...' : editTarget ? 'Сохранить' : 'Создать'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirm ─────────────────────────────────────── */}
            <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold text-red-600">Удалить задачу?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Вы уверены, что хотите удалить задачу{' '}
                        <span className="font-semibold">«{deleteTarget?.name}»</span>?
                        {' '}Это действие необратимо.
                    </p>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Отмена</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Удаление...' : 'Удалить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
