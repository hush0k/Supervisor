import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function RadioButtonDemo() {
    const [access, setAccess] = useState("admin")

    return (
        <div className="space-y-6 p-6">
            <div>
                <h3 className="text-xs font-medium text-muted-foreground mb-4">
                    RADIO GROUP
                </h3>

                <RadioGroup value={access} onValueChange={setAccess} className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="r-admin" />
                        <Label htmlFor="r-admin" className="cursor-pointer font-normal">
                            Admin Access
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="viewer" id="r-viewer" />
                        <Label htmlFor="r-viewer" className="cursor-pointer font-normal">
                            Viewer Only
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Показать выбранное значение */}
            <div className="text-sm">
                Selected: <span className="font-medium">{access}</span>
            </div>
        </div>
    )
}