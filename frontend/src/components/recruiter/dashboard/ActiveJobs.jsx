function ActiveJobs() {
  const jobs = [
    {
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      candidates: 32,
      interviews: 12,
      status: 'Active',
    },
    {
      title: 'Frontend Developer',
      department: 'Engineering',
      candidates: 24,
      interviews: 9,
      status: 'Active',
    },
    {
      title: 'Data Scientist',
      department: 'Data & AI',
      candidates: 18,
      interviews: 7,
      status: 'Active',
    },
  ]

  return (
    <section className="border border-white/10 bg-[#111111]">

      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

        <div>

          <h2 className="text-sm font-bold text-zinc-100">
            Active Jobs
          </h2>

          <p className="mt-1 text-[10px] text-zinc-500">
            Currently hiring
          </p>

        </div>

        <button
          type="button"
          className="text-[10px] font-semibold text-[#3972a7] hover:text-[#285b8f]"
        >
          View all
        </button>

      </div>


      <div className="divide-y divide-white/[0.06]">

        {jobs.map((job) => (
          <div
            key={job.title}
            className="px-5 py-4 transition hover:bg-[#151515]"
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold text-zinc-200">
                  {job.title}
                </p>

                <p className="mt-1 text-[10px] text-zinc-500">
                  {job.department}
                </p>

              </div>

              <span className="bg-[#13251b] px-2 py-1 text-[9px] font-semibold text-[#3d8a60]">
                {job.status}
              </span>

            </div>


            <div className="mt-4 flex items-center gap-6">

              <div>

                <p className="text-[9px] uppercase tracking-wider text-zinc-500">
                  Candidates
                </p>

                <p className="mt-1 text-xs font-semibold text-zinc-300">
                  {job.candidates}
                </p>

              </div>

              <div>

                <p className="text-[9px] uppercase tracking-wider text-zinc-500">
                  Interviews
                </p>

                <p className="mt-1 text-xs font-semibold text-zinc-300">
                  {job.interviews}
                </p>

              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  )
}

export default ActiveJobs