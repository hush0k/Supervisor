const PERIODS = [
    { value: 7,   label: 'Неделя' },
    { value: 30,  label: 'Месяц' },
    { value: 180, label: '6 мес.' },
    { value: 365, label: 'Год' },
]

export function DashboardPeriodSelector({ value, onChange }) {
    return (
        <div className="flex items-center gap-1 bg-gray-100 p-1">
            {PERIODS.map(p => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                        value === p.value
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    )
}
