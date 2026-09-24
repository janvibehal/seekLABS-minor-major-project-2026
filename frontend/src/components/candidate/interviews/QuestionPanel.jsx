import QuestionHeader from './QuestionHeader'
import ProblemStatement from './ProblemStatement'
import Examples from './Examples'
import Constraints from './Constraints'

function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
}) {
  if (!question) {
    return (
      <section className="flex min-h-0 items-center justify-center bg-[#f8fbfe]">
        <p className="text-sm text-slate-400">
          No question selected
        </p>
      </section>
    )
  }

  return (
    <section className="min-h-0 overflow-y-auto bg-[#f8fbfe]">

      <QuestionHeader
        question={question}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />

      <div className="space-y-8 p-6 lg:p-8">

        <ProblemStatement
          description={question.description}
        />

        <Examples
          examples={question.examples}
        />

        <Constraints
          constraints={question.constraints}
        />

      </div>

    </section>
  )
}

export default QuestionPanel