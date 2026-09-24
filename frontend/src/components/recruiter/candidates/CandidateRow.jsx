function CandidateRow({ candidate, onClick }) {
  const scoreClass =
    candidate.score >= 85
      ? 'text-[#3d8a60]'
      : candidate.score >= 70
        ? 'text-[#3972a7]'
        : 'text-slate-500'

  const statusClass =
    candidate.status === 'Shortlisted'
      ? 'bg-[#edf7f1] text-[#3d8a60]'
      : candidate.status === 'In Progress'
        ? 'bg-[#edf5fc] text-[#3972a7]'
        : 'bg-slate-100 text-slate-500'

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[2fr_1.5fr_0.7fr_1fr_1fr_40px] items-center px-5 py-4 text-left transition hover:bg-slate-50"
    >

      {/* Candidate */}

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#eaf3fc] text-[10px] font-semibold text-[#3972a7]">
          {candidate.initials}
        </div>

        <div className="min-w-0">

          <p className="truncate text-xs font-semibold text-slate-700">
            {candidate.name}
          </p>

          <p className="mt-1 truncate text-[10px] text-slate-400">
            {candidate.email}
          </p>

        </div>

      </div>


      {/* Job */}

      <div className="min-w-0 pr-4">

        <p className="truncate text-xs text-slate-600">
          {candidate.job}
        </p>

        <p className="mt-1 text-[9px] text-slate-400">
          {candidate.date}
        </p>

      </div>


      {/* Score */}

      <div>

        <span className={`text-sm font-bold ${scoreClass}`}>
          {candidate.score}
        </span>

        <span className="text-[9px] text-slate-400">
          /100
        </span>

      </div>


      {/* Interview */}

      <div>

        <p
          className={`text-[10px] font-medium ${
            candidate.interview === 'Completed'
              ? 'text-slate-600'
              : 'text-[#3972a7]'
          }`}
        >
          {candidate.interview}
        </p>

      </div>


      {/* Status */}

      <div>

        <span className={`inline-block px-2 py-1 text-[9px] font-semibold ${statusClass}`}>
          {candidate.status}
        </span>

      </div>


      {/* Arrow */}

      <div className="flex justify-end text-slate-300">

        <ArrowIcon />

      </div>

    </button>
  )
}


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


export default CandidateRow