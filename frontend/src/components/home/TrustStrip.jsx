function TrustStrip() {
    return (
        <section className="border-y border-white/[0.08] bg-black text-white">

            <div className="mx-auto max-w-[1440px] px-6 lg:px-10">

                <div className="grid grid-cols-1 divide-y divide-white/[0.08] md:grid-cols-4 md:divide-x md:divide-y-0">


                    {/* ITEM 1 */}

                    <div className="flex flex-col justify-center py-8 md:px-8">

                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                            Interview format
                        </p>

                        <p className="mt-3 text-sm font-medium text-white/80">
                            Conversational AI
                        </p>

                    </div>


                    {/* ITEM 2 */}

                    <div className="flex flex-col justify-center py-8 md:px-8">

                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                            Evaluation
                        </p>

                        <p className="mt-3 text-sm font-medium text-white/80">
                            Structured scoring
                        </p>

                    </div>


                    {/* ITEM 3 */}

                    <div className="flex flex-col justify-center py-8 md:px-8">

                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                            Intelligence
                        </p>

                        <p className="mt-3 text-sm font-medium text-white/80">
                            Adaptive follow-ups
                        </p>

                    </div>


                    {/* ITEM 4 */}

                    <div className="flex flex-col justify-center py-8 md:px-8">

                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                            Experience
                        </p>

                        <p className="mt-3 text-sm font-medium text-white/80">
                            Built for technical hiring
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default TrustStrip;