import { useMemo, useState } from 'react'
import InterviewTopBar from './InterviewTopBar'
import QuestionSidebar from './QuestionSidebar'
import QuestionPanel from './QuestionPanel'
import ChatPanel from './ChatPanel'

function InterviewLayout({
  title,
  questions,
  activeQuestionId,
  viewedQuestionId,
  onQuestionSelect,
  messages,
  onSendMessage,
  sending,
  sessionEnded,
  timeLabel,
  onEndInterview,
  ending,
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Questions that the candidate has explicitly saved.
  const [savedQuestionIds, setSavedQuestionIds] = useState([])

  const activeIndex = questions.findIndex(
    (q) => q.id === activeQuestionId,
  )

  const selectedQuestion =
    questions.find((q) => q.id === viewedQuestionId) ??
    questions[0] ??
    null

  const selectedIndex = questions.findIndex(
    (q) => q.id === selectedQuestion?.id,
  )

  // ------------------------------------------------------------
  // QUESTIONS WITH LOCAL SAVE/DONE STATUS
  // ------------------------------------------------------------
  const displayQuestions = useMemo(() => {
    return questions.map((question) => {
      const isSaved = savedQuestionIds.includes(question.id)

      if (isSaved) {
        return {
          ...question,
          status: 'completed',
          saved: true,
        }
      }

      return {
        ...question,
        saved: false,
      }
    })
  }, [questions, savedQuestionIds])

  // ------------------------------------------------------------
  // SELECT QUESTION
  // ------------------------------------------------------------
  const handleQuestionSelect = (questionId) => {
    if (sessionEnded) return

    onQuestionSelect(questionId)
  }

  // ------------------------------------------------------------
  // SAVE CURRENT QUESTION
  // ------------------------------------------------------------
  const handleSaveProgress = () => {
    if (!selectedQuestion || sessionEnded || sending) {
      return
    }

    setSavedQuestionIds((previous) => {
      if (previous.includes(selectedQuestion.id)) {
        return previous
      }

      return [...previous, selectedQuestion.id]
    })
  }

  const currentQuestionSaved =
    selectedQuestion &&
    savedQuestionIds.includes(selectedQuestion.id)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f8fc]">
      <InterviewTopBar
        title={title}
        currentQuestionNumber={
          activeIndex >= 0 ? activeIndex + 1 : 1
        }
        totalQuestions={questions.length}
        timeLabel={timeLabel}
        onEndInterview={onEndInterview}
        ending={ending}
      />

      <div
        className={`grid min-h-0 flex-1 transition-[grid-template-columns] duration-200 ${
          isSidebarCollapsed
            ? 'grid-cols-[64px_minmax(0,0.9fr)_minmax(0,1.1fr)]'
            : 'grid-cols-[220px_minmax(0,0.9fr)_minmax(0,1.1fr)]'
        }`}
      >
        {/* ------------------------------------------------------
            QUESTION SIDEBAR
        ------------------------------------------------------ */}

        <QuestionSidebar
          questions={displayQuestions}
          currentQuestion={selectedQuestion?.id}
          onQuestionSelect={handleQuestionSelect}
          isCollapsed={isSidebarCollapsed}
          onToggle={() =>
            setIsSidebarCollapsed(
              (previous) => !previous,
            )
          }
        />

        {/* ------------------------------------------------------
            QUESTION PANEL
        ------------------------------------------------------ */}

        <div className="flex min-h-0 flex-col">
          <QuestionPanel
            question={selectedQuestion}
            questionNumber={
              selectedIndex >= 0 ? selectedIndex + 1 : 1
            }
            totalQuestions={questions.length}
          />

          {/* ----------------------------------------------------
              SAVE PROGRESS
          ---------------------------------------------------- */}

          {selectedQuestion && !sessionEnded && (
            <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
              <div className="text-xs text-gray-500">
                {currentQuestionSaved
                  ? 'This question has been saved.'
                  : 'Save your progress before moving on.'}
              </div>

              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={
                  currentQuestionSaved ||
                  sending ||
                  ending ||
                  sessionEnded
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  currentQuestionSaved
                    ? 'cursor-default bg-green-100 text-green-700'
                    : 'bg-[#285b8f] text-white hover:bg-[#214d7a] disabled:cursor-not-allowed disabled:opacity-50'
                }`}
              >
                {currentQuestionSaved
                  ? '✓ Saved'
                  : 'Save Progress'}
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------
            CHAT PANEL
        ------------------------------------------------------ */}

        <ChatPanel
          messages={messages}
          onSendMessage={onSendMessage}
          sending={sending}
          sessionEnded={sessionEnded}
        />
      </div>
    </div>
  )
}

export default InterviewLayout