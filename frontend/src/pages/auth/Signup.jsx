import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function Signup() {
    const navigate = useNavigate();
    const { register, login } = useAuth();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!agreeTerms) {
            setError(
                "Please accept the Terms of Service and Privacy Policy."
            );
            return;
        }

        setLoading(true);

        try {
            await register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
            });

            await login({
                email: form.email,
                password: form.password,
            });

            navigate("/candidate/dashboard");

        } catch (err) {

            setError(
                err.message ||
                "Unable to create your account. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };

    const handleGoogleSignup = () => {
        console.log("Google signup");
    };

    const handleAppleSignup = () => {
        console.log("Apple signup");
    };


    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#050505] text-white">


            {/* =====================================================
                LEFT SIDE — BRAND / VIDEO
            ====================================================== */}

            <section className="relative hidden h-full w-[48%] overflow-hidden border-r border-white/[0.08] lg:flex">


                {/* VIDEO */}

                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                >
                    <source
                        src="/videos/signup-bg.mp4"
                        type="video/mp4"
                    />
                </video>


                {/* OVERLAYS */}

                <div className="absolute inset-0 bg-black/60" />

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/90" />

                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/95" />


                


                {/* GRID */}

                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                rgba(255,255,255,.7) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                90deg,
                                rgba(255,255,255,.7) 1px,
                                transparent 1px
                            )
                        `,
                        backgroundSize: "80px 80px",
                    }}
                />


                {/* LEFT CONTENT */}

                <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-8 xl:px-14 xl:py-10">


                    {/* LOGO */}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="group flex w-fit items-center gap-3"
                    >

                        <img
                            src="/images/logo.png"
                            alt="SeekLABS Logo"
                            className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105"
                        />


                        <span className="text-sm font-medium tracking-[-0.02em]">

                            Interview
                            <span className="text-white/40">
                                IQ
                            </span>

                        </span>

                    </button>


                    {/* HERO */}

                    <div className="max-w-xl">



                        <h1 className="text-5xl font-medium leading-[0.9] tracking-[-0.065em] xl:text-[68px]">

                            Show us

                            <br />

                            <span className="text-white/35">
                                how you think.
                            </span>

                        </h1>


                        <p className="mt-6 max-w-md text-sm leading-7 text-white/55">

                            Create your account and experience a new kind
                            of technical interview — one designed to
                            understand your reasoning, not just your answer.

                        </p>


                        {/* FEATURES */}

                        <div className="mt-8 border-t border-white/[0.1]">

                            <Benefit
                                number="01"
                                title="Adaptive questioning"
                                description="The conversation evolves based on your reasoning."
                            />

                            <Benefit
                                number="02"
                                title="Reasoning-first evaluation"
                                description="Your approach matters as much as your final answer."
                            />

                            <Benefit
                                number="03"
                                title="Detailed insight"
                                description="Understand your strengths and areas for improvement."
                            />

                        </div>

                    </div>


                    

                </div>

            </section>



            {/* =====================================================
                RIGHT SIDE — SIGNUP
            ====================================================== */}

            <section className="relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#070707] px-7 sm:px-12 lg:px-16">


                {/* GRID */}

                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                rgba(255,255,255,.7) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                90deg,
                                rgba(255,255,255,.7) 1px,
                                transparent 1px
                            )
                        `,
                        backgroundSize: "80px 80px",
                    }}
                />


                {/* SUBTLE BLUE GLOW */}

                <div className="pointer-events-none absolute right-[10%] top-[30%] h-[350px] w-[350px] rounded-full bg-blue-500/[0.025] blur-[130px]" />


                {/* FORM CONTENT */}

                <div className="relative z-10 w-full max-w-[430px]">


                    {/* MOBILE LOGO */}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mb-8 flex items-center gap-3 lg:hidden"
                    >

                        <img
                            src="/images/interviewiq-logo.png"
                            alt="SeekLABS"
                            className="h-8 w-8 object-contain"
                        />

                        <span className="text-sm font-medium">

                            Interview
                            <span className="text-white/40">
                                IQ
                            </span>

                        </span>

                    </button>



                    {/* TITLE */}

                    <h2 className="mt-5 text-4xl font-medium tracking-[-0.05em] text-white">

                        Create your account.

                    </h2>


                    <p className="mt-2 text-sm text-white/40">

                        Start your reasoning-first interview experience.

                    </p>


                    {/* SOCIAL BUTTONS */}

                    <div className="mt-6 grid grid-cols-2 gap-3">

                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="flex items-center justify-center gap-3 border border-white/[0.12] bg-white/[0.02] py-3 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/[0.05]"
                        >

                            <GoogleIcon />

                            Google

                        </button>


                        <button
                            type="button"
                            onClick={handleAppleSignup}
                            className="flex items-center justify-center gap-3 border border-white/[0.12] bg-white/[0.02] py-3 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/[0.05]"
                        >

                            <AppleIcon />

                            Apple

                        </button>

                    </div>


                    {/* DIVIDER */}

                    <div className="my-5 flex items-center gap-4">

                        <div className="h-px flex-1 bg-white/[0.08]" />

                        <span className="text-[8px] uppercase tracking-[0.16em] text-white/25">
                            Or use email
                        </span>

                        <div className="h-px flex-1 bg-white/[0.08]" />

                    </div>


                    {/* FORM */}

                    <form
                        onSubmit={handleSignup}
                        className="space-y-3"
                    >


                        {/* NAMES */}

                        <div className="grid grid-cols-2 gap-3">

                            <div>

                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    required
                                    className="w-full border border-white/[0.12] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-blue-400/70"
                                />

                            </div>


                            <div>

                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    required
                                    minLength={2}
                                    className="w-full border border-white/[0.12] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-blue-400/70"
                                />

                                <p className="mt-1 text-[10px] leading-4 text-white/30">
                                    Last name must be at least 2 characters.
                                </p>

                            </div>

                        </div>


                        {/* EMAIL */}

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email address"
                            required
                            className="w-full border border-white/[0.12] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-blue-400/70"
                        />


                        {/* PASSWORD */}

                        <div className="relative">

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Create password"
                                required
                                minLength={8}
                                className="w-full border border-white/[0.12] bg-white/[0.025] px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-white/20 focus:border-blue-400/70"
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="relative">

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                required
                                className="w-full border border-white/[0.12] bg-white/[0.025] px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-white/20 focus:border-blue-400/70"
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon />
                                ) : (
                                    <EyeIcon />
                                )}
                            </button>

                        </div>


                        {/* TERMS */}

                        <label className="flex cursor-pointer items-start gap-3 pt-1">

                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) =>
                                    setAgreeTerms(e.target.checked)
                                }
                                className="mt-0.5 h-3.5 w-3.5 accent-blue-500"
                            />


                            <span className="text-[10px] leading-5 text-white/40">

                                I agree to the Terms of Service and
                                Privacy Policy.

                            </span>

                        </label>


                        {/* ERROR */}

                        {error && (

                            <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-xs text-red-300">

                                {error}

                            </div>

                        )}


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-3 bg-white py-3.5 text-sm font-medium text-black transition duration-300 hover:bg-blue-400 hover:text-white disabled:opacity-60"
                        >

                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />

                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account

                                    <span className="transition-transform group-hover:translate-x-1">
                                        →
                                    </span>
                                </>
                            )}

                        </button>


                        {/* LOGIN LINK */}

                        <p className="pt-2 text-center text-xs text-white/35">

                            Already have an account?{" "}

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-white/80 transition hover:text-blue-400"
                            >
                                Sign in
                            </button>

                        </p>

                    </form>

                </div>

            </section>

        </div>
    );
}


/* =====================================================
    BENEFIT
===================================================== */

function Benefit({ number, title, description }) {
    return (
        <div className="flex gap-5 border-b border-white/[0.08] py-4">

            <span className="pt-0.5 text-[9px] text-blue-400">
                {number}
            </span>

            <div>

                <h3 className="text-sm font-medium text-white/80">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/40">
                    {description}
                </p>

            </div>

        </div>
    );
}


/* =====================================================
    GOOGLE ICON
===================================================== */

function GoogleIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24">

            <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.5 5.5 0 0 1-2.4 3.61v3h3.89c2.28-2.1 3.55-5.19 3.55-8.64Z"
            />

            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.89-3A7.18 7.18 0 0 1 12 19.2c-3.05 0-5.63-2.06-6.56-4.83H1.42v3.09A12 12 0 0 0 12 24Z"
            />

            <path
                fill="#FBBC05"
                d="M5.44 14.37A7.2 7.2 0 0 1 5.06 12c0-.82.14-1.62.38-2.37V6.54H1.42A12 12 0 0 0 0 12c0 1.93.46 3.76 1.42 5.46l4.02-3.09Z"
            />

            <path
                fill="#EA4335"
                d="M12 4.8c1.76 0 3.34.61 4.59 1.81l3.44-3.44C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.42 6.54l4.02 3.09C6.37 6.86 8.95 4.8 12 4.8Z"
            />

        </svg>
    );
}


/* =====================================================
    APPLE ICON
===================================================== */

function AppleIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.07-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01ZM12.03 7.25C11.88 5.02 13.69 3.18 15.75 3c.29 2.58-2.34 4.5-3.72 4.25Z" />
        </svg>
    );
}


/* =====================================================
    EYE ICON
===================================================== */

function EyeIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

            <circle cx="12" cy="12" r="3" />

        </svg>
    );
}


/* =====================================================
    EYE OFF ICON
===================================================== */

function EyeOffIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M3 3l18 18" />

            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

            <path d="M9.9 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18.4 18.4 0 0 1-3.1 3.9" />

            <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.5 0 2.8-.3 4-.8" />

        </svg>
    );
}


export default Signup;