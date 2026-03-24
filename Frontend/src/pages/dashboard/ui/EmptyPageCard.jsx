import { Button } from'@/shared/ui/button'
import { useNavigate } from "react-router-dom"

export function EmptyPageCard( {id, name, description, icon, button, last, nav } ) {
    const navigate = useNavigate()

    return (
        <div className={`flex flex-row gap-5 w-[32rem] ${last ? 'h-[11.25rem]' : 'h-56'}`}>
            <div className="flex flex-col justify-center items-center h-full">
                <div className="flex flex-col h-9 w-9 shrink-0 justify-center items-center m-0 p-0 bg-primary text-white font-extrabold">
                    {id}
                </div>
                <div className="w-0 h-full bg-black border-r border-1 border-gray-500"></div>
            </div>
            <div className={`flex flex-row w-full justify-left items-center bg-white p-3 pr-7 space-x-4 ${last ? 'h-full' : 'h-[80.357142%]'}`}>
                <div className="w-24 flex items-center justify-center text-muted-foreground">
                    {icon}
                </div>
                <div className="w-full h-full py-4 flex flex-col justify-start items-start">
                    <h3 className="font-extrabold text-xl">{name}</h3>
                    <p className="text-gray-600 text-justify text-sm">{description}</p>
                    <Button variant="link" onClick={() => navigate(`/${nav}`)} className="font-bold ml-auto pr-0">
                        {button}
                    </Button>
                </div>
            </div>
        </div>
    )
}