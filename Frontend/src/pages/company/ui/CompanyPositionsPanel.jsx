import { useEffect, useState } from 'react'
import { FiPlus, FiUsers } from 'react-icons/fi'
import { usersApi } from '@/shared/api/users'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'

export function CompanyPositionsPanel() {
    const [positions, setPositions] = useState([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [headOfGroup, setHeadOfGroup] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadPositions()
    }, [])

    async function loadPositions() {
        setLoading(true)
        try {
            const data = await usersApi.getPositions()
            setPositions(data)
        } catch {
            setPositions([])
        } finally {
            setLoading(false)
        }
    }

    async function handleCreate(e) {
        e.preventDefault()
        if (!name.trim()) {
            setError('Введите название должности')
            return
        }
        setSaving(true)
        setError('')
        try {
            await usersApi.createPosition({
                name: name.trim(),
                head_of_group: headOfGroup,
            })
            setName('')
            setHeadOfGroup(false)
            await loadPositions()
        } catch (err) {
            setError(err.response?.data?.detail || 'Не удалось создать должность')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                <div className="space-y-1.5">
                    <Label htmlFor="position_name">Новая должность</Label>
                    <Input
                        id="position_name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Например: Старший монтажник"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={headOfGroup}
                            onChange={(e) => setHeadOfGroup(e.target.checked)}
                            className="w-4 h-4 accent-primary"
                        />
                        Может быть бригадиром (head_of_group)
                    </label>
                    <Button type="submit" className="gap-2" disabled={saving}>
                        <FiPlus size={14} />
                        {saving ? 'Создание...' : 'Создать'}
                    </Button>
                </div>
            </form>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <div className="border divide-y">
                {loading ? (
                    <div className="p-4 text-sm text-gray-400">Загрузка должностей...</div>
                ) : positions.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400">Должностей пока нет</div>
                ) : (
                    positions.map(pos => (
                        <div key={pos.id} className="px-4 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-800 truncate">{pos.name}</p>
                                <p className="text-xs text-gray-500">ID: {pos.id}</p>
                            </div>
                            {pos.head_of_group ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 font-semibold">
                                    <FiUsers size={11} />
                                    head_of_group
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-500">
                                    обычная
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
