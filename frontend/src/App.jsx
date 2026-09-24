import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

import Home from './pages/Home'
import AdminDashboard from './pages/admin/AdminDashboard'


import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import RecruiterJobs from './pages/recruiter/RecruiterJobs'
import RecruiterCandidates from './pages/recruiter/RecruiterCandidates'
import RecruiterInterviews from './pages/recruiter/RecruiterInterviews'
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics'

import CandidateDashboard from './pages/candidate/CandidateDashboard'
import CandidateInterviews from './pages/candidate/CandidateInterviews'
import CandidateResults from './pages/candidate/CandidateResults'
import CandidateResultDetail from './pages/candidate/CandidateResultDetail'
import CandidatePreparation from './pages/candidate/CandidatePreparation'
import CandidateInterview from './pages/candidate/CandidateInterview'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route path="/" element={<Home />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          {/* Recruiter */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/candidates"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/interviews"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterInterviews />
              </ProtectedRoute>
            }
          />




          {/* Candidate */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/interviews"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateInterviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/results"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/results/:id"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateResultDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/preparation"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidatePreparation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/interview/:id"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/analytics"
            element={<RecruiterAnalytics />}
          />



          {/* Default */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
