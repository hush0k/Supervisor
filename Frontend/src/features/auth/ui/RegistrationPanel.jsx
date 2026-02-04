import { MdAnalytics } from "react-icons/md";
import {Advances} from "@/shared/ui/advances.jsx";
import { HiUserGroup } from "react-icons/hi";
import { IoShield } from "react-icons/io5";

export function RegistrationPanel() {
    return (
        <div className="flex flex-col items-start justify-start bg-secondary_card p-4 max-w-xs_card space-y-4">
            <h1 className="text-4xl font-extrabold">Вся аналитика вашей компании</h1>
            <p className="text-muted-foreground">Присоединяйтесь к более чем 10 000 компаниям, которые используют Analytica для упрощения работы с данными и управления задачами.</p>

            <Advances
                icon={<MdAnalytics className="w-1/2 h-1/2 text-primary"/>}
                prime_text="Аналитика в реальном времене"
                secondary_text="Наблюдай KPI команды каждую секунду"
            />

            <Advances
                icon={<HiUserGroup className="w-1/2 h-1/2 text-primary"/>}
                prime_text="Автоматизация команды"
                secondary_text="Создавай задание и автоматизируй работу"
            />

            <Advances
                icon={<IoShield className="w-1/2 h-1/2 text-primary"/>}
                prime_text="Безопасно хранение"
                secondary_text="Безопасно храни статистику команды"
            />


        </div>
    )
}