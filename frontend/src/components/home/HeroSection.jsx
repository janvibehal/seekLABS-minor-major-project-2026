import { motion } from "framer-motion";

function HeroSection() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-black text-white">

            {/* ============================================
                VIDEO BACKGROUND
            ============================================ */}

            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
            >
                <source
                    src="/videos/hero-background.mp4"
                    type="video/mp4"
                />
            </video>


            {/* ============================================
                DARK OVERLAY
            ============================================ */}

            <div className="absolute inset-0 bg-black/40" />


            {/* TOP TO BOTTOM GRADIENT */}

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/70" />


            {/* ============================================
                HERO CONTENT
            ============================================ */}

            <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col items-center px-6 pb-24 pt-40 lg:px-10 lg:pt-48">


                {/* ========================================
                    EYEBROW
                ========================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.6,
                    }}
                    className="mb-8 flex items-center gap-3"
                >

                    <span className="h-1.5 w-1.5 rounded-full bg-white" />

                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                        SeekLABS - Adaptive Technical Interviews
                    </span>

                </motion.div>


                {/* ========================================
                    MAIN HEADING
                ========================================= */}

                <motion.h1
                    initial={{
                        opacity: 0,
                        y: 25,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.8,
                        delay: 0.1,
                    }}
                    className="max-w-5xl text-center text-5xl font-medium leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-[96px]"
                >

                    Interviews that reveal

                    <br />

                    <span className="text-white/35">
                        think. seek. solve.
                    </span>

                </motion.h1>


                {/* ========================================
                    DESCRIPTION
                ========================================= */}

                <motion.p
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.7,
                        delay: 0.25,
                    }}
                    className="mt-8 max-w-xl text-center text-sm leading-7 text-white/50"
                >

                    SeekLABS transform technical assessments into
                    adaptive conversations that evaluate reasoning,
                    decision-making, and problem-solving ability.

                </motion.p>


                {/* ========================================
                    CTA BUTTONS
                ========================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.7,
                        delay: 0.35,
                    }}
                    className="mt-10 flex items-center gap-4"
                >

                    <a
                        href="/signup"
                        className="bg-white px-6 py-3 text-[11px] font-medium text-black transition hover:bg-white/85"
                    >
                        Get started
                    </a>


                    <a
                        href="#how-it-works"
                        className="border border-white/15 px-6 py-3 text-[11px] text-white/60 transition hover:border-white/30 hover:text-white"
                    >
                        How it works
                    </a>

                </motion.div>


                {/* ========================================
                    PRODUCT / INTERVIEW PREVIEW
                ========================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 50,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 1,
                        delay: 0.45,
                        ease: "easeOut",
                    }}
                    className="relative mt-24 w-full max-w-6xl"
                >


                    {/* Subtle glow */}

                    <div className="absolute -inset-10 bg-white/[0.03] blur-[100px]" />


                    {/* ====================================
                        MAIN APPLICATION WINDOW
                    ==================================== */}

                    <div className="relative overflow-hidden border border-white/[0.12] bg-[#080808]/90 backdrop-blur-md">


                        {/* ====================================
                            WINDOW HEADER
                        ==================================== */}

                        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">


                            {/* Window dots */}

                            <div className="flex items-center gap-2">

                                <div className="h-2 w-2 rounded-full bg-white/30" />

                                <div className="h-2 w-2 rounded-full bg-white/15" />

                                <div className="h-2 w-2 rounded-full bg-white/15" />

                            </div>


                            {/* Title */}

                            <span className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                                SeekLABS / Live Session
                            </span>


                            {/* Progress */}

                            <span className="text-[9px] text-white/25">
                                03 / 07
                            </span>

                        </div>


                        {/* ====================================
                            MAIN INTERVIEW AREA
                        ==================================== */}

                        <div className="grid min-h-[480px] md:grid-cols-[0.9fr_1.1fr]">


                            {/* =================================
                                LEFT — QUESTION
                            ================================= */}

                            <div className="border-b border-white/[0.08] p-8 md:border-b-0 md:border-r lg:p-12">


                                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                                    Algorithms
                                </p>


                                <h2 className="mt-8 max-w-md text-2xl font-medium leading-tight tracking-[-0.03em] text-white lg:text-3xl">
                                    Find the top K most frequent
                                    elements in an array.
                                </h2>


                                <p className="mt-6 max-w-sm text-sm leading-6 text-white/40">
                                    Explain your approach, the data
                                    structure you would choose, and
                                    the complexity of your solution.
                                </p>


                                {/* Evaluation */}

                                <div className="mt-12 border-t border-white/[0.08] pt-5">

                                    <p className="text-[9px] uppercase tracking-wider text-white/25">
                                        Evaluation focuses on
                                    </p>


                                    <div className="mt-4 flex flex-wrap gap-2">

                                        <span className="border border-white/10 px-3 py-1.5 text-[9px] text-white/50">
                                            Reasoning
                                        </span>


                                        <span className="border border-white/10 px-3 py-1.5 text-[9px] text-white/50">
                                            Algorithm
                                        </span>


                                        <span className="border border-white/10 px-3 py-1.5 text-[9px] text-white/50">
                                            Complexity
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                RIGHT — CHAT
                            ================================= */}

                            <div className="flex flex-col p-8 lg:p-12">


                                {/* Messages */}

                                <div className="flex-1 space-y-8">


                                    {/* AI MESSAGE */}

                                    <div className="max-w-md">

                                        <p className="mb-2 text-[9px] uppercase tracking-wider text-white/25">
                                            Interviewer
                                        </p>

                                        <p className="text-sm leading-6 text-white/75">
                                            Why would you choose a heap
                                            instead of sorting the entire
                                            array?
                                        </p>

                                    </div>


                                    {/* CANDIDATE MESSAGE */}

                                    <div className="ml-auto max-w-md text-right">

                                        <p className="mb-2 text-[9px] uppercase tracking-wider text-white/25">
                                            Candidate
                                        </p>

                                        <p className="text-sm leading-6 text-white/45">
                                            A heap allows us to maintain
                                            only the K most relevant elements
                                            rather than sorting the complete
                                            dataset.
                                        </p>

                                    </div>


                                    {/* AI MESSAGE */}

                                    <div className="max-w-md">

                                        <p className="mb-2 text-[9px] uppercase tracking-wider text-white/25">
                                            Interviewer
                                        </p>

                                        <p className="text-sm leading-6 text-white/75">
                                            And how does that affect
                                            the time complexity?
                                        </p>

                                    </div>

                                </div>


                                {/* =================================
                                    CHAT INPUT
                                ================================= */}

                                <div className="mt-10 flex items-center border-t border-white/[0.08] pt-5">

                                    <span className="text-sm text-white/20">
                                        Explain your thinking...
                                    </span>


                                    <span className="ml-auto text-sm text-white/40">
                                        ↗
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* ====================================
                            BOTTOM STATUS BAR
                        ==================================== */}

                        <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-4">


                            <div className="flex items-center gap-2">

                                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />

                                <span className="text-[9px] text-white/30">
                                    AI evaluation active
                                </span>

                            </div>


                            <span className="text-[9px] text-white/25">
                                Adaptive follow-ups enabled
                            </span>

                        </div>

                    </div>

                </motion.div>

            </div>

        </section>
    );
}

export default HeroSection;
