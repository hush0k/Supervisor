import {LoginForm} from "@/features/auth/ui/LoginForm.jsx";
import {FooterAuth} from "@/features/auth/ui/FooterAuth.jsx";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col space-y-4 items-center justify-center bg-background p-4">
            <LoginForm />
            <FooterAuth />
        </div>
    )
}