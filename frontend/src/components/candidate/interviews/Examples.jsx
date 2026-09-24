function Examples({ examples = [] }) {
  return (
    <section>

      <h2 className="text-sm font-bold text-[#17324f]">
        Examples
      </h2>

      <div className="mt-4 space-y-4">

        {examples.map((example, index) => (
          <div
            key={index}
            className="border border-slate-200 bg-white"
          >

            <div className="border-b border-slate-100 px-4 py-2.5">

              <span className="text-xs font-semibold text-slate-600">
                Example {index + 1}
              </span>

            </div>


            <div className="space-y-3 p-4">

              <div>

                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Input
                </span>

                <pre className="mt-1 overflow-x-auto bg-slate-50 p-3 text-xs text-slate-600">
                  {example.input}
                </pre>

              </div>


              <div>

                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Output
                </span>

                <pre className="mt-1 bg-slate-50 p-3 text-xs text-slate-600">
                  {example.output}
                </pre>

              </div>


              {example.explanation && (
                <p className="text-xs leading-5 text-slate-400">
                  {example.explanation}
                </p>
              )}

            </div>

          </div>
        ))}

      </div>

    </section>
  )
}

export default Examples