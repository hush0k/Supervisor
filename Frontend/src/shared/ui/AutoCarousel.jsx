import {Carousel, CarouselContent, CarouselItem} from "@/shared/ui/carousel.jsx";
import Autoplay from "embla-carousel-autoplay";
import { FaBrain } from "react-icons/fa6";
import { FaCodePullRequest } from "react-icons/fa6";
import { IoMdAnalytics } from "react-icons/io";
import { IoShield } from "react-icons/io5";
import {Card, CardDescription, CardHeader} from "@/shared/ui/card.jsx";

export function AutoCarousel() {
    const cards = [
        {id: 1, icon: FaBrain, title: "ИИ АВТОМАТИЗАЦИЯ", content: "ИИ освобождает от рутины, чтобы вы фокусировались на действительно важном"},
        {id: 2, icon: FaCodePullRequest, title: "Оркестрация задач", content: "Умное управление зависимостями, задачами и ресурсами для сложных многоуровневых процессов."},
        {id: 3, icon: IoShield, title: "Корпоративная защита", content: "Банковский уровень шифрования, соответствие стандартам и гибкое управление доступом к данным."},
        {id: 4, icon: IoMdAnalytics, title: "Телеметрия в реальном времени", content: "Мгновенные обновления всех ключевых метрик с автоматическим обнаружением аномалий и уведомлениями."}

    ]

    return (
        <>
            <Carousel
                plugins={[
                    Autoplay({
                        delay:3000,
                    }),
                ]}
                className="w-4/5 mx-auto md:hidden"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <CarouselItem>
                                <Card
                                    key={card.id}
                                    className="flex flex-col space-y-4 p-8"
                                >
                                    <div className="flex justify-center items-center w-14 h-14 bg-gray-800">
                                        <Icon className="w-7 h-7 fill-white"/>
                                    </div>
                                    <CardHeader className="text-start p-0 font-bold uppercase text-lg">{card.title}</CardHeader>
                                    <CardDescription>{card.content}</CardDescription>
                                </Card>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
            </Carousel>

            <div className="hidden md:flex felx-row flex-wrap justify-center">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                            <Card
                                key={card.id}
                                className="flex flex-col space-y-4 py-6 px-8 max-w-2xs_card h-80"
                            >
                                <div className="flex justify-center items-center w-14 h-14 bg-gray-800">
                                    <Icon className="w-7 h-7 fill-white"/>
                                </div>
                                <CardHeader className="text-start p-0 font-bold uppercase text-lg">{card.title}</CardHeader>
                                <CardDescription>{card.content}</CardDescription>
                            </Card>
                    )
                })}
            </div>
        </>


    )
}