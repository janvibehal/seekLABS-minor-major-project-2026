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
    <section className="border border-white/10 bg-[#111111]">

      <div className="border-b border-white/[0.06] px-5 py-4">

        <h2 className="text-sm font-bold text-zinc-100">
          Hiring Funnel
        </h2>

        <p className="mt-1 text-[10px] text-zinc-500">
          Candidate progression through the recruitment process.
        </p>

      </div>


      <div className="p-5">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

          {stages.map((stage, index) => (
            <div
              key={stage.name}
              className="relative border border-white/[0.06] bg-[#121212] p-4"
            >

              <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                {stage.name}
              </p>

              <p className="mt-2 text-xl font-bold text-zinc-100">
                {stage.count}
              </p>

              <p className="mt-1 text-[9px] text-zinc-500">
                {stage.percentage}% of applications
              </p>


              {index < stages.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 bg-[#111111] px-1 text-zinc-600 md:block">
                  →
                </div>
              )}

            </div>
          ))}

        </div>


        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">

          <span className="text-[10px] text-zinc-500">
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