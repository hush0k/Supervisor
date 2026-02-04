import {useLocation, useNavigate} from "react-router-dom";
import {Logo} from "@/shared/ui/logo.jsx";
import {Button} from "@/shared/ui/button.jsx";
import {useAuthStore} from "@/entities/user/model/store.js";
import logoSvg from '@/assets/logos/supervisor.svg'
import {useState} from "react";

export function HeaderAuth() {
    const navigate = useNavigate();
    const location = useLocation();
    const showButton = location.pathname === '/home'
    const {isAuthenticated} = useAuthStore();

    const loginAction = () => {
        if (!isAuthenticated) {
            navigate("/home")
        } else {
            navigate("/dashboard")
        }
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-row justify-between items-center lg:px-36 px-8 bg-white h-16 border shadow-accent">
            <Logo size={45} onClick={loginAction} src={logoSvg} />

            {showButton && (
                <div className="flex flex-row space-x-4 items-center">
                    <Button onClick={() => navigate('/login')}>Войти</Button>
                    <Button className="hidden md:block" variant="outline" onClick={() => navigate('/register')}>Начать сейчас</Button>
                </div>
            )}

            {!showButton && (
                <div className="flex flex-row space-x-4 items-center">
                    <p className="text-muted-foreground text-sm invisible lg:visible md:visible">Уже есть аккаунт?</p>
                    <Button onClick={() => navigate('/login')}>Войти</Button>
                </div>
            )}
        </div>
    )
}