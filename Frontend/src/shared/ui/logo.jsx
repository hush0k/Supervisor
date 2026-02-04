import {cn} from "@/shared/lib/utils.js";

export function Logo({src, size = 22, className, onClick }) {
    return (
        <img
            src={src}
            alt="Logo"
            width={size*3}
            height={size}
            onClick={onClick}
            className={cn(onClick && "cursor-pointer", className)}
        />
    )
}