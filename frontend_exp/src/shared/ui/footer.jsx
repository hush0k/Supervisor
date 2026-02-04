import {useNavigate} from "react-router-dom";
import {Logo} from "@/shared/ui/logo.jsx";
import {Link} from "@/shared/ui/link.jsx";
import LogoIcon from "@/assets/logos/supervisor_white.svg"
import {Button} from "@/shared/ui/button.jsx";
import { FiInstagram } from "react-icons/fi";
import { SiTelegram } from "react-icons/si";
import { FaYoutube } from "react-icons/fa";
import { TiSocialLinkedin } from "react-icons/ti";
import { TiSocialGithub } from "react-icons/ti";
import {FaMapLocation, FaMapLocationDot} from "react-icons/fa6";

export function Footer() {
    const navigate = useNavigate();
    return (
        <footer className="flex flex-col bg-primary-dark_blue h-96 md:h-full items-start">
            <div className="flex flex-row p-8 md:p-16 lg:p-20 justify-between w-full">
                <div className="flex flex-col items-start space-y-4">
                    <Logo size={50} src={LogoIcon} />
                    <div className="flex flex-row items-start w-full">
                        <nav className="md:hidden flex flex-col items-start w-full ">
                            <Button variant="link" className="text-white hover:no-underline font-light p-0" onClick={() => navigate('/')}>
                                <FiInstagram className="text-white"/> supervisor_app
                            </Button>
                            <Button variant="link" className="text-white hover:no-underline font-light p-0">
                                <SiTelegram className="text-white"/>
                                supervisor_app
                            </Button>
                            <Button variant="link" className="text-white hover:no-underline font-light p-0" onClick={() => navigate('/')}><FaYoutube className="text-white"/> supervisor_app</Button>
                            <Button variant="link" className="text-white hover:no-underline font-light p-0" onClick={() => navigate('/')}><TiSocialLinkedin className="text-white"/> supervisor_app</Button>
                            <Button variant="link" className="text-white hover:no-underline font-light p-0" onClick={() => navigate('/')}><TiSocialGithub className="text-white"/> supervisor_app</Button>
                        </nav>
                        <div className="md:flex flex-col items-start md:max-w-72 hidden lg:max-w-96 space-y-4">
                            <p className="text-muted-foreground">Продвинутая аналитическая инфраструктура для индустрии нового поколения. Архитектура, ориентированная на производительность и надёжность.</p>
                            <div className="flex flex-row space-x-4">
                                <div className="bg-outline-dark border border-outline-foreground text-white p-3 cursor-pointer" onClick={() => navigate('/')}><FiInstagram /></div>
                                <div className="bg-outline-dark border border-outline-foreground text-white p-3 cursor-pointer" onClick={() => navigate('/')}><TiSocialLinkedin /></div>
                                <div className="bg-outline-dark border border-outline-foreground text-white p-3 cursor-pointer" onClick={() => navigate('/')}><FaYoutube /></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:flex flex-row hidden space-x-10">
                    <nav className="flex flex-col space-y-3">
                        <p className="text-white font-bold text-lg">Главная</p>
                        <Link to="/" className="text-muted-foreground font-normal">Домой</Link>
                        <Link to="/" className="text-muted-foreground font-normal">Цены</Link>
                        <Link to="/" className="text-muted-foreground font-normal">Технология</Link>
                        <Link to="/" className="text-muted-foreground font-normal">О нас</Link>
                    </nav>
                    <nav className="flex flex-col space-y-3">
                        <p className="text-white font-bold text-lg">Технология</p>
                        <Link to="/" className="text-muted-foreground font-normal">Главная</Link>
                        <Link to="/" className="text-muted-foreground font-normal">API</Link>
                        <Link to="/" className="text-muted-foreground font-normal">KPI</Link>
                        <Link to="/" className="text-muted-foreground font-normal">Сотрудничество</Link>
                    </nav>
                </div>
            </div>


            <div className="border-t border-muted-foreground w-full m-0 p-4 text-center text-xs">
                <p className="text-muted-foreground">&copy; Все права защищены.</p>
                <p className="text-muted-foreground">Supervisor Company. 2026</p>
            </div>
        </footer>
    )
}