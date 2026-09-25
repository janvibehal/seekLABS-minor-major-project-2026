function JobFilters() {
  return (
    <div className="flex flex-col gap-3 border border-white/10 bg-[#111111] p-4 md:flex-row">

      {/* Search */}

      <div className="flex flex-1 items-center border border-white/10 bg-[#151515] px-3">

        <SearchIcon />

        <input
          type="text"
          placeholder="Search jobs..."
          className="ml-2 w-full bg-transparent py-2 text-xs text-zinc-300 outline-none placeholder:text-zinc-500"
        />

      </div>


      {/* Status */}

      <select
        defaultValue="all"
        className="border border-white/10 bg-[#111111] px-3 py-2 text-xs text-zinc-300 outline-none"
      >
        <option value="all">
          All Status
        </option>

        <option value="active">
          Active
        </option>

        <option value="closed">
          Closed
        </option>

        <option value="draft">
          Draft
        </option>
      </select>


      {/* Department */}

      <select
        defaultValue="all"
        className="border border-white/10 bg-[#111111] px-3 py-2 text-xs text-zinc-300 outline-none"
      >
        <option value="all">
          All Departments
        </option>

        <option value="engineering">
          Engineering
        </option>

        <option value="data">
          Data & AI
        </option>

        <option value="product">
          Product
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


export default JobFilters