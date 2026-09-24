import { useEffect, useState } from 'react'
import { getRecruiterInterviewById } from '../../../api/interview.api.js'

function InterviewDetails({ interviewId, onClose }) {
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!interviewId) return

    const fetchInterview = async () => {
      try {
        setLoading(true)
        setError(null)

        const data =
          await getRecruiterInterviewById(interviewId)

        setInterview(data)
      } catch (error) {
        console.error('Fetch interview error:', error)

        setError(
          error.message ||
          'Failed to fetch interview',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchInterview()
  }, [interviewId])


  const handleCopy = async () => {
    if (!interview) return

    const interviewLink =
      `${window.location.origin}/candidate/interviews/${interview.id}`

    try {
      await navigator.clipboard.writeText(interviewLink)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70">

        <div className="flex h-full w-full max-w-xl flex-col border-l border-zinc-800 bg-[#0d0d0d] shadow-2xl">

          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

            <div className="flex items-center gap-4">

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
              >
                <BackIcon />
              </button>

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Interview Details
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Loading information
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center border border-zinc-800 text-zinc-500 transition hover:border-zinc-600 hover:text-white"
            >
              <CloseIcon />
            </button>

          </div>


          <div className="flex flex-1 items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-8 w-8 animate-spin border-2 border-zinc-700 border-t-white" />

              <p className="mt-4 text-xs text-zinc-500">
                Loading interview details...
              </p>

            </div>

          </div>

        </div>

      </div>
    )
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70">

        <div className="flex h-full w-full max-w-xl flex-col border-l border-zinc-800 bg-[#0d0d0d]">

          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Interview Details
              </p>

              <h2 className="mt-1 text-sm font-semibold text-white">
                Unable to load interview
              </h2>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center border border-zinc-800 text-zinc-500 transition hover:border-zinc-600 hover:text-white"
            >
              <CloseIcon />
            </button>

          </div>


          <div className="flex flex-1 items-center justify-center px-8">

            <div className="max-w-sm text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-zinc-700 text-zinc-400">
                <ErrorIcon />
              </div>

              <p className="mt-5 text-sm font-semibold text-white">
                Failed to load interview
              </p>

              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                {error}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 border border-zinc-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
              >
                Go Back
              </button>

            </div>

          </div>

        </div>

      </div>
    )
  }


  if (!interview) return null


  // ============================================================
  // FORMAT DATA
  // ============================================================

  const scheduledDate = new Date(interview.scheduledAt)

  const date =
    scheduledDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )

  const time =
    scheduledDate.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    )


  const statusMap = {
    SCHEDULED: 'Upcoming',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
  }


  const displayStatus =
    statusMap[interview.status] ||
    interview.status


  const isUpcoming =
    interview.status === 'SCHEDULED'

  const isProgress =
    interview.status === 'IN_PROGRESS'

  const isCompleted =
    interview.status === 'COMPLETED'


  const candidate = interview.candidate


  const candidateName = candidate
    ? `${candidate.firstName} ${candidate.lastName}`
    : 'Candidate'


  const initials = candidate
    ? `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`.toUpperCase()
    : 'C'


  const score =
    interview.evaluation?.overallScore ?? null


  const interviewLink =
    `${window.location.origin}/candidate/interviews/${interview.id}`


  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70"
      onClick={onClose}
    >

      <div
        className="flex h-full w-full max-w-xl flex-col border-l border-zinc-800 bg-[#0d0d0d] shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >


        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-5">

          <div className="flex min-w-0 items-center gap-4">

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
            >
              <BackIcon />
            </button>


            <div className="min-w-0">

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Interview Details
              </p>

              <h2 className="mt-1 truncate text-base font-semibold text-white">
                {interview.title}
              </h2>

              <p className="mt-1 truncate font-mono text-[10px] text-zinc-600">
                {interview.id}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-800 text-zinc-500 transition hover:border-zinc-600 hover:text-white"
          >
            <CloseIcon />
          </button>

        </div>


        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="dark-scrollbar min-h-0 flex-1 overflow-y-auto">


          {/* Candidate */}

          <section className="border-b border-zinc-800 px-6 py-6">

            <SectionLabel>
              Candidate
            </SectionLabel>


            <div className="mt-5 flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-zinc-700 bg-zinc-900 text-sm font-semibold text-white">
                {initials}
              </div>


              <div className="min-w-0">

                <h3 className="truncate text-sm font-semibold text-zinc-100">
                  {candidateName}
                </h3>

                <p className="mt-1 truncate text-xs text-zinc-500">
                  {candidate?.email ||
                    'No email available'}
                </p>

                <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-400">
                  {interview.type ||
                    'Technical Interview'}
                </p>

              </div>

            </div>

          </section>


          {/* Status */}

          <section className="border-b border-zinc-800 px-6 py-6">

            <SectionLabel>
              Interview Status
            </SectionLabel>


            <div className="mt-4 flex items-center gap-3">

              <span className="h-2 w-2 bg-white" />

              <span className="text-sm font-medium text-zinc-200">
                {displayStatus}
              </span>

            </div>

          </section>


          {/* Schedule */}

          <section className="border-b border-zinc-800 px-6 py-6">

            <SectionLabel>
              Schedule
            </SectionLabel>


            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-6">

              <Info
                label="Date"
                value={date}
              />

              <Info
                label="Time"
                value={time}
              />

              <Info
                label="Duration"
                value={`${interview.duration} minutes`}
              />

              <Info
                label="Company"
                value={
                  interview.company ||
                  'Not specified'
                }
              />

            </div>

          </section>


          {/* Focus Areas */}

          {interview.focusAreas?.length > 0 && (

            <section className="border-b border-zinc-800 px-6 py-6">

              <SectionLabel>
                Focus Areas
              </SectionLabel>


              <div className="mt-4 flex flex-wrap gap-2">

                {interview.focusAreas.map(
                  (area) => (

                    <span
                      key={area}
                      className="border border-zinc-700 px-3 py-1.5 text-[10px] font-medium text-zinc-300"
                    >
                      {area}
                    </span>

                  ),
                )}

              </div>

            </section>

          )}


          {/* Questions */}

          {interview.questions?.length > 0 && (

            <section className="border-b border-zinc-800 px-6 py-6">

              <div className="flex items-center justify-between">

                <SectionLabel>
                  Questions
                </SectionLabel>

                <span className="text-[10px] text-zinc-500">
                  {interview.questions.length} assigned
                </span>

              </div>


              <div className="mt-5 space-y-2">

                {interview.questions.map(
                  (item, index) => (

                    <div
                      key={item.id}
                      className="flex items-center gap-4 border border-zinc-800 bg-[#111111] px-4 py-4"
                    >

                      <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-700 font-mono text-[10px] text-zinc-400">
                        {String(index + 1).padStart(
                          2,
                          '0',
                        )}
                      </span>


                      <div className="min-w-0">

                        <p className="truncate text-xs font-medium text-zinc-200">
                          {item.question?.title ||
                            'Question'}
                        </p>

                        <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-500">
                          {item.question?.difficulty}
                        </p>

                      </div>

                    </div>

                  ),
                )}

              </div>

            </section>

          )}


          {/* AI Evaluation */}

          {isCompleted && (

            <section className="border-b border-zinc-800 px-6 py-6">

              <SectionLabel>
                AI Evaluation
              </SectionLabel>


              <div className="mt-5 flex items-end gap-3">

                <span className="font-mono text-5xl font-semibold tracking-tight text-white">
                  {score ?? '—'}
                </span>

                <span className="mb-2 text-sm text-zinc-600">
                  / 100
                </span>

              </div>


              <div className="mt-5 h-px w-full bg-zinc-800">

                {score !== null && (

                  <div
                    className="h-full bg-white"
                    style={{
                      width: `${score}%`,
                    }}
                  />

                )}

              </div>


              <p className="mt-3 text-xs text-zinc-500">
                Overall candidate performance
              </p>

            </section>

          )}


          {/* Candidate Link */}

          {isUpcoming && (

            <section className="px-6 py-6">

              <SectionLabel>
                Candidate Interview Link
              </SectionLabel>


              <div className="mt-4 flex border border-zinc-700">

                <input
                  readOnly
                  value={interviewLink}
                  className="min-w-0 flex-1 bg-[#111111] px-4 py-3 font-mono text-[10px] text-zinc-500 outline-none"
                />


                <button
                  type="button"
                  onClick={handleCopy}
                  className="border-l border-zinc-700 px-5 text-[10px] font-semibold uppercase tracking-wider text-white transition hover:bg-zinc-800"
                >
                  {copied
                    ? 'Copied'
                    : 'Copy'}
                </button>

              </div>

            </section>

          )}

        </div>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="flex shrink-0 gap-3 border-t border-zinc-800 bg-[#111111] px-6 py-5">

          {isCompleted && (

            <button
              type="button"
              className="flex-1 bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200"
            >
              View Evaluation
            </button>

          )}


          {isUpcoming && (

            <>
              <button
                type="button"
                className="flex-1 border border-zinc-700 px-4 py-3 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                Reschedule
              </button>

              <button
                type="button"
                className="flex-1 bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200"
              >
                Send Reminder
              </button>
            </>

          )}


          {isProgress && (

            <button
              type="button"
              className="flex-1 bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200"
            >
              Open Interview
            </button>

          )}


          {!isCompleted &&
            !isUpcoming &&
            !isProgress && (

              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-zinc-700 px-4 py-3 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                Close
              </button>

            )}

        </div>

      </div>

    </div>
  )
}


function SectionLabel({ children }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
      {children}
    </p>
  )
}


function Info({ label, value }) {
  return (
    <div>

      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 break-all text-xs font-medium text-zinc-300">
        {value}
      </p>

    </div>
  )
}


function BackIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  )
}


function CloseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}


function ErrorIcon() {
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


export default InterviewDetails