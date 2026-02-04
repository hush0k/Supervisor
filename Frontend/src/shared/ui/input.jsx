import * as React from "react"
import { cn } from "@/shared/lib/utils"

const Input = React.forwardRef(({ className, type, error, icon, value, onChange, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    error
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-input focus-visible:ring-ring",
                    icon && "pr-10",
                    className
                )}
                ref={ref}
                value={value}
                onChange={onChange}
                {...props}
            />
            {icon && !value && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    {icon}
                </div>
            )}
        </div>
    )
})
Input.displayName = "Input"

export { Input }