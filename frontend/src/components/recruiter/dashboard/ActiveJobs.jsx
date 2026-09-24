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
    <section className="border border-slate-200 bg-white">

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

        <div>

          <h2 className="text-sm font-bold text-[#17324f]">
            Active Jobs
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
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


      <div className="divide-y divide-slate-100">

        {jobs.map((job) => (
          <div
            key={job.title}
            className="px-5 py-4 transition hover:bg-slate-50"
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-700">
                  {job.title}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {job.department}
                </p>

              </div>

              <span className="bg-[#edf7f1] px-2 py-1 text-[9px] font-semibold text-[#3d8a60]">
                {job.status}
              </span>

            </div>


            <div className="mt-4 flex items-center gap-6">

              <div>

                <p className="text-[9px] uppercase tracking-wider text-slate-400">
                  Candidates
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {job.candidates}
                </p>

              </div>

              <div>

                <p className="text-[9px] uppercase tracking-wider text-slate-400">
                  Interviews
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-600">
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