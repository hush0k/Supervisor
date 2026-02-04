

export function Advances({ icon, prime_text, secondary_text }) {
    return (
        <div className="flex flex-row w-11/12 h-10 gap-x-2">
            <div className="h-full bg-grey-blue w-10 flex-shrink-0 flex justify-center items-center">
                { icon }
            </div>
            <div className="flex flex-col w-full">
                <p className="font-semibold text-sm">{ prime_text }</p>
                <p className="font-normal text-xs text-muted-foreground">{ secondary_text }</p>
            </div>
        </div>
    )
}