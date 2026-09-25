function HiringPipeline() {
  const stages = [
    {
      name: 'Applied',
      count: 42,
      percentage: 100,
    },
    {
      name: 'Interview',
      count: 24,
      percentage: 57,
    },
    {
      name: 'Shortlisted',
      count: 12,
      percentage: 29,
    },
    {
      name: 'Selected',
      count: 6,
      percentage: 14,
    },
  ]

  return (
    <section className="border border-white/10 bg-[#111111]">

      <div className="border-b border-white/[0.06] px-5 py-4">

        <h2 className="text-sm font-bold text-zinc-100">
          Hiring Pipeline
        </h2>

        <p className="mt-1 text-[10px] text-zinc-500">
          Candidate progression
        </p>

      </div>


      <div className="space-y-6 p-5">

        {stages.map((stage) => (
          <div key={stage.name}>

            <div className="mb-2 flex items-center justify-between">

              <span className="text-xs font-medium text-zinc-300">
                {stage.name}
              </span>

              <span className="text-xs font-semibold text-zinc-100">
                {stage.count}
              </span>

            </div>


            <div className="h-1.5 w-full bg-white/[0.06]">

              <div
                className="h-full bg-[#6fa9dc]"
                style={{
                  width: `${stage.percentage}%`,
                }}
              />

            </div>

          </div>
        ))}

      </div>

    </section>
  )
}

export default HiringPipeline