import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as candidateApi from '../../api/candidate.api.js'

function CandidateDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const dashboardData = await candidateApi.getDashboard()

        if (cancelled) return

        setDashboard(dashboardData)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load your dashboard.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

              <div className="absolute inset-2 rounded-full bg-blue-400/10 blur-md" />
            </div>

            <p className="text-sm text-zinc-500">
              Loading your workspace...
            </p>
          </div>
        </div>
    )
  }

  /* =====================================================
     ERROR
  ====================================================== */

  if (error) {
    return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-medium text-red-400">
            Something went wrong
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            {error}
          </p>
        </div>
    )
  }

  return (
    <div className="min-h-screen pb-8 text-white">

        {/* =====================================================
            HERO / HEADER
        ====================================================== */}

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#111827] via-[#090b10] to-black p-7 sm:p-10">

          {/* Background Effects */}

          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]" />

          <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-96 rounded-full bg-blue-400/5 blur-[100px]" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

          <div className="relative">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

              {/* LEFT */}

              <div>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Good morning,
                  <span className="ml-2 text-blue-400">
                    {user?.firstName
                      ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
                      : 'Candidate'}
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                  Track your interview performance, sharpen your skills,
                  and stay prepared for your next opportunity.
                </p>

                <p className="mt-3 max-w-xl text-sm italic leading-6 text-zinc-400">
                  "Great things are done by a series of small things brought together."
                  <span className="ml-1 text-zinc-500 not-italic">— Vincent van Gogh</span>
                </p>
              </div>

              {/* CTA */}

              <button
                type="button"
                onClick={() => navigate('/candidate/interviews')}
                className="group flex items-center justify-center gap-2 rounded-xl bg-blue-400 px-5 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-blue-300 hover:shadow-[0_0_30px_rgba(96,165,250,0.25)]"
              >
                View Interviews

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <StatCard
            label="Upcoming Interviews"
            value={String(dashboard?.stats?.upcomingInterviews ?? 0)}
            description="Scheduled sessions"
            icon={<CalendarIcon />}
            accent="blue"
          />

          <StatCard
            label="Completed"
            value={String(dashboard?.stats?.completedInterviews ?? 0)}
            description="Interviews completed"
            icon={<CheckIcon />}
            accent="cyan"
          />

          <StatCard
            label="Average Score"
            value={`${dashboard?.stats?.averageScore ?? 0}%`}
            description={`${dashboard?.stats?.totalInterviews ?? 0} total interviews`}
            icon={<ChartIcon />}
            accent="sky"
          />


        </div>

        {/* QORE Image Section */}
        <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl mt-10">
          <img
            src="/images/qore-promo.png"
            alt="QORE – Your AI-Powered Interview Companion"
            className="block h-auto w-full rounded-2xl object-cover"
          />
        </div>

    </div>
  )
}

/* ============================================================
   LABELS
============================================================ */

/* ============================================================
   COMPONENTS
============================================================ */

function StatCard({
  label,
  value,
  description,
  icon,
  accent = 'blue',
}) {
  const accentStyles = {
    blue: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    cyan: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
    sky: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    indigo: 'bg-blue-600/10 text-blue-300 border-blue-500/20',
  }

  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-[#0e1118]">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium text-zinc-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accentStyles[accent]}`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-5 text-xs text-zinc-600">
        {description}
      </p>

    </div>
  )
}

/* ============================================================
   ICONS
============================================================ */

function CalendarIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M7 2v4M17 2v4M3 10h18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-5 3 2 5-6" />
    </svg>
  )
}

export default CandidateDashboard
