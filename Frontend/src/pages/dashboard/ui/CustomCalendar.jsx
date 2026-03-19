import { Calendar } from "@/shared/ui/calendar"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export function CustomCalendar() {
    const [date, setDate] = useState(new Date())
    const [month, setMonth] = useState(new Date())

    return (
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonth}
            showOutsideDays
            locale={ru}
            components={{
                Caption: () => (
                    <div className="flex justify-between items-center px-1 mb-2">
                        <button
                            onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
                            className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-sm font-black uppercase tracking-wide">
                            <span className="text-sm font-black tracking-wide capitalize">
                                {format(month, "LLLL yyyy", { locale: ru })}
                            </span>
                        </span>
                        <button
                            onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
                            className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )
            }}
            classNames={{
                months: "w-full",
                month: "w-full space-y-2 p-3",
                caption: "hidden",
                table: "w-full",
                head_row: "flex justify-between",
                head_cell: "w-8 text-center text-xs font-semibold text-muted-foreground",
                row: "flex justify-between mt-1",
                cell: "w-8 h-8 text-center",
                day: "w-8 h-8 flex items-center justify-center rounded text-sm font-medium hover:bg-accent transition-colors cursor-pointer",
                day_selected: "bg-blue-600 text-white rounded-md hover:bg-blue-600",
                day_today: "text-blue-600 font-bold",
                day_outside: "text-muted-foreground opacity-40",
            }}
        />
    )
}