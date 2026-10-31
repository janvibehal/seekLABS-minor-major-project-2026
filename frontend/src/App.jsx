
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

// General Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import RecruiterJobs from './pages/recruiter/RecruiterJobs'
import RecruiterCandidates from './pages/recruiter/RecruiterCandidates'
import RecruiterInterviews from './pages/recruiter/RecruiterInterviews'
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics'
import RecruiterSettings from './pages/recruiter/RecruiterSettings'

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard'
import CandidateInterviews from './pages/candidate/CandidateInterviews'
import CandidateResults from './pages/candidate/CandidateResults'
import CandidateResultDetail from './pages/candidate/CandidateResultDetail'
import CandidatePreparation from './pages/candidate/CandidatePreparation'
import CandidateInterview from './pages/candidate/CandidateInterview'
import CandidateSettings from './pages/candidate/CandidateSettings'

// Candidate Shared Layout
import CandidateLayout from './components/layout/CandidateLayout'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* =====================================
              GENERAL ROUTES
          ====================================== */}

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />


          {/* =====================================
              ADMIN ROUTES
          ====================================== */}

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />


          {/* =====================================
              RECRUITER ROUTES
          ====================================== */}

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

          <Route
            path="/recruiter/analytics"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterAnalytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/settings"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterSettings />
              </ProtectedRoute>
            }
          />


          {/* =====================================
              CANDIDATE ROUTES
              Shared Sidebar + Header Layout
          ====================================== */}

          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateLayout />
              </ProtectedRoute>
            }
          >

            {/* Candidate Dashboard */}
            <Route
              path="dashboard"
              element={<CandidateDashboard />}
            />

            {/* Candidate Interviews */}
            <Route
              path="interviews"
              element={<CandidateInterviews />}
            />

            {/* Candidate Results */}
            <Route
              path="results"
              element={<CandidateResults />}
            />

            {/* Individual Interview Result */}
            <Route
              path="results/:id"
              element={<CandidateResultDetail />}
            />

            {/* Interview Preparation */}
            <Route
              path="preparation"
              element={<CandidatePreparation />}
            />

            {/* Individual Interview Session */}
            <Route
              path="interview/:id"
              element={<CandidateInterview />}
            />

            {/* Candidate Settings */}
            <Route
              path="settings"
              element={<CandidateSettings />}
            />

            {/* Default Candidate Route */}
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

          </Route>


          {/* =====================================
              DEFAULT ROUTE
          ====================================== */}

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
