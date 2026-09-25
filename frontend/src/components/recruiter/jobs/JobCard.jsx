function JobCard({ job }) {
  const isActive = job.status === 'Active'

  return (
    <div className="border border-white/10 bg-[#111111] transition hover:border-slate-300">

      <div className="p-5">

        {/* Top */}

        <div className="flex items-start justify-between">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-sm font-bold text-zinc-100">
                {job.title}
              </h2>

              <span
                className={`px-2 py-1 text-[9px] font-semibold ${
                  isActive
                    ? 'bg-[#13251b] text-[#3d8a60]'
                    : 'bg-white/[0.06] text-zinc-400'
                }`}
              >
                {job.status}
              </span>

            </div>


            <p className="mt-2 text-xs text-zinc-500">
              {job.department}
              <span className="mx-2 text-zinc-600">
                •
              </span>
              {job.type}
            </p>

          </div>


          {/* More */}

          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-zinc-500 transition hover:bg-[#151515] hover:text-zinc-200"
          >
            <MoreIcon />
          </button>

        </div>


        {/* Skills */}

        <div className="mt-4 flex flex-wrap gap-2">

          {job.skills.map((skill) => (
            <span
              key={skill}
              className="bg-[#0a0a0a] px-2.5 py-1 text-[9px] font-medium text-zinc-400"
            >
              {skill}
            </span>
          ))}

        </div>


        {/* Bottom Stats */}

        <div className="mt-5 flex flex-wrap items-end justify-between gap-5 border-t border-white/[0.06] pt-4">

          <div className="flex gap-8">

            <Stat
              label="Candidates"
              value={job.candidates}
            />

            <Stat
              label="Interviews"
              value={job.interviews}
            />

            <Stat
              label="Created"
              value={job.created}
            />

          </div>


          <button
            type="button"
            className="flex items-center gap-2 text-[10px] font-semibold text-[#3972a7] transition hover:text-[#285b8f]"
          >
            View Job
            <ArrowIcon />
          </button>

        </div>

      </div>

    </div>
  )
}


function Stat({ label, value }) {
  return (
    <div>

      <p className="text-[9px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-zinc-300">
        {value}
      </p>

    </div>
  )
}


function MoreIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
}


function ArrowIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}


export default JobCard