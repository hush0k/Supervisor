import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef(({ className, icon, iconPosition = "before", children, ...props }, ref) => {
    const content = (
        <>
            {icon && iconPosition === "before" && (
                <span className="mr-2 inline-flex">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "after" && (
                <span className="ml-2 inline-flex">{icon}</span>
            )}
        </>
    )

    return (
        <LabelPrimitive.Root
            ref={ref}
            className={cn(labelVariants(), "flex items-center", className)}
            {...props}
        >
            {content}
        </LabelPrimitive.Root>
    )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
