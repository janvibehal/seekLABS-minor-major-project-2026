import QuestionItem from './QuestionItem'

function QuestionList({
  questions,
  currentQuestion,
  onQuestionSelect,
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">

      <div className="space-y-1">

        {questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            isCurrent={question.id === currentQuestion}
            onClick={() => onQuestionSelect(question.id)}
          />
        ))}

      </div>

    </div>
  )
}

export default QuestionList