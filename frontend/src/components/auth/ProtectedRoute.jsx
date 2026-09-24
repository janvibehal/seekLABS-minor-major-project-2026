import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  RECRUITER: '/recruiter/dashboard',
  CANDIDATE: '/candidate/dashboard',
}

function ProtectedRoute({ allowedRoles, children }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f8fc]">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#285b8f]/30 border-t-[#285b8f]" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
  }

  return children
}

export default ProtectedRoute
