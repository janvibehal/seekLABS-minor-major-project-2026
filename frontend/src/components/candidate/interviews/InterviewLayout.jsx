import { useState } from 'react'
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false)

  const activeIndex = questions.findIndex(
    (q) => q.id === activeQuestionId,
  )

  const selectedQuestion =
    questions.find(
      (q) => q.id === viewedQuestionId,
    ) ??
    questions[0] ??
    null

  const selectedIndex = questions.findIndex(
    (q) => q.id === selectedQuestion?.id,
  )

  // ------------------------------------------------------------
  // SELECT QUESTION
  // ------------------------------------------------------------
  const handleQuestionSelect = (questionId) => {
    if (sessionEnded) return

    onQuestionSelect(questionId)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f8fc]">
      <InterviewTopBar
        title={title}
        currentQuestionNumber={
          activeIndex >= 0
            ? activeIndex + 1
            : 1
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
          questions={questions}
          currentQuestion={
            selectedQuestion?.id
          }
          onQuestionSelect={
            handleQuestionSelect
          }
          isCollapsed={
            isSidebarCollapsed
          }
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
              selectedIndex >= 0
                ? selectedIndex + 1
                : 1
            }
            totalQuestions={
              questions.length
            }
          />
        </div>

        {/* ------------------------------------------------------
            CHAT PANEL
        ------------------------------------------------------ */}

        <ChatPanel
          messages={messages}
          onSendMessage={
            onSendMessage
          }
          sending={sending}
          sessionEnded={sessionEnded}
        />
      </div>
    </div>
  )
}

export default InterviewLayout