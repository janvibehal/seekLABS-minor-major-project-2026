import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

function RecruiterSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const workspaceNavigation = [
    {
      name: 'Dashboard',
      path: '/recruiter/dashboard',
      icon: DashboardIcon,
    },
    // {
    //   name: 'Jobs',
    //   path: '/recruiter/jobs',
    //   icon: JobsIcon,
    // },
    {
      name: 'Candidates',
      path: '/recruiter/candidates',
      icon: CandidatesIcon,
    },
    {
      name: 'Interviews',
      path: '/recruiter/interviews',
      icon: InterviewIcon,
    },
    {
      name: 'Analytics',
      path: '/recruiter/analytics',
      icon: AnalyticsIcon,
    },
  ]

  const managementNavigation = [
    {
      name: 'Settings',
      path: '/recruiter/settings',
      icon: SettingsIcon,
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error('Logout error:', error)

      navigate('/login', {
        replace: true,
      })
    }
  }

  const firstName = user?.firstName || 'Recruiter'
  const lastName = user?.lastName || ''

  const initials = `${firstName?.[0] || ''}${
    lastName?.[0] || ''
  }`.toUpperCase()

  const fullName = `${firstName} ${lastName}`.trim()

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0a0a0a] lg:flex">

      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-7">

        <div>

          <p className="text-base font-semibold tracking-tight text-white">
            SeekLABS
          </p>

          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            Recruiter Workspace
          </p>

        </div>

      </div>


      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-7">

        {/* WORKSPACE */}

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
          Workspace
        </p>

        <div className="space-y-1">

          {workspaceNavigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-3 text-sm transition ${
                    isActive
                      ? 'bg-white/[0.06] font-medium text-white'
                      : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 top-0 w-px bg-white" />
                    )}

                    <Icon />

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            )
          })}

        </div>


        {/* MANAGEMENT */}

        <p className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
          Management
        </p>

        <div className="space-y-1">

          {managementNavigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-3 text-sm transition ${
                    isActive
                      ? 'bg-white/[0.06] font-medium text-white'
                      : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 top-0 w-px bg-white" />
                    )}

                    <Icon />

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            )
          })}

        </div>

      </nav>


      {/* =====================================================
          USER
      ====================================================== */}

      <div className="shrink-0 border-t border-white/10">

        {/* PROFILE */}

        <div className="flex items-center gap-3 px-7 py-5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/15 bg-[#111111] text-xs font-semibold text-neutral-300">

            {initials || 'R'}

          </div>


          <div className="min-w-0">

            <p className="truncate text-sm font-medium text-neutral-200">
              {fullName}
            </p>

            <p className="mt-0.5 truncate text-xs text-neutral-600">
              {user?.email || 'Recruitment Team'}
            </p>

          </div>

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 border-t border-white/10 px-7 py-4 text-sm text-neutral-500 transition hover:bg-white/[0.03] hover:text-white"
        >

          <LogoutIcon />

          <span>Logout</span>

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
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}


function JobsIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="6" width="18" height="14" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 11h18" />
      <path d="M10 11v2h4v-2" />
    </svg>
  )
}


function CandidatesIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5a3 3 0 0 1 0 6" />
      <path d="M18 14c2 .8 3 2.8 3 6" />
    </svg>
  )
}


function InterviewIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="4" width="18" height="17" />
      <path d="M7 2v4M17 2v4M3 10h18" />
      <path d="M8 14h2M14 14h2M8 18h2" />
    </svg>
  )
}


function AnalyticsIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3-4 3 2 5-6" />
    </svg>
  )
}


function SettingsIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="3" />

      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.5h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.5v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  )
}


function LogoutIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M3 5V3h10a2 2 0 0 1 2 2v2" />
      <path d="M12 17v2a2 2 0 0 1-2 2H3v-2" />
    </svg>
  )
}


export default RecruiterSidebar