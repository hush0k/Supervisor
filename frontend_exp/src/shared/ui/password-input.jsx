// frontend_exp/src/shared/ui/password-input.jsx

import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const PasswordInput = React.forwardRef(({ className, icon, error, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
        <div className="relative w-full">
            <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={cn(
                    "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    error
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-input focus-visible:ring-ring",
                    "pr-20",
                    className
                )}
                ref={ref}
                value={value}
                onChange={onChange}
                {...props}
            />

            {icon && !value && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    {icon}
                </div>
            )}

            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
            </button>
        </div>
    )
})
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }