import {RegistrationForm} from "@/features/auth/ui/RegistrationForm.jsx";
import {FooterAuth} from "@/features/auth/ui/FooterAuth.jsx";
import {RegistrationPanel} from "@/features/auth/ui/RegistrationPanel.jsx";
import {HeaderAuth} from "@/features/auth/ui/HeaderAuth.jsx";

export default function RegisterPage() {
    return (
        <div className="flex flex-col bg-secondary_card space-y-8">
            <HeaderAuth />

            <div className="min-h-screen flex flex-row lg:gap-x-5  items-start justify-center p-4 pt-16">
                <div className="invisible lg:visible max-w-0 lg:max-w-xs_card">
                    <RegistrationPanel />
                </div>
                <div className="flex flex-col space-y-8 mb-10">
                    <RegistrationForm />
                    <FooterAuth />
                </div>
            </div>
        </div>

    )
}