import {useLocation, useNavigate} from "react-router-dom";
import { Logo } from "@/shared/ui/logo.jsx";
import { User, Menu, X }  from "lucide-react";
import { Button } from "@/shared/ui/button.jsx";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from "@/shared/ui/navigation-menu.jsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/shared/ui/dropdown-menu.jsx";
import {useAuthStore} from "@/entities/user/model/store.js";
import logoSvg from '@/assets/logos/supervisor.svg'
import {useState} from "react";

export function Header() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const {isAuthenticated} = useAuthStore();

    const displayName = user
        ? `${user.last_name[0]}. ${user.first_name}`
        : "Профиль"

    const logoutAction = () => {
        localStorage.clear()
        window.location.href = '/home'
    }

    const loginAction = () => {
        if (!isAuthenticated) {
            navigate("/home")
        } else {
            navigate("/dashboard")
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const menuItems = [
        {label: "Главная", path: "/dashboard"},
        {label: "Рейтинг", path: "/rating"},
        {label: "KPI", path: "/kpi"},
        {label: "Моя компания", path: "/company"},
    ];





    return (
        <header className="flex flex-row justify-between items-center px-4 md:px-8 lg:px-36 bg-white h-16 border shadow-accent w-full">
            <Logo size={45} onClick={loginAction} src={logoSvg} />

            <div className="hidden lg:flex flex-row space-x-4 items-center">
                <NavigationMenu>
                    <NavigationMenuList>
                        {menuItems.map((item) => (
                            <NavigationMenuItem key={item.path}>
                                <NavigationMenuLink
                                    onClick={() => navigate(item.path)}
                                    className={navigationMenuTriggerStyle()}
                                >
                                    {item.label}
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <User className="mr-2 h-4 w-4" />
                            {displayName}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="bg-white w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                            Профиль
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logoutAction}>
                            Выйти
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2"
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-16 bg-white z-50 border-t">
                    <nav className="flex flex-col p-4 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className="text-left px-4 py-3 hover:bg-accent rounded-md transition-colors"
                            >
                                {item.label}
                            </button>
                        ))}

                        <div className="border-t pt-4 mt-4 space-y-2">
                            <button
                                onClick={() => handleNavigation("/profile")}
                                className="text-left px-4 py-3 hover:bg-accent rounded-md transition-colors w-full"
                            >
                                Профиль
                            </button>

                            <button
                                onClick={logoutAction}
                                className="text-left px-4 py-3 text-destructive-foreground hover:bg-destructive rounded-md transition-colors w-full"
                            >
                                Выйти
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}