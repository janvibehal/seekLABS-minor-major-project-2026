import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CandidateLayout from '../../components/layout/CandidateLayout'
import * as candidateApi from '../../api/candidate.api.js'

function CandidateInterviews() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    let cancelled = false

    candidateApi
      .listInterviews()
      .then((data) => {
        if (cancelled) return

        const mappedInterviews = data.map((interview) => {
          const status = candidateApi.toInterviewStatusLabel(interview.status)

          // Completed interviews should be ordered by when the candidate
          // actually took the interview. Prefer endedAt, then startedAt,
          // and finally fall back to the scheduled time.
          const activityAt =
            status === 'Completed'
              ? interview.endedAt || interview.startedAt || interview.scheduledAt
              : interview.scheduledAt

          return {
            id: interview.id,
            title: interview.title,
            type: interview.type,
            company: interview.company,
            scheduledAt: interview.scheduledAt,
            startedAt: interview.startedAt,
            endedAt: interview.endedAt,
            activityAt,
            date: candidateApi.formatDate(activityAt),
            time: candidateApi.formatTime(activityAt),
            duration: candidateApi.formatDuration(interview.duration),
            status,
            score: interview.score,
            topics: interview.topics || [],
          }
        })

        // Ordering:
        // 1. Upcoming interviews are ALWAYS first.
        //    Soonest scheduled interview comes first.
        // 2. Completed interviews come next.
        //    Most recently TAKEN interview comes first.
        // 3. Expired interviews come last.
        //    Most recently scheduled interview comes first.
        const sortedInterviews = [...mappedInterviews].sort((a, b) => {
          const aUpcoming = a.status === 'Upcoming'
          const bUpcoming = b.status === 'Upcoming'

          if (aUpcoming && !bUpcoming) return -1
          if (!aUpcoming && bUpcoming) return 1

          const aTime = new Date(a.activityAt).getTime()
          const bTime = new Date(b.activityAt).getTime()

          if (aUpcoming && bUpcoming) {
            return aTime - bTime
          }

          return bTime - aTime
        })

        setInterviews(sortedInterviews)
      })
      .catch(
        (err) =>
          !cancelled &&
          setError(err.message || 'Unable to load interviews.'),
      )
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  // Keep the UI availability in sync when a candidate leaves this page
  // open until the scheduled start time.
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])


  /* =====================================================
     DATA
  ====================================================== */

  const tabs = ['All', 'Upcoming', 'Completed', 'Expired']

  const filteredInterviews =
    activeTab === 'All'
      ? interviews
      : interviews.filter((interview) => interview.status === activeTab)

  const upcomingCount = interviews.filter(
    (interview) => interview.status === 'Upcoming',
  ).length

  const completedCount = interviews.filter(
    (interview) => interview.status === 'Completed',
  ).length

  const expiredCount = interviews.filter(
    (interview) => interview.status === 'Expired',
  ).length


  return (
    <CandidateLayout>

      <div className="min-h-full text-white">


        {/* =====================================================
            PAGE HERO
        ====================================================== */}

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#10151d] via-[#0b0d11] to-[#07090d] p-7 sm:p-9">

          {/* Ambient blue glow */}

          <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-blue-400/[0.07] blur-[100px]" />

          <div className="pointer-events-none absolute bottom-0 left-[20%] h-40 w-80 rounded-full bg-blue-500/[0.035] blur-[90px]" />


          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">


            {/* Left */}

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3 py-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />

                <span className="text-xs font-medium text-blue-300">
                  Interview Workspace
                </span>

              </div>


              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                My Interviews
              </h1>


              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                Manage your interview sessions, track progress, and review
                your completed evaluations.
              </p>

            </div>


            {/* CTA */}

            <button
              type="button"
              onClick={() => navigate('/candidate/preparation')}
              className="group flex w-fit items-center gap-2 rounded-xl bg-blue-400 px-5 py-3 text-sm font-semibold text-[#071018] transition-all duration-300 hover:bg-blue-300 hover:shadow-[0_0_30px_rgba(96,165,250,0.25)]"
            >

              Prepare Now

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>

            </button>

          </div>

        </div>


        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <AlertIcon />
            </div>

            <div>

              <p className="text-sm font-medium text-red-300">
                Unable to load interviews
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="flex min-h-[55vh] items-center justify-center">

            <div className="flex flex-col items-center gap-4">

              <div className="relative h-12 w-12">

                <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/[0.08] border-t-blue-400" />

                <div className="absolute inset-3 rounded-full bg-blue-400/10 blur-md" />

              </div>

              <p className="text-sm text-zinc-600">
                Loading your interviews...
              </p>

            </div>

          </div>

        ) : (

          <>


            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}

            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <SummaryCard
                label="Total Interviews"
                value={interviews.length}
                description="All assigned interviews"
                icon={<GridIcon />}
                accent="blue"
              />

              <SummaryCard
                label="Upcoming"
                value={upcomingCount}
                description="Waiting for you"
                icon={<CalendarIcon />}
                accent="cyan"
              />

              <SummaryCard
                label="Completed"
                value={completedCount}
                description="Successfully finished"
                icon={<CheckIcon />}
                accent="green"
              />

              <SummaryCard
                label="Expired"
                value={expiredCount}
                description="No longer available"
                icon={<ClockIcon />}
                accent="zinc"
              />

            </div>


            {/* =====================================================
                INTERVIEW AREA
            ====================================================== */}

            <div className="rounded-3xl border border-white/[0.06] bg-[#0b0d11]">


              {/* =====================================================
                  TABS
              ====================================================== */}

              <div className="flex flex-col justify-between gap-5 border-b border-white/[0.06] px-5 pt-5 sm:px-7 sm:pt-6 md:flex-row md:items-center">


                <div>

                  <h2 className="text-base font-semibold text-white">
                    Interview Sessions
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Browse and manage your interview activity
                  </p>

                </div>


                <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.025] p-1">

                  {tabs.map((tab) => {

                    const count =
                      tab === 'All'
                        ? interviews.length
                        : interviews.filter(
                            (interview) => interview.status === tab,
                          ).length

                    const isActive = activeTab === tab

                    return (

                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-400 text-[#061018] shadow-sm'
                            : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200'
                        }`}
                      >

                        {tab}

                        <span
                          className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] ${
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


              {/* =====================================================
                  LIST
              ====================================================== */}

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


                {/* =====================================================
                    EMPTY STATE
                ====================================================== */}

                {filteredInterviews.length === 0 && (

                  <div className="px-6 py-20 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-400/[0.06] text-blue-400">

                      <CalendarIcon />

                    </div>

                    <h3 className="mt-5 text-sm font-semibold text-zinc-300">
                      No interviews found
                    </h3>

                    <p className="mt-2 text-sm text-zinc-600">
                      There are currently no interviews in this category.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </>

        )}

      </div>

    </CandidateLayout>
  )
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  label,
  value,
  description,
  icon,
  accent = 'blue',
}) {

  const accentStyles = {

    blue:
      'border-blue-400/15 bg-blue-400/[0.07] text-blue-400',

    cyan:
      'border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-400',

    green:
      'border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400',

    zinc:
      'border-white/[0.08] bg-white/[0.04] text-zinc-500',

  }


  return (

    <div className="group rounded-2xl border border-white/[0.06] bg-[#0b0d11] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.11] hover:bg-[#0e1116]">


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
   INTERVIEW LIST ITEM
============================================================ */

function InterviewListItem({ interview, currentTime, onOpen }) {
  const scheduledTime = new Date(interview.scheduledAt).getTime()
  const canStart = scheduledTime <= currentTime

  const isUpcoming = interview.status === 'Upcoming'
  const isCompleted = interview.status === 'Completed'
  const isExpired = interview.status === 'Expired'


  return (

    <div className="group px-5 py-6 transition-all duration-300 hover:bg-white/[0.02] sm:px-7">


      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">


        {/* =====================================================
            LEFT
        ====================================================== */}

        <div className="flex min-w-0 flex-1 items-start gap-4">


          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition ${
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


            <div className="flex flex-wrap items-center gap-2.5">


              <h3 className="truncate text-sm font-semibold text-zinc-200 transition group-hover:text-white">
                {interview.title}
              </h3>


              <StatusBadge status={interview.status} />

            </div>


            <p className="mt-1.5 text-xs text-zinc-600">

              {interview.type}

              {interview.company
                ? ` · ${interview.company}`
                : ''}

            </p>


            {/* Topics */}

            {interview.topics?.length > 0 && (

              <div className="mt-4 flex flex-wrap gap-2">

                {interview.topics.slice(0, 5).map((topic) => (

                  <span
                    key={topic}
                    className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[10px] font-medium text-zinc-500"
                  >
                    {topic}
                  </span>

                ))}


                {interview.topics.length > 5 && (

                  <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[10px] text-zinc-600">

                    +{interview.topics.length - 5}

                  </span>

                )}

              </div>

            )}

          </div>

        </div>


        {/* =====================================================
            META INFORMATION
        ====================================================== */}

        <div className="flex shrink-0 flex-wrap gap-x-7 gap-y-4 xl:justify-end">


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


        {/* =====================================================
            ACTION
        ====================================================== */}

        <div className="flex shrink-0 items-center gap-4 xl:min-w-[150px] xl:justify-end">


          {isCompleted && (

            <div className="hidden text-right sm:block">

              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600">
                Score
              </p>

              <p className="mt-1 text-xl font-semibold text-blue-400">
                {interview.score ?? 0}%
              </p>

            </div>

          )}


          {isUpcoming && (

            <button
              type="button"
              onClick={canStart ? onOpen : undefined}
              disabled={!canStart}
              aria-disabled={!canStart}
              title={
                canStart
                  ? 'Open Interview'
                  : `Available at ${candidateApi.formatTime(interview.scheduledAt)}`
              }
              className={`group/btn flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                canStart
                  ? 'bg-blue-400 text-[#061018] hover:bg-blue-300 hover:shadow-[0_0_25px_rgba(96,165,250,0.2)]'
                  : 'cursor-not-allowed border border-white/[0.08] bg-white/[0.04] text-zinc-600'
              }`}
            >

              {canStart
                ? 'Open Interview'
                : `Available at ${candidateApi.formatTime(interview.scheduledAt)}`}

              {canStart && (
                <span className="transition-transform group-hover/btn:translate-x-1">
                  →
                </span>
              )}

            </button>

          )}


          {isCompleted && (

            <button
              type="button"
              onClick={onOpen}
              className="group/btn flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-zinc-400 transition-all hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-blue-300"
            >

              Results

              <span className="text-blue-400 transition-transform group-hover/btn:translate-x-1">
                →
              </span>

            </button>

          )}


          {isExpired && (

            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-zinc-600">

              Expired

            </div>

          )}

        </div>

      </div>

    </div>

  )
}


/* ============================================================
   INTERVIEW META
============================================================ */

function InterviewMeta({ label, value, icon }) {

  return (

    <div className="min-w-[80px]">


      <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600">

        <span className="text-zinc-600">
          {icon}
        </span>

        {label}

      </div>


      <p className="mt-2 whitespace-nowrap text-xs font-medium text-zinc-400">

        {value}

      </p>

    </div>

  )
}


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {

  const styles = {

    Upcoming:
      'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',

    Completed:
      'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300',

    Expired:
      'border-white/[0.06] bg-white/[0.03] text-zinc-500',

  }


  return (

    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
        styles[status] || styles.Expired
      }`}
    >

      {status}

    </span>

  )
}


/* ============================================================
   ICONS
============================================================ */

function GridIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
}


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
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 12 4 4L19 6" />
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


function AlertIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  )
}


export default CandidateInterviews