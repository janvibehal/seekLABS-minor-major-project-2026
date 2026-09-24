function RecruiterHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#0f0f0f] px-6 lg:px-8">

      {/* =====================================================
          LEFT
      ====================================================== */}

      <div>

        <p className="text-sm font-medium tracking-tight text-neutral-100">
          Recruiter Dashboard
        </p>

        <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-neutral-600">
          Hiring Overview
        </p>

      </div>


      {/* =====================================================
          RIGHT
      ====================================================== */}

      <div className="flex items-center gap-5">

        {/* SEARCH */}

        <div className="hidden items-center border border-white/10 bg-transparent px-3 py-2 md:flex">

          <SearchIcon />

          <input
            type="text"
            placeholder="Search candidates..."
            className="ml-3 w-52 bg-transparent text-xs text-neutral-300 outline-none placeholder:text-neutral-600"
          />

        </div>


        {/* NOTIFICATIONS */}

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center border border-transparent text-neutral-500 transition hover:border-white/10 hover:bg-white/[0.03] hover:text-neutral-200"
        >

          <BellIcon />

          <span className="absolute right-2.5 top-2.5 h-1 w-1 bg-white" />

        </button>


        {/* DIVIDER */}

        <div className="h-7 w-px bg-white/10" />


        {/* PROFILE */}

        <button
          type="button"
          className="flex items-center gap-3 text-left transition hover:opacity-80"
        >

          <div className="flex h-8 w-8 items-center justify-center border border-white/15 bg-[#141414] text-xs font-medium text-neutral-300">
            R
          </div>


          <div className="hidden sm:block">

            <p className="text-xs font-medium text-neutral-200">
              Recruiter
            </p>

            <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-neutral-600">
              Hiring Team
            </p>

          </div>

        </button>

      </div>

    </header>
  )
}


/* ============================================================
   SEARCH ICON
============================================================ */

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-neutral-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="7" />

      <path d="m20 20-4-4" />
    </svg>
  )
}


/* ============================================================
   BELL ICON
============================================================ */

function BellIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

      <path d="M10 21h4" />
    </svg>
  )
}


export default RecruiterHeader