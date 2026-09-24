import { useScroll, useTransform } from "framer-motion";

import HeroSection from "../components/home/HeroSection";
import Navbar from "../components/layout/Navbar";
import TrustStrip from "../components/home/TrustStrip";
import AboutSection from "../components/home/AboutSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import RecruiterSection from "../components/home/RecruiterSection";
import CandidateSection from "../components/home/CandidateSection";
import FinalCTASection from "../components/home/FinalCTASection";
import Footer from "../components/layout/Footer";

function Home() {
    const { scrollYProgress } = useScroll();

    const heroY = useTransform(
        scrollYProgress,
        [0, 0.3],
        [0, -80]
    );

    const heroOpacity = useTransform(
        scrollYProgress,
        [0, 0.25],
        [1, 0]
    );

    return (
        <div className="min-h-screen overflow-hidden bg-white text-[#132b45]">

            <Navbar />

            <HeroSection
                heroY={heroY}
                heroOpacity={heroOpacity}
            />

            <TrustStrip />

            <AboutSection />

            <HowItWorksSection />

            <RecruiterSection />

            <CandidateSection />

            <FinalCTASection /> 
                    

            <Footer />

        </div>
    );
}

export default Home;