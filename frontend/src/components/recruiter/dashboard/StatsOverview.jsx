function StatsOverview({
  stats = {},
  loading = false,
}) {
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '—'

    return Number(value).toLocaleString()
  }

  const formatScore = (value) => {
    if (value === null || value === undefined) return '—'

    return `${Math.round(value)}%`
  }

  const statItems = [
    {
      label: 'Total Candidates',
      value: formatNumber(stats.totalCandidates),
      description: 'Registered candidates',
      icon: CandidatesIcon,
    },
    {
      label: 'Active Jobs',
      value: formatNumber(stats.activeJobs),
      description: 'Currently active positions',
      icon: JobsIcon,
    },
    {
      label: 'Interviews',
      value: formatNumber(stats.totalInterviews),
      description: 'Interview activity',
      icon: InterviewIcon,
    },
    {
      label: 'Average Score',
      value: formatScore(stats.averageScore),
      description: 'AI evaluation average',
      icon: ScoreIcon,
    },
  ]

  return (
    <div className="grid grid-cols-1 border border-[#27272a] sm:grid-cols-2 xl:grid-cols-4">

      {statItems.map((stat, index) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.label}
            className={`bg-[#0d0d0d] p-6 ${
              index !== statItems.length - 1
                ? 'border-b border-[#27272a] xl:border-b-0 xl:border-r'
                : ''
            } ${
              index === 1
                ? 'sm:border-r-0 xl:border-r'
                : ''
            } ${
              index === 2
                ? 'sm:border-b-0 xl:border-r'
                : ''
            }`}
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  {stat.label}
                </p>

                {loading ? (

                  <div className="mt-4 h-8 w-20 animate-pulse bg-[#1a1a1a]" />

                ) : (

                  <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </p>

                )}

              </div>


              <div className="text-zinc-600">
                <Icon />
              </div>

            </div>


            <p className="mt-6 border-t border-[#202020] pt-4 text-xs text-zinc-600">
              {stat.description}
            </p>

          </div>
        )
      })}

    </div>
  )
}


function CandidatesIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="9" cy="8" r="3" />

      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />

      <path d="M16 5a3 3 0 0 1 0 6" />

      <path d="M18 14c2 .8 3 2.8 3 6" />
    </svg>
  )
}


function JobsIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect
        x="3"
        y="6"
        width="18"
        height="14"
      />

      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />

      <path d="M3 11h18" />

      <path d="M10 11v2h4v-2" />
    </svg>
  )
}


function InterviewIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
      />

      <path d="M7 2v4M17 2v4M3 10h18" />

      <path d="M8 14h2M14 14h2M8 18h2" />
    </svg>
  )
}


function ScoreIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 19V5" />

      <path d="M4 19h16" />

      <path d="m7 15 3-4 3 2 5-6" />
    </svg>
  )
}


export default StatsOverview