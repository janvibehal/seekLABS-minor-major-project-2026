function HiringFunnel() {
  const stages = [
    {
      name: 'Applications',
      count: 248,
      percentage: 100,
    },
    {
      name: 'Interviews',
      count: 146,
      percentage: 59,
    },
    {
      name: 'Shortlisted',
      count: 62,
      percentage: 25,
    },
    {
      name: 'Selected',
      count: 24,
      percentage: 10,
    },
  ]

  return (
    <section className="border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-5 py-4">

        <h2 className="text-sm font-bold text-[#17324f]">
          Hiring Funnel
        </h2>

        <p className="mt-1 text-[10px] text-slate-400">
          Candidate progression through the recruitment process.
        </p>

      </div>


      <div className="p-5">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

          {stages.map((stage, index) => (
            <div
              key={stage.name}
              className="relative border border-slate-100 bg-[#f8fbfe] p-4"
            >

              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                {stage.name}
              </p>

              <p className="mt-2 text-xl font-bold text-[#17324f]">
                {stage.count}
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                {stage.percentage}% of applications
              </p>


              {index < stages.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 bg-white px-1 text-slate-300 md:block">
                  →
                </div>
              )}

            </div>
          ))}

        </div>


        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

          <span className="text-[10px] text-slate-400">
            Overall application-to-selection rate
          </span>

          <span className="text-sm font-bold text-[#3972a7]">
            9.7%
          </span>

        </div>

      </div>

    </section>
  )
}

export default HiringFunnel