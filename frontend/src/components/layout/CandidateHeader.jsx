import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

function CandidateHeader() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const initial = user?.firstName?.[0]?.toUpperCase() || 'C'

  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Candidate'

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="relative z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#08090b]/90 px-5 backdrop-blur-xl sm:px-6 lg:px-8">

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-zinc-400 transition hover:border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-400 lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>


      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="hidden md:block">

        <div className="group relative">

          <SearchIcon />

          <input
            type="text"
            placeholder="Search interviews..."
            className="
              h-11 w-72
              rounded-xl
              border border-white/[0.07]
              bg-white/[0.025]
              py-2
              pl-11
              pr-4
              text-sm
              text-zinc-200
              outline-none
              transition-all
              duration-300
              placeholder:text-zinc-600
              hover:border-white/[0.12]
              focus:border-blue-400/40
              focus:bg-blue-400/[0.04]
              focus:shadow-[0_0_0_4px_rgba(96,165,250,0.05)]
            "
          />

        </div>

      </div>


      {/* =====================================================
          RIGHT ACTIONS
      ====================================================== */}

      <div className="ml-auto flex items-center gap-3 sm:gap-4">


        {/* Notifications */}

        <button
          type="button"
          className="
            group
            relative
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.025]
            text-zinc-500
            transition-all
            duration-300
            hover:border-blue-400/30
            hover:bg-blue-400/[0.08]
            hover:text-blue-400
          "
          aria-label="Notifications"
        >

          <BellIcon />

          {/* Notification indicator */}

          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-blue-400 ring-2 ring-[#08090b]" />

        </button>


        {/* Divider */}

        <div className="hidden h-7 w-px bg-white/[0.07] sm:block" />


        {/* =====================================================
            USER PROFILE
        ====================================================== */}

        <div className="group flex items-center gap-3 rounded-xl py-1.5 pl-1.5 pr-2 transition hover:bg-white/[0.03]">


          {/* Avatar */}

          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 text-sm font-bold text-[#061018] shadow-[0_6px_25px_rgba(96,165,250,0.18)]">

            {initial}

            {/* Status */}

            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#08090b] bg-emerald-400" />

          </div>


          {/* User details */}

          <div className="hidden min-w-0 text-left xl:block">

            <p className="max-w-[130px] truncate text-sm font-semibold text-zinc-200 transition group-hover:text-white">
              {fullName}
            </p>

            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Candidate
            </p>

          </div>


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              hidden
              h-9
              items-center
              justify-center
              rounded-lg
              px-3
              text-xs
              font-medium
              text-zinc-600
              transition-all
              hover:bg-red-500/10
              hover:text-red-400
              xl:flex
            "
            title="Log out"
          >
            <LogoutIcon />
          </button>

        </div>

      </div>

    </header>
  )
}


/* ============================================================
   ICONS
============================================================ */

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}


function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-blue-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="6.5" />

      <path d="m16 16 4 4" />
    </svg>
  )
}


function BellIcon() {
  return (
    <svg
      className="h-[19px] w-[19px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

      <path d="M10 21h4" />
    </svg>
  )
}


function LogoutIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M10 17l5-5-5-5" />

      <path d="M15 12H3" />

      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  )
}


export default CandidateHeader