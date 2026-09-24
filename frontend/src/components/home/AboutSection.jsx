import { motion } from "framer-motion";

function AboutSection() {
    return (
        <section
            id="about"
            className="relative overflow-hidden bg-black text-white"
        >

            {/* SUBTLE BACKGROUND */}

            <div className="absolute inset-0 opacity-[0.035]">
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                        backgroundSize: "90px 90px",
                    }}
                />
            </div>


            <div className="relative mx-auto max-w-[1440px] px-6 py-28 lg:px-10 lg:py-40">


                {/* ===============================
                    TOP LABEL
                =============================== */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-3"
                >
                    <span className="h-px w-8 bg-white/40" />

                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                        About SeekLABS
                    </p>
                </motion.div>


                {/* ===============================
                    MAIN HEADING
                =============================== */}

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.8,
                        delay: 0.1,
                    }}
                    className="mt-10"
                >

                    <h2 className="max-w-6xl text-5xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[88px]">

                        A technical interview
                        <br />

                        should understand

                        <span className="text-white/30">
                            {" "}how you think.
                        </span>

                    </h2>

                </motion.div>


                {/* ===============================
                    DESCRIPTION ROW
                =============================== */}

                <div className="mt-16 grid gap-10 border-t border-white/[0.08] pt-10 lg:grid-cols-[1fr_1fr]">


                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-xl text-lg leading-8 text-white/65"
                    >
                        Traditional technical assessments often measure
                        whether a candidate reaches the correct answer.

                        <span className="text-white">
                            {" "}SeekLABS focuse on the reasoning,
                            decisions, and understanding behind it.
                        </span>

                    </motion.p>


                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.6,
                            delay: 0.1,
                        }}
                        className="max-w-lg text-sm leading-7 text-white/35 lg:justify-self-end"
                    >
                        Our adaptive interview system creates a conversation
                        around each candidate's approach. Every response can
                        influence the next question, helping evaluate technical
                        depth beyond memorised answers.
                    </motion.p>

                </div>


                {/* ===============================
                    FEATURE GRID
                =============================== */}

                <div className="mt-24 grid border border-white/[0.08] md:grid-cols-3">


                    <Feature
                        number="01"
                        title="Understand reasoning"
                        text="Evaluate how candidates break down problems and make technical decisions."
                    />


                    <Feature
                        number="02"
                        title="Adapt the interview"
                        text="Follow-up questions evolve based on each candidate's response."
                    />


                    <Feature
                        number="03"
                        title="Evaluate consistently"
                        text="Structured dimensions help create a clearer and more consistent evaluation."
                    />

                </div>


                {/* ===============================
                    BOTTOM STATEMENT
                =============================== */}

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.8,
                        delay: 0.2,
                    }}
                    className="mt-16 flex flex-col justify-between gap-6 border-t border-white/[0.08] pt-8 md:flex-row md:items-center"
                >

                    <p className="text-sm text-white/35">
                        Built for a better technical interview experience.
                    </p>


                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                        Reasoning over memorisation
                    </p>

                </motion.div>

            </div>

        </section>
    );
}


/* ===============================================
    SMALL COMPONENT — ONLY FOR THIS SECTION
================================================ */

function Feature({
    number,
    title,
    text,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group min-h-[280px] border-b border-white/[0.08] p-8 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 lg:p-10"
        >

            <p className="text-[10px] tracking-[0.2em] text-white/25">
                {number}
            </p>


            <div className="mt-20">

                <h3 className="text-xl font-medium tracking-[-0.03em] text-white">
                    {title}
                </h3>


                <p className="mt-4 max-w-xs text-sm leading-6 text-white/40">
                    {text}
                </p>

            </div>


            {/* Minimal line */}

            <div className="mt-8 h-px w-0 bg-white/40 transition-all duration-500 group-hover:w-12" />

        </motion.div>
    );
}


export default AboutSection;