function QuestionHeader({
  question,
  questionNumber,
  totalQuestions,
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">

      <h1 className="text-xl font-bold leading-7 text-[#17324f] lg:text-2xl">
        {question.title}
      </h1>


      <p className="mt-2 text-xs text-slate-400">
        Question {questionNumber} of {totalQuestions}
      </p>

    </div>
  )
}

export default QuestionHeader