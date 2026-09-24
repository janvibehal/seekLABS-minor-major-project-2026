function Navbar() {
    return (
        <header className="absolute left-0 top-0 z-50 w-full border-b border-white/[0.08]">

            <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">

                {/* LOGO */}

                <a
                    href="/"
                    className="group flex items-center gap-3"
                >
                    {/* LOGO IMAGE */}

                    <div className="flex h-10 w-10 items-center justify-center">

                        <img
                            src="/images/logo.png"
                            alt="InterviewIQ Logo"
                            className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105"
                        />

                    </div>


                    {/* BRAND NAME */}

                    <span className="text-base font-semibold tracking-[-0.04em] text-white">

                        Seek
                        <span className="text-white/40">
                            LABS
                        </span>

                    </span>

                </a>


                {/* NAVIGATION */}

                <nav className="hidden items-center gap-10 md:flex">

                    <a
                        href="#about"
                        className="text-[11px] text-white/50 transition-colors hover:text-white"
                    >
                        About
                    </a>

                    <a
                        href="#how-it-works"
                        className="text-[11px] text-white/50 transition-colors hover:text-white"
                    >
                        How it works
                    </a>

                    <a
                        href="#recruiters"
                        className="text-[11px] text-white/50 transition-colors hover:text-white"
                    >
                        Recruiters
                    </a>

                    <a
                        href="#candidates"
                        className="text-[11px] text-white/50 transition-colors hover:text-white"
                    >
                        Candidates
                    </a>

                </nav>


                {/* RIGHT */}

                <div className="flex items-center gap-7">

                    <a
                        href="/login"
                        className="text-[11px] text-white/50 transition-colors hover:text-white"
                    >
                        Sign in
                    </a>

                    <a
                        href="/signup"
                        className="bg-white px-5 py-2.5 text-[10px] font-medium text-black transition-colors hover:bg-white/80"
                    >
                        Get started
                    </a>

                </div>

            </div>

        </header>
    );
}

export default Navbar;