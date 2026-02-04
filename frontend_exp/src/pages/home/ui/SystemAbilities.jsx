import {AutoCarousel} from "@/features/elements/AutoCarousel.jsx";

export function SystemAbilities() {

    return (
        <div className="flex flex-col space-y-10 py-10 px-6 md:px-10 lg:px-14">
            <div className="flex flex-row justify-between">
                <div className="flex flex-col space-y-4 max-w-sm lg:max-w-lg">
                    <h2 className="uppercase font-black text-3xl md:text-4xl">Ключевые возможности системы</h2>
                    <div className="w-14 h-2 bg-primary"></div>
                </div>

                <div className="hidden md:block">
                    <p className="text-muted-foreground max-w-sm">Модульная архитектура для высоко нагруженных систем с расширенными возможностями аналитики</p>
                </div>
            </div>
            <AutoCarousel/>
        </div>
    )
}