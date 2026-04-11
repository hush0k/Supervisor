import { useEffect, useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiTrendingDown, FiTrendingUp } from 'react-icons/fi'

const W = 760
const H = 290
const PAD = { top: 22, right: 18, bottom: 42, left: 56 }

function formatMoney(value) {
    return `${Math.round(value || 0).toLocaleString('ru-RU')} ₸`
}

function monthKeyToDate(month) {
    const [year, mon] = String(month || '').split('-').map(Number)
    return new Date(year, (mon || 1) - 1, 1)
}

function getMonthLabel(month, long = false) {
    const date = monthKeyToDate(month)
    return date.toLocaleDateString('ru-RU', long
        ? { month: 'long', year: 'numeric' }
        : { month: 'short' })
}

function getYear(month) {
    return Number(String(month).slice(0, 4))
}

function toMonthKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
}

function linePath(points) {
    if (!points.length) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i += 1) {
        d += ` L ${points[i].x} ${points[i].y}`
    }
    return d
}

function YearSelector({ years, selectedYear, onSelect, windowStart, onShift }) {
    const visibleYears = years.slice(windowStart, windowStart + 5)
    const canLeft = windowStart > 0
    const canRight = windowStart + 5 < years.length

    return (
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
                type="button"
                onClick={() => onShift(-1)}
                disabled={!canLeft}
                className="w-7 h-7 inline-flex items-center justify-center border text-gray-600 disabled:opacity-35 disabled:cursor-not-allowed"
                aria-label="Предыдущие годы"
            >
                <FiChevronLeft size={14} />
            </button>

            <div className="flex items-center gap-1 overflow-x-auto">
                {visibleYears.map(year => (
                    <button
                        type="button"
                        key={year}
                        onClick={() => onSelect(year)}
                        className={`px-2.5 h-7 border text-xs font-semibold whitespace-nowrap ${
                            selectedYear === year
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        {year}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={() => onShift(1)}
                disabled={!canRight}
                className="w-7 h-7 inline-flex items-center justify-center border text-gray-600 disabled:opacity-35 disabled:cursor-not-allowed"
                aria-label="Следующие годы"
            >
                <FiChevronRight size={14} />
            </button>
        </div>
    )
}

function StatTile({ label, value, hint, positive = null }) {
    return (
        <div className="border bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
            <p className="text-lg font-extrabold text-gray-800 mt-1">{value}</p>
            {hint && (
                <div className="mt-1 text-xs inline-flex items-center gap-1">
                    {positive !== null && (positive
                        ? <FiTrendingUp className="text-emerald-600" size={12} />
                        : <FiTrendingDown className="text-rose-600" size={12} />)}
                    <span className={positive === null ? 'text-gray-400' : positive ? 'text-emerald-600' : 'text-rose-600'}>{hint}</span>
                </div>
            )}
        </div>
    )
}

export function CompanyCompensationChart({ data = [] }) {
    const sorted = useMemo(() => [...data].sort((a, b) => a.month.localeCompare(b.month)), [data])
    const years = useMemo(() => {
        const set = new Set(sorted.map(item => getYear(item.month)))
        return Array.from(set).sort((a, b) => a - b)
    }, [sorted])

    const currentMonthKey = toMonthKey(new Date())
    const currentMonthRecord = sorted.find(item => item.month === currentMonthKey)
    const fallbackMonth = sorted[sorted.length - 1]?.month ?? null

    const [selectedYear, setSelectedYear] = useState(years[years.length - 1] ?? new Date().getFullYear())
    const [windowStart, setWindowStart] = useState(Math.max(0, years.length - 5))
    const [selectedMonth, setSelectedMonth] = useState(currentMonthRecord?.month ?? fallbackMonth)
    const [hoveredIndex, setHoveredIndex] = useState(null)

    useEffect(() => {
        if (!years.length) return
        const latestYear = years[years.length - 1]
        if (!years.includes(selectedYear)) {
            setSelectedYear(latestYear)
        }
        setWindowStart(prev => {
            if (years.length <= 5) return 0
            if (prev > years.length - 5) return years.length - 5
            return prev
        })
    }, [years, selectedYear])

    useEffect(() => {
        if (!sorted.length || !years.length) return
        if (!selectedMonth) {
            setSelectedMonth(currentMonthRecord?.month ?? fallbackMonth)
            return
        }

        const yearItems = sorted.filter(item => getYear(item.month) === selectedYear)
        if (!yearItems.length) return

        const inYear = yearItems.some(item => item.month === selectedMonth)
        if (!inYear) {
            const currentInYear = yearItems.find(item => item.month === currentMonthKey)
            setSelectedMonth(currentInYear?.month ?? yearItems[yearItems.length - 1].month)
        }
    }, [selectedYear, sorted, selectedMonth, currentMonthKey, years.length, fallbackMonth, currentMonthRecord?.month])

    if (!sorted.length || !selectedMonth) {
        return (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                Пока нет данных по зарплатам и бонусам
            </div>
        )
    }

    const yearData = sorted.filter(item => getYear(item.month) === selectedYear)
    if (!yearData.length) {
        return (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                Нет данных за выбранный год
            </div>
        )
    }

    const selected = yearData.find(item => item.month === selectedMonth) ?? yearData[yearData.length - 1]
    const selectedIndex = Math.max(0, yearData.findIndex(item => item.month === selected.month))

    const prev = selectedIndex > 0 ? yearData[selectedIndex - 1] : null
    const payrollDelta = prev ? selected.payroll_fund - prev.payroll_fund : 0
    const bonusDelta = prev ? selected.bonus_paid - prev.bonus_paid : 0

    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const yMax = Math.max(
        ...yearData.map(item => Math.max(item.payroll_fund || 0, item.bonus_paid || 0, item.avg_salary || 0)),
        1,
    )

    const toX = index => {
        if (yearData.length === 1) return PAD.left + innerW / 2
        return PAD.left + (index / (yearData.length - 1)) * innerW
    }
    const toY = value => PAD.top + innerH - ((value || 0) / yMax) * innerH

    const payrollPoints = yearData.map((item, index) => ({
        x: toX(index),
        y: toY(item.payroll_fund),
        value: item.payroll_fund,
        bonus: item.bonus_paid,
        month: item.month,
    }))

    const bonusPoints = yearData.map((item, index) => ({
        x: toX(index),
        y: toY(item.bonus_paid),
        value: item.bonus_paid,
        month: item.month,
    }))

    const activeIndex = hoveredIndex ?? selectedIndex
    const activePoint = payrollPoints[activeIndex]

    const yTicks = [0, yMax * 0.33, yMax * 0.66, yMax]

    const onSelectYear = year => {
        setSelectedYear(year)

        const yearDataLocal = sorted.filter(item => getYear(item.month) === year)
        const currentInYear = yearDataLocal.find(item => item.month === currentMonthKey)
        if (yearDataLocal.length) {
            setSelectedMonth(currentInYear?.month ?? yearDataLocal[yearDataLocal.length - 1].month)
        }

        const index = years.indexOf(year)
        if (index < windowStart) setWindowStart(index)
        if (index >= windowStart + 5) setWindowStart(index - 4)
    }

    const onShiftYears = step => {
        setWindowStart(prev => {
            const next = prev + step
            if (next < 0) return 0
            if (next > Math.max(0, years.length - 5)) return Math.max(0, years.length - 5)
            return next
        })
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                        Фонд зарплат
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        Бонусы
                    </span>
                </div>
                <YearSelector
                    years={years}
                    selectedYear={selectedYear}
                    onSelect={onSelectYear}
                    windowStart={windowStart}
                    onShift={onShiftYears}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 border bg-white p-3 overflow-x-auto">
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        className="w-full min-w-[320px]"
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <defs>
                            <linearGradient id="companyPayrollArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {yTicks.map((tick, idx) => {
                            const y = toY(tick)
                            return (
                                <g key={idx}>
                                    <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#eef2f7" strokeWidth="1" />
                                    <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                                        {Math.round(tick).toLocaleString('ru-RU')}
                                    </text>
                                </g>
                            )
                        })}

                        {payrollPoints.length > 1 && (
                            <path
                                d={`${linePath(payrollPoints)} L ${payrollPoints[payrollPoints.length - 1].x} ${PAD.top + innerH} L ${payrollPoints[0].x} ${PAD.top + innerH} Z`}
                                fill="url(#companyPayrollArea)"
                            />
                        )}

                        <path d={linePath(payrollPoints)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                        <path d={linePath(bonusPoints)} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />

                        {payrollPoints.map((pt, i) => {
                            const width = yearData.length > 1 ? innerW / (yearData.length - 1) : 26
                            return (
                                <rect
                                    key={pt.month}
                                    x={pt.x - Math.max(14, width / 2)}
                                    y={PAD.top}
                                    width={Math.max(28, width)}
                                    height={innerH}
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onClick={() => setSelectedMonth(pt.month)}
                                    style={{ cursor: 'pointer' }}
                                />
                            )
                        })}

                        {payrollPoints.map((pt, i) => {
                            const active = i === activeIndex || pt.month === selected.month
                            return (
                                <g key={`dot-${pt.month}`}>
                                    <circle cx={pt.x} cy={pt.y} r={active ? 5 : 3.5} fill="#3b82f6" />
                                    <circle cx={bonusPoints[i].x} cy={bonusPoints[i].y} r={active ? 4 : 3} fill="#10b981" />
                                </g>
                            )
                        })}

                        {payrollPoints.map((pt, i) => {
                            const show = i === 0 || i === payrollPoints.length - 1 || i % Math.max(1, Math.ceil(payrollPoints.length / 6)) === 0
                            if (!show) return null
                            return (
                                <text key={`x-${pt.month}`} x={pt.x} y={H - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
                                    {getMonthLabel(pt.month)}
                                </text>
                            )
                        })}

                        {activePoint && (
                            <g>
                                <line
                                    x1={activePoint.x}
                                    y1={PAD.top}
                                    x2={activePoint.x}
                                    y2={PAD.top + innerH}
                                    stroke="#cbd5e1"
                                    strokeDasharray="4 4"
                                />

                                <rect
                                    x={Math.min(Math.max(activePoint.x - 74, PAD.left), W - PAD.right - 148)}
                                    y={PAD.top + 8}
                                    width={148}
                                    height={44}
                                    fill="#0f172a"
                                    rx="6"
                                />
                                <text
                                    x={Math.min(Math.max(activePoint.x, PAD.left + 74), W - PAD.right - 74)}
                                    y={PAD.top + 25}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="11"
                                    fontWeight="700"
                                >
                                    {getMonthLabel(activePoint.month, true)}
                                </text>
                                <text
                                    x={Math.min(Math.max(activePoint.x, PAD.left + 74), W - PAD.right - 74)}
                                    y={PAD.top + 40}
                                    textAnchor="middle"
                                    fill="#93c5fd"
                                    fontSize="10"
                                >
                                    {formatMoney(activePoint.value)}
                                </text>
                            </g>
                        )}
                    </svg>
                </div>

                <div className="border bg-gray-50 p-4 flex flex-col gap-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Выбранный период</p>
                        <p className="text-base font-bold text-gray-800 mt-1">{getMonthLabel(selected.month, true)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">По умолчанию показывается текущий месяц</p>
                    </div>

                    <StatTile
                        label="Фонд зарплат"
                        value={formatMoney(selected.payroll_fund)}
                        hint={prev ? `${payrollDelta >= 0 ? '+' : ''}${formatMoney(payrollDelta)} к прошлому месяцу` : 'Первый месяц в истории'}
                        positive={prev ? payrollDelta >= 0 : null}
                    />

                    <StatTile
                        label="Средняя зарплата"
                        value={formatMoney(selected.avg_salary)}
                        hint={`${selected.employees_count} сотрудников в месяце`}
                    />

                    <StatTile
                        label="Бонусы"
                        value={formatMoney(selected.bonus_paid)}
                        hint={prev ? `${bonusDelta >= 0 ? '+' : ''}${formatMoney(bonusDelta)} к прошлому месяцу` : 'Первый месяц в истории'}
                        positive={prev ? bonusDelta >= 0 : null}
                    />
                </div>
            </div>
        </div>
    )
}
