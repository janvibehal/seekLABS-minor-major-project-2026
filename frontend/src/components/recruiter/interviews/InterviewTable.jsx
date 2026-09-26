import { useEffect, useState } from 'react'

import InterviewRow from './InterviewRow'
import CreateInterviewModal from './CreateInterviewModal'

import { getRecruiterInterviews } from '../../../api/interview.api.js'


function InterviewTable({
  interviews: providedInterviews = null,
  loading: providedLoading = false,
  error: providedError = null,
  onInterviewSelect,
  onInterviewCreated,
}) {
  const [
    localInterviews,
    setLocalInterviews,
  ] = useState([])

  const [
    localLoading,
    setLocalLoading,
  ] = useState(
    providedInterviews === null,
  )

  const [
    localError,
    setLocalError,
  ] = useState(null)

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false)

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0)


  // ============================================================
  // USE PARENT DATA WHEN PROVIDED
  //
  // RecruiterInterviews owns filtering.
  // InterviewTable only displays the filtered records.
  // ============================================================

  const interviews =
    providedInterviews !== null
      ? providedInterviews
      : localInterviews

  const loading =
    providedInterviews !== null
      ? providedLoading
      : localLoading

  const error =
    providedInterviews !== null
      ? providedError
      : localError


  // ============================================================
  // OPEN CREATE INTERVIEW MODAL
  // ============================================================

  const handleCreateInterview = () => {
    setIsCreateModalOpen(true)
  }


  // ============================================================
  // FETCH FALLBACK DATA
  //
  // This keeps InterviewTable backwards-compatible if another
  // page uses it without passing an interviews prop.
  // ============================================================

  useEffect(() => {
    if (providedInterviews !== null) {
      return
    }

    let cancelled = false

    const fetchInterviews = async () => {
      try {
        setLocalLoading(true)
        setLocalError(null)

        const data =
          await getRecruiterInterviews()

        if (cancelled) {
          return
        }

        setLocalInterviews(
          Array.isArray(data)
            ? data
            : [],
        )
      } catch (error) {
        console.error(
          'Fetch interviews error:',
          error,
        )

        if (!cancelled) {
          setLocalError(
            error?.message ||
              'Failed to load interviews',
          )
        }
      } finally {
        if (!cancelled) {
          setLocalLoading(false)
        }
      }
    }

    fetchInterviews()

    return () => {
      cancelled = true
    }
  }, [
    providedInterviews,
    refreshKey,
  ])


  // ============================================================
  // CREATE INTERVIEW SUCCESS
  // ============================================================

  const handleCreateSuccess = () => {
    /*
     * Parent owns the actual interview list when this table
     * is rendered from RecruiterInterviews.
     *
     * Tell the parent to fetch fresh data.
     */
    if (
      providedInterviews !== null
    ) {
      onInterviewCreated?.()
    } else {
      /*
       * Fallback mode:
       * refresh this component's own data.
       */
      setRefreshKey(
        (key) => key + 1,
      )
    }

    setIsCreateModalOpen(false)
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full">

      {/* =====================================================
          TABLE HEADER
      ===================================================== */}

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


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (

        <div className="flex h-[384px] items-center justify-center">

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


      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (

        <div className="flex h-[384px] items-center justify-center px-6">

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

          </div>

        </div>

      )}


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!loading &&
        !error &&
        interviews.length === 0 && (

          <div className="flex h-[384px] flex-col items-center justify-center px-6 text-center">

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
              No interviews found
            </p>


            <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              There are no candidate interview records
              matching the selected filters.
            </p>

          </div>

        )}


      {/* =====================================================
          INTERVIEW ROWS

          FIXED 4-ROW VIEWPORT

          4 rows × 96px = 384px.

          The viewport itself does not grow when more
          candidates exist. Additional rows scroll inside it.
      ===================================================== */}

      {!loading &&
        !error &&
        interviews.length > 0 && (

          <div
            className="
              h-[384px]
              overflow-y-auto
              overscroll-contain
              divide-y divide-white/10
              [scrollbar-width:thin]
              [scrollbar-color:#3f3f46_transparent]
            "
          >

            {interviews.map(
              (interview) => (

                <div
                  key={interview.id}
                  className="h-24 min-h-24 overflow-hidden"
                >

                  <InterviewRow
                    interview={
                      interview
                    }
                    onClick={() =>
                      onInterviewSelect?.(
                        interview.id,
                      )
                    }
                  />

                </div>

              ),
            )}

          </div>

        )}


      {/* =====================================================
          CREATE INTERVIEW MODAL
      ===================================================== */}

      {isCreateModalOpen && (

        <CreateInterviewModal
          onClose={() =>
            setIsCreateModalOpen(
              false,
            )
          }
          onSuccess={
            handleCreateSuccess
          }
        />

      )}

    </div>
  )
}


// ============================================================
// TABLE HEADING
// ============================================================

function Heading({
  children,
}) {
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


// ============================================================
// EMPTY ICON
// ============================================================

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


// ============================================================
// ERROR ICON
// ============================================================

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