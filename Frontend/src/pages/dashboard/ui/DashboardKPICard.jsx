import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'

function TrendBadge({ value, suffix = '' }) {
    if (value === null || value === undefined) return null
    if (value > 0) return (
        <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
            <FiTrendingUp size={11} /> +{value}{suffix}
        </span>
    )
    if (value < 0) return (
        <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500">
            <FiTrendingDown size={11} /> {value}{suffix}
        </span>
    )
    return (
        <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-400">
            <FiMinus size={11} /> 0{suffix}
        </span>
    )
}

export function DashboardKPICard({ icon, label, value, sub, trend, trendSuffix, accent }) {
    return (
        <div className="bg-white border p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`flex items-center justify-center w-10 h-10 shrink-0 ${accent ?? 'bg-primary/10 text-primary'}`}>
                    {icon}
                </div>
                {trend !== undefined && <TrendBadge value={trend} suffix={trendSuffix} />}
            </div>
            <div>
                <p className="text-2xl font-extrabold leading-tight">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    )
}
