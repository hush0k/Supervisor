function dynamicFontSize(str) {
    const l = str.length
    if (l <= 2)  return 28
    if (l <= 4)  return 24
    if (l <= 6)  return 20
    if (l <= 9)  return 16
    if (l <= 12) return 13
    return 11
}

// ─── arc math ─────────────────────────────────────────────────────────────────
// Half-circle gauge: left = 0%, top = 50%, right = 100%
// Uses clockwise sweep (sweep-flag=1), always large-arc=0 ⇒ top semicircle

function arcPoint(cx, cy, r, pct) {
    const angle = (Math.PI * Math.max(0, Math.min(100, pct))) / 100
    return [
        parseFloat((cx - r * Math.cos(angle)).toFixed(2)),
        parseFloat((cy - r * Math.sin(angle)).toFixed(2)),
    ]
}

// ─── Gauge SVG ────────────────────────────────────────────────────────────────

function GaugeSVG({ pct, color, value, scaleMax }) {
    const CX = 100, CY = 105, R = 72, SW = 11
    const p = Math.max(0, Math.min(100, pct ?? 0))

    const [bgX, bgY]   = arcPoint(CX, CY, R, 100)
    const [valX, valY] = arcPoint(CX, CY, R, p)

    const showTip = p > 5 && p < 95
    const fz = dynamicFontSize(value)

    // centroid of half-disk ≈ cy − 0.44 R
    const centerY = CY - R * 0.44

    return (
        <svg viewBox="0 0 200 132" className="w-full select-none">
            {/* ── background track ── */}
            <path
                d={`M ${CX - R},${CY} A ${R},${R} 0 0 1 ${bgX},${bgY}`}
                fill="none"
                stroke="#f0f4f8"
                strokeWidth={SW}
                strokeLinecap="round"
            />

            {/* ── filled arc ── */}
            {p > 0.5 && (
                <path
                    d={`M ${CX - R},${CY} A ${R},${R} 0 ${p >= 99.5 ? 1 : 0} 1 ${valX},${valY}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={SW}
                    strokeLinecap="round"
                />
            )}

            {/* ── tip dot ── */}
            {showTip && (
                <>
                    <circle cx={valX} cy={valY} r={SW / 2 + 3} fill="white" />
                    <circle cx={valX} cy={valY} r={SW / 2}     fill={color} opacity="0.25" />
                    <circle cx={valX} cy={valY} r={5}           fill={color} />
                </>
            )}

            {/* ── scale labels — below arc endpoints ── */}
            <text x={CX - R} y={CY + 18} textAnchor="middle" fontSize="9" fill="#c8d0da" fontFamily="inherit">0</text>
            {scaleMax && (
                <text x={CX + R} y={CY + 18} textAnchor="middle" fontSize="9" fill="#c8d0da" fontFamily="inherit">
                    {scaleMax}
                </text>
            )}

            {/* ── main value ── */}
            <text
                x={CX}
                y={centerY + fz * 0.4}
                textAnchor="middle"
                fontSize={fz}
                fontWeight="800"
                fill="#0d1117"
                fontFamily="inherit"
            >
                {value}
            </text>
        </svg>
    )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function KPICard({ color, title, pct, value, context, scaleMax, footer }) {
    return (
        <div
            className="bg-white flex flex-col overflow-hidden"
            style={{ border: '1px solid #e8ecf0', borderTop: `3px solid ${color}` }}
        >
            {/* header */}
            <div className="px-4 pt-3 pb-0 flex items-center justify-between">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-400">
                    {title}
                </span>
                <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>
                    {Math.round(pct ?? 0)}%
                </span>
            </div>

            {/* gauge */}
            <div className="px-2 pt-1 pb-0 flex justify-center">
                <div className="w-full max-w-[240px]">
                    <GaugeSVG pct={pct} color={color} value={value} scaleMax={scaleMax} />
                </div>
            </div>

            {/* context — sits just below the arc */}
            {context && (
                <p className="text-[11px] text-gray-400 text-center leading-snug px-3 -mt-2">
                    {context}
                </p>
            )}

            {/* footer */}
            {footer && (
                <p className="text-[10px] text-gray-400 text-center leading-snug px-3 pt-1 pb-3 mt-auto">
                    {footer}
                </p>
            )}
        </div>
    )
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export function CompanyKPIGrid({ data }) {
    const emp   = data.employees_count   ?? 0
    const busy  = data.tasks_in_progress ?? 0
    const total = data.tasks_total       ?? 0
    const avail = data.tasks_available   ?? 0
    const done  = data.tasks_completed   ?? 0
    const ver   = data.tasks_verified    ?? 0
    const fail  = data.tasks_failed      ?? 0
    const rate  = data.success_rate      ?? 0

    const closed   = ver + fail
    const activeTotal = avail + busy
    const utilPct  = emp   > 0 ? (busy  / emp)   * 100 : 0
    const availPct = total > 0 ? (avail / total)  * 100 : 0
    const donePct  = total > 0 ? (done  / total)  * 100 : 0
    const verPct   = closed > 0 ? (ver  / closed) * 100 : 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

            <KPICard
                color="#3b82f6"
                title="Сотрудники"
                pct={utilPct}
                value={String(emp)}
                context={busy > 0 ? `${busy} в работе` : 'нет активных'}
                scaleMax={String(emp)}
                footer="Загрузка команды"
            />

            <KPICard
                color="#f59e0b"
                title="Активные задачи"
                pct={activeTotal > 0 ? (busy / activeTotal) * 100 : 0}
                value={String(activeTotal)}
                context={`${busy} в работе · ${avail} доступно`}
                scaleMax={String(activeTotal)}
                footer="Только доступные и в работе"
            />

            <KPICard
                color="#8b5cf6"
                title="Успешность"
                pct={rate}
                value={`${Math.round(rate)}%`}
                context={closed > 0 ? `${ver} принято · ${fail} отклонено` : 'нет закрытых задач'}
                scaleMax="100%"
                footer="Доля одобренных"
            />

            <KPICard
                color="#06b6d4"
                title="Доступно"
                pct={availPct}
                value={String(avail)}
                context={total > 0 ? `${Math.round(availPct)}% от общего` : null}
                scaleMax={String(total)}
                footer="Можно взять в работу"
            />

            <KPICard
                color="#6366f1"
                title="Завершено"
                pct={donePct}
                value={String(done)}
                context={total > 0 ? `${Math.round(donePct)}% выполнено` : null}
                scaleMax={String(total)}
                footer="Ожидают проверки"
            />

            <KPICard
                color="#84cc16"
                title="Проверено"
                pct={verPct}
                value={String(ver)}
                context={closed > 0 ? `${Math.round(verPct)}% успешность` : null}
                scaleMax={closed > 0 ? String(closed) : null}
                footer="Из закрытых задач"
            />

        </div>
    )
}
