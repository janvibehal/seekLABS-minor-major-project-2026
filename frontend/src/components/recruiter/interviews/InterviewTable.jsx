import { useEffect, useState } from 'react'

import InterviewRow from './InterviewRow'
import { getRecruiterInterviews } from '../../../api/interview.api.js'


function InterviewTable({ onInterviewSelect }) {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  // ============================================================
  // FETCH INTERVIEWS
  // ============================================================

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true)
        setError(null)

        const response =
          await getRecruiterInterviews()

        // Supports either:
        // response = []
        // OR response = { interviews: [] }

        const interviewList =
          Array.isArray(response)
            ? response
            : response?.interviews || []


        const formattedInterviews =
          interviewList.map((interview) => {
            const candidate = interview.candidate


            // ==================================================
            // CANDIDATE NAME
            // ==================================================

            const candidateName =
              candidate?.name ||
              (
                candidate
                  ? `${candidate.firstName || ''} ${
                      candidate.lastName || ''
                    }`.trim()
                  : 'Candidate'
              )


            // ==================================================
            // INITIALS
            // ==================================================

            const initials =
              candidate
                ? candidate.initials ||
                  `${candidate.firstName?.[0] || ''}${
                    candidate.lastName?.[0] || ''
                  }`.toUpperCase()
                : 'C'


            // ==================================================
            // RETURN NORMALIZED DATA
            // ==================================================

            return {
              ...interview,

              candidate: {
                ...candidate,

                name:
                  candidateName || 'Unknown Candidate',

                initials,

                email:
                  candidate?.email ||
                  'No email available',
              },

              score:
                interview.score ??
                interview.evaluation?.overallScore ??
                null,
            }
          })


        setInterviews(formattedInterviews)

      } catch (error) {
        console.error(
          'Fetch interviews error:',
          error,
        )

        setError(
          error.message ||
          'Failed to load interviews',
        )

      } finally {
        setLoading(false)
      }
    }


    fetchInterviews()
  }, [])


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="border border-white/[0.08] bg-[#0d0d0d]">

        <div className="flex min-h-[320px] flex-col items-center justify-center">

          <div className="h-8 w-8 animate-spin border-2 border-white/10 border-t-zinc-300" />

          <p className="mt-5 text-xs text-zinc-500">
            Loading interviews...
          </p>

        </div>

      </div>
    )
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="border border-white/[0.08] bg-[#0d0d0d]">

        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">


          {/* Error Icon */}

          <div className="flex h-12 w-12 items-center justify-center border border-red-500/20 bg-red-500/[0.06] text-red-400">

            <ErrorIcon />

          </div>


          <p className="mt-5 text-sm font-semibold text-zinc-200">
            Failed to load interviews
          </p>


          <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
            {error}
          </p>


          <button
            type="button"
            onClick={() => window.location.reload()}
            className="
              mt-6
              border
              border-white/10
              bg-white/[0.03]
              px-4
              py-2
              text-[10px]
              font-semibold
              text-zinc-300
              transition
              hover:bg-white/[0.07]
              hover:text-white
            "
          >
            Try Again
          </button>

        </div>

      </div>
    )
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="overflow-hidden border border-white/[0.08] bg-[#0d0d0d]">


      {/* ======================================================
          TABLE HEADER
      ====================================================== */}

      <div
        className="
          hidden
          grid-cols-[1.5fr_1.2fr_1.2fr_1fr_0.7fr_0.9fr_40px]
          border-b
          border-white/[0.08]
          bg-[#121212]
          px-5
          py-3.5
          lg:grid
        "
      >

        <Heading>
          Candidate
        </Heading>

        <Heading>
          Interview
        </Heading>

        <Heading>
          Details
        </Heading>

        <Heading>
          Schedule
        </Heading>

        <Heading>
          Score
        </Heading>

        <Heading>
          Status
        </Heading>

        <span />

      </div>


      {/* ======================================================
          TABLE ROWS
      ====================================================== */}

      {interviews.length > 0 ? (

        <div>

          {interviews.map((interview) => (

            <InterviewRow
              key={interview.id}
              interview={interview}
              onClick={() =>
                onInterviewSelect?.(interview.id)
              }
            />

          ))}

        </div>

      ) : (

        <EmptyState />

      )}

    </div>
  )
}


/* ============================================================
   TABLE HEADING
============================================================ */

function Heading({ children }) {
  return (
    <span
      className="
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.16em]
        text-zinc-600
      "
    >
      {children}
    </span>
  )
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">


      {/* Icon */}

      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          border
          border-white/[0.08]
          bg-[#151515]
          text-zinc-500
        "
      >
        <InterviewIcon />
      </div>


      <h3 className="mt-6 text-sm font-semibold text-zinc-300">
        No interviews found
      </h3>


      <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-600">
        You haven't created any interviews yet.
        Create an interview to start evaluating candidates.
      </p>

    </div>
  )
}


/* ============================================================
   INTERVIEW ICON
============================================================ */

function InterviewIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
      />

      <path d="M7 2v4M17 2v4M3 10h18" />

      <path d="M8 14h2M14 14h2M8 18h2" />
    </svg>
  )
}


/* ============================================================
   ERROR ICON
============================================================ */

function ErrorIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 8v5" />

      <path d="M12 16h.01" />
    </svg>
  )
}


export default InterviewTable