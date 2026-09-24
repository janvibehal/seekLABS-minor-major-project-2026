import { motion } from "framer-motion";

function CandidateSection() {
    return (
        <section
            id="candidates"
            className="relative overflow-hidden bg-black text-white"
        >
            {/* ============================================
                SUBTLE BACKGROUND GRID
            ============================================ */}

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />

            {/* Soft ambient glow */}

            <div className="pointer-events-none absolute left-[15%] top-[40%] h-[500px] w-[500px] rounded-full bg-white/[0.025] blur-[140px]" />

            {/* ============================================
                MAIN CONTENT
            ============================================ */}

            <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-28 lg:px-10 lg:py-40">
               
                {/* ========================================
                    MAIN TWO COLUMN LAYOUT
                ======================================== */}

                <div className="mt-14 grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                    {/* =====================================
                        LEFT SIDE
                    ====================================== */}

                    <div>
                        {/* HEADING */}

                        <motion.div
                            initial={{ opacity: 0, y: 35 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="max-w-3xl text-5xl font-medium leading-[0.94] tracking-[-0.06em] sm:text-6xl xl:text-[82px]">
                                Explain how
                                <br />

                                <span className="text-white/30">
                                    you think.
                                </span>
                            </h2>

                            <p className="mt-8 max-w-xl text-base leading-8 text-white/45">
                                A technical interview shouldn't force you
                                into a rigid answer format. Explain your
                                approach naturally and let the conversation
                                explore your understanding.
                            </p>
                        </motion.div>

                        {/* =================================
                            FEATURE LIST
                        ================================== */}

                        <div className="mt-16 border-t border-white/[0.1]">
                            <CandidateFeature
                                number="01"
                                title="Chat your approach"
                                description="Explain your thinking naturally instead of immediately writing a complete solution."
                            />

                            <CandidateFeature
                                number="02"
                                title="Think out loud"
                                description="Break down the problem step by step and communicate your reasoning."
                            />

                            <CandidateFeature
                                number="03"
                                title="Adaptive follow-ups"
                                description="Questions evolve based on your responses and explore concepts that need more depth."
                            />

                            <CandidateFeature
                                number="04"
                                title="Show what you know"
                                description="Your understanding is evaluated across reasoning, concepts, complexity, and edge cases."
                            />
                        </div>
                    </div>

                    {/* =====================================
                        RIGHT SIDE
                        LIVE AI INTERVIEW SIMULATION
                    ====================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 40,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.9,
                        }}
                        className="relative"
                    >
                        {/* TOP BAR */}

                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />

                                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                                    Live interview simulation
                                </p>
                            </div>

                            <span className="font-mono text-[10px] text-white/30">
                                SESSION_01
                            </span>
                        </div>

                        {/* =================================
                            INTERVIEW WINDOW
                        ================================== */}

                        <div className="relative h-[680px] overflow-hidden border border-white/[0.12] bg-[#080808]">
                            {/* Background grid */}

                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
                                    `,
                                    backgroundSize: "45px 45px",
                                }}
                            />

                            {/* =============================
                                INTERVIEW HEADER
                            ============================== */}

                            <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center border border-white/[0.15] bg-white/[0.03]">
                                        <span className="text-[10px] font-medium text-white/80">
                                            AI
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-white/80">
                                            AI Interviewer
                                        </p>

                                        <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-white/30">
                                            Adaptive evaluation
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />

                                    <span className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                                        Live
                                    </span>
                                </div>
                            </div>

                            {/* =============================
                                CHAT AREA
                            ============================== */}

                            <div className="relative z-10 h-[calc(100%-150px)] space-y-6 overflow-hidden px-6 py-8">
                                {/* AI MESSAGE */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.7,
                                        delay: 0.3,
                                    }}
                                    className="max-w-[85%]"
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                                            AI interviewer
                                        </span>

                                        <span className="h-px w-6 bg-white/15" />
                                    </div>

                                    <div className="border border-white/[0.1] bg-white/[0.04] p-5">
                                        <p className="text-sm leading-7 text-white/80">
                                            You are given an array of integers.
                                            How would you identify two numbers
                                            whose sum equals a target value?
                                        </p>
                                    </div>
                                </motion.div>

                                {/* CANDIDATE MESSAGE */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.7,
                                        delay: 1.4,
                                    }}
                                    className="ml-auto max-w-[85%]"
                                >
                                    <div className="mb-2 flex items-center justify-end gap-2">
                                        <span className="h-px w-6 bg-white/15" />

                                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                                            Candidate
                                        </span>
                                    </div>

                                    <div className="border border-white/[0.15] bg-white/[0.08] p-5">
                                        <p className="text-sm leading-7 text-white/80">
                                            I would first think about checking
                                            every possible pair, but that would
                                            take O(n²). A better approach would
                                            be using a hash map...
                                        </p>
                                    </div>
                                </motion.div>

                                {/* =========================
                                    AI ANALYSIS STATE
                                ========================== */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                        delay: 2.5,
                                        duration: 0.7,
                                    }}
                                    className="border-y border-white/[0.08] py-5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1">
                                                <span className="h-1 w-1 animate-bounce rounded-full bg-white/50" />

                                                <span className="h-1 w-1 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />

                                                <span className="h-1 w-1 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
                                            </div>

                                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                                                Analyzing response
                                            </span>
                                        </div>

                                        <span className="text-[9px] text-white/20">
                                            Reasoning detected
                                        </span>
                                    </div>
                                </motion.div>

                                {/* =========================
                                    ADAPTIVE FOLLOW-UP
                                ========================== */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                        delay: 3.5,
                                        duration: 0.7,
                                    }}
                                    className="max-w-[85%]"
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                                            AI interviewer
                                        </span>

                                        <span className="h-px w-6 bg-white/15" />
                                    </div>

                                    <div className="border border-white/[0.1] bg-white/[0.04] p-5">
                                        <p className="text-sm leading-7 text-white/80">
                                            Good. You mentioned a hash map.
                                            Can you explain why this reduces
                                            the time complexity and what
                                            happens when duplicate values
                                            are present?
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* =============================
                                BOTTOM INPUT AREA
                            ============================== */}

                            <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/[0.08] bg-black/90 px-6 py-5 backdrop-blur-xl">
                                <div className="flex items-center gap-4 border border-white/[0.1] bg-white/[0.03] px-5 py-4">
                                    <div className="h-2 w-2 rounded-full bg-white/30" />

                                    <span className="text-sm text-white/25">
                                        Explain your approach...
                                    </span>

                                    {/* Typing cursor */}

                                    <motion.span
                                        animate={{
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                        }}
                                        className="ml-auto h-4 w-px bg-white/60"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* =================================
                            BOTTOM METRICS
                        ================================== */}

                        <div className="grid grid-cols-3 border border-t-0 border-white/[0.1]">
                            <InterviewMetric
                                label="Reasoning"
                                value="Detected"
                            />

                            <InterviewMetric
                                label="Concept"
                                value="Hashing"
                            />

                            <InterviewMetric
                                label="Complexity"
                                value="O(n)"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}


/* ============================================================
    CANDIDATE FEATURE
============================================================ */

function CandidateFeature({
    number,
    title,
    description,
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20,
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
            className="group grid grid-cols-[45px_1fr] gap-4 border-b border-white/[0.1] py-7 transition-colors duration-300 hover:bg-white/[0.025]"
        >
            {/* NUMBER */}

            <span className="pt-1 text-[10px] tracking-[0.2em] text-white/25">
                {number}
            </span>

            {/* CONTENT */}

            <div>
                <div className="flex items-center justify-between gap-5">
                    <h3 className="text-lg font-medium tracking-[-0.03em] text-white">
                        {title}
                    </h3>

                    <span className="h-px w-0 bg-white/40 transition-all duration-500 group-hover:w-8" />
                </div>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/40">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}


/* ============================================================
    INTERVIEW METRIC
============================================================ */

function InterviewMetric({
    label,
    value,
}) {
    return (
        <div className="border-r border-white/[0.1] p-5 last:border-r-0">
            <p className="text-[8px] uppercase tracking-[0.18em] text-white/25">
                {label}
            </p>

            <p className="mt-2 text-xs text-white/65">
                {value}
            </p>
        </div>
    );
}


export default CandidateSection;