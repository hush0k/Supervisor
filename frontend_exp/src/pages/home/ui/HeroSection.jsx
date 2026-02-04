import {TextLabel} from "@/shared/ui/text-label.jsx";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import {Button} from "@/shared/ui/button.jsx";
import {useNavigate} from "react-router-dom";


export function HeroSection() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-row bg-grid-pattern bg-grid md:justify-between items-center px-6 md:px-10 lg:px-14 py-10 md:py-16 lg:py-24 md:space-x-10 w-full">
            <div className="flex flex-col justify-start items-start space-y-4 md:space-y-6 lg:w-/21 w-full md:max-w-half">
                <div>
                    <TextLabel
                        icon={<MdOutlineRadioButtonChecked />}
                        className="border text-2xs md:text-xs font-semibold px-1 py-0.5 bg-muted text-primary border-primary"
                    >
                        V1.0 СЕЙЧАС ДОСТУПНО
                    </TextLabel>
                </div>

                <div className="md:space-y-6 space-y-2">
                    <h1 className="text-4.5xl lg:text-6xl font-black text-gray-900 leading-tight">
                        Отслеживание точного KPI <br/> <span className="text-primary">для Современной Компании</span>
                    </h1>
                    <p className="text-base text-gray-900">
                        Раскройте потенциал вашей команды с единой платформой для аналитики, управления задачами и мониторинга эффективности сотрудников.
                    </p>
                </div>
                <div className="space-x-6">
                    <Button onClick={() => navigate('/login')} className="px-6 py-4">Войти</Button>
                    <Button variant="outline" onClick={() => navigate('/register')} className="px-6 py-4">Начать сейчас</Button>
                </div>
            </div>

            <div className="hidden md:flex flex-col justify-start items-start space-y-4 w-full md:w-1/2 md:max-w-half">
                <img src="https://habrastorage.org/r/w1560/getpro/habr/upload_files/b11/610/6c8/b116106c805a094b2fb8ffb361f05ee4.png" alt="Hero Image"/>
            </div>
        </div>
    )
}