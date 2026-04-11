import { useEffect, useMemo, useState } from 'react'
import { FiArchive, FiSearch } from 'react-icons/fi'
import { tasksApi } from '@/shared/api/tasks'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TaskDetailsDialog } from '@/shared/ui/TaskDetailsDialog'

const CITIES = {
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

function formatMoney(v) {
    return `${Math.round(v || 0).toLocaleString('ru-RU')} ₸`
}

function formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('ru-RU')
}

export function TasksArchiveContent() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('verified_desc')
    const [error, setError] = useState('')
    const [previewTask, setPreviewTask] = useState(null)

    useEffect(() => {
        loadArchive()
    }, [])

    async function loadArchive() {
        setLoading(true)
        setError('')
        try {
            const data = await tasksApi.getAll({ task_step: 'verified', limit: 500 })
            setTasks(data)
        } catch (e) {
            setError(e.response?.data?.detail || 'Не удалось загрузить архив задач')
            setTasks([])
        } finally {
            setLoading(false)
        }
    }

    const filtered = useMemo(() => {
        let list = tasks.filter(task => {
            const q = search.trim().toLowerCase()
            if (!q) return true
            return task.name.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)
        })

        if (sortBy === 'verified_desc') list = [...list].sort((a, b) => new Date(b.verified_at || b.deadline) - new Date(a.verified_at || a.deadline))
        if (sortBy === 'verified_asc') list = [...list].sort((a, b) => new Date(a.verified_at || a.deadline) - new Date(b.verified_at || b.deadline))
        if (sortBy === 'payment_desc') list = [...list].sort((a, b) => (b.payment || 0) - (a.payment || 0))
        if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name))

        return list
    }, [tasks, search, sortBy])

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 text-white shrink-0">
                        <FiArchive size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Архив задач</h1>
                        <p className="text-sm text-gray-500">Подтвержденные задачи хранятся отдельно от активных</p>
                    </div>
                </div>
                <span className="text-sm text-gray-500">Всего в архиве: {tasks.length}</span>
            </div>

            <div className="p-6 flex flex-col gap-5">
                <div className="bg-white border p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1 flex-1 min-w-44">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <FiSearch size={11} /> Поиск
                        </Label>
                        <Input
                            placeholder="Название или описание..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-60">
                        <Label className="text-xs text-gray-500">Сортировка</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="verified_desc">Подтверждение: новые</SelectItem>
                                <SelectItem value="verified_asc">Подтверждение: старые</SelectItem>
                                <SelectItem value="payment_desc">Оплата: высокая</SelectItem>
                                <SelectItem value="name_asc">Название (А–Я)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white border overflow-auto">
                    {loading ? (
                        <div className="h-52 flex items-center justify-center text-sm text-gray-400">Загрузка архива...</div>
                    ) : error ? (
                        <div className="h-52 flex items-center justify-center text-sm text-red-500">{error}</div>
                    ) : filtered.length === 0 ? (
                        <div className="h-52 flex items-center justify-center text-sm text-gray-400">В архиве пока нет задач</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead>Название</TableHead>
                                    <TableHead>Тип</TableHead>
                                    <TableHead>Город</TableHead>
                                    <TableHead>Дедлайн</TableHead>
                                    <TableHead>Подтверждена</TableHead>
                                    <TableHead>Оплата</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(task => (
                                    <TableRow
                                        key={task.id}
                                        className="hover:bg-accent/50 transition-colors cursor-pointer"
                                        onClick={() => setPreviewTask(task)}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-sm">{task.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{task.task_type === 'group' ? 'Группа' : 'Соло'}</TableCell>
                                        <TableCell>{CITIES[task.city] || task.city}</TableCell>
                                        <TableCell>{formatDate(task.deadline)}</TableCell>
                                        <TableCell>{formatDate(task.verified_at)}</TableCell>
                                        <TableCell className="font-semibold">{formatMoney(task.payment)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <TaskDetailsDialog
                task={previewTask}
                open={!!previewTask}
                onOpenChange={open => !open && setPreviewTask(null)}
            />
        </div>
    )
}
