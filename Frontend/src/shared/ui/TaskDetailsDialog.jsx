import { useEffect, useState } from 'react'
import { tasksApi } from '@/shared/api/tasks'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog'

const CITY_LABELS = {
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

function formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('ru-RU')
}

function cityLabel(value) {
    if (!value) return '—'
    return CITY_LABELS[value] || value
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('ru-RU')} ₸`
}

function payoutHint(task) {
    if (!task) return '—'
    if (task.task_type !== 'group') {
        return `Оплата исполнителю: ${formatMoney(task.payment)}`
    }

    if (task.head_payment === null || task.head_payment === undefined) {
        return `Общий бюджет: ${formatMoney(task.payment)} · делится поровну между участниками`
    }

    return `Бригадир: ${formatMoney(task.head_payment)} · остальное делится поровну между участниками`
}

function fullName(user) {
    return `${user.last_name} ${user.first_name}`.trim()
}

function TaskParticipantsBlock({ task, participants, loading }) {
    const isAvailable = task?.task_step === 'available'
    const list = isAvailable ? participants.accessed_users : participants.executors
    const title = isAvailable ? 'Допущенные сотрудники' : 'Исполнители задачи'

    return (
        <div className="border p-3 bg-white">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{title}</p>
            {loading ? (
                <p className="text-xs text-gray-500 mt-2">Загрузка...</p>
            ) : !list?.length ? (
                <p className="text-xs text-gray-500 mt-2">Нет данных</p>
            ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {list.map(user => (
                        <span key={user.id} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700">
                            {fullName(user)} ({user.login})
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export function TaskDetailsDialog({ task, open, onOpenChange }) {
    const [participants, setParticipants] = useState({ accessed_users: [], executors: [] })
    const [participantsLoading, setParticipantsLoading] = useState(false)

    useEffect(() => {
        if (!task?.id || !open) return

        let ignore = false
        setParticipantsLoading(true)
        tasksApi.getParticipants(task.id)
            .then(data => {
                if (ignore) return
                setParticipants({
                    accessed_users: data?.accessed_users ?? [],
                    executors: data?.executors ?? [],
                })
            })
            .catch(() => {
                if (ignore) return
                setParticipants({ accessed_users: [], executors: [] })
            })
            .finally(() => {
                if (!ignore) setParticipantsLoading(false)
            })

        return () => {
            ignore = true
        }
    }, [task?.id, open])

    return (
        <Dialog
            open={open}
            onOpenChange={next => {
                if (!next) {
                    setParticipants({ accessed_users: [], executors: [] })
                }
                onOpenChange(next)
            }}
        >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-extrabold">{task?.name}</DialogTitle>
                </DialogHeader>

                {task && (
                    <div className="space-y-3 text-sm">
                        <p className="text-gray-600 leading-relaxed">{task.description || 'Без описания'}</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="border p-2.5 bg-gray-50">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Дедлайн</p>
                                <p className="font-semibold mt-1">{formatDate(task.deadline)}</p>
                            </div>
                            <div className="border p-2.5 bg-gray-50">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Оплата</p>
                                <p className="font-semibold mt-1">{formatMoney(task.payment)}</p>
                                <p className="text-xs text-gray-500 mt-1">{payoutHint(task)}</p>
                            </div>
                            <div className="border p-2.5 bg-gray-50">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Город</p>
                                <p className="font-semibold mt-1">{cityLabel(task.city)}</p>
                            </div>
                            <div className="border p-2.5 bg-gray-50">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Тип</p>
                                <p className="font-semibold mt-1">{task.task_type === 'group' ? 'Группа' : 'Соло'}</p>
                            </div>
                        </div>

                        <TaskParticipantsBlock
                            task={task}
                            participants={participants}
                            loading={participantsLoading}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
