import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
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
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet"
import { GrLogout } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
import { MdLeaderboard } from "react-icons/md";
import { BsBuildingFill } from "react-icons/bs";
import { BiTask } from "react-icons/bi";


export function Header({ variant = "default" }) {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const {isAuthenticated} = useAuthStore();
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSheetOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const displayName = user?.last_name && user?.first_name
        ? `${user.last_name[0]}. ${user.first_name}`
        : "Профиль"

    const logoutAction = () => {
        localStorage.clear()
        window.location.href = '/home'
    }

    const loginAction = () => {
        navigate(isAuthenticated ? "/dashboard" : "/home");
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const menuItems = [
        {label: "Главная", path: "/dashboard", icon: <MdDashboard />},
        {label: "Рейтинг", path: "/rating", icon: <MdLeaderboard />},
        {label: "Задачи", path: "/tasks", icon: <BiTask />},
        {label: "Моя компания", path: "/company", icon: <BsBuildingFill />},
    ];


    if (variant === "logo-left") {
        return (
            <header className="flex flex-row items-center bg-white h-16 border shadow-accent w-full">
                <div className="ml-6">
                    <Logo size={45} onClick={loginAction} src={logoSvg} />
                </div>

                <div className="hidden lg:flex flex-row space-x-4 items-center ml-auto mr-6">
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
                        <DropdownMenuContent align="end" className="bg-white w-[var(--radix-dropdown-menu-trigger-width)]">
                            <DropdownMenuItem onClick={() => navigate('/profile')}>Профиль</DropdownMenuItem>
                            <DropdownMenuItem onClick={logoutAction}>Выйти</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="lg:hidden ml-auto mr-4">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2"><Menu size={24} /></button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[320px] p-0 flex flex-col">
                            <button onClick={() => navigate('/profile')} className="mt-14 py-2 px-8 border-t border-b border-gray-100 flex flex-row space-x-4">
                                <img
                                    src="https://img.freepik.com/premium-psd/3d-avatar-character_975163-673.jpg?semt=ais_hybrid&w=740&q=80"
                                    alt="avatar"
                                    className="w-12"
                                />
                                <div className="flex flex-col justify-around text-left">
                                    <p className="font-bold">{user?.first_name[0]}. {user?.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{user?.position?.name}</p>
                                </div>
                            </button>
                            <nav className="flex flex-col py-4 space-y-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className="group text-left flex flex-row items-center hover:bg-accent active:bg-accent rounded-md transition-colors"
                                    >
                                        <div className="h-10 w-1 mr-6 bg-transparent group-hover:bg-primary transition-colors"></div>
                                        <div className="flex flex-row items-center gap-2 group-hover:text-primary">
                                            {item.icon}{item.label}
                                        </div>
                                    </button>
                                ))}
                            </nav>
                            <div className="flex flex-col border-t border-b py-4 mt-auto mb-14 space-y-2 items-center">
                                <Button variant="destructive" className="font-semibold" onClick={logoutAction}>
                                    <GrLogout />
                                    Выйти
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>
        );
    }


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

            <div className="lg:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <button className="p-2"><Menu size={24} /></button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[320px] p-0 flex flex-col ">
                        <button  onClick={() => navigate('/profile')} className="mt-14 py-2 px-8 border-t border-b border-gray-100 flex flex-row space-x-4">
                            <div>
                                <img
                                    src="https://img.freepik.com/premium-psd/3d-avatar-character_975163-673.jpg?semt=ais_hybrid&w=740&q=80"
                                    alt="avatar for profile"
                                    className="w-12"
                                />
                            </div>

                            <div className="flex flex-col justify-around text-left">
                                <p className="font-bold">{user?.first_name[0]}. {user?.last_name}</p>
                                <p className="text-sm text-muted-foreground">{user?.position?.name}</p>
                            </div>
                        </button>
                        <nav className="flex flex-col py-4 space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className="group text-left  flex flex-row items-center hover:bg-accent active:bg-accent rounded-md transition-colors"
                                >
                                    <div className="h-10 w-1 mr-6 bg-transparent group-hover:bg-primary group-active:bg-primary transition-colors"></div>
                                    <div className="flex flex-row items-center gap-2 group-hover:text-primary group-active:text-primary">
                                        {item.icon}{item.label}
                                    </div>
                                </button>
                            ))}
                        </nav>
                        <div className="flex flex-col border-t border-b py-4 mt-auto mb-14 space-y-2 items-center">
                            <Button variant="destructive" className="font-semibold">
                                <GrLogout />
                                Выйти
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}