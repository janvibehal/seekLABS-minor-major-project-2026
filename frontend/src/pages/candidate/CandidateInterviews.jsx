
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as candidateApi from '../../api/candidate.api.js'

function CandidateInterviews() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [interviews, setInterviews] = useState([])
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    let cancelled = false

    candidateApi
      .listInterviews()
      .then((data) => {
        if (cancelled) return

        const mapped = data.map((interview) => {
          const status = candidateApi.toInterviewStatusLabel(interview.status)

          const activityAt =
            status === 'Completed'
              ? interview.endedAt ||
                interview.startedAt ||
                interview.scheduledAt
              : interview.scheduledAt

          return {
            id: interview.id,
            title: interview.title,
            type: interview.type,
            company: interview.company,
            scheduledAt: interview.scheduledAt,
            activityAt,
            date: candidateApi.formatDate(activityAt),
            time: candidateApi.formatTime(activityAt),
            duration: candidateApi.formatDuration(interview.duration),
            status,
            score: interview.score,
            topics: interview.topics || [],
          }
        })

        mapped.sort((a, b) => {
          const aUpcoming = a.status === 'Upcoming'
          const bUpcoming = b.status === 'Upcoming'

          if (aUpcoming && !bUpcoming) return -1
          if (!aUpcoming && bUpcoming) return 1

          const aTime = new Date(a.activityAt).getTime()
          const bTime = new Date(b.activityAt).getTime()

          return aUpcoming ? aTime - bTime : bTime - aTime
        })

        setInterviews(mapped)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Unable to load interviews.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const tabs = ['All', 'Upcoming', 'Completed', 'Expired']

  const filteredInterviews =
    activeTab === 'All'
      ? interviews
      : interviews.filter((item) => item.status === activeTab)

  const countByStatus = (status) =>
    interviews.filter((item) => item.status === status).length

  return (
    <div className="min-h-full text-white">
      {/* PAGE HERO */}
<section className="relative mb-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#10151d] via-[#0b0d11] to-[#07090d] px-5 py-5 sm:px-6 sm:py-6">
  <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-blue-400/[0.07] blur-[90px]" />
  <div className="pointer-events-none absolute bottom-0 left-[20%] h-32 w-64 rounded-full bg-blue-500/[0.035] blur-[80px]" />

  <div className="relative">
    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
      Your Interviews
    </h1>

    <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
      All your interview sessions in one place. Check upcoming interviews,
      pick up where you left off, and revisit your results whenever you need.
    </p>
  </div>
</section>

      {/* ERROR */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <AlertIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-red-300">
              Unable to load interviews
            </p>
            <p className="mt-1 text-sm text-zinc-500">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/[0.08] border-t-blue-400" />
            </div>
            <p className="text-sm text-zinc-500">
              Loading your interviews...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Interviews"
              value={interviews.length}
              description="All assigned interviews"
              icon={<GridIcon />}
              accent="blue"
            />
            <SummaryCard
              label="Upcoming"
              value={countByStatus('Upcoming')}
              description="Waiting for you"
              icon={<CalendarIcon />}
              accent="cyan"
            />
            <SummaryCard
              label="Completed"
              value={countByStatus('Completed')}
              description="Successfully finished"
              icon={<CheckIcon />}
              accent="green"
            />
            <SummaryCard
              label="Expired"
              value={countByStatus('Expired')}
              description="No longer available"
              icon={<ClockIcon />}
              accent="zinc"
            />
          </div>

          {/* INTERVIEW LIST */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b0d11]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] px-4 py-4 sm:px-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Interview Sessions
                </h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Browse and manage your interview activity
                </p>
              </div>

              <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.025] p-1">
                {tabs.map((tab) => {
                  const count =
                    tab === 'All'
                      ? interviews.length
                      : countByStatus(tab)

                  const isActive = activeTab === tab

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${
                        isActive
                          ? 'bg-blue-400 text-[#061018]'
                          : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200'
                      }`}
                    >
                      {tab}
                      <span
                        className={`flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] ${
                          isActive
                            ? 'bg-black/10 text-[#061018]'
                            : 'bg-white/[0.05] text-zinc-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {filteredInterviews.map((interview) => (
                <InterviewListItem
                  key={interview.id}
                  interview={interview}
                  currentTime={currentTime}
                  onOpen={() => {
                    if (interview.status === 'Upcoming') {
                      navigate(`/candidate/interview/${interview.id}`)
                    }

                    if (interview.status === 'Completed') {
                      navigate(`/candidate/results/${interview.id}`)
                    }
                  }}
                />
              ))}

              {filteredInterviews.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/[0.06] text-blue-400">
                    <CalendarIcon />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-300">
                    No interviews found
                  </h3>
                  <p className="mt-1.5 text-sm text-zinc-600">
                    There are currently no interviews in this category.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, description, icon, accent = 'blue' }) {
  const accentStyles = {
    blue: 'border-blue-400/15 bg-blue-400/[0.07] text-blue-400',
    cyan: 'border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-400',
    green: 'border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400',
    zinc: 'border-white/[0.08] bg-white/[0.04] text-zinc-500',
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0b0d11] p-4 transition hover:border-white/[0.11] hover:bg-[#0e1116]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-600">{description}</p>
    </div>
  )
}

function InterviewListItem({ interview, currentTime, onOpen }) {
  const scheduledTime = new Date(interview.scheduledAt).getTime()
  const canStart = scheduledTime <= currentTime

  const isUpcoming = interview.status === 'Upcoming'
  const isCompleted = interview.status === 'Completed'
  const isExpired = interview.status === 'Expired'

  return (
    <div className="group px-4 py-4 transition hover:bg-white/[0.02] sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
              isUpcoming
                ? 'border-blue-400/15 bg-blue-400/[0.08] text-blue-400'
                : isCompleted
                  ? 'border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400'
                  : 'border-white/[0.06] bg-white/[0.03] text-zinc-600'
            }`}
          >
            <CodeIcon />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-zinc-200 transition group-hover:text-white">
                {interview.title}
              </h3>
              <StatusBadge status={interview.status} />
            </div>

            <p className="mt-1 text-xs text-zinc-600">
              {interview.type}
              {interview.company ? ` · ${interview.company}` : ''}
            </p>

            {interview.topics?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {interview.topics.slice(0, 5).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] font-medium text-zinc-500"
                  >
                    {topic}
                  </span>
                ))}
                {interview.topics.length > 5 && (
                  <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] text-zinc-600">
                    +{interview.topics.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 xl:justify-end">
          <InterviewMeta
            label="Date"
            value={interview.date}
            icon={<CalendarIcon />}
          />
          <InterviewMeta
            label="Time"
            value={interview.time}
            icon={<ClockIcon />}
          />
          <InterviewMeta
            label="Duration"
            value={interview.duration}
            icon={<TimerIcon />}
          />
        </div>

        <div className="flex shrink-0 items-center gap-3 xl:min-w-[140px] xl:justify-end">
  {isUpcoming && (
    <button
      type="button"
      onClick={canStart ? onOpen : undefined}
      disabled={!canStart}
      title={
        canStart
          ? 'Open Interview'
          : `Available at ${candidateApi.formatTime(interview.scheduledAt)}`
      }
      className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
        canStart
          ? 'bg-blue-400 text-[#061018] hover:bg-blue-300'
          : 'cursor-not-allowed border border-white/[0.08] bg-white/[0.04] text-zinc-600'
      }`}
    >
      {canStart
        ? 'Open Interview'
        : `Available at ${candidateApi.formatTime(interview.scheduledAt)}`}
      {canStart && <span>→</span>}
    </button>
  )}

  {isCompleted && (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-blue-300"
    >
      Results <span className="text-blue-400">→</span>
    </button>
  )}

  {isExpired && (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-600">
      Expired
    </div>
  )}
</div>
      </div>
    </div>
  )
}

function InterviewMeta({ label, value, icon }) {
  return (
    <div className="min-w-[75px]">
      <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-zinc-600">
        <span>{icon}</span>
        {label}
      </div>
      <p className="mt-1.5 whitespace-nowrap text-xs font-medium text-zinc-400">
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    Upcoming: 'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
    Completed: 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300',
    Expired: 'border-white/[0.06] bg-white/[0.03] text-zinc-500',
  }

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        styles[status] || styles.Expired
      }`}
    >
      {status}
    </span>
  )
}

function GridIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M7 2v4M17 2v4M3 10h18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function TimerIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 5V2M9 2h6" />
      <path d="m12 9 3 4" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m14 5-4 14" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  )
}

export default CandidateInterviews
