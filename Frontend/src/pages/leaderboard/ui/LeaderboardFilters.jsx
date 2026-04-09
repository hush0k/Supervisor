import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'

export function LeaderboardFilters({ limit, onLimitChange, sortOrder, onSortOrderChange }) {
    return (
        <div className="flex flex-wrap items-end gap-4 bg-white border px-5 py-4">
            <div className="flex flex-col gap-1 w-36">
                <Label className="text-xs text-gray-500">Показать</Label>
                <Select value={String(limit)} onValueChange={v => onLimitChange(Number(v))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">Топ 10</SelectItem>
                        <SelectItem value="25">Топ 25</SelectItem>
                        <SelectItem value="50">Топ 50</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1 w-44">
                <Label className="text-xs text-gray-500">Порядок</Label>
                <Select value={sortOrder} onValueChange={onSortOrderChange}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">По убыванию очков</SelectItem>
                        <SelectItem value="asc">По возрастанию очков</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
