import { EmptyPageCard } from '@/pages/dashboard/ui/EmptyPageCard'
import { RiTeamFill } from "react-icons/ri";
import { IoCreateSharp } from "react-icons/io5";
import { AiFillControl } from "react-icons/ai";


export function EmptyPageForAdmin() {
    const info = [
        {
            id: 1,
            name: 'Регистрация сотрудников',
            description: 'Добавьте сотрудников в систему, чтобы отслеживать их работу и анализировать общий прогресс компании.',
            icon: <RiTeamFill size={96} />,
            button: 'Добавить сотрудника',
            nav: 'team',
            last: false
        },
        {
            id: 2,
            name: 'Создание задач',
            description: 'Создавайте задачи для сотрудников и отслеживайте выполнение в реальном времени.',
            icon: <IoCreateSharp size={96} />,
            button: 'Создать задачу',
            nav: 'tasks',
            last: false
        },
        {
            id: 3,
            name: 'Проверка выполнения',
            description: 'После выполнения задач просматривайте результаты и принимайте или отклоняйте их.',
            icon: <AiFillControl size={96} />,
            button: 'Проверить задачи',
            nav: 'task-check',
            last: true
        }
    ];

    return (
        info.map(item => <EmptyPageCard key={item.id} {...item} />)

    )

}