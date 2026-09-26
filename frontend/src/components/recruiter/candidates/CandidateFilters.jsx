function CandidateFilters({
  filters,
  onFilterChange,
  jobOptions = [],
}) {
  const updateFilter = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="flex flex-col gap-3 border border-white/10 bg-[#111111] p-4 lg:flex-row">

      {/* Search */}

      <div className="flex min-w-0 flex-1 items-center border border-white/10 bg-[#151515] px-3">

        <SearchIcon />

        <input
          type="text"
          value={filters.search}
          onChange={(e) =>
            updateFilter('search', e.target.value)
          }
          placeholder="Search candidates..."
          className="ml-2 w-full bg-transparent py-2 text-xs text-zinc-300 outline-none placeholder:text-zinc-500"
        />

      </div>


      {/* Job */}

      <select
        value={filters.job}
        onChange={(e) =>
          updateFilter('job', e.target.value)
        }
        className="border border-white/10 bg-[#111111] px-3 py-2 text-xs text-zinc-300 outline-none"
      >
        <option value="">
          All Jobs
        </option>

        {jobOptions.map((job) => (
          <option key={job} value={job}>
            {job}
          </option>
        ))}
      </select>


      {/* Status */}

      <select
        value={filters.status}
        onChange={(e) =>
          updateFilter('status', e.target.value)
        }
        className="border border-white/10 bg-[#111111] px-3 py-2 text-xs text-zinc-300 outline-none"
      >
        <option value="">
          All Status
        </option>

        <option value="Scheduled">
          Scheduled
        </option>

        <option value="In Progress">
          In Progress
        </option>

        <option value="Completed">
          Completed
        </option>

        <option value="Expired">
          Expired
        </option>

        <option value="Cancelled">
          Cancelled
        </option>
      </select>


      {/* Score */}

      <select
        value={filters.score}
        onChange={(e) =>
          updateFilter('score', e.target.value)
        }
        className="border border-white/10 bg-[#111111] px-3 py-2 text-xs text-zinc-300 outline-none"
      >
        <option value="">
          Any Score
        </option>

        <option value="90+">
          90+
        </option>

        <option value="80+">
          80+
        </option>

        <option value="70+">
          70+
        </option>

        <option value="below70">
          Below 70
        </option>
      </select>

    </div>
  )
}


function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-zinc-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}


export default CandidateFilters