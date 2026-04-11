import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BsBuildingFill } from 'react-icons/bs'
import { FiArrowRight, FiUsers, FiBriefcase, FiActivity, FiTrendingUp, FiBarChart2 } from 'react-icons/fi'
import { useCompanyOverview } from '@/features/company/useCompanyOverview'
import { useCompanyPriorityTasks } from '@/features/tasks/useCompanyPriorityTasks'
import { PriorityTasksCarousel } from '@/shared/ui/PriorityTasksCarousel'

const CHART_W = 420
const CHART_H = 170
const PAD = { top: 16, right: 12, bottom: 24, left: 16 }

function formatMoney(value) {
    return `${Math.round(value || 0).toLocaleString('ru-RU')} ₸`
}

function monthLabel(month, long = false) {
    const [year, mon] = String(month || '').split('-').map(Number)
    return new Date(year, (mon || 1) - 1, 1).toLocaleDateString(
        'ru-RU',
        long ? { month: 'long', year: 'numeric' } : { month: 'short' },
    )
}

function linePath(points) {
    if (!points.length) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i += 1) d += ` L ${points[i].x} ${points[i].y}`
    return d
}

function AccentStat({ label, value, hint, icon, tone }) {
    const map = {
        blue: { text: 'text-blue-700', border: 'border-blue-200' },
        amber: { text: 'text-amber-700', border: 'border-amber-200' },
        emerald: { text: 'text-emerald-700', border: 'border-emerald-200' },
        rose: { text: 'text-rose-700', border: 'border-rose-200' },
    }
    const classes = map[tone] || map.blue

    return (
        <div className="border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className={`text-[10px] uppercase tracking-wider font-semibold ${classes.text}`}>{label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-gray-900 truncate">{value}</p>
                    {hint ? <p className="mt-1 text-xs text-gray-600 truncate">{hint}</p> : null}
                </div>
                <div className={`w-9 h-9 border bg-gray-50 flex items-center justify-center shrink-0 ${classes.border} ${classes.text}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function PayrollSparkline({ stats }) {
    const [hovered, setHovered] = useState(null)
    const data = (stats || []).slice(-8)
    if (!data.length) {
        return <div className="h-40 flex items-center justify-center text-sm text-gray-400">Нет данных</div>
    }

    const innerW = CHART_W - PAD.left - PAD.right
    const innerH = CHART_H - PAD.top - PAD.bottom
    const max = Math.max(...data.map(d => Math.max(d.payroll_fund || 0, d.bonus_paid || 0)), 1)

    const toX = i => (data.length === 1
        ? PAD.left + innerW / 2
        : PAD.left + (i / (data.length - 1)) * innerW)
    const toY = value => PAD.top + innerH - ((value || 0) / max) * innerH

    const payroll = data.map((d, i) => ({ x: toX(i), y: toY(d.payroll_fund), month: d.month }))
    const bonus = data.map((d, i) => ({ x: toX(i), y: toY(d.bonus_paid), month: d.month }))
    const active = hovered !== null ? data[hovered] : null
    const tooltipW = 190
    const tooltipH = 66
    const tooltipX = hovered !== null
        ? Math.min(Math.max(payroll[hovered].x - tooltipW / 2, 8), CHART_W - tooltipW - 8)
        : 8
    const tooltipCenterX = tooltipX + tooltipW / 2
    const tooltipTextX = tooltipX + 12

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full min-w-[300px]">
                <defs>
                    <linearGradient id="managerArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
                    </linearGradient>
                </defs>

                <path
                    d={`${linePath(payroll)} L ${payroll[payroll.length - 1].x} ${PAD.top + innerH} L ${payroll[0].x} ${PAD.top + innerH} Z`}
                    fill="url(#managerArea)"
                />
                <path d={linePath(payroll)} fill="none" stroke="#2563eb" strokeWidth="2.5" />
                <path d={linePath(bonus)} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />

                {payroll.map((pt, i) => (
                    <g key={pt.month}>
                        <circle cx={pt.x} cy={pt.y} r="3" fill="#2563eb" />
                        <circle cx={bonus[i].x} cy={bonus[i].y} r="2.5" fill="#10b981" />
                    </g>
                ))}

                {payroll.map((pt, i) => {
                    const step = data.length > 1 ? innerW / (data.length - 1) : 24
                    return (
                        <rect
                            key={`hover-${pt.month}`}
                            x={pt.x - Math.max(12, step / 2)}
                            y={PAD.top}
                            width={Math.max(24, step)}
                            height={innerH}
                            fill="transparent"
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        />
                    )
                })}

                {payroll.map((pt, i) => {
                    if (i !== 0 && i !== payroll.length - 1 && i % 2 !== 0) return null
                    return (
                        <text key={`m-${pt.month}`} x={pt.x} y={CHART_H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
                            {monthLabel(pt.month)}
                        </text>
                    )
                })}

                {hovered !== null && active && (
                    <g>
                        <line x1={payroll[hovered].x} y1={PAD.top} x2={payroll[hovered].x} y2={PAD.top + innerH} stroke="#cbd5e1" strokeDasharray="4 3" />
                        <rect
                            x={tooltipX}
                            y={PAD.top + 8}
                            width={tooltipW}
                            height={tooltipH}
                            fill="#ffffff"
                            stroke="#e2e8f0"
                            rx="8"
                        />
                        <text
                            x={tooltipCenterX}
                            y={PAD.top + 23}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="10"
                            fontWeight="600"
                        >
                            {monthLabel(active.month, true)}
                        </text>
                        <text
                            x={tooltipTextX}
                            y={PAD.top + 41}
                            textAnchor="start"
                            fill="#2563eb"
                            fontSize="10.5"
                            fontWeight="700"
                        >
                            {`ЗП: ${formatMoney(active.payroll_fund)}`}
                        </text>
                        <text
                            x={tooltipTextX}
                            y={PAD.top + 56}
                            textAnchor="start"
                            fill="#059669"
                            fontSize="10.5"
                            fontWeight="700"
                        >
                            {`Бонус: ${formatMoney(active.bonus_paid)}`}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    )
}

function TasksMiniBars({ stats }) {
    const data = (stats || []).slice(-6)
    if (!data.length) {
        return <div className="h-40 flex items-center justify-center text-sm text-gray-400">Нет данных</div>
    }

    const max = Math.max(...data.map(d => Math.max(d.verified || 0, d.failed || 0, d.completed || 0)), 1)

    return (
        <div className="flex flex-col gap-2.5">
            {data.map(item => (
                <div key={item.month} className="grid grid-cols-[42px_1fr] gap-2 items-center">
                    <span className="text-[11px] text-gray-500 font-semibold">{monthLabel(item.month)}</span>
                    <div className="grid grid-cols-3 gap-1.5">
                        <div className="h-2 bg-emerald-100 overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(item.verified / max) * 100}%` }} />
                        </div>
                        <div className="h-2 bg-rose-100 overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${(item.failed / max) * 100}%` }} />
                        </div>
                        <div className="h-2 bg-indigo-100 overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${(item.completed / max) * 100}%` }} />
                        </div>
                    </div>
                </div>
            ))}

            <div className="pt-1 flex items-center gap-3 text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500" />Принято</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-rose-500" />Отклонено</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-indigo-500" />На проверке</span>
            </div>
        </div>
    )
}

export function ManagerDashboardContent() {
    const { data, isLoading, isError } = useCompanyOverview(30)
    const {
        data: priorityTasks = [],
        isLoading: priorityLoading,
    } = useCompanyPriorityTasks()

    if (isLoading) {
        return (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-28 bg-white border animate-pulse" />
                ))}
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="p-6">
                <div className="bg-white border p-6">
                    <h2 className="text-xl font-extrabold text-gray-800">Главная</h2>
                    <p className="text-sm text-gray-500 mt-2">Не удалось загрузить сводку компании.</p>
                    <Link to="/company" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Перейти в Моя компания <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>
        )
    }

    const currentMonth = data.monthly_compensation_stats?.[data.monthly_compensation_stats.length - 1] ?? null

    return (
        <div className="flex flex-col w-full min-h-full">
            <div className="bg-white border-b px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white shrink-0">
                        <BsBuildingFill size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Главная</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Краткая сводка по компании за последние 30 дней</p>
                    </div>
                </div>
                <Link
                    to="/company"
                    className="inline-flex items-center gap-2 h-9 px-3 border bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700"
                >
                    Детальная аналитика
                    <FiArrowRight size={14} />
                </Link>
            </div>

            <div className="p-6 flex flex-col gap-5">
                <div className="border bg-white p-5">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Company Snapshot</p>
                            <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-gray-900">{data.company.name}</h2>
                            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                                {data.company.description || 'Краткий центр управления: ключевые метрики и динамика. Полная аналитика доступна в разделе «Моя компания».'}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-[240px]">
                            <div className="bg-white border p-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Фонд зарплат</p>
                                <p className="text-lg font-extrabold mt-1 text-gray-900">{formatMoney(currentMonth?.payroll_fund)}</p>
                            </div>
                            <div className="bg-white border p-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Бонусы</p>
                                <p className="text-lg font-extrabold mt-1 text-gray-900">{formatMoney(currentMonth?.bonus_paid)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <AccentStat
                        tone="blue"
                        icon={<FiUsers size={16} />}
                        label="Сотрудники"
                        value={data.employees_count}
                        hint={`Основана: ${new Date(data.company.date_established).toLocaleDateString('ru-RU')}`}
                    />
                    <AccentStat
                        tone="amber"
                        icon={<FiBriefcase size={16} />}
                        label="Задачи в работе"
                        value={data.tasks_in_progress}
                        hint={`Доступно: ${data.tasks_available}`}
                    />
                    <AccentStat
                        tone="emerald"
                        icon={<FiActivity size={16} />}
                        label="Проверено"
                        value={data.tasks_verified}
                        hint={`Отклонено: ${data.tasks_failed}`}
                    />
                    <AccentStat
                        tone="rose"
                        icon={<FiTrendingUp size={16} />}
                        label="Успешность"
                        value={`${Math.round(data.success_rate || 0)}%`}
                        hint="За выбранный период"
                    />
                </div>

                <PriorityTasksCarousel
                    tasks={priorityTasks}
                    isLoading={priorityLoading}
                    title="Приоритетные задачи компании"
                    subtitle="Максимум 10 задач: критичные + дедлайн, затем дедлайн, затем критичные"
                />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 bg-white border p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Зарплаты и бонусы (последние 8 месяцев)</p>
                            <span className="text-[11px] text-gray-400">Фонд / Бонусы</span>
                        </div>
                        <PayrollSparkline stats={data.monthly_compensation_stats} />
                    </div>

                    <div className="bg-white border p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FiBarChart2 className="text-gray-500" size={15} />
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Пульс задач (6 месяцев)</p>
                        </div>
                        <TasksMiniBars stats={data.monthly_task_stats} />
                    </div>
                </div>

                <div className="bg-white border p-4 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-bold text-gray-800">Нужна полная аналитика по годам и месяцам?</p>
                        <p className="text-xs text-gray-500 mt-1">В «Моя компания» доступен детальный интерактивный график зарплат/бонусов и вся структура команды.</p>
                    </div>
                    <Link to="/company" className="inline-flex items-center gap-2 h-9 px-3 border bg-primary text-white hover:bg-primary/90 text-sm font-semibold shrink-0">
                        Открыть «Моя компания»
                        <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
