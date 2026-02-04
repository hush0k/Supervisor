import {Link} from "@/shared/ui/link.jsx";

export function FooterAuth() {
    return (
        <footer className="w-full flex flex-col justify-center text-center space-y-2">
            <nav className="space-x-6 ">
                <Link className="text-gray-400" to="/">Политика</Link>
                <Link className="text-gray-400" to="/login">Служба поддержки</Link>
                <Link className="text-gray-400" to="/register">Домой</Link>
            </nav>
            <span className="text-sm text-gray-400">&copy; 2025 Supervisor. Все права защищены.</span>
        </footer>
    )
}

