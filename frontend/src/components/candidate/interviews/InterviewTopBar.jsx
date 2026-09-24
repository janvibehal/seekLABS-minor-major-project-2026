function InterviewTopBar({
  title = 'Interview',
  currentQuestionNumber,
  totalQuestions,
  timeLabel,
  onEndInterview,
  ending,
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">

      <div className="flex items-center gap-4">

        <div className="flex h-9 w-9 items-center justify-center bg-[#173b63]">
          <div className="h-4 w-4 rounded-full border-[3px] border-white border-r-[#8fc5ff]" />
        </div>

        <div>
          <p className="text-sm font-bold text-[#173b63]">
            SeekLABS
          </p>

          <p className="text-[10px] text-slate-400">
            {title}
          </p>
        </div>

      </div>


      {Boolean(totalQuestions) && (
        <div className="hidden items-center gap-3 md:flex">

          <span className="text-xs text-slate-400">
            Question
          </span>

          <span className="text-sm font-semibold text-[#17324f]">
            {currentQuestionNumber}
          </span>

          <span className="text-xs text-slate-400">
            / {totalQuestions}
          </span>

        </div>
      )}


      <div className="flex items-center gap-5">

        {timeLabel && (
          <div className="flex items-center gap-2 text-sm font-semibold text-[#285b8f]">

            <ClockIcon />

            <span>
              {timeLabel}
            </span>

          </div>
        )}

        <div className="h-6 w-px bg-slate-200" />

        <button
          type="button"
          onClick={onEndInterview}
          disabled={ending}
          className="border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ending ? 'Ending...' : 'End Interview'}
        </button>

      </div>

    </header>
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

export default InterviewTopBar
