import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

function CandidateSidebar() {
  const { user } = useAuth()

  const initial = user?.firstName?.[0]?.toUpperCase() || 'C'

  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Candidate'

  const navigation = [
    {
      name: 'Dashboard',
      path: '/candidate/dashboard',
      icon: DashboardIcon,
    },
    {
      name: 'My Interviews',
      path: '/candidate/interviews',
      icon: InterviewIcon,
    },
    {
      name: 'Results',
      path: '/candidate/results',
      icon: ResultsIcon,
    },
    {
      name: 'Preparation',
      path: '/candidate/preparation',
      icon: PreparationIcon,
    },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col overflow-hidden border-r border-white/[0.06] bg-[#08090b] lg:flex">

      {/* =====================================================
          BACKGROUND GLOW
      ====================================================== */}

      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-400/[0.07] blur-[100px]" />

      <div className="pointer-events-none absolute bottom-20 -left-32 h-72 w-72 rounded-full bg-blue-500/[0.04] blur-[120px]" />


      {/* =====================================================
          LOGO
      ====================================================== */}

      <div className="relative flex h-24 shrink-0 items-center px-6">

        <div className="flex items-center gap-3">

          {/* Logo */}

          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">

            <div className="absolute inset-0 rounded-2xl bg-blue-400/[0.06] blur-xl" />

            <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-blue-400">

              <div className="h-2.5 w-2.5 rounded-full border-2 border-[#08090b]" />

            </div>

          </div>


          {/* Brand */}

          <div>

            <p className="text-[17px] font-semibold tracking-tight text-white">
              Seek<span className="text-blue-400">LABS</span>
            </p>

            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-600">
              Candidate Workspace
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          DIVIDER
      ====================================================== */}

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />


      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="relative flex-1 overflow-y-auto px-4 py-7">

        {/* Section Label */}

        <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Workspace
        </p>


        <div className="space-y-1.5">

          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-400 text-black shadow-[0_8px_30px_rgba(96,165,250,0.12)]'
                      : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Glow */}

                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-blue-400/20 blur-lg" />
                    )}


                    {/* Icon */}

                    <span
                      className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-black/10 text-black'
                          : 'text-zinc-600 group-hover:bg-blue-400/10 group-hover:text-blue-400'
                      }`}
                    >
                      <Icon />
                    </span>


                    {/* Text */}

                    <span className="relative">
                      {item.name}
                    </span>


                    {/* Active Dot */}

                    {isActive && (
                      <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-black/60" />
                    )}

                  </>
                )}
              </NavLink>
            )
          })}

        </div>


        {/* =====================================================
            QUICK TIP CARD
        ====================================================== */}

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-blue-400/[0.12] bg-gradient-to-br from-blue-400/[0.08] to-transparent p-4">

          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-400/10 blur-2xl" />

          <div className="relative">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
              <SparkIcon />
            </div>

            <p className="mt-4 text-xs font-semibold text-zinc-200">
              Keep improving
            </p>

            <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">
              Practice regularly to improve your interview performance.
            </p>

          </div>

        </div>

      </nav>


      {/* =====================================================
          PROFILE
      ====================================================== */}

      <div className="relative shrink-0 border-t border-white/[0.06] p-4">

        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all duration-300 hover:bg-white/[0.04]"
        >

          {/* Avatar */}

          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 text-sm font-bold text-[#061018] shadow-[0_8px_25px_rgba(96,165,250,0.2)]">

            {initial}

            {/* Online indicator */}

            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#08090b] bg-emerald-400" />

          </div>


          {/* User Info */}

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold text-zinc-200 transition group-hover:text-white">
              {fullName}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-zinc-600">
              Candidate Account
            </p>

          </div>


          {/* Arrow */}

          <span className="text-zinc-700 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-blue-400">
            <ArrowIcon />
          </span>

        </button>

      </div>

    </aside>
  )
}


/* ============================================================
   ICONS
============================================================ */

function DashboardIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}


function InterviewIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" />

      <path d="M7 2v4M17 2v4M3 10h18" />

      <path d="M8 14h3M8 18h5" />
    </svg>
  )
}


function ResultsIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 19V5" />

      <path d="M4 19h16" />

      <path d="m7 15 4-4 3 2 5-7" />

      <circle cx="7" cy="15" r="1" fill="currentColor" stroke="none" />

      <circle cx="11" cy="11" r="1" fill="currentColor" stroke="none" />

      <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}


function PreparationIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 5a3 3 0 0 1 3-3h13v18H7a3 3 0 0 0-3 3V5Z" />

      <path d="M7 20h13" />

      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  )
}


function SparkIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m12 3-1.7 5.3L5 10l5.3 1.7L12 17l1.7-5.3L19 10l-5.3-1.7L12 3Z" />

      <path d="m19 16-.8 2.2L16 19l2.2.8L19 22l.8-2.2L22 19l-2.2-.8L19 16Z" />
    </svg>
  )
}


function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 12h14" />

      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}


export default CandidateSidebar