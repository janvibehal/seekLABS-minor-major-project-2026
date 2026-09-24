function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-white/[0.08] bg-black text-white">

            {/* SUBTLE BLUE GLOW */}

            <div className="pointer-events-none absolute bottom-[-250px] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/[0.05] blur-[150px]" />


            {/* GRID TEXTURE */}

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `
                        linear-gradient(
                            rgba(255,255,255,.8) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(255,255,255,.8) 1px,
                            transparent 1px
                        )
                    `,
                    backgroundSize: "90px 90px",
                }}
            />


            <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-10">


                {/* =====================================================
                    MAIN FOOTER
                ====================================================== */}

                <div className="grid gap-16 py-20 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">


                    {/* =================================================
                        BRAND
                    ================================================= */}

                    <div className="max-w-sm">


                        {/* LOGO */}

                        <a
                            href="/"
                            className="group flex items-center gap-3"
                        >

                            <img
                                src="/images/logo.png"
                                alt="InterviewIQ Logo"
                                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105"
                            />


                            <span className="text-base font-semibold tracking-[-0.04em]">

                                Seek
                                <span className="text-white/40">
                                    LABS
                                </span>

                            </span>

                        </a>


                        {/* DESCRIPTION */}

                        <p className="mt-7 text-sm leading-7 text-white/40">

                            A research-driven platform exploring how
                            conversational AI can evaluate technical reasoning,
                            problem-solving, and candidate understanding beyond
                            traditional code-based assessments.

                        </p>


                        {/* RESEARCH LABEL */}

                        <div className="mt-8 flex items-center gap-3">

                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                            <span className="text-[9px] uppercase tracking-[0.22em] text-white/35">
                                Academic Research Project
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        PROJECT
                    ================================================= */}

                    <div>

                        <p className="mb-6 text-[9px] uppercase tracking-[0.25em] text-white/30">
                            Project
                        </p>


                        <div className="flex flex-col gap-4">

                            <a
                                href="#about"
                                className="text-sm text-white/45 transition hover:text-white"
                            >
                                About the Research
                            </a>

                            <a
                                href="#how-it-works"
                                className="text-sm text-white/45 transition hover:text-white"
                            >
                                Methodology
                            </a>

                            <a
                                href="#recruiters"
                                className="text-sm text-white/45 transition hover:text-white"
                            >
                                For Recruiters
                            </a>

                            <a
                                href="#candidates"
                                className="text-sm text-white/45 transition hover:text-white"
                            >
                                For Candidates
                            </a>

                        </div>

                    </div>


                    {/* =================================================
                        RESEARCH
                    ================================================= */}

                    <div>

                        <p className="mb-6 text-[9px] uppercase tracking-[0.25em] text-white/30">
                            Research
                        </p>


                        <div className="flex flex-col gap-4">

                            <a
                                href="#"
                                className="text-sm text-white/45 transition hover:text-white"
                            >
                                Research Paper
                            </a>

                            <a
                                href="#"
                                className="text-sm text-white/45 transition hover:text-white"
                            >
                                System Architecture
                            </a>

                            <a
                                href="#"
                                className="text-sm text-white/45 transition hover:text-white"
                            >
                                Evaluation Framework
                            </a>

                            <a
                                href="#"
                                className="text-sm text-white/45 transition hover:text-white"
                            >
                                Project Documentation
                            </a>

                        </div>

                    </div>


                    {/* =================================================
                        INSTITUTION
                    ================================================= */}

                    <div>

                        <p className="mb-6 text-[9px] uppercase tracking-[0.25em] text-white/30">
                            Institution
                        </p>


                        <div className="space-y-4">

                            <p className="text-sm leading-6 text-white/45">

                                Indira Gandhi Delhi Technical University
                                for Women

                            </p>


                            <p className="text-sm text-white/30">

                                Department of Computer Science
                                & Engineering

                            </p>


                            <div className="pt-2">

                                <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                                    Minor / Major Project
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    RESEARCH STATEMENT
                ====================================================== */}

                <div className="border-t border-white/[0.08] py-10">

                    <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">


                        <div className="max-w-2xl">

                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                                Research Objective
                            </p>


                            <p className="mt-3 text-sm leading-7 text-white/40">

                                Exploring whether conversational explanations
                                can provide deeper insight into a candidate's
                                reasoning process than conventional
                                answer-based technical assessments.

                            </p>

                        </div>


                        {/* SYSTEM STATUS */}

                        <div className="flex items-center gap-3">

                            <span className="relative flex h-2 w-2">

                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />

                                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />

                            </span>


                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                                Research Prototype
                            </span>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    BOTTOM BAR
                ====================================================== */}

                <div className="flex flex-col justify-between gap-5 border-t border-white/[0.08] py-7 text-[9px] uppercase tracking-[0.14em] text-white/25 sm:flex-row sm:items-center">


                    <p>
                        © {new Date().getFullYear()} InterviewIQ
                    </p>


                    <p>
                        Developed as an Academic Research Project
                    </p>


                    <div className="flex gap-6">

                        <a
                            href="#"
                            className="transition hover:text-white/60"
                        >
                            Privacy
                        </a>

                        <a
                            href="#"
                            className="transition hover:text-white/60"
                        >
                            Contact
                        </a>

                    </div>

                </div>

            </div>

        </footer>
    );
}

export default Footer;