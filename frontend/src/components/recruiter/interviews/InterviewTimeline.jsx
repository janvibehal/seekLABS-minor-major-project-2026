import { useEffect, useState } from 'react'
import InterviewRow from './InterviewRow'
import CreateInterviewModal from './CreateInterviewModal'
import { getRecruiterInterviews } from '../../../api/interview.api.js'

function InterviewTable({ onInterviewSelect, onCreateInterview }) {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  // ============================================================
  // OPEN CREATE INTERVIEW MODAL
  // ============================================================

  const handleCreateInterview = () => {
    setIsCreateModalOpen(true)

    onCreateInterview?.()
  }

  // ============================================================
  // FETCH INTERVIEWS
  // ============================================================

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getRecruiterInterviews()

        setInterviews(data || [])
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
  }, [refreshKey])

  return (
    <div className="w-full">

      {/* =====================================================
          TOP SECTION
      ===================================================== */}

      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Recruitment Management
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
            Interviews
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Manage and monitor candidate interviews
          </p>

        </div>


        {/* CREATE BUTTON */}

        <button
          type="button"
          onClick={handleCreateInterview}
          className="
            flex items-center gap-2
            border border-white/20
            bg-white
            px-4 py-2.5
            text-xs font-semibold
            text-black
            transition
            hover:bg-zinc-200
            active:bg-zinc-300
          "
        >
          <PlusIcon />

          Create Interview
        </button>

      </div>


      {/* =====================================================
          TABLE CONTAINER
      ===================================================== */}

      <div className="border border-white/10 bg-[#111111]">

        {/* ===================================================
            TABLE HEADER
        =================================================== */}

        <div
          className="
            hidden
            grid-cols-[1.6fr_1.4fr_1fr_0.9fr_0.7fr_40px]
            border-b border-white/10
            bg-[#171717]
            px-5 py-3.5
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


        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (

          <div className="flex min-h-[320px] items-center justify-center">

            <div className="text-center">

              <div
                className="
                  mx-auto
                  h-8 w-8
                  animate-spin
                  border-2 border-zinc-700
                  border-t-white
                "
              />

              <p className="mt-4 text-xs text-zinc-500">
                Loading interviews...
              </p>

            </div>

          </div>

        )}


        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (

          <div className="flex min-h-[320px] items-center justify-center px-6">

            <div className="max-w-sm text-center">

              <div
                className="
                  mx-auto
                  flex h-12 w-12
                  items-center justify-center
                  border border-red-500/30
                  text-red-400
                "
              >
                <ErrorIcon />
              </div>


              <p className="mt-5 text-sm font-semibold text-zinc-200">
                Failed to load interviews
              </p>


              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                {error}
              </p>


              <button
                type="button"
                onClick={() =>
                  setRefreshKey(
                    (key) => key + 1,
                  )
                }
                className="
                  mt-5
                  border border-white/15
                  px-4 py-2
                  text-xs font-medium
                  text-zinc-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Try Again
              </button>

            </div>

          </div>

        )}


        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {!loading &&
          !error &&
          interviews.length === 0 && (

            <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">

              <div
                className="
                  flex h-14 w-14
                  items-center justify-center
                  border border-white/10
                  bg-[#171717]
                  text-zinc-500
                "
              >
                <EmptyIcon />
              </div>


              <p className="mt-5 text-sm font-semibold text-zinc-200">
                No interviews yet
              </p>


              <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
                Create your first interview to begin
                evaluating candidates.
              </p>


              <button
                type="button"
                onClick={handleCreateInterview}
                className="
                  mt-6
                  border border-white
                  bg-white
                  px-5 py-2.5
                  text-xs font-semibold
                  text-black
                  transition
                  hover:bg-zinc-200
                "
              >
                Create Interview
              </button>

            </div>

          )}


        {/* ===================================================
            INTERVIEW ROWS
        =================================================== */}

        {!loading &&
          !error &&
          interviews.length > 0 && (

            <div className="divide-y divide-white/10">

              {interviews.map((interview) => (

                <InterviewRow
                  key={interview.id}
                  interview={interview}
                  onClick={() =>
                    onInterviewSelect?.(
                      interview.id,
                    )
                  }
                />

              ))}

            </div>

          )}

      </div>


      {/* =====================================================
          CREATE INTERVIEW MODAL
      ===================================================== */}

      {isCreateModalOpen && (

        <CreateInterviewModal
          onClose={() =>
            setIsCreateModalOpen(false)
          }
          onSuccess={() => {

            setRefreshKey(
              (key) => key + 1,
            )

            setIsCreateModalOpen(false)

          }}
        />

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
        text-zinc-500
      "
    >
      {children}
    </span>
  )
}


/* ============================================================
   PLUS ICON
============================================================ */

function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}


/* ============================================================
   EMPTY ICON
============================================================ */

function EmptyIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
      />

      <path d="M8 3v4M16 3v4M3 10h18" />

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