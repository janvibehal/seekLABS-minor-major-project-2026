function InterviewFilters({
  filters = {
    search: '',
    status: 'all',
    job: 'all',
    date: 'all',
    score: 'all',
    sort: 'recent',
    type: 'all',
  },

  onFiltersChange = () => {},

  jobs = [],
}) {
  // ============================================================
  // UPDATE FILTER
  // ============================================================

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }


  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      job: 'all',
      date: 'all',
      score: 'all',
      sort: 'recent',
      type: 'all',
    })
  }


  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.job !== 'all' ||
    filters.date !== 'all' ||
    filters.score !== 'all' ||
    filters.sort !== 'recent' ||
    filters.type !== 'all'


  return (
    <div className="overflow-hidden border border-white/10 bg-[#111111]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-white/10 px-6 py-5">

        <div className="flex items-start justify-between gap-6">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Interview Filters
            </p>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Search and filter interviews by candidate,
              schedule, status, and evaluation score.
            </p>

          </div>


          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="
              shrink-0
              border
              border-white/10
              bg-transparent
              px-4
              py-2
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
              transition
              hover:border-white/30
              hover:bg-white/5
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            Clear All
          </button>

        </div>

      </div>


      {/* =====================================================
          MAIN FILTERS
      ===================================================== */}

      <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">


        {/* SEARCH */}

        <div className="xl:col-span-2">

          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Search
          </label>


          <div
            className="
              flex
              items-center
              border
              border-white/10
              bg-[#0a0a0a]
              px-4
              transition
              focus-within:border-white/30
            "
          >

            <SearchIcon />

            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                updateFilter(
                  'search',
                  event.target.value,
                )
              }
              placeholder="Search candidate, email, company, title..."
              className="
                ml-3
                w-full
                bg-transparent
                py-3.5
                text-xs
                text-slate-200
                outline-none
                placeholder:text-slate-600
              "
            />

          </div>

        </div>


        {/* STATUS */}

        <FilterSelect
          label="Interview Status"
          value={filters.status}
          onChange={(value) =>
            updateFilter('status', value)
          }
          options={[
            {
              value: 'all',
              label: 'All Status',
            },
            {
              value: 'SCHEDULED',
              label: 'Scheduled',
            },
            {
              value: 'IN_PROGRESS',
              label: 'In Progress',
            },
            {
              value: 'COMPLETED',
              label: 'Completed',
            },
            {
              value: 'EXPIRED',
              label: 'Expired',
            },
            {
              value: 'CANCELLED',
              label: 'Cancelled',
            },
          ]}
        />


        {/* INTERVIEW */}

        <FilterSelect
          label="Interview"
          value={filters.job}
          onChange={(value) =>
            updateFilter('job', value)
          }
          options={[
            {
              value: 'all',
              label: 'All Interviews',
            },

            ...jobs.map((job) => ({
              value: job.id,
              label: job.title,
            })),
          ]}
        />


        {/* DATE */}

        <FilterSelect
          label="Interview Date"
          value={filters.date}
          onChange={(value) =>
            updateFilter('date', value)
          }
          options={[
            {
              value: 'all',
              label: 'All Dates',
            },
            {
              value: 'today',
              label: 'Today',
            },
            {
              value: 'tomorrow',
              label: 'Tomorrow',
            },
            {
              value: 'week',
              label: 'This Week',
            },
            {
              value: 'past',
              label: 'Past Interviews',
            },
          ]}
        />


        {/* SCORE */}

        <FilterSelect
          label="Evaluation Score"
          value={filters.score}
          onChange={(value) =>
            updateFilter('score', value)
          }
          options={[
            {
              value: 'all',
              label: 'Any Score',
            },
            {
              value: '90',
              label: '90 – 100',
            },
            {
              value: '80',
              label: '80 – 89',
            },
            {
              value: '70',
              label: '70 – 79',
            },
            {
              value: '60',
              label: '60 – 69',
            },
            {
              value: 'below60',
              label: 'Below 60',
            },
            {
              value: 'pending',
              label: 'Not Evaluated',
            },
          ]}
        />

      </div>


      {/* =====================================================
          SECONDARY FILTERS
      ===================================================== */}

      <div className="border-t border-white/10 bg-[#0a0a0a] px-6 py-5">

        <div className="grid gap-5 md:grid-cols-2">


          {/* SORT */}

          <FilterSelect
            label="Sort By"
            value={filters.sort}
            onChange={(value) =>
              updateFilter('sort', value)
            }
            options={[
              {
                value: 'recent',
                label: 'Most Recently Created',
              },
              {
                value: 'scheduled-soon',
                label: 'Scheduled Soon',
              },
              {
                value: 'scheduled-late',
                label: 'Scheduled Later',
              },
              {
                value: 'score-high',
                label: 'Highest Score',
              },
              {
                value: 'score-low',
                label: 'Lowest Score',
              },
              {
                value: 'candidate',
                label: 'Candidate Name',
              },
            ]}
          />


          {/* INTERVIEW TYPE */}

          <FilterSelect
            label="Interview Type"
            value={filters.type || 'all'}
            onChange={(value) =>
              updateFilter('type', value)
            }
            options={[
              {
                value: 'all',
                label: 'All Types',
              },
              {
                value: 'Technical Interview',
                label: 'Technical Interview',
              },
              {
                value: 'Coding Interview',
                label: 'Coding Interview',
              },
              {
                value: 'DSA Interview',
                label: 'DSA Interview',
              },
              {
                value: 'LeetCode Easy Interview',
                label: 'LeetCode Easy Interview',
              },
            ]}
          />

        </div>

      </div>


      {/* =====================================================
          ACTIVE FILTERS
      ===================================================== */}

      <div className="border-t border-white/10 px-6 py-4">

        <div className="flex flex-wrap items-center gap-2">

          <span className="mr-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Active Filters
          </span>


          {!hasActiveFilters && (

            <span className="border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] font-medium text-slate-500">
              All Interviews
            </span>

          )}


          {/* SEARCH */}

          {filters.search && (

            <ActiveFilter
              label={`Search: ${filters.search}`}
              onRemove={() =>
                updateFilter('search', '')
              }
            />

          )}


          {/* STATUS */}

          {filters.status !== 'all' && (

            <ActiveFilter
              label={`Status: ${formatStatus(
                filters.status,
              )}`}
              onRemove={() =>
                updateFilter('status', 'all')
              }
            />

          )}


          {/* INTERVIEW */}

          {filters.job !== 'all' && (

            <ActiveFilter
              label={`Interview: ${
                jobs.find(
                  (job) => job.id === filters.job,
                )?.title || 'Selected Interview'
              }`}
              onRemove={() =>
                updateFilter('job', 'all')
              }
            />

          )}


          {/* DATE */}

          {filters.date !== 'all' && (

            <ActiveFilter
              label={`Date: ${formatDateFilter(
                filters.date,
              )}`}
              onRemove={() =>
                updateFilter('date', 'all')
              }
            />

          )}


          {/* SCORE */}

          {filters.score !== 'all' && (

            <ActiveFilter
              label={`Score: ${formatScoreFilter(
                filters.score,
              )}`}
              onRemove={() =>
                updateFilter('score', 'all')
              }
            />

          )}


          {/* TYPE */}

          {filters.type !== 'all' && (

            <ActiveFilter
              label={`Type: ${filters.type}`}
              onRemove={() =>
                updateFilter('type', 'all')
              }
            />

          )}


          {/* SORT */}

          {filters.sort !== 'recent' && (

            <ActiveFilter
              label={`Sort: ${formatSortFilter(
                filters.sort,
              )}`}
              onRemove={() =>
                updateFilter('sort', 'recent')
              }
            />

          )}

        </div>

      </div>

    </div>
  )
}


/* ============================================================
   FILTER SELECT
============================================================ */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="min-w-0">

      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>


      <div className="relative">

        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="
            w-full
            cursor-pointer
            appearance-none
            border
            border-white/10
            bg-[#0a0a0a]
            px-4
            py-3.5
            pr-10
            text-xs
            text-slate-300
            outline-none
            transition
            hover:border-white/20
            focus:border-white/35
          "
        >

          {options.map((option) => (

            <option
              key={option.value}
              value={option.value}
              className="bg-[#111111] text-slate-200"
            >
              {option.label}
            </option>

          ))}

        </select>


        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
          <ChevronDownIcon />
        </div>

      </div>

    </div>
  )
}


/* ============================================================
   ACTIVE FILTER
============================================================ */

function ActiveFilter({
  label,
  onRemove,
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="
        flex
        items-center
        gap-2
        border
        border-white/10
        bg-white/[0.03]
        px-3
        py-1.5
        text-[9px]
        font-medium
        text-slate-400
        transition
        hover:border-white/25
        hover:bg-white/[0.06]
        hover:text-white
      "
    >

      <span className="max-w-[200px] truncate">
        {label}
      </span>

      <span className="text-xs leading-none text-slate-600">
        ×
      </span>

    </button>
  )
}


/* ============================================================
   HELPERS
============================================================ */

function formatStatus(status) {
  return status
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(' ')
}


function formatDateFilter(date) {
  const labels = {
    today: 'Today',
    tomorrow: 'Tomorrow',
    week: 'This Week',
    past: 'Past Interviews',
  }

  return labels[date] || date
}


function formatScoreFilter(score) {
  const labels = {
    90: '90 – 100',
    80: '80 – 89',
    70: '70 – 79',
    60: '60 – 69',
    below60: 'Below 60',
    pending: 'Not Evaluated',
  }

  return labels[score] || score
}


function formatSortFilter(sort) {
  const labels = {
    recent: 'Most Recent',
    'scheduled-soon': 'Scheduled Soon',
    'scheduled-late': 'Scheduled Later',
    'score-high': 'Highest Score',
    'score-low': 'Lowest Score',
    candidate: 'Candidate Name',
  }

  return labels[sort] || sort
}


/* ============================================================
   ICONS
============================================================ */

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />

    </svg>
  )
}


function ChevronDownIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}


export default InterviewFilters