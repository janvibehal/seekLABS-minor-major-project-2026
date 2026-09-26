import { useEffect, useMemo, useState } from 'react'

import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'

import InterviewTable from '../../components/recruiter/interviews/InterviewTable'

import * as recruiterInterviewApi from '../../api/interview.api.js'


// ============================================================
// RESPONSE NORMALIZER
// ============================================================

const extractInterviewList = (response) => {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data
  }

  if (Array.isArray(response?.interviews)) {
    return response.interviews
  }

  if (Array.isArray(response?.data?.interviews)) {
    return response.data.interviews
  }

  return []
}


// ============================================================
// INTERVIEW GROUPING
//
// Multiple candidates selected for one interview create
// separate Interview records with the same title/company/time.
//
// This key lets the summary cards treat those records as
// ONE distinct interview while the table still shows every
// individual candidate.
// ============================================================

const getInterviewGroupKey = (interview) => {
  const title =
    interview?.title?.trim() ||
    'Untitled Interview'

  const scheduledAt =
    interview?.scheduledAt
      ? new Date(
          interview.scheduledAt,
        ).getTime()
      : 'unscheduled'

  const company =
    interview?.company?.trim() ||
    ''

  return [
    title,
    company,
    scheduledAt,
  ].join('::')
}


// ============================================================
// DISTINCT INTERVIEW GROUPS
// ============================================================

const getDistinctInterviewGroups = (
  interviews,
) => {
  const groups = new Map()

  interviews.forEach((interview) => {
    const key =
      getInterviewGroupKey(
        interview,
      )

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title:
          interview?.title ||
          'Untitled Interview',
        company:
          interview?.company ||
          '',
        scheduledAt:
          interview?.scheduledAt ||
          null,
        status:
          interview?.status ||
          null,
      })
    }

    const group = groups.get(key)

    /*
     * If any candidate record for the
     * interview is currently in progress,
     * show the group as in progress.
     */
    if (
      interview?.status ===
      'IN_PROGRESS'
    ) {
      group.status =
        'IN_PROGRESS'
    }
  })

  return Array.from(
    groups.values(),
  )
}


// ============================================================
// RECRUITER INTERVIEWS
// ============================================================

function RecruiterInterviews() {
  const [interviews, setInterviews] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [refreshKey, setRefreshKey] =
    useState(0)

  const [selectedInterview, setSelectedInterview] =
    useState('')

  const [selectedCompany, setSelectedCompany] =
    useState('')


  // ==========================================================
  // FETCH INTERVIEWS
  // ==========================================================

  useEffect(() => {
    let cancelled = false

    const loadInterviews = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await recruiterInterviewApi.getRecruiterInterviews()

        if (cancelled) {
          return
        }

        const interviewList =
          extractInterviewList(
            response,
          )

        setInterviews(
          interviewList,
        )
      } catch (err) {
        console.error(
          'Recruiter interviews loading error:',
          err,
        )

        if (!cancelled) {
          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              'Unable to load interviews.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInterviews()

    return () => {
      cancelled = true
    }
  }, [refreshKey])


  // ==========================================================
  // AVAILABLE INTERVIEW NAMES
  // ==========================================================

  const interviewOptions = useMemo(() => {
    const names = new Set()

    interviews.forEach(
      (interview) => {
        const title =
          interview?.title?.trim()

        if (title) {
          names.add(title)
        }
      },
    )

    return Array.from(
      names,
    ).sort((a, b) =>
      a.localeCompare(b),
    )
  }, [interviews])


  // ==========================================================
  // AVAILABLE COMPANIES
  // ==========================================================

  const companyOptions = useMemo(() => {
    const companies = new Set()

    interviews.forEach(
      (interview) => {
        const company =
          interview?.company?.trim()

        if (company) {
          companies.add(company)
        }
      },
    )

    return Array.from(
      companies,
    ).sort((a, b) =>
      a.localeCompare(b),
    )
  }, [interviews])


  // ==========================================================
  // FILTER INTERVIEWS
  //
  // IMPORTANT:
  // We filter the individual candidate records here.
  //
  // Therefore:
  //
  // Backend Engineer
  //   Candidate A
  //   Candidate B
  //   Candidate C
  //
  // selecting "Backend Engineer" shows A, B and C.
  // ==========================================================

  const filteredInterviews =
    useMemo(() => {
      return interviews.filter(
        (interview) => {
          const title =
            interview?.title?.trim() ||
            ''

          const company =
            interview?.company?.trim() ||
            ''

          const matchesInterview =
            !selectedInterview ||
            title ===
              selectedInterview

          const matchesCompany =
            !selectedCompany ||
            company ===
              selectedCompany

          return (
            matchesInterview &&
            matchesCompany
          )
        },
      )
    }, [
      interviews,
      selectedInterview,
      selectedCompany,
    ])


  // ==========================================================
  // DISTINCT SUMMARY GROUPS
  // ==========================================================

  const distinctInterviews =
    useMemo(
      () =>
        getDistinctInterviewGroups(
          interviews,
        ),
      [interviews],
    )


  // ==========================================================
  // SUMMARY COUNTS
  //
  // No total-interviews card.
  // ==========================================================

  const summary = useMemo(() => {
    return {
      scheduled:
        distinctInterviews.filter(
          (interview) =>
            interview.status ===
            'SCHEDULED',
        ).length,

      inProgress:
        distinctInterviews.filter(
          (interview) =>
            interview.status ===
            'IN_PROGRESS',
        ).length,

      completed:
        distinctInterviews.filter(
          (interview) =>
            interview.status ===
            'COMPLETED',
        ).length,

      expired:
        distinctInterviews.filter(
          (interview) =>
            interview.status ===
            'EXPIRED',
        ).length,
    }
  }, [distinctInterviews])


  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSelectedInterview('')
    setSelectedCompany('')
  }


  // ==========================================================
  // INTERVIEW SELECT
  // ==========================================================

  const handleInterviewSelect = (
    interview,
  ) => {
    console.log(
      'Selected recruiter interview:',
      interview,
    )
  }


  // ==========================================================
  // REFRESH AFTER CREATE
  // ==========================================================

  const handleInterviewCreated = () => {
    setRefreshKey(
      (value) => value + 1,
    )
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <RecruiterSidebar />


      {/* ====================================================
          MAIN APPLICATION
      ==================================================== */}

      <div className="ml-64 flex min-h-screen flex-col">

        <RecruiterHeader />


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main className="flex-1 px-6 py-8 lg:px-10">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-8 border-b border-[#242424] pb-8">

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Recruitment Management
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Interviews
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Manage and monitor candidate interviews,
              schedules, progress, and evaluations.
            </p>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-center justify-between border border-[#3a1f1f] bg-[#160d0d] px-5 py-4">

              <p className="text-sm text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setRefreshKey(
                    (value) =>
                      value + 1,
                  )
                }
                className="text-xs font-semibold text-zinc-300 transition hover:text-white"
              >
                Retry
              </button>

            </div>
          )}


          {/* =================================================
              STATUS SUMMARY
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              label="Scheduled"
              value={
                loading
                  ? '—'
                  : summary.scheduled
              }
              description="Upcoming interviews"
              type="scheduled"
            />

            <SummaryCard
              label="In Progress"
              value={
                loading
                  ? '—'
                  : summary.inProgress
              }
              description="Currently running"
              type="progress"
            />

            <SummaryCard
              label="Completed"
              value={
                loading
                  ? '—'
                  : summary.completed
              }
              description="Finished interviews"
              type="completed"
            />

            <SummaryCard
              label="Expired"
              value={
                loading
                  ? '—'
                  : summary.expired
              }
              description="Expired interviews"
              type="expired"
            />

          </div>


          {/* =================================================
              SEARCH / FILTERS
          ================================================= */}

          <div className="mb-5 border border-white/10 bg-[#111111] p-4">

            <div className="mb-3 flex items-center gap-2">

              <SearchIcon />

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Search Interviews
              </p>

            </div>


            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">

              {/* INTERVIEW NAME */}
              <div className="relative">

                <select
                  value={selectedInterview}
                  onChange={(event) =>
                    setSelectedInterview(
                      event.target.value,
                    )
                  }
                  className="w-full appearance-none border border-white/10 bg-[#151515] px-3 py-3 pr-9 text-xs text-zinc-300 outline-none transition focus:border-white/20"
                >

                  <option value="">
                    All Interview Names
                  </option>

                  {interviewOptions.map(
                    (title) => (
                      <option
                        key={title}
                        value={title}
                      >
                        {title}
                      </option>
                    ),
                  )}

                </select>

                <SelectArrow />

              </div>


              {/* COMPANY */}
              <div className="relative">

                <select
                  value={selectedCompany}
                  onChange={(event) =>
                    setSelectedCompany(
                      event.target.value,
                    )
                  }
                  className="w-full appearance-none border border-white/10 bg-[#151515] px-3 py-3 pr-9 text-xs text-zinc-300 outline-none transition focus:border-white/20"
                >

                  <option value="">
                    All Companies
                  </option>

                  {companyOptions.map(
                    (company) => (
                      <option
                        key={company}
                        value={company}
                      >
                        {company}
                      </option>
                    ),
                  )}

                </select>

                <SelectArrow />

              </div>


              {/* CLEAR */}
              {(selectedInterview ||
                selectedCompany) && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="border border-white/10 px-4 py-3 text-xs font-medium text-zinc-500 transition hover:border-white/20 hover:text-zinc-200"
                >
                  Clear
                </button>
              )}

            </div>


            {/* ACTIVE FILTER RESULT */}
            {(selectedInterview ||
              selectedCompany) && (
              <div className="mt-3 flex items-center gap-2">

                <span className="text-[10px] text-zinc-600">
                  Showing
                </span>

                <span className="text-[10px] font-semibold text-zinc-300">
                  {filteredInterviews.length}
                </span>

                <span className="text-[10px] text-zinc-600">
                  candidate interview record
                  {filteredInterviews.length ===
                  1
                    ? ''
                    : 's'}
                </span>

              </div>
            )}

          </div>


          {/* =================================================
              INTERVIEW TABLE
          ================================================= */}

          <div className="border border-white/10 bg-[#111111]">

            <InterviewTable
              interviews={
                filteredInterviews
              }
              loading={loading}
              error={error}
              onInterviewSelect={
                handleInterviewSelect
              }
              onInterviewCreated={
                handleInterviewCreated
              }
            />

          </div>

        </main>

      </div>

    </div>
  )
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  description,
  type,
}) {
  const styles = {
    scheduled: {
      border:
        'border-blue-400/15',
      label:
        'text-blue-400',
    },

    progress: {
      border:
        'border-amber-400/15',
      label:
        'text-amber-400',
    },

    completed: {
      border:
        'border-emerald-400/15',
      label:
        'text-emerald-400',
    },

    expired: {
      border:
        'border-red-400/15',
      label:
        'text-red-400',
    },
  }

  const style =
    styles[type] ||
    styles.scheduled

  return (
    <div
      className={`border bg-[#111111] px-5 py-4 ${style.border}`}
    >

      <p
        className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${style.label}`}
      >
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-zinc-600">
        {description}
      </p>

    </div>
  )
}


// ============================================================
// SEARCH ICON
// ============================================================

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 text-zinc-600"
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


// ============================================================
// SELECT ARROW
// ============================================================

function SelectArrow() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}


export default RecruiterInterviews