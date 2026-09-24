function InterviewRow({ interview, onClick }) {
  const formattedStatus = formatStatus(interview.status)

  // ============================================================
  // STATUS STYLING — MONOCHROME / PROFESSIONAL
  // ============================================================

  const statusClass =
    interview.status === 'COMPLETED'
      ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
      : interview.status === 'IN_PROGRESS'
        ? 'border border-white/15 bg-white/[0.06] text-white'
        : interview.status === 'CANCELLED'
          ? 'border border-red-500/20 bg-red-500/10 text-red-400'
          : interview.status === 'EXPIRED'
            ? 'border border-white/10 bg-white/[0.03] text-zinc-500'
            : 'border border-white/15 bg-white/[0.05] text-zinc-300'

  // ============================================================
  // DATE FORMATTING
  // ============================================================

  const scheduledDate = new Date(interview.scheduledAt)

  const date = scheduledDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const time = scheduledDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  // ============================================================
  // UI
  // ============================================================

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        grid
        w-full
        grid-cols-[1.5fr_1.2fr_1.2fr_1fr_0.7fr_0.9fr_40px]
        items-center
        border-b
        border-white/[0.07]
        bg-[#0d0d0d]
        px-5
        py-4
        text-left
        transition
        hover:bg-[#151515]
      "
    >

      {/* ======================================================
          CANDIDATE
      ====================================================== */}

      <div className="flex min-w-0 items-center gap-3">

        {/* Initials */}

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            border
            border-white/10
            bg-[#171717]
            text-[10px]
            font-semibold
            text-zinc-300
          "
        >
          {interview.candidate?.initials || '--'}
        </div>


        {/* Candidate Info */}

        <div className="min-w-0">

          <p className="truncate text-xs font-semibold text-zinc-200">
            {interview.candidate?.name ||
              'Unknown Candidate'}
          </p>

          <p className="mt-1 truncate text-[10px] text-zinc-500">
            {interview.candidate?.email ||
              'No email available'}
          </p>

        </div>

      </div>


      {/* ======================================================
          INTERVIEW
      ====================================================== */}

      <div className="min-w-0 pr-4">

        <p className="truncate text-xs font-medium text-zinc-300">
          {interview.title}
        </p>

        <p className="mt-1 truncate text-[9px] text-zinc-500">
          {interview.type}
        </p>

      </div>


      {/* ======================================================
          COMPANY / FOCUS AREA
      ====================================================== */}

      <div className="min-w-0 pr-4">

        <p className="truncate text-xs font-medium text-zinc-400">
          {interview.company || 'No Company'}
        </p>

        <p className="mt-1 truncate text-[9px] text-zinc-600">
          {interview.focusAreas?.length > 0
            ? interview.focusAreas.join(', ')
            : 'General Interview'}
        </p>

      </div>


      {/* ======================================================
          SCHEDULE
      ====================================================== */}

      <div>

        <p className="text-xs font-medium text-zinc-300">
          {date}
        </p>

        <p className="mt-1 text-[9px] text-zinc-500">
          {time}
        </p>

        <p className="mt-0.5 text-[9px] text-zinc-600">
          {interview.duration} mins
        </p>

      </div>


      {/* ======================================================
          SCORE
      ====================================================== */}

      <div>

        {interview.score !== null &&
        interview.score !== undefined ? (

          <div className="flex items-baseline">

            <span className="text-sm font-bold text-zinc-100">
              {interview.score}
            </span>

            <span className="ml-0.5 text-[9px] text-zinc-600">
              /100
            </span>

          </div>

        ) : (

          <span className="text-sm text-zinc-600">
            —
          </span>

        )}

      </div>


      {/* ======================================================
          STATUS
      ====================================================== */}

      <div>

        <span
          className={`
            inline-flex
            border
            px-2.5
            py-1
            text-[9px]
            font-semibold
            uppercase
            tracking-wide
            ${statusClass}
          `}
        >
          {formattedStatus}
        </span>

      </div>


      {/* ======================================================
          ARROW
      ====================================================== */}

      <div className="flex justify-end text-zinc-600 transition group-hover:text-zinc-300">

        <ArrowIcon />

      </div>

    </button>
  )
}


/* ============================================================
   FORMAT STATUS
============================================================ */

function formatStatus(status) {
  return status
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(' ')
}


/* ============================================================
   ARROW ICON
============================================================ */

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}


export default InterviewRow