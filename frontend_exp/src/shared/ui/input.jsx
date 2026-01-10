import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
    return (
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
                className
            )}
            ref={ref}
            {...props}
        />
    );
})
Input.displayName = "Input"

export { Input }