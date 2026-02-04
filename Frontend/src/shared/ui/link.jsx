import { Link as RouterLink } from "react-router-dom"
import { cn } from "@/shared/lib/utils"

export function Link({ className, children, ...props }) {
    return (
        <RouterLink
            className={cn("text-primary font-bold text-sm hover:text-primary-foreground transition", className)}
            {...props}
        >
            {children}
        </RouterLink>
    )
}