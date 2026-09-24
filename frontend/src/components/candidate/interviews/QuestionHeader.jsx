function QuestionHeader({
  question,
  questionNumber,
  totalQuestions,
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">

      <div className="flex flex-wrap items-center gap-2">

        <span className="bg-[#eaf3fc] px-2.5 py-1 text-[10px] font-semibold text-[#3972a7]">
          {question.difficulty}
        </span>

        {question.topics.map((topic) => (
          <span
            key={topic}
            className="bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500"
          >
            {topic}
          </span>
        ))}

      </div>


      <h1 className="mt-4 text-xl font-bold leading-7 text-[#17324f] lg:text-2xl">
        {question.title}
      </h1>


      <p className="mt-2 text-xs text-slate-400">
        Question {questionNumber} of {totalQuestions}
      </p>

    </div>
  )
}

export default QuestionHeader