import { useNavigate } from "react-router-dom"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/shared/ui/carousel"

export function EmptyPageCardMobi( {items} ) {
    const navigate = useNavigate()

    return (
        <Carousel
            plugins={[
                Autoplay({
                    delay:3000,
                }),
            ]}
            className="md:hidden"
        >
            <CarouselContent>
                {items.map((item, index) => {
                    return (
                        <CarouselItem key={index}>

                        </CarouselItem>
                    )
                })}
            </CarouselContent>
        </Carousel>
    )
}
