import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function CheckboxDemo() {
    const [items, setItems] = useState({
        notifications: true,
        reports: false,
        updates: true,
    })

    return (
        <div className="space-y-6 p-6">
            <div>
                <h3 className="text-sm font-medium mb-4">CHECKBOXES</h3>
                <div className="space-y-3">
                    {Object.entries(items).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                                id={key}
                                checked={value}
                                onCheckedChange={(checked) =>
                                    setItems(prev => ({ ...prev, [key]: checked }))
                                }
                            />
                            <Label htmlFor={key} className="cursor-pointer capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Показать выбранные */}
            <div className="text-sm text-muted-foreground">
                Selected: {JSON.stringify(items, null, 2)}
            </div>
        </div>
    )
}