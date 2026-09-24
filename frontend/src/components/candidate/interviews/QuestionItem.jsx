function QuestionItem({
  question,
  index,
  isCurrent,
  onClick,
}) {
  const isCompleted = question.status === 'completed'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
        isCurrent
          ? 'bg-[#eaf3fc] text-[#285b8f]'
          : 'text-slate-500 hover:bg-slate-50'
      }`}
    >

      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold ${
          isCurrent
            ? 'bg-[#285b8f] text-white'
            : isCompleted
              ? 'bg-[#edf7f1] text-[#3d8a60]'
              : 'bg-slate-100 text-slate-400'
        }`}
      >

        {isCompleted ? (
          <CheckIcon />
        ) : (
          String(index + 1).padStart(2, '0')
        )}

      </div>


      <div className="min-w-0">

        <p className="truncate text-xs font-semibold">
          {question.title}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          {isCompleted
            ? 'Completed'
            : isCurrent
              ? 'Current question'
              : 'Not started'}
        </p>

      </div>

    </button>
  )
}


function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}


export default QuestionItem