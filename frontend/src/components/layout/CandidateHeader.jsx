
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

function CandidateHeader() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="relative z-30 flex h-[76px] shrink-0 items-center justify-end border-b border-white/[0.06] bg-[#08090b]/90 px-5 backdrop-blur-xl sm:px-6 lg:px-10">
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
        title="Log out"
      >
        <LogoutIcon />
        Logout
      </button>
    </header>
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  )
}

export default CandidateHeader
