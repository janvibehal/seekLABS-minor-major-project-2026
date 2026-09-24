import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CandidateLayout from '../../components/layout/CandidateLayout'
import { useAuth } from '../../context/AuthContext.jsx'
import * as candidateApi from '../../api/candidate.api.js'

function CandidateDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [preparation, setPreparation] = useState(null)
  const [latestResult, setLatestResult] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const [dashboardData, preparationData] = await Promise.all([
          candidateApi.getDashboard(),
          candidateApi.getPreparation(),
        ])

        if (cancelled) return

        setDashboard(dashboardData)
        setPreparation(preparationData)

        const latestCompleted = dashboardData.recentInterviews?.[0]

        if (latestCompleted) {
          const detail = await candidateApi.getResultDetail(latestCompleted.id)

          if (!cancelled) {
            setLatestResult(detail)
          }
        }
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
      <CandidateLayout>
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
      </CandidateLayout>
    )
  }

  /* =====================================================
     ERROR
  ====================================================== */

  if (error) {
    return (
      <CandidateLayout>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-medium text-red-400">
            Something went wrong
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            {error}
          </p>
        </div>
      </CandidateLayout>
    )
  }

  const upcoming = dashboard?.upcomingInterviews?.[0]

  const dimensionEntries = latestResult
    ? Object.entries(latestResult.dimensions || {})
    : []

  const topRecommendation = preparation?.topicScores?.length
    ? [...preparation.topicScores].sort((a, b) => a.score - b.score)[0]
    : null

  return (
    <CandidateLayout>
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
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_#60a5fa]" />

                  <span className="text-xs font-medium text-blue-300">
                    Candidate Workspace
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Good morning,
                  <span className="ml-2 text-blue-400">
                    {user?.firstName || 'Candidate'}
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                  Track your interview performance, sharpen your skills,
                  and stay prepared for your next opportunity.
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

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

          <StatCard
            label="Preparation"
            value={`${preparation?.overallProgress ?? 0}%`}
            description="Overall readiness"
            icon={<BookIcon />}
            accent="indigo"
          />

        </div>

        {/* =====================================================
            MAIN GRID
        ====================================================== */}

        <div className="mt-8 grid gap-6 xl:grid-cols-3">

          {/* ================= UPCOMING ================= */}

          <div className="xl:col-span-2">

            <SectionHeader
              title="Upcoming Interview"
              subtitle="Your next scheduled session"
              action="View all"
              onAction={() => navigate('/candidate/interviews')}
            />

            {upcoming ? (
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0d12] transition-all duration-300 hover:border-blue-400/20 hover:bg-[#0e1118]">

                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

                <div className="p-6 sm:p-7">

                  <div className="flex flex-col justify-between gap-8 md:flex-row">

                    <div>
                      <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-blue-400">
                          <CodeIcon />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {upcoming.title}
                          </h3>

                          <p className="mt-1 text-sm text-zinc-500">
                            Technical Interview Session
                          </p>
                        </div>

                      </div>

                      <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-400">

                        <InterviewMeta
                          icon={<CalendarIcon />}
                          value={candidateApi.formatDate(upcoming.scheduledAt)}
                        />

                        <InterviewMeta
                          icon={<ClockIcon />}
                          value={candidateApi.formatTime(upcoming.scheduledAt)}
                        />

                        <InterviewMeta
                          icon={<TimerIcon />}
                          value={candidateApi.formatDuration(upcoming.duration)}
                        />

                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-5 md:items-end">

                      <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                        {candidateApi.toInterviewStatusLabel(upcoming.status)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/candidate/interview/${upcoming.id}`)
                        }
                        className="group/btn flex items-center gap-2 rounded-xl bg-blue-400 px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-blue-300 hover:shadow-[0_0_30px_rgba(96,165,250,0.25)]"
                      >
                        View Interview

                        <span className="transition-transform group-hover/btn:translate-x-1">
                          →
                        </span>
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                message="No upcoming interviews scheduled."
                action="Browse interviews"
                onAction={() => navigate('/candidate/interviews')}
              />
            )}

          </div>

          {/* ================= PREPARATION ================= */}

          <div>

            <SectionHeader
              title="Preparation"
              subtitle="Your current progress"
              action="Practice"
              onAction={() => navigate('/candidate/preparation')}
            />

            <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-6 transition hover:border-blue-400/20">

              <div className="flex items-center gap-6">

                {/* Progress Circle */}

                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">

                  <svg
                    className="absolute h-28 w-28 -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#27272a"
                      strokeWidth="7"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="7"
                      strokeDasharray="264"
                      strokeDashoffset={
                        264 -
                        ((preparation?.overallProgress ?? 0) / 100) * 264
                      }
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>

                  <div className="text-center">

                    <span className="block text-xl font-semibold text-white">
                      {preparation?.overallProgress ?? 0}%
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Progress
                    </span>

                  </div>
                </div>

                {/* Topics */}

                <div className="min-w-0 flex-1 space-y-4">

                  {(preparation?.topicScores ?? [])
                    .slice(0, 3)
                    .map((topic) => (
                      <ProgressItem
                        key={topic.topic}
                        label={topic.topic}
                        value={`${topic.score}%`}
                        progress={topic.score}
                      />
                    ))}

                  {(!preparation ||
                    preparation.topicScores?.length === 0) && (
                    <p className="text-xs leading-5 text-zinc-600">
                      Complete an interview to unlock your preparation insights.
                    </p>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            PERFORMANCE
        ====================================================== */}

        <div className="mt-10">

          <SectionHeader
            title="Performance Breakdown"
            subtitle="Your latest interview evaluation"
            action="View detailed results"
            onAction={() => navigate('/candidate/results')}
          />

          {dimensionEntries.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {dimensionEntries.map(([key, score]) => (
                <DimensionCard
                  key={key}
                  title={DIMENSION_LABELS[key] || key}
                  score={`${score}%`}
                  progress={score}
                />
              ))}

              <button
                type="button"
                onClick={() => navigate('/candidate/results')}
                className="group flex min-h-[145px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5 transition-all hover:border-blue-400/40 hover:bg-blue-400/[0.04]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition group-hover:border-blue-400/40 group-hover:text-blue-400">
                  →
                </span>

                <span className="mt-3 text-sm font-medium text-zinc-400 group-hover:text-white">
                  Full Evaluation
                </span>
              </button>

            </div>
          ) : (
            <EmptyState
              message="Complete an interview to unlock your performance insights."
            />
          )}

        </div>

        {/* =====================================================
            BOTTOM SECTION
        ====================================================== */}

        <div className="mt-10 grid gap-6 xl:grid-cols-2">

          {/* ================= FEEDBACK ================= */}

          <div>

            <SectionHeader
              title="Recent Feedback"
              subtitle="Insights from your latest interview"
              action="View all"
              onAction={() => navigate('/candidate/results')}
            />

            {latestResult ? (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-6">

                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
                    <MessageIcon />
                  </div>

                  <div>
                    <p className="text-sm leading-7 text-zinc-400">
                      {latestResult.feedback}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/candidate/results/${latestResult.interviewId}`
                        )
                      }
                      className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-white"
                    >
                      View full feedback

                      <span className="text-blue-400 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              <EmptyState
                message="Feedback will appear after your first completed interview."
              />
            )}

          </div>

          {/* ================= RECOMMENDATION ================= */}

          <div>

            <SectionHeader
              title="Recommended for You"
              subtitle="Your highest priority improvement area"
              action="View preparation"
              onAction={() => navigate('/candidate/preparation')}
            />

            {topRecommendation ? (
              <div className="relative overflow-hidden rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-400/[0.09] via-[#0b0d12] to-[#0b0d12] p-6">

                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-[70px]" />

                <div className="relative">

                  <div className="flex items-start justify-between gap-6">

                    <div>

                      <div className="inline-flex rounded-full bg-blue-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-300">
                        Focus Area
                      </div>

                      <h3 className="mt-4 text-xl font-semibold text-white">
                        {topRecommendation.topic}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        This is the area where focused practice can make
                        the biggest difference.
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-3xl font-semibold text-white">
                        {topRecommendation.score}%
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Current score
                      </p>

                    </div>

                  </div>

                  <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.06]">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 transition-all duration-700"
                      style={{
                        width: `${topRecommendation.score}%`,
                      }}
                    />

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/candidate/preparation')
                    }
                    className="mt-6 rounded-xl bg-blue-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-blue-300"
                  >
                    Start Practice →
                  </button>

                </div>
              </div>
            ) : (
              <EmptyState
                message="Complete an interview to receive a personalized recommendation."
              />
            )}

          </div>
        </div>
      </div>
    </CandidateLayout>
  )
}

/* ============================================================
   LABELS
============================================================ */

const DIMENSION_LABELS = {
  algorithmCorrectness: 'Algorithmic Correctness',
  logicalReasoning: 'Reasoning & Approach',
  conceptCoverage: 'Concept Coverage',
  completeness: 'Completeness',
  dataStructure: 'Data Structures',
  complexity: 'Time & Space Complexity',
  edgeCases: 'Edge Cases',
}

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

function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">

      <div>
        <h2 className="text-base font-semibold text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-zinc-600">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="group whitespace-nowrap text-xs font-medium text-zinc-500 transition hover:text-blue-300"
        >
          {action}

          <span className="ml-1 inline-block text-blue-400 transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      )}

    </div>
  )
}

function EmptyState({
  message,
  action,
  onAction,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-10 text-center">

      <p className="text-sm text-zinc-600">
        {message}
      </p>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          {action} →
        </button>
      )}

    </div>
  )
}

function DimensionCard({
  title,
  score,
  progress,
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-5 transition-all duration-300 hover:border-blue-400/20 hover:bg-[#0e1118]">

      <div className="flex items-start justify-between gap-4">

        <p className="max-w-[150px] text-xs font-medium leading-5 text-zinc-500">
          {title}
        </p>

        <span className="text-sm font-semibold text-blue-300">
          {score}
        </span>

      </div>

      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 transition-all duration-700"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  )
}

function ProgressItem({
  label,
  value,
  progress,
}) {
  return (
    <div>

      <div className="mb-2 flex justify-between gap-3">

        <span className="truncate text-[11px] text-zinc-500">
          {label}
        </span>

        <span className="text-[11px] font-medium text-blue-200">
          {value}
        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  )
}

function InterviewMeta({
  icon,
  value,
}) {
  return (
    <span className="flex items-center gap-2">

      <span className="text-blue-400/70">
        {icon}
      </span>

      {value}

    </span>
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

function BookIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 5a3 3 0 0 1 3-3h13v18H7a3 3 0 0 0-3 3V5Z" />
      <path d="M7 20h13" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m14 5-4 14" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function TimerIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="13" r="8" />
      <path d="M12 5V2M9 2h6" />
      <path d="m12 9 3 4" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 11.5a8 8 0 0 1-8 8 8.6 8.6 0 0 1-3.4-.7L4 20l1.2-3.7A8 8 0 1 1 20 11.5Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  )
}

export default CandidateDashboard