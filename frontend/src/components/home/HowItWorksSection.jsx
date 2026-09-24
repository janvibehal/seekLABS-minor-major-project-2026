import { motion } from "framer-motion";

function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="relative overflow-hidden bg-white text-black"
        >
            {/* ============================================
                BLACK → WHITE TRANSITION GLOW
            ============================================ */}

            <div className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-white shadow-[0_0_100px_50px_rgba(255,255,255,0.95),0_0_220px_100px_rgba(255,255,255,0.85)]" />

            {/* ============================================
                SUBTLE BACKGROUND GRID
            ============================================ */}

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,0,0,.7) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,.7) 1px, transparent 1px)
                    `,
                    backgroundSize: "70px 70px",
                }}
            />

            {/* ============================================
                BACKGROUND TEXT
            ============================================ */}

            <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 select-none whitespace-nowrap">
                <span className="text-[22vw] font-medium tracking-[-0.09em] text-black/[0.025]">
                    FLOW
                </span>
            </div>

            {/* ============================================
                MAIN CONTENT
            ============================================ */}

            <div className="relative z-10 mx-auto max-w-[1500px] px-6 py-28 lg:px-10 lg:py-40">

                {/* ========================================
                    HEADER
                ======================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.3,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <div className="flex items-center justify-center gap-4">
                        <span className="h-px w-12 bg-black/20" />

                        <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
                            How it works
                        </p>

                        <span className="h-px w-12 bg-black/20" />
                    </div>

                    <h2 className="mt-8 text-5xl font-medium leading-[0.94] tracking-[-0.06em] sm:text-6xl lg:text-[88px]">
                        Intelligence in
                        <br />

                        <span className="text-black/30">
                            continuous motion.
                        </span>
                    </h2>

                    <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-black/45">
                        Every response becomes context for what happens next.
                        The system continuously understands, analyzes, adapts,
                        and evaluates the candidate's thinking.
                    </p>
                </motion.div>

                {/* ========================================
                    DESKTOP TRAIN FLOW
                ======================================== */}

                <div className="relative mt-28 hidden min-h-[650px] xl:block">

                    {/* ====================================
                        SVG CONTINUOUS TRACK
                    ==================================== */}

                    <svg
                        className="absolute inset-0 z-0 h-full w-full overflow-visible"
                        viewBox="0 0 1500 650"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <filter
                                id="electronGlow"
                                x="-200%"
                                y="-200%"
                                width="400%"
                                height="400%"
                            >
                                <feGaussianBlur
                                    stdDeviation="5"
                                    result="blur"
                                />

                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* ==================================
                            MAIN CONTINUOUS FLOW

                            LEFT → RIGHT
                            ↓ TURN
                            RIGHT → LEFT
                        ================================== */}

                        <path
                            id="systemFlow"
                            d="
                                M 70 130

                                H 1430

                                C 1480 130, 1480 180, 1480 230

                                V 420

                                C 1480 480, 1430 500, 1370 500

                                H 70
                            "
                            fill="none"
                            stroke="rgba(0,0,0,0.16)"
                            strokeWidth="1.5"
                            strokeDasharray="5 10"
                        />

                        {/* ==================================
                            ELECTRON 1
                        ================================== */}

                        <circle
                            r="6"
                            fill="black"
                            filter="url(#electronGlow)"
                        >
                            <animateMotion
                                dur="12s"
                                repeatCount="indefinite"
                            >
                                <mpath href="#systemFlow" />
                            </animateMotion>
                        </circle>

                        {/* ==================================
                            ELECTRON 2
                        ================================== */}

                        <circle
                            r="4"
                            fill="black"
                            opacity="0.6"
                        >
                            <animateMotion
                                dur="12s"
                                begin="-3s"
                                repeatCount="indefinite"
                            >
                                <mpath href="#systemFlow" />
                            </animateMotion>
                        </circle>

                        {/* ==================================
                            ELECTRON 3
                        ================================== */}

                        <circle
                            r="4"
                            fill="black"
                            opacity="0.4"
                        >
                            <animateMotion
                                dur="12s"
                                begin="-6s"
                                repeatCount="indefinite"
                            >
                                <mpath href="#systemFlow" />
                            </animateMotion>
                        </circle>

                        {/* ==================================
                            ELECTRON 4
                        ================================== */}

                        <circle
                            r="3"
                            fill="black"
                            opacity="0.25"
                        >
                            <animateMotion
                                dur="12s"
                                begin="-9s"
                                repeatCount="indefinite"
                            >
                                <mpath href="#systemFlow" />
                            </animateMotion>
                        </circle>
                    </svg>

                    {/* ====================================
                        TOP ROW
                        01 → 02 → 03
                    ==================================== */}

                    <div className="absolute left-0 right-0 top-0 z-10 grid grid-cols-3 gap-10">

                        <SystemNode
                            number="01"
                            label="INPUT"
                            title="Interview Setup"
                            description="The recruiter defines the role, required skills, difficulty level, and evaluation criteria."
                        />

                        <SystemNode
                            number="02"
                            label="GENERATE"
                            title="Question Engine"
                            description="The platform selects and generates questions based on the technical concepts being evaluated."
                        />

                        <SystemNode
                            number="03"
                            label="CONVERSE"
                            title="Candidate Response"
                            description="The candidate explains their approach naturally through a conversational interview."
                        />

                    </div>

                    {/* ====================================
                        RIGHT TURN
                    ==================================== */}

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        className="absolute right-[-5px] top-[280px] z-20 flex flex-col items-center"
                    >
                        <div className="h-2 w-2 animate-pulse rounded-full bg-black" />

                        <div className="mt-3 text-[8px] uppercase tracking-[0.2em] text-black/30">
                            Process
                        </div>
                    </motion.div>

                    {/* ====================================
                        BOTTOM ROW

                        Flow continues:
                        04 → 05 → 06

                        Visually arranged from right to left
                    ==================================== */}

                    <div className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-3 gap-10">

                        <SystemNode
                            number="06"
                            label="OUTPUT"
                            title="Structured Evaluation"
                            description="The complete conversation is transformed into a transparent multi-dimensional candidate evaluation."
                        />

                        <SystemNode
                            number="05"
                            label="ADAPT"
                            title="Adaptive Decision"
                            description="The system decides whether to probe deeper, clarify understanding, or continue to the next concept."
                        />

                        <SystemNode
                            number="04"
                            label="ANALYZE"
                            title="Response Intelligence"
                            description="The LLM analyzes reasoning, concepts, approach, complexity, and gaps in understanding."
                        />

                    </div>

                </div>

                {/* ========================================
                    MOBILE / TABLET FLOW
                ======================================== */}

                <div className="relative mt-20 xl:hidden">

                    {/* Vertical Track */}

                    <div className="absolute bottom-10 left-[18px] top-10 w-px bg-black/15" />

                    {/* Moving Electron */}

                    <motion.div
                        animate={{
                            y: [0, 750],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute left-[14px] top-10 z-10 h-2 w-2 rounded-full bg-black"
                    />

                    <div className="space-y-6">

                        <MobileNode
                            number="01"
                            label="INPUT"
                            title="Interview Setup"
                            description="Define the role, skills, difficulty, and evaluation criteria."
                        />

                        <MobileNode
                            number="02"
                            label="GENERATE"
                            title="Question Engine"
                            description="Generate and select questions around the required concepts."
                        />

                        <MobileNode
                            number="03"
                            label="CONVERSE"
                            title="Candidate Response"
                            description="The candidate explains their approach through conversation."
                        />

                        <MobileNode
                            number="04"
                            label="ANALYZE"
                            title="Response Intelligence"
                            description="Reasoning, concepts, complexity, and knowledge gaps are analyzed."
                        />

                        <MobileNode
                            number="05"
                            label="ADAPT"
                            title="Adaptive Decision"
                            description="The next question changes based on the candidate's understanding."
                        />

                        <MobileNode
                            number="06"
                            label="OUTPUT"
                            title="Structured Evaluation"
                            description="Generate a complete multi-dimensional evaluation."
                        />

                    </div>

                </div>

            </div>
        </section>
    );
}


/* ============================================================
    DESKTOP NODE
============================================================ */

function SystemNode({
    number,
    label,
    title,
    description,
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 25,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{
                once: true,
                amount: 0.2,
            }}
            transition={{
                duration: 0.6,
            }}
            className="relative"
        >
            <div className="group relative min-h-[220px] border border-black/[0.12] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-black/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]">

                {/* TOP */}

                <div className="flex items-center justify-between">

                    <span className="text-[10px] tracking-[0.25em] text-black/30">
                        {number}
                    </span>

                    <span className="text-[8px] uppercase tracking-[0.2em] text-black/30">
                        {label}
                    </span>

                </div>

                {/* CONTENT */}

                <div className="mt-12">

                    <h3 className="text-xl font-medium tracking-[-0.04em] text-black">
                        {title}
                    </h3>

                    <p className="mt-4 max-w-[280px] text-xs leading-6 text-black/45">
                        {description}
                    </p>

                </div>

                {/* Decorative line */}

                <div className="mt-8 h-px w-8 bg-black/25 transition-all duration-500 group-hover:w-16" />

            </div>
        </motion.div>
    );
}


/* ============================================================
    MOBILE NODE
============================================================ */

function MobileNode({
    number,
    label,
    title,
    description,
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                x: 20,
            }}
            whileInView={{
                opacity: 1,
                x: 0,
            }}
            viewport={{
                once: true,
            }}
            transition={{
                duration: 0.5,
            }}
            className="relative ml-12 border border-black/[0.12] bg-white p-7"
        >

            {/* TOP */}

            <div className="flex items-center justify-between">

                <span className="text-[10px] tracking-[0.25em] text-black/30">
                    {number}
                </span>

                <span className="text-[8px] uppercase tracking-[0.2em] text-black/30">
                    {label}
                </span>

            </div>

            {/* CONTENT */}

            <h3 className="mt-8 text-xl font-medium tracking-[-0.04em] text-black">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-black/45">
                {description}
            </p>

        </motion.div>
    );
}


export default HowItWorksSection;