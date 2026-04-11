import { LeaderboardAvatar } from './LeaderboardAvatar'
import { useNavigate } from 'react-router-dom'

const VISUAL_SLOTS = [
    {
        entryIdx: 1,
        medal: '🥈',
        height: 'h-20',
        labelBg: 'bg-gray-100 text-gray-600',
        ring: 'ring-2 ring-gray-300',
        textSize: 'text-sm',
    },
    {
        entryIdx: 0,
        medal: '🥇',
        height: 'h-28',
        labelBg: 'bg-amber-100 text-amber-700',
        ring: 'ring-2 ring-amber-400',
        textSize: 'text-base',
    },
    {
        entryIdx: 2,
        medal: '🥉',
        height: 'h-14',
        labelBg: 'bg-orange-100 text-orange-600',
        ring: 'ring-2 ring-orange-300',
        textSize: 'text-sm',
    },
]

function PodiumSlot({ entry, config }) {
    const navigate = useNavigate()
    return (
        <button
            type="button"
            onClick={() => navigate(`/profile/${entry.user_id}`)}
            className="flex flex-col items-center gap-2"
        >
            <span className="text-2xl">{config.medal}</span>

            <div className={`${config.ring} rounded-full`}>
                <LeaderboardAvatar entry={entry} size="lg" />
            </div>

            <div className="flex flex-col items-center">
                <p className={`font-bold ${config.textSize} text-center leading-tight max-w-[96px] truncate`}>
                    {entry.user_first_name} {entry.user_last_name}
                </p>
                <span className={`mt-1 inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${config.labelBg}`}>
                    {entry.total_points} pts
                </span>
                <span className="text-xs text-gray-400 mt-0.5">
                    {Math.round(entry.success_rate)}% успех
                </span>
            </div>

            <div className={`w-24 ${config.height} bg-gray-100 border-t-2 border-gray-200 flex items-center justify-center`}>
                <span className="text-3xl font-extrabold text-gray-300">#{entry.rank_position}</span>
            </div>
        </button>
    )
}

export function LeaderboardPodium({ data }) {
    const top3 = data.filter(e => e.rank_position <= 3)

    if (top3.length === 0) return null

    return (
        <div className="flex items-end justify-center gap-6 py-8 bg-white border">
            {VISUAL_SLOTS.map((slot, i) => {
                const entry = top3[slot.entryIdx]
                if (!entry) return <div key={i} className="w-24" />
                return <PodiumSlot key={entry.user_id} entry={entry} config={slot} />
            })}
        </div>
    )
}
