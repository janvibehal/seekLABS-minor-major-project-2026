import QuestionList from './QuestionList'

function QuestionSidebar({
  questions,
  currentQuestion,
  onQuestionSelect,
  isCollapsed,
  onToggle,
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">

      {/* Header */}

      <div
        className={`flex h-[73px] shrink-0 items-center border-b border-slate-100 ${
          isCollapsed
            ? 'justify-center'
            : 'justify-between px-5'
        }`}
      >

        {!isCollapsed && (
          <div>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Interview Questions
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {questions.length} questions
            </p>

          </div>
        )}


        <button
          type="button"
          onClick={onToggle}
          aria-label={
            isCollapsed
              ? 'Expand questions'
              : 'Collapse questions'
          }
          className="flex h-7 w-7 items-center justify-center border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-[#285b8f]"
        >

          {isCollapsed ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}

        </button>

      </div>


      {/* Questions */}

      <QuestionList
        questions={questions}
        currentQuestion={currentQuestion}
        onQuestionSelect={onQuestionSelect}
        isCollapsed={isCollapsed}
      />

    </aside>
  )
}


function ChevronLeftIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}


function ChevronRightIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}


export default QuestionSidebar