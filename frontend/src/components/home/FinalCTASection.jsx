import { motion } from "framer-motion";

function FinalCTA() {
    return (
        <section
            id="get-started"
            className="relative min-h-screen overflow-hidden bg-black text-white"
        >
            {/* ============================================
                SUBTLE BACKGROUND
            ============================================ */}

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
                    `,
                    backgroundSize: "90px 90px",
                }}
            />

            {/* Ambient glow */}

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[180px]" />


            {/* ============================================
                MAIN CONTENT
            ============================================ */}

            <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-6 py-16 lg:px-10 lg:py-20">


                {/* ========================================
                    TOP BAR
                ======================================== */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <span className="h-px w-10 bg-white/30" />

                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                            Get started
                        </p>
                    </div>

                    <p className="font-mono text-[10px] text-white/25">
                        SELECT_PATH
                    </p>
                </motion.div>


                {/* ========================================
                    MAIN CTA
                ======================================== */}

                <div className="flex flex-1 flex-col justify-center py-20">


                    {/* HEADING */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 40,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                        }}
                        transition={{
                            duration: 0.9,
                        }}
                        className="mx-auto max-w-6xl text-center"
                    >
                        <h2 className="text-5xl font-medium leading-[0.9] tracking-[-0.065em] sm:text-7xl md:text-8xl lg:text-[120px]">

                            Ready to see

                            <br />

                            <span className="text-white/25">
                                how you think?
                            </span>

                        </h2>
                    </motion.div>


                    {/* ====================================
                        TWO PATHS
                    ==================================== */}

                    <div className="mx-auto mt-20 grid w-full max-w-[1200px] gap-px overflow-hidden border border-white/[0.1] bg-white/[0.1] md:grid-cols-2">


                        {/* =================================
                            RECRUITER PATH
                        ================================== */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -30,
                            }}
                            whileInView={{
                                opacity: 1,
                                x: 0,
                            }}
                            viewport={{
                                once: true,
                            }}
                            transition={{
                                duration: 0.7,
                            }}
                            className="group relative min-h-[420px] bg-black p-8 transition-colors duration-500 hover:bg-white/[0.025] md:p-12"
                        >

                            {/* Number */}

                            <div className="flex items-center justify-between">

                                <span className="text-[10px] tracking-[0.25em] text-white/25">
                                    01
                                </span>

                                <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                                    Recruiter
                                </span>

                            </div>


                            {/* Content */}

                            <div className="absolute bottom-10 left-8 right-8 md:bottom-12 md:left-12 md:right-12">

                                <h3 className="text-3xl font-medium tracking-[-0.05em] text-white md:text-4xl">
                                    Build better
                                    <br />
                                    interviews.
                                </h3>


                                <p className="mt-6 max-w-md text-sm leading-7 text-white/40">
                                    Contact the administrator to receive your
                                    recruiter ID and get access to the
                                    recruitment platform.
                                </p>


                                {/* CTA */}

                                <a
                                    href="#contact"
                                    className="mt-10 flex w-fit items-center gap-4 border-b border-white/30 pb-3 text-[10px] uppercase tracking-[0.22em] text-white transition-all duration-300 hover:gap-7 hover:border-white"
                                >
                                    Contact admin

                                    <span className="text-lg leading-none">
                                        ↗
                                    </span>
                                </a>

                            </div>

                        </motion.div>


                        {/* =================================
                            CANDIDATE PATH
                        ================================== */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                x: 30,
                            }}
                            whileInView={{
                                opacity: 1,
                                x: 0,
                            }}
                            viewport={{
                                once: true,
                            }}
                            transition={{
                                duration: 0.7,
                            }}
                            className="group relative min-h-[420px] bg-white/[0.03] p-8 transition-all duration-500 hover:bg-white/[0.06] md:p-12"
                        >

                            {/* Number */}

                            <div className="flex items-center justify-between">

                                <span className="text-[10px] tracking-[0.25em] text-white/25">
                                    02
                                </span>

                                <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                                    Candidate
                                </span>

                            </div>


                            {/* Content */}

                            <div className="absolute bottom-10 left-8 right-8 md:bottom-12 md:left-12 md:right-12">

                                <h3 className="text-3xl font-medium tracking-[-0.05em] text-white md:text-4xl">
                                    Start the
                                    <br />
                                    conversation.
                                </h3>


                                <p className="mt-6 max-w-md text-sm leading-7 text-white/40">
                                    Log in to your account and begin your
                                    AI-powered interview experience.
                                </p>


                                {/* CTA */}

                                <a
                                    href="/login"
                                    className="mt-10 flex w-fit items-center gap-4 border-b border-white/30 pb-3 text-[10px] uppercase tracking-[0.22em] text-white transition-all duration-300 hover:gap-7 hover:border-white"
                                >
                                    Login to continue

                                    <span className="text-lg leading-none">
                                        ↗
                                    </span>
                                </a>

                            </div>

                        </motion.div>

                    </div>


                    {/* ====================================
                        BOTTOM TEXT
                    ==================================== */}

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.7,
                            delay: 0.2,
                        }}
                        className="mx-auto mt-10 flex max-w-[1200px] items-center justify-between"
                    >
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/20">
                            One conversation. Deeper understanding.
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />

                            <span className="text-[9px] uppercase tracking-[0.18em] text-white/20">
                                System ready
                            </span>
                        </div>
                    </motion.div>

                </div>


                {/* ========================================
                    BOTTOM LINE
                ======================================== */}

                <div className="border-t border-white/[0.08] pt-6">

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/20">
                            AI-powered technical evaluation
                        </p>

                        <p className="text-[9px] text-white/20">
                            © 2026
                        </p>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default FinalCTA;