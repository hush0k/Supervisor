import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiArrowLeft, FiMail, FiUser, FiCalendar, FiBriefcase, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import { usersApi } from '@/shared/api/users'
import { statisticsApi } from '@/shared/api/statistics'
import { Button } from '@/shared/ui/button'

function formatMoney(value) {
    return `${Math.round(value || 0).toLocaleString('ru-RU')} ₸`
}

function roleLabel(role) {
    if (role === 'admin') return 'Админ'
    if (role === 'supervisor') return 'Супервайзер'
    if (role === 'head') return 'Руководитель'
    return 'Сотрудник'
}

function StatCard({ label, value, hint }) {
    return (
        <div className="bg-white border p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
            {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
        </div>
    )
}

function PointsLineChart({ points = [] }) {
    if (!points.length) {
        return <div className="h-56 flex items-center justify-center text-sm text-gray-400">Нет данных для графика</div>
    }

    const W = 680
    const H = 240
    const PAD = { top: 20, right: 16, bottom: 36, left: 48 }
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const values = points.map(p => p.value || 0)
    const max = Math.max(...values, 1)

    const toX = i => (points.length === 1 ? PAD.left + innerW / 2 : PAD.left + (i / (points.length - 1)) * innerW)
    const toY = v => PAD.top + innerH - (v / max) * innerH
    const coords = points.map((p, i) => ({ x: toX(i), y: toY(p.value || 0), point: p }))

    const line = coords.length
        ? `M ${coords.map(c => `${c.x} ${c.y}`).join(' L ')}`
        : ''

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[320px]">
                <defs>
                    <linearGradient id="empPointsArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
                    </linearGradient>
                </defs>

                <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH} stroke="#e2e8f0" />
                <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="#e2e8f0" />

                {coords.length > 1 && (
                    <path
                        d={`${line} L ${coords[coords.length - 1].x} ${PAD.top + innerH} L ${coords[0].x} ${PAD.top + innerH} Z`}
                        fill="url(#empPointsArea)"
                    />
                )}
                <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.5" />

                {coords.map(c => (
                    <circle key={String(c.point.date)} cx={c.x} cy={c.y} r="3.5" fill="#2563eb" />
                ))}

                {coords.map((c, i) => {
                    if (i !== 0 && i !== coords.length - 1 && i % 2 !== 0) return null
                    return (
                        <text key={`x-${i}`} x={c.x} y={H - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
                            {new Date(c.point.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
                        </text>
                    )
                })}
            </svg>
        </div>
    )
}

export function EmployeeProfileContent() {
    const navigate = useNavigate()
    const { userId } = useParams()
    const parsedUserId = Number(userId)
    const isValidUserId = Number.isFinite(parsedUserId) && parsedUserId > 0

    const userQuery = useQuery({
        queryKey: ['employee-profile', parsedUserId],
        queryFn: () => usersApi.getById(parsedUserId),
        enabled: isValidUserId,
    })

    const dashboardQuery = useQuery({
        queryKey: ['employee-dashboard', parsedUserId],
        queryFn: () => statisticsApi.getDashboard(parsedUserId, 30),
        enabled: isValidUserId,
    })

    const chartQuery = useQuery({
        queryKey: ['employee-chart', parsedUserId],
        queryFn: () => statisticsApi.getChart(parsedUserId, 'total_points'),
        enabled: isValidUserId,
    })

    const loading = userQuery.isLoading || dashboardQuery.isLoading || chartQuery.isLoading
    const user = userQuery.data
    const dashboard = dashboardQuery.data
    const chart = chartQuery.data?.data ?? []

    const fullName = useMemo(() => {
        if (!user) return 'Сотрудник'
        return `${user.last_name} ${user.first_name}`.trim()
    }, [user])

    if (!isValidUserId) {
        return <div className="p-6 text-sm text-red-500">Некорректный id сотрудника</div>
    }

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-24 bg-white border animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white border animate-pulse" />)}
                </div>
                <div className="h-64 bg-white border animate-pulse" />
            </div>
        )
    }

    if (!user || !dashboard) {
        return <div className="p-6 text-sm text-red-500">Не удалось загрузить профиль сотрудника</div>
    }

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <FiArrowLeft size={16} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">{fullName}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Личный профиль сотрудника</p>
                    </div>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
                <div className="bg-white border p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiUser className="text-gray-400" size={14} />
                        <span>{roleLabel(user.role)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiMail className="text-gray-400" size={14} />
                        <span>{user.login}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiCalendar className="text-gray-400" size={14} />
                        <span>{new Date(user.date_of_birth).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiBriefcase className="text-gray-400" size={14} />
                        <span>{user.position?.name || 'Без должности'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard label="Очки за месяц" value={dashboard.current_month_points.toLocaleString('ru-RU')} hint={`Прошлый: ${dashboard.last_month_points.toLocaleString('ru-RU')}`} />
                    <StatCard label="Подтверждено задач" value={dashboard.tasks_verified} hint={`Успешность: ${Math.round(dashboard.success_rate)}%`} />
                    <StatCard label="В процессе" value={dashboard.tasks_in_progress} hint={`Доступно: ${dashboard.tasks_available}`} />
                    <StatCard label="Заработано" value={formatMoney(dashboard.profit_for_period)} hint={`Место в рейтинге: ${dashboard.leaderboard_position ? '#' + dashboard.leaderboard_position : '—'}`} />
                </div>

                <div className="bg-white border p-5">
                    <div className="flex items-center gap-2 mb-2 text-gray-600">
                        <FiTrendingUp size={15} />
                        <p className="text-xs uppercase tracking-wider font-semibold">Динамика очков</p>
                    </div>
                    <PointsLineChart points={chart} />
                </div>
            </div>
        </div>
    )
}
