import {HeaderAuth} from "@/features/auth/ui/HeaderAuth.jsx";
import {HeroSection} from "@/pages/home/ui/HeroSection.jsx";
import {TrustedBy} from "@/pages/home/ui/TrustedBy.jsx";
import microsoft from "@/assets/logos/microsoft-logo-svgrepo-com.svg"
import facebook from "@/assets/logos/facebook-1-logo-svgrepo-com.svg"
import linkedin from "@/assets/logos/linkedin-logo-svgrepo-com.svg"
import forbes from "@/assets/logos/forbes-logo-svgrepo-com.svg"
import google from "@/assets/logos/google-2015-logo-svgrepo-com.svg"
import spotify from "@/assets/logos/spotify-1-logo-svgrepo-com.svg"
import {SystemAbilities} from "@/pages/home/ui/SystemAbilities.jsx";
import {Footer} from "@/shared/ui/footer.jsx";


export function HomePage() {
    return (
        <>
            <HeaderAuth />
            <div className="pt-16 w-full ">
                <HeroSection />
                <TrustedBy list_company={[facebook, linkedin, forbes, google, spotify, microsoft]} />
                <SystemAbilities />
                <Footer />
            </div>
        </>
    )
}