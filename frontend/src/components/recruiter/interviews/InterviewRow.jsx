import React from 'react'


// ============================================================
// STATUS LABELS
// ============================================================

const STATUS_LABELS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN PROGRESS',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
}


// ============================================================
// STATUS COLORS
// ============================================================

const STATUS_STYLES = {
  SCHEDULED:
    'border-blue-400/25 bg-blue-400/[0.06] text-blue-300',

  IN_PROGRESS:
    'border-amber-400/25 bg-amber-400/[0.06] text-amber-300',

  COMPLETED:
    'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-300',

  EXPIRED:
    'border-red-400/25 bg-red-400/[0.06] text-red-300',

  CANCELLED:
    'border-zinc-500/25 bg-zinc-500/[0.06] text-zinc-400',
}


// ============================================================
// HELPERS
// ============================================================

const getInitials = (candidate) => {
  if (candidate?.initials) {
    return candidate.initials
  }

  const name =
    candidate?.name ||
    candidate?.email ||
    'Unknown Candidate'

  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}


const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )
}


const formatTime = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )
}


const getScore = (interview) => {
  if (
    typeof interview?.score ===
    'number'
  ) {
    return interview.score
  }

  if (
    typeof interview?.overallScore ===
    'number'
  ) {
    return interview.overallScore
  }

  if (
    typeof interview?.evaluation
      ?.overallScore === 'number'
  ) {
    return interview.evaluation
      .overallScore
  }

  if (
    typeof interview?.result
      ?.overallScore === 'number'
  ) {
    return interview.result
      .overallScore
  }

  return null
}


// ============================================================
// INTERVIEW ROW
// ============================================================

function InterviewRow({
  interview,
  onClick,
}) {
  const candidate =
    interview?.candidate || {}

  const status =
    interview?.status ||
    'SCHEDULED'

  const score =
    getScore(interview)

  const statusLabel =
    STATUS_LABELS[status] ||
    status

  const statusStyle =
    STATUS_STYLES[status] ||
    'border-zinc-700 bg-zinc-900 text-zinc-400'


  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        h-full
        w-full
        items-center
        text-left
        transition
        hover:bg-[#151515]
        focus:outline-none
      "
    >

      {/* ====================================================
          DESKTOP ROW
      ==================================================== */}

      <div
        className="
          hidden
          w-full
          grid-cols-[1.6fr_1.4fr_1fr_0.9fr_0.7fr_40px]
          items-center
          gap-0
          px-5
          lg:grid
        "
      >

        {/* ==================================================
            CANDIDATE
        ================================================== */}

        <div className="min-w-0 pr-4">

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                border
                border-white/10
                bg-[#181818]
                text-[10px]
                font-semibold
                text-zinc-400
              "
            >
              {getInitials(
                candidate,
              )}
            </div>


            <div className="min-w-0">

              <p className="truncate text-xs font-semibold text-zinc-200">
                {candidate?.name ||
                  'Unknown Candidate'}
              </p>

              <p className="mt-1 truncate text-[10px] text-zinc-600">
                {candidate?.email ||
                  'No email available'}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            INTERVIEW
        ================================================== */}

        <div className="min-w-0 pr-4">

          <p className="truncate text-xs font-medium text-zinc-300">
            {interview?.title ||
              'Untitled Interview'}
          </p>

          {interview?.company && (
            <p className="mt-1 truncate text-[10px] text-zinc-600">
              {interview.company}
            </p>
          )}

        </div>


        {/* ==================================================
            SCHEDULE
        ================================================== */}

        <div className="min-w-0">

          {interview?.scheduledAt ? (
            <>
              <p className="text-xs text-zinc-300">
                {formatDate(
                  interview.scheduledAt,
                )}
              </p>

              <p className="mt-1 text-[10px] text-zinc-600">
                {formatTime(
                  interview.scheduledAt,
                )}
              </p>
            </>
          ) : (
            <p className="text-xs text-zinc-600">
              —
            </p>
          )}

        </div>


        {/* ==================================================
            SCORE
        ================================================== */}

        <div>

          {score !== null ? (
            <span className="text-xs font-semibold text-zinc-300">
              {Math.round(score)}%
            </span>
          ) : (
            <span className="text-xs text-zinc-600">
              —
            </span>
          )}

        </div>


        {/* ==================================================
            STATUS
        ================================================== */}

        <div>

          <span
            className={`
              inline-flex
              items-center
              border
              px-3
              py-2
              text-[9px]
              font-semibold
              tracking-[0.04em]
              ${statusStyle}
            `}
          >
            {statusLabel}
          </span>

        </div>


        {/* ==================================================
            ARROW
        ================================================== */}

        <div className="flex justify-end">

          <svg
            className="
              h-4
              w-4
              text-zinc-700
              transition
              group-hover:text-zinc-400
            "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>

        </div>

      </div>


      {/* ====================================================
          MOBILE ROW
      ==================================================== */}

      <div className="flex w-full items-center gap-4 px-4 lg:hidden">

        {/* CANDIDATE AVATAR */}

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            border
            border-white/10
            bg-[#181818]
            text-[10px]
            font-semibold
            text-zinc-400
          "
        >
          {getInitials(
            candidate,
          )}
        </div>


        {/* MAIN INFORMATION */}

        <div className="min-w-0 flex-1">

          <p className="truncate text-xs font-semibold text-zinc-200">
            {candidate?.name ||
              'Unknown Candidate'}
          </p>

          <p className="mt-1 truncate text-[10px] text-zinc-600">
            {interview?.title ||
              'Untitled Interview'}
          </p>

          {interview?.company && (
            <p className="mt-1 truncate text-[10px] text-zinc-700">
              {interview.company}
            </p>
          )}

        </div>


        {/* STATUS */}

        <span
          className={`
            shrink-0
            border
            px-2.5
            py-1.5
            text-[8px]
            font-semibold
            tracking-[0.04em]
            ${statusStyle}
          `}
        >
          {statusLabel}
        </span>


        {/* ARROW */}

        <svg
          className="h-4 w-4 shrink-0 text-zinc-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>

      </div>

    </button>
  )
}


export default InterviewRow