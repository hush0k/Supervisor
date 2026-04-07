import { useState, useEffect, useMemo } from 'react'
import { usersApi } from '@/shared/api/users'
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
import { RiTeamFill } from 'react-icons/ri'
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiFilter } from 'react-icons/fi'
import { MdOutlineTrendingUp } from 'react-icons/md'
import { IoCashOutline } from 'react-icons/io5'
import { BsPeopleFill } from 'react-icons/bs'

const ROLE_LABELS = {
    SUPERVISOR: { label: 'Супервайзер', className: 'bg-primary/10 text-primary font-semibold' },
    USER:       { label: 'Сотрудник',   className: 'bg-gray-100 text-gray-600 font-medium' },
}

const EMPTY_FORM = {
    login: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    salary: '',
    bonus: '',
    password: '',
}

function formatSalary(value) {
    if (!value && value !== 0) return '—'
    return Number(value).toLocaleString('ru-RU') + ' ₸'
}

function getInitials(first, last) {
    return `${(first?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}`
}

const AVATAR_COLORS = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500',
]

function avatarColor(id) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function StatCard({ icon, label, value, sub }) {
    return (
        <div className="bg-white border p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 bg-primary/10 text-primary shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-xl font-extrabold leading-tight">{value}</p>
                {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </div>
        </div>
    )
}

export function TeamContent() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading]     = useState(true)
    const [fetchError, setFetchError] = useState('')

    // filters
    const [search, setSearch]       = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')
    const [sortBy, setSortBy]       = useState('name')

    // modal
    const [showModal, setShowModal]   = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [form, setForm]             = useState(EMPTY_FORM)
    const [formError, setFormError]   = useState('')
    const [submitting, setSubmitting] = useState(false)

    // delete
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting]         = useState(false)

    useEffect(() => { loadEmployees() }, [])

    async function loadEmployees() {
        setLoading(true)
        setFetchError('')
        try {
            const data = await usersApi.getEmployees()
            setEmployees(data)
        } catch (e) {
            if (e.response?.status === 404) setEmployees([])
            else setFetchError('Не удалось загрузить сотрудников')
        } finally {
            setLoading(false)
        }
    }

    const filtered = useMemo(() => {
        let list = employees.filter(e => {
            const text = `${e.first_name} ${e.last_name} ${e.login}`.toLowerCase()
            const matchSearch = text.includes(search.toLowerCase())
            const matchRole   = roleFilter === 'ALL' || e.role === roleFilter
            return matchSearch && matchRole
        })

        if (sortBy === 'name')          list = [...list].sort((a, b) => a.last_name.localeCompare(b.last_name))
        else if (sortBy === 'salary_desc') list = [...list].sort((a, b) => b.salary - a.salary)
        else if (sortBy === 'salary_asc')  list = [...list].sort((a, b) => a.salary - b.salary)

        return list
    }, [employees, search, roleFilter, sortBy])

    const avgSalary = employees.length
        ? Math.round(employees.reduce((s, e) => s + e.salary, 0) / employees.length)
        : 0

    function openAdd() {
        setEditTarget(null)
        setForm(EMPTY_FORM)
        setFormError('')
        setShowModal(true)
    }

    function openEdit(emp) {
        setEditTarget(emp)
        setForm({
            login:         emp.login,
            first_name:    emp.first_name,
            last_name:     emp.last_name,
            date_of_birth: emp.date_of_birth?.slice(0, 10) ?? '',
            salary:        String(emp.salary),
            bonus:         emp.bonus != null ? String(emp.bonus) : '',
            password:      '',
        })
        setFormError('')
        setShowModal(true)
    }

    function handleFormChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
        setFormError('')
    }

    function handleNumericChange(field) {
        return e => {
            const raw = e.target.value.replace(/\D/g, '')
            setForm(f => ({ ...f, [field]: raw }))
            setFormError('')
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setFormError('')

        const payload = {
            login:         form.login.trim(),
            first_name:    form.first_name.trim(),
            last_name:     form.last_name.trim(),
            date_of_birth: form.date_of_birth,
            salary:        Number(form.salary),
            bonus:         form.bonus ? Number(form.bonus) : null,
            position_id:   null,
            company_id:    null,
        }

        try {
            if (editTarget) {
                const { password, ...up } = payload
                const updated = await usersApi.updateUser(editTarget.id, up)
                setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e))
            } else {
                const created = await usersApi.createUser({ ...payload, password: form.password })
                setEmployees(prev => [...prev, created])
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
            await usersApi.deleteUser(deleteTarget.id)
            setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id))
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="flex flex-col w-full min-h-full">

            {/* ── Hero header ───────────────────────────────────────── */}
            <div className="bg-white border-b px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                        <BsPeopleFill size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Сотрудники</h1>
                        <p className="text-sm text-gray-500">Управление командой компании</p>
                    </div>
                </div>
                <Button onClick={openAdd} className="gap-2 self-start md:self-auto shrink-0">
                    <FiUserPlus size={16} />
                    Добавить сотрудника
                </Button>
            </div>

            <div className="flex flex-col gap-5 p-6">

                {/* ── Stats ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={<BsPeopleFill size={20} />}
                        label="Всего сотрудников"
                        value={employees.length}
                        sub="в вашей компании"
                    />
                    <StatCard
                        icon={<IoCashOutline size={22} />}
                        label="Средняя зарплата"
                        value={formatSalary(avgSalary)}
                        sub="по компании"
                    />
                    <StatCard
                        icon={<MdOutlineTrendingUp size={22} />}
                        label="Отображено"
                        value={filtered.length}
                        sub={`из ${employees.length} сотрудников`}
                    />
                </div>

                {/* ── Filters ───────────────────────────────────────── */}
                <div className="bg-white border p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                    <div className="flex flex-col gap-1 flex-1">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <FiSearch size={11} /> Поиск
                        </Label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <Input
                                placeholder="Имя, фамилия или логин..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 h-9 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-44">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <FiFilter size={11} /> Роль
                        </Label>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Все роли</SelectItem>
                                <SelectItem value="USER">Сотрудник</SelectItem>
                                <SelectItem value="SUPERVISOR">Супервайзер</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-52">
                        <Label className="text-xs text-gray-500">Сортировка</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">По имени (А–Я)</SelectItem>
                                <SelectItem value="salary_desc">Зарплата: высокая</SelectItem>
                                <SelectItem value="salary_asc">Зарплата: низкая</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* ── Table ─────────────────────────────────────────── */}
                <div className="bg-white border overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Загрузка...</div>
                    ) : fetchError ? (
                        <div className="flex items-center justify-center h-52 text-red-500 text-sm">{fetchError}</div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-52 gap-3 text-gray-400">
                            <BsPeopleFill size={44} />
                            <p className="text-sm font-medium">
                                {search || roleFilter !== 'ALL' ? 'Никого не найдено по вашему фильтру' : 'Сотрудников пока нет — добавьте первого'}
                            </p>
                            {!search && roleFilter === 'ALL' && (
                                <Button variant="outline" size="sm" onClick={openAdd} className="gap-1">
                                    <FiUserPlus size={14} /> Добавить
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="w-12 text-center">#</TableHead>
                                    <TableHead>Сотрудник</TableHead>
                                    <TableHead>Логин</TableHead>
                                    <TableHead>Должность</TableHead>
                                    <TableHead>Зарплата</TableHead>
                                    <TableHead>Бонус</TableHead>
                                    <TableHead>Роль</TableHead>
                                    <TableHead className="text-right w-24">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((emp, idx) => {
                                    const roleInfo = ROLE_LABELS[emp.role] ?? { label: emp.role, className: 'bg-gray-100 text-gray-600' }
                                    return (
                                        <TableRow key={emp.id} className="hover:bg-accent/50 transition-colors group">
                                            <TableCell className="text-center text-gray-400 text-sm font-mono">{idx + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {emp.avatar_url ? (
                                                        <img
                                                            src={emp.avatar_url}
                                                            alt=""
                                                            className="w-8 h-8 rounded-none object-cover shrink-0"
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 shrink-0 flex items-center justify-center text-white text-xs font-bold ${avatarColor(emp.id)}`}>
                                                            {getInitials(emp.first_name, emp.last_name)}
                                                        </div>
                                                    )}
                                                    <span className="font-semibold text-sm">
                                                        {emp.last_name} {emp.first_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">{emp.login}</TableCell>
                                            <TableCell className="text-gray-500 text-sm">
                                                {emp.position?.name ?? <span className="text-gray-300">—</span>}
                                            </TableCell>
                                            <TableCell className="font-semibold text-sm">{formatSalary(emp.salary)}</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {emp.bonus ? formatSalary(emp.bonus) : <span className="text-gray-300">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs rounded-sm ${roleInfo.className}`}>
                                                    {roleInfo.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEdit(emp)}
                                                        className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteTarget(emp)}
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
                            <FiUserPlus className="text-primary" />
                            {editTarget ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="first_name">Имя</Label>
                                <Input id="first_name" name="first_name" placeholder="Азамат"
                                    value={form.first_name} onChange={handleFormChange} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="last_name">Фамилия</Label>
                                <Input id="last_name" name="last_name" placeholder="Рахымжан"
                                    value={form.last_name} onChange={handleFormChange} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="login">Логин</Label>
                                <Input id="login" name="login" placeholder="username"
                                    value={form.login} onChange={handleFormChange} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="date_of_birth">Дата рождения</Label>
                                <Input id="date_of_birth" name="date_of_birth" type="date"
                                    value={form.date_of_birth} onChange={handleFormChange} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="salary">Зарплата (₸)</Label>
                                <Input id="salary" name="salary" type="text" placeholder="150 000"
                                    value={form.salary ? Number(form.salary).toLocaleString('ru-RU') : ''}
                                    onChange={handleNumericChange('salary')} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="bonus">Бонус (₸) — необязательно</Label>
                                <Input id="bonus" name="bonus" type="text" placeholder="10 000"
                                    value={form.bonus ? Number(form.bonus).toLocaleString('ru-RU') : ''}
                                    onChange={handleNumericChange('bonus')} />
                            </div>
                            {!editTarget && (
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="password">Пароль</Label>
                                    <Input id="password" name="password" type="password"
                                        placeholder="Минимум 8 символов, A-z, 0-9, спецсимвол"
                                        value={form.password} onChange={handleFormChange} required />
                                </div>
                            )}
                        </div>

                        {formError && <p className="text-sm text-red-500 mb-4">{formError}</p>}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Отмена</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Сохранение...' : editTarget ? 'Сохранить' : 'Добавить'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirm ────────────────────────────────────── */}
            <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold text-red-600">Удалить сотрудника?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Вы уверены, что хотите удалить{' '}
                        <span className="font-semibold">{deleteTarget?.last_name} {deleteTarget?.first_name}</span>?
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
