import { Calendar } from "@/shared/ui/calendar"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export function CustomCalendar() {
    const [date, setDate] = useState(new Date())
    const [month, setMonth] = useState(new Date())

    return (
        <div className="w-full px-4 py-4 flex justify-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                month={month}
                onMonthChange={setMonth}
                showOutsideDays
                locale={ru}
                className="p-0 w-full"
                components={{
                    Caption: () => (
                        <div className="flex justify-between items-center px-2 mb-2">
                            <button
                                onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
                                className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-lg font-black uppercase tracking-wide">
                                {format(month, "LLLL yyyy", { locale: ru })}
                            </span>
                            <button
                                onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
                                className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )
                }}
                classNames={{
                    root: "w-full",
                    months: "w-full",
                    month: "w-full space-y-4",
                    caption: "hidden",
                    table: "w-full",
                    head_row: "flex justify-between",
                    head_cell: "w-10 text-center text-sm font-semibold text-muted-foreground",
                    row: "flex justify-between mt-2",
                    cell: "w-10 h-10 text-center",
                    day: "w-10 h-10 flex items-center justify-center rounded text-base font-medium hover:bg-accent transition-colors cursor-pointer",
                    day_selected: "bg-blue-600 text-white rounded-md hover:bg-blue-600",
                    day_today: "text-blue-600 font-bold",
                    day_outside: "text-muted-foreground opacity-40",
                }}
            />
        </div>
    )
}