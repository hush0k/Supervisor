const COLORS = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500',
]

function getColor(id) {
    return COLORS[id % COLORS.length]
}

function getInitials(first, last) {
    return `${(first?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}`
}

export function LeaderboardAvatar({ entry, size = 'md' }) {
    const sizeClass = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-16 h-16 text-lg',
    }[size]

    if (entry.avatar_url) {
        return (
            <img
                src={entry.avatar_url}
                alt=""
                className={`${sizeClass} rounded-full object-cover shrink-0`}
            />
        )
    }

    return (
        <div className={`${sizeClass} rounded-full shrink-0 flex items-center justify-center font-bold text-white ${getColor(entry.user_id)}`}>
            {getInitials(entry.user_first_name, entry.user_last_name)}
        </div>
    )
}
