function ProblemStatement({ description }) {
  return (
    <section>

      <h2 className="text-sm font-bold text-[#17324f]">
        Problem Statement
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-600">
        {description}
      </p>

    </section>
  )
}

export default ProblemStatement