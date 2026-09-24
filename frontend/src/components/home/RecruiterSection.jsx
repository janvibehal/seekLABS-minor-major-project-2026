import { motion } from "framer-motion";

function RecruiterSection() {
    return (
        <section
            id="recruiters"
            className="relative min-h-screen overflow-hidden bg-white text-white"
        >
            {/* ============================================
                VIDEO BACKGROUND
            ============================================ */}

            <div className="absolute inset-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover opacity-90"
                >
                    <source
                        src="/videos/recruiter-bg.mp4"
                        type="video/mp4"
                    />
                </video>

                {/* DARK OVERLAY */}

                <div className="absolute inset-0 bg-black/45" />

                {/* Darker edges */}

                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-black" />

                {/* Top / bottom cinematic fade */}

                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>


            {/* ============================================
                SUBTLE BACKGROUND GRID
            ============================================ */}

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />


            {/* ============================================
                MAIN 3 COLUMN LAYOUT
            ============================================ */}

            <div className="relative z-10 mx-auto min-h-screen max-w-[1600px] px-6 lg:px-10">

                <div className="grid min-h-screen grid-cols-1 border-x border-white/[0.08] lg:grid-cols-[1fr_1.25fr_1fr]">


                    {/* =====================================
                        COLUMN 1 — LEFT
                    ====================================== */}

                    <div className="flex min-h-[600px] flex-col justify-between border-b border-white/[0.08] p-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-10 xl:p-14">


                        {/* TOP LABEL */}

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
                            }}
                            transition={{
                                duration: 0.6,
                            }}
                            className="flex items-center gap-3"
                        >
                            <span className="h-px w-8 bg-white/30" />

                            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                                For recruiters
                            </p>
                        </motion.div>


                        {/* MAIN HEADING */}

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
                                duration: 0.8,
                            }}
                        >
                            <h2 className="text-5xl font-medium leading-[0.92] tracking-[-0.06em] sm:text-6xl xl:text-[78px]">

                                Seek

                                <br />

                                <span className="text-white/30">
                                    beyond
                                </span>

                                <br />

                                the answer.

                            </h2>
                        </motion.div>


                        {/* BOTTOM */}

                        <motion.div
                            initial={{
                                opacity: 0,
                            }}
                            whileInView={{
                                opacity: 1,
                            }}
                            viewport={{
                                once: true,
                            }}
                            transition={{
                                duration: 0.7,
                                delay: 0.2,
                            }}
                        >
                            <div className="h-px w-10 bg-white/30" />

                            <p className="mt-5 max-w-[250px] text-sm leading-7 text-white/40">
                                Understand how candidates think,
                                reason, and approach technical
                                problems.
                            </p>
                        </motion.div>

                    </div>


                    {/* =====================================
                        COLUMN 2 — MIDDLE

                        TOP
                        ↓
                        EMPTY VIDEO SPACE
                        ↓
                        BOTTOM
                    ====================================== */}

                    <div className="relative flex min-h-[700px] flex-col border-b border-white/[0.08] lg:min-h-screen lg:border-b-0 lg:border-r">


                        {/* TOP MIDDLE */}

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
                            }}
                            transition={{
                                duration: 0.7,
                            }}
                            className="border-b border-white/[0.08] p-8 lg:p-10"
                        >
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                                Recruiter intelligence
                            </p>

                            <p className="mt-5 max-w-sm text-lg leading-8 text-white/65">
                                A deeper signal for every
                                technical hiring decision.
                            </p>
                        </motion.div>


                        {/* =================================
                            EMPTY MIDDLE VIDEO WINDOW

                            VIDEO POPS THROUGH HERE
                        ================================= */}

                        <div className="relative flex flex-1 items-center justify-center overflow-hidden">


                            {/* VIDEO SPOTLIGHT */}

                            <div className="absolute inset-0">

                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="h-full w-full scale-110 object-cover opacity-90"
                                >
                                    <source
                                        src="/videos/recruiter-bg.mp4"
                                        type="video/mp4"
                                    />
                                </video>


                                {/* Soft fade around video */}

                                {/* <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

                                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" /> */}

                            </div>


                        

                        </div>


                        {/* BOTTOM MIDDLE */}

                       

                    </div>


                    {/* =====================================
                        COLUMN 3 — RIGHT
                    ====================================== */}

                    <div className="grid min-h-[600px] grid-cols-1 divide-y divide-white/[0.08] lg:min-h-screen">


                        <RecruiterFeature
                            number="01"
                            title="Understand reasoning"
                            description="SEEK beyond final answers and understand the thinking behind every technical decision."
                        />


                        <RecruiterFeature
                            number="02"
                            title="Adaptive interviews"
                            description="Follow-up questions evolve based on what the candidate understands and where gaps appear."
                        />


                        <RecruiterFeature
                            number="03"
                            title="Clear evaluation"
                            description="Review structured insights across reasoning, concepts, complexity, and technical depth."
                        />

                    </div>

                </div>

            </div>

        </section>
    );
}


/* ============================================================
    RIGHT COLUMN FEATURE
============================================================ */

function RecruiterFeature({
    number,
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
                amount: 0.2,
            }}
            transition={{
                duration: 0.6,
            }}
            className="group relative flex min-h-[220px] flex-col justify-between p-8 transition-colors duration-500 hover:bg-white/[0.025] lg:p-10"
        >
            {/* NUMBER */}

            <div className="flex items-center justify-between">

                <span className="text-[10px] tracking-[0.25em] text-white/25">
                    {number}
                </span>

                <div className="h-px w-8 bg-white/10 transition-all duration-500 group-hover:w-14 group-hover:bg-white/30" />

            </div>


            {/* CONTENT */}

            <div>

                <h3 className="text-xl font-medium tracking-[-0.04em] text-white">
                    {title}
                </h3>

                <p className="mt-4 max-w-xs text-sm leading-7 text-white/40">
                    {description}
                </p>

            </div>

        </motion.div>
    );
}


export default RecruiterSection;