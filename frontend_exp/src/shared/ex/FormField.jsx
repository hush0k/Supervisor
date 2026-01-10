import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function FormField({ label, error, helperText, className, ...props }) {
    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label>{label}</Label>}
            <Input error={error} {...props} />
            {helperText && (
                <p className={cn(
                    "text-xs",
                    error ? "text-red-500" : "text-muted-foreground"
                )}>
                    {helperText}
                </p>
            )}
        </div>
    )
}