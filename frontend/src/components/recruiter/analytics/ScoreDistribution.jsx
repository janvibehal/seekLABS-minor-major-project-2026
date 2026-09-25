function ScoreDistribution() {
  const distribution = [
    {
      range: '90 – 100',
      count: 18,
      percentage: 12,
    },
    {
      range: '80 – 89',
      count: 42,
      percentage: 29,
    },
    {
      range: '70 – 79',
      count: 51,
      percentage: 35,
    },
    {
      range: '60 – 69',
      count: 25,
      percentage: 17,
    },
    {
      range: 'Below 60',
      count: 10,
      percentage: 7,
    },
  ]

  return (
    <section className="border border-white/10 bg-[#111111]">

      <div className="border-b border-white/[0.06] px-5 py-4">

        <h2 className="text-sm font-bold text-zinc-100">
          Score Distribution
        </h2>

        <p className="mt-1 text-[10px] text-zinc-500">
          Candidate scores from completed interviews.
        </p>

      </div>


      <div className="p-5">

        <div className="flex h-44 items-end gap-4 border-b border-white/10">

          {distribution.map((item) => (
            <div
              key={item.range}
              className="flex h-full flex-1 flex-col justify-end"
            >

              <div className="flex flex-1 items-end justify-center">

                <div
                  className="w-full max-w-10 bg-[#78aeda] transition hover:bg-[#5d98c4]"
                  style={{
                    height: `${item.percentage * 2.3}%`,
                  }}
                  title={`${item.count} candidates`}
                />

              </div>

            </div>
          ))}

        </div>


        {/* Labels */}

        <div className="mt-3 flex gap-4">

          {distribution.map((item) => (
            <div
              key={item.range}
              className="flex-1 text-center"
            >

              <p className="text-[9px] text-zinc-500">
                {item.range}
              </p>

              <p className="mt-1 text-xs font-semibold text-zinc-100">
                {item.count}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  )
}

export default ScoreDistribution