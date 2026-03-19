import { Rocket } from "lucide-react"

export function EmptyPage() {
    return (
        <div>
            <div className="relative flex items-center justify-center w-16 h-16 bg-white shadow-md rotate-45">
                <Rocket className="w-8 h-8 text-blue-500 -rotate-45" />
            </div>
        </div>
    )
}