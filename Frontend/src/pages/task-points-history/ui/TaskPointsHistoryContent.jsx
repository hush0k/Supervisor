import { useEffect, useMemo, useState } from 'react'
import { FiActivity, FiSearch } from 'react-icons/fi'
import { statisticsApi } from '@/shared/api/statistics'
import { usersApi } from '@/shared/api/users'
import { tasksApi } from '@/shared/api/tasks'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

function formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('ru-RU')
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('ru-RU')} ₸`
}

function formatFloat(value) {
    return Number(value || 0).toFixed(2)
}

function fullName(user) {
    if (!user) return 'Неизвестно'
    return `${user.last_name || ''} ${user.first_name || ''}`.trim() || user.login || `ID ${user.id}`
}

function StatCard({ label, value, hint }) {
    return (
        <div className="bg-white border p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
            <p className="text-xl font-extrabold mt-1 text-gray-900">{value}</p>
            {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
        </div>
    )
}

export function TaskPointsHistoryContent() {
    const [rows, setRows] = useState([])
    const [employees, setEmployees] = useState([])
    const [tasksMap, setTasksMap] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState('ALL')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        setError('')
        try {
            const [historyData, employeesData, tasksData] = await Promise.all([
                statisticsApi.getTaskPointsHistoryAll(),
                usersApi.getEmployees(),
                tasksApi.getAll({ limit: 1000, sort_field: 'id', sort_order: 'desc' }),
            ])

            const map = Object.fromEntries((tasksData || []).map(task => [task.id, task.name]))
            setRows(historyData || [])
            setEmployees(employeesData || [])
            setTasksMap(map)
        } catch (e) {
            setError(e.response?.data?.detail || 'Не удалось загрузить историю начислений')
            setRows([])
            setEmployees([])
            setTasksMap({})
        } finally {
            setLoading(false)
        }
    }

    const employeesMap = useMemo(
        () => Object.fromEntries(employees.map(emp => [emp.id, emp])),
        [employees],
    )

    const filtered = useMemo(() => {
        let list = [...rows]

        if (selectedUser !== 'ALL') {
            list = list.filter(row => String(row.user_id) === selectedUser)
        }

        const q = search.trim().toLowerCase()
        if (q) {
            list = list.filter(row => {
                const emp = employeesMap[row.user_id]
                const employeeName = fullName(emp).toLowerCase()
                const taskName = String(tasksMap[row.task_id] || '').toLowerCase()
                return (
                    employeeName.includes(q)
                    || taskName.includes(q)
                    || String(row.task_id).includes(q)
                    || String(row.user_id).includes(q)
                )
            })
        }

        return list.sort((a, b) => new Date(b.calculated_at || b.period_date) - new Date(a.calculated_at || a.period_date))
    }, [rows, selectedUser, search, employeesMap, tasksMap])

    const totals = useMemo(() => {
        const entries = filtered.length
        const sumPoints = filtered.reduce((acc, row) => acc + Number(row.points || 0), 0)
        const sumEarned = filtered.reduce((acc, row) => acc + Number(row.earned_amount || 0), 0)
        const avgPoints = entries ? (sumPoints / entries) : 0
        return { entries, sumPoints, sumEarned, avgPoints }
    }, [filtered])

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white shrink-0">
                        <FiActivity size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">История начисления очков</h1>
                        <p className="text-sm text-gray-500">Прозрачный журнал: кто, за какую задачу и почему получил такие поинты</p>
                    </div>
                </div>
                <span className="text-sm text-gray-500">Записей: {rows.length}</span>
            </div>

            <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <StatCard label="Записей по фильтру" value={totals.entries} />
                    <StatCard label="Сумма очков" value={totals.sumPoints.toLocaleString('ru-RU')} />
                    <StatCard label="Средние очки" value={formatFloat(totals.avgPoints)} />
                    <StatCard label="Сумма выплат" value={formatMoney(totals.sumEarned)} />
                </div>

                <div className="bg-white border p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1 flex-1 min-w-44">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <FiSearch size={11} /> Поиск
                        </Label>
                        <Input
                            placeholder="Сотрудник, задача или ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-72">
                        <Label className="text-xs text-gray-500">Сотрудник</Label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Все сотрудники</SelectItem>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={String(emp.id)}>
                                        {fullName(emp)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white border overflow-auto">
                    {loading ? (
                        <div className="h-52 flex items-center justify-center text-sm text-gray-400">Загрузка истории...</div>
                    ) : error ? (
                        <div className="h-52 flex items-center justify-center text-sm text-red-500">{error}</div>
                    ) : filtered.length === 0 ? (
                        <div className="h-52 flex items-center justify-center text-sm text-gray-400">Записи не найдены</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead>Дата</TableHead>
                                    <TableHead>Сотрудник</TableHead>
                                    <TableHead>Задача</TableHead>
                                    <TableHead>Выплата</TableHead>
                                    <TableHead>Delay</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead>Raw</TableHead>
                                    <TableHead>Очки</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(row => {
                                    const employee = employeesMap[row.user_id]
                                    const taskName = tasksMap[row.task_id] || `Задача #${row.task_id}`
                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell>{formatDate(row.calculated_at || row.period_date)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold text-sm">{fullName(employee)}</p>
                                                    <p className="text-xs text-gray-500">ID: {row.user_id}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold text-sm">{taskName}</p>
                                                    <p className="text-xs text-gray-500">Task #{row.task_id}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">{formatMoney(row.earned_amount)}</TableCell>
                                            <TableCell>{row.delay_days}</TableCell>
                                            <TableCell>{formatFloat(row.difficulty_multiplier)}</TableCell>
                                            <TableCell>{formatFloat(row.deadline_multiplier)}</TableCell>
                                            <TableCell>{formatFloat(row.raw_points)}</TableCell>
                                            <TableCell className="font-extrabold">{row.points}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    )
}

