import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const ROLE_HOME = {
  ADMIN: "/admin/dashboard",
  RECRUITER: "/recruiter/dashboard",
  CANDIDATE: "/candidate/dashboard",
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login({
        email,
        password,
        rememberMe,
      });

      navigate(ROLE_HOME[user.role] || "/login");
    } catch (err) {
      setError(
        err.message || "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
  };

  const handleAppleLogin = () => {
    console.log("Apple login");
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#050505] text-white">

      {/* =====================================================
                LEFT SIDE — CINEMATIC VIDEO EXPERIENCE
            ====================================================== */}

      <section className="relative hidden h-screen w-[48%] overflow-hidden border-r border-white/[0.08] lg:flex">

        {/* BACKGROUND VIDEO */}

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="/videos/login-bg.mp4"
            type="video/mp4"
          />
        </video>


        {/* =================================================
                    DARK CINEMATIC OVERLAYS
                ================================================= */}

        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/90" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90" />




        {/* =================================================
                    SUBTLE GRID
                ================================================= */}

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


        {/* =================================================
                    LEFT CONTENT
                ================================================= */}

        <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-8 xl:px-14 xl:py-10">


          {/* LOGO */}

          <div className="flex items-center gap-3">

            {/* LOGO */}

            <div className="flex h-9 w-9 items-center justify-center">

              <img
                src="/images/logo.png"
                alt="SeekLABS Logo"
                className="h-full w-full object-contain"
              />

            </div>


            {/* TEXT */}

            <Link
              to="/"
              className="text-sm font-medium tracking-[-0.02em] text-white transition-opacity hover:opacity-70"
            >
              SeekLABS
            </Link>

          </div>


          {/* MAIN TEXT */}

          <div className="max-w-xl py-8">


            {/* HEADING */}

            <h1 className="text-5xl font-medium leading-[0.9] tracking-[-0.065em] text-white xl:text-[68px]">

              Beyond the

              <br />

              <span className="text-white/35">
                final answer.
              </span>

            </h1>


            {/* DESCRIPTION */}

            <p className="mt-6 max-w-md text-sm leading-7 text-white/55">

              A new way to experience technical interviews.

              Explain your reasoning, explore your approach,
              and let AI understand how you think.

            </p>


            {/* MINI INFORMATION */}

            <div className="mt-8 flex items-center gap-7 border-t border-white/[0.12] pt-5">

              <div>

                <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                  Evaluation
                </p>

                <p className="mt-2 text-sm text-white/75">
                  Reasoning-first
                </p>

              </div>


              <div className="h-8 w-px bg-white/[0.1]" />


              <div>

                <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                  Experience
                </p>

                <p className="mt-2 text-sm text-white/75">
                  Adaptive
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
                RIGHT SIDE — LOGIN
            ====================================================== */}

      <section className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-[#070707]">


        {/* =================================================
                    BACKGROUND DETAILS
                ================================================= */}

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



        {/* =================================================
                    TOP BAR
                ================================================= */}

        <div className="relative z-10 flex shrink-0 items-center justify-between px-7 py-6 sm:px-10 lg:px-12">


          {/* MOBILE LOGO */}

          <div className="flex items-center gap-3 lg:hidden">

            <div className="flex h-9 w-9 items-center justify-center border border-white/20">

              <div className="relative h-4 w-4">

                <div className="absolute inset-0 rounded-full border border-white/80" />

                <div className="absolute right-[-2px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-400" />

              </div>

            </div>


            <span className="text-sm font-medium">
              SeekLABS
            </span>

          </div>


          <div className="hidden lg:block" />


          {/* SIGNUP */}

          <p className="text-xs text-white/35">

            Don't have an account?{" "}

            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-white/80 transition hover:text-blue-400"
            >
              Sign up
            </button>

          </p>

        </div>


        {/* =================================================
                    LOGIN CONTENT
                ================================================= */}

        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-7 py-6 sm:px-12">


          <div className="w-full max-w-[400px]">


            {/* LABEL */}

            <div className="flex items-center gap-3">

              <span className="h-px w-8 bg-blue-400/70" />

              <span className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                Secure access
              </span>

            </div>


            {/* HEADING */}

            <h2 className="mt-6 text-4xl font-medium tracking-[-0.05em] text-white">

              Welcome back.

            </h2>


            <p className="mt-2 text-sm leading-6 text-white/40">

              Continue your journey with SeekLABS.

            </p>


            {/* =================================================
                            SOCIAL LOGIN
                        ================================================= */}

            <div className="mt-8 grid grid-cols-2 gap-3">


              {/* GOOGLE */}

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 border border-white/[0.12] bg-white/[0.02] py-3 text-sm text-white/70 transition duration-300 hover:border-white/30 hover:bg-white/[0.05]"
              >

                <GoogleIcon />

                <span>Google</span>

              </button>


              {/* APPLE */}

              <button
                type="button"
                onClick={handleAppleLogin}
                className="flex items-center justify-center gap-3 border border-white/[0.12] bg-white/[0.02] py-3 text-sm text-white/70 transition duration-300 hover:border-white/30 hover:bg-white/[0.05]"
              >

                <AppleIcon />

                <span>Apple</span>

              </button>

            </div>


            {/* DIVIDER */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/[0.08]" />

              <span className="whitespace-nowrap text-[8px] uppercase tracking-[0.18em] text-white/25">
                Or continue with email
              </span>

              <div className="h-px flex-1 bg-white/[0.08]" />

            </div>


            {/* =================================================
                            LOGIN FORM
                        ================================================= */}

            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >


              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-white/40">
                  Email
                </label>


                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  className="w-full border border-white/[0.12] bg-white/[0.025] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/70 focus:bg-white/[0.04] focus:ring-1 focus:ring-blue-400/20"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-white/40">
                  Password
                </label>


                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    className="w-full border border-white/[0.12] bg-white/[0.025] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/70 focus:bg-white/[0.04] focus:ring-1 focus:ring-blue-400/20"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOffIcon />
                    ) : (
                      <EyeIcon />
                    )}

                  </button>

                </div>

              </div>


              {/* REMEMBER + FORGOT */}

              <div className="flex items-center justify-between pt-1">


                <label className="flex cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    className="h-3.5 w-3.5 border-white/20 bg-transparent accent-blue-500"
                  />

                  <span className="text-xs text-white/40">
                    Remember me
                  </span>

                </label>


                <button
                  type="button"
                  onClick={() =>
                    navigate("/forgot-password")
                  }
                  className="text-xs text-white/50 transition hover:text-blue-400"
                >
                  Forgot password?
                </button>

              </div>


              {/* ERROR */}

              {error && (

                <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">

                  {error}

                </div>

              )}


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center overflow-hidden border border-blue-400/30 bg-blue-500 py-3.5 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <span className="relative z-10 flex items-center gap-3">

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue to SeekLABS

                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}

                </span>

              </button>

            </form>


            {/* SECURITY */}

            <div className="mt-5 flex items-center gap-2 text-[9px] text-white/25">

              <LockIcon />

              Your account information is securely encrypted.

            </div>

          </div>

        </div>


        {/* =================================================
                    FOOTER
                ================================================= */}

        <footer className="relative z-10 flex shrink-0 items-center justify-between border-t border-white/[0.06] px-7 py-5 text-[9px] uppercase tracking-[0.12em] text-white/25 sm:px-10 lg:px-12">

          <span>
            © 2026 SeekLABS
          </span>


          <div className="flex gap-6">

            <button
              type="button"
              className="transition hover:text-white/60"
            >
              Privacy
            </button>

            <button
              type="button"
              className="transition hover:text-white/60"
            >
              Support
            </button>

          </div>

        </footer>

      </section>

    </div>
  );
}


/* ============================================================
   GOOGLE ICON
============================================================ */

function GoogleIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
    >
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


/* ============================================================
   APPLE ICON
============================================================ */

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


/* ============================================================
   LOCK ICON
============================================================ */

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}


/* ============================================================
   EYE ICON
============================================================ */

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

      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </svg>
  );
}


/* ============================================================
   EYE OFF ICON
============================================================ */

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


export default Login;