function CandidateFilters() {
  return (
    <div className="flex flex-col gap-3 border border-slate-200 bg-white p-4 lg:flex-row">

      {/* Search */}

      <div className="flex min-w-0 flex-1 items-center border border-slate-200 bg-slate-50 px-3">

        <SearchIcon />

        <input
          type="text"
          placeholder="Search candidates..."
          className="ml-2 w-full bg-transparent py-2 text-xs text-slate-600 outline-none placeholder:text-slate-400"
        />

      </div>


      {/* Job */}

      <select
        defaultValue="all"
        className="border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
      >
        <option value="all">
          All Jobs
        </option>

        <option>
          Senior Backend Engineer
        </option>

        <option>
          Frontend Developer
        </option>

        <option>
          Data Scientist
        </option>

      </select>


      {/* College */}

      <select
        defaultValue="all"
        className="border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
      >
        <option value="all">
          All Colleges
        </option>

        <option>
          IIT Delhi
        </option>

        <option>
          IIT Bombay
        </option>

        <option>
          IIT Madras
        </option>

        <option>
          NIT Trichy
        </option>

        <option>
          BITS Pilani
        </option>

        <option>
          VIT
        </option>

        <option>
          SRM University
        </option>

      </select>


      {/* Hiring Mode */}

      <select
        defaultValue="all"
        className="border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
      >
        <option value="all">
          All Hiring Modes
        </option>

        <option value="on-campus">
          On-Campus
        </option>

        <option value="off-campus">
          Off-Campus
        </option>

      </select>


      {/* Status */}

      <select
        defaultValue="all"
        className="border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
      >
        <option value="all">
          All Status
        </option>

        <option>
          Interviewed
        </option>

        <option>
          Shortlisted
        </option>

        <option>
          In Progress
        </option>

        <option>
          Rejected
        </option>

      </select>


      {/* Score */}

      <select
        defaultValue="all"
        className="border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
      >
        <option value="all">
          Any Score
        </option>

        <option>
          90+
        </option>

        <option>
          80+
        </option>

        <option>
          70+
        </option>

        <option>
          Below 70
        </option>

      </select>

    </div>
  )
}


function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
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