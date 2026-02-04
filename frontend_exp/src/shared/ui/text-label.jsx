import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const textLabelVariants = cva(
  "text-sm font-medium leading-none text-foreground"
)

const TextLabel = React.forwardRef(
  ({ className, icon, iconPosition = "before", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          textLabelVariants(),
          "inline-flex items-center",
          className
        )}
        {...props}
      >
        {icon && iconPosition === "before" && (
          <span className="mr-2 inline-flex">{icon}</span>
        )}
        {children}
        {icon && iconPosition === "after" && (
          <span className="ml-2 inline-flex">{icon}</span>
        )}
      </span>
    )
  }
)

TextLabel.displayName = "TextLabel"

export { TextLabel }
