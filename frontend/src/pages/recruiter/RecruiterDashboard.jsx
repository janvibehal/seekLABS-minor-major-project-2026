import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'

import StatsOverview from '../../components/recruiter/dashboard/StatsOverview'
import ActiveJobs from '../../components/recruiter/dashboard/ActiveJobs'
import HiringPipeline from '../../components/recruiter/dashboard/HiringPipeline'
import RecentCandidates from '../../components/recruiter/dashboard/RecentCandidates'

import * as recruiterInterviewApi from '../../api/interview.api.js'


const ACTIVE_STATUSES = new Set([
  'SCHEDULED',
  'IN_PROGRESS',
])


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


/*
 * One recruiter interview is created per candidate.
 *
 * Example:
 *
 * Backend Engineer | 10 Oct | Candidate A
 * Backend Engineer | 10 Oct | Candidate B
 * Backend Engineer | 10 Oct | Candidate C
 *
 * These should appear as ONE interview on the
 * dashboard with "3 candidates".
 */
const getInterviewGroupKey = (interview) => {
  const scheduledAt = interview?.scheduledAt
    ? new Date(
        interview.scheduledAt,
      ).getTime()
    : ''

  return [
    interview?.title || '',
    interview?.company || '',
    scheduledAt,
  ].join('|')
}


const getDistinctInterviews = (
  interviews,
) => {
  const groups = new Map()

  interviews.forEach((interview) => {
    const key =
      getInterviewGroupKey(interview)

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        id: interview.id,
        title:
          interview.title ||
          'Untitled Interview',
        company:
          interview.company || '',
        type:
          interview.type ||
          'Technical Interview',
        scheduledAt:
          interview.scheduledAt || null,
        duration:
          interview.duration || null,
        status:
          interview.status || null,
        questionCount:
          interview.questionCount || 0,
        candidates: [],
      })
    }

    const group = groups.get(key)

    if (interview.candidate) {
      group.candidates.push(
        interview.candidate,
      )
    }

    /*
     * If one of the records is IN_PROGRESS,
     * the whole interview group is considered
     * in progress.
     */
    if (
      interview.status ===
      'IN_PROGRESS'
    ) {
      group.status = 'IN_PROGRESS'
    }
  })

  return Array.from(
    groups.values(),
  ).map((group) => ({
    ...group,
    candidateCount:
      group.candidates.length,
  }))
}


const getInterviewScore = (
  interview,
) => {
  if (
    typeof interview?.score ===
    'number'
  ) {
    return interview.score
  }

  if (
    typeof interview?.overallScore ===
    'number'
  ) {
    return interview.overallScore
  }

  if (
    typeof interview?.evaluation
      ?.overallScore === 'number'
  ) {
    return interview.evaluation
      .overallScore
  }

  if (
    typeof interview?.result
      ?.overallScore === 'number'
  ) {
    return interview.result
      .overallScore
  }

  return null
}


function RecruiterDashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [interviews, setInterviews] =
    useState([])


  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
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
          'Dashboard loading error:',
          err,
        )

        if (!cancelled) {
          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              'Unable to load dashboard.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])


  /*
   * Group candidate-specific interview
   * records into distinct interviews.
   */
  const distinctInterviews =
    useMemo(
      () =>
        getDistinctInterviews(
          interviews,
        ),
      [interviews],
    )


  /*
   * Only active DISTINCT interviews.
   */
  const activeInterviews =
    useMemo(
      () =>
        distinctInterviews.filter(
          (interview) =>
            ACTIVE_STATUSES.has(
              interview.status,
            ),
        ),
      [distinctInterviews],
    )


  /*
   * Distinct candidates.
   */
  const totalCandidates =
    useMemo(() => {
      const candidateIds =
        new Set()

      interviews.forEach(
        (interview) => {
          const candidateId =
            interview?.candidate?.id

          if (candidateId) {
            candidateIds.add(
              candidateId,
            )
          }
        },
      )

      return candidateIds.size
    }, [interviews])


  /*
   * Distinct completed interviews.
   *
   * 5 candidates assigned to the same
   * interview = 1 conducted interview.
   */
  const totalInterviewsConducted =
    useMemo(
      () =>
        distinctInterviews.filter(
          (interview) =>
            interview.status ===
            'COMPLETED',
        ).length,
      [distinctInterviews],
    )


  /*
   * Average score is calculated from
   * completed candidate interviews.
   *
   * Existing StatsOverview structure
   * remains untouched.
   */
  const averageScore =
    useMemo(() => {
      const scores =
        interviews
          .filter(
            (interview) =>
              interview.status ===
              'COMPLETED',
          )
          .map(
            getInterviewScore,
          )
          .filter(
            (score) =>
              score !== null &&
              score !== undefined,
          )

      if (!scores.length) {
        return 0
      }

      return Math.round(
        scores.reduce(
          (sum, score) =>
            sum + score,
          0,
        ) / scores.length,
      )
    }, [interviews])


  /*
   * IMPORTANT:
   * Keep the existing StatsOverview
   * props/structure intact.
   */
  const dashboardData = {
    totalCandidates,

    activeJobs:
      activeInterviews.length,

    totalInterviews:
      totalInterviewsConducted,

    averageScore,
  }


  return (
    <div className="min-h-screen bg-[#090909] text-white">

      <RecruiterSidebar />

      <div className="ml-64 flex min-h-screen flex-col">

        <RecruiterHeader />

        <main className="flex-1 px-6 py-8 lg:px-10">

          {/* HEADER */}
          <div className="mb-10 flex items-end justify-between border-b border-zinc-800 pb-8">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                Overview
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Monitor your recruitment activity and hiring performance.
              </p>
            </div>


            {/* CREATE INTERVIEW CTA
                Dashboard CTA now redirects
                to the Interviews page. */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/recruiter/interviews',
                )
              }
              className="inline-flex items-center gap-2 border border-zinc-700 bg-[#151515] px-4 py-2.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-white hover:text-black"
            >
              Create Interview →
            </button>

          </div>


          {error && (
            <div className="mb-6 border border-red-950 bg-[#110909] px-5 py-4">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}


          {/* EXISTING STATS
              DO NOT CHANGE StatsOverview.jsx */}
          <StatsOverview
            stats={dashboardData}
            loading={loading}
          />


          {/* EXISTING DASHBOARD SECTIONS
              HiringPipeline is untouched. */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">

            <ActiveJobs
              interviews={
                activeInterviews
              }
              loading={loading}
            />

            <HiringPipeline
              interviews={
                interviews
              }
              loading={loading}
            />

          </div>

          {/* EXISTING RECENT CANDIDATES */}
          <div className="mt-6">
            <RecentCandidates
              interviews={
                interviews
              }
              loading={loading}
            />
          </div>

        </main>
      </div>
    </div>
  )
}


/*
 * Dashboard Interview Activity
 *
 * Shows the DISTINCT number of completed
 * interview sessions.
 */


function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}


export default RecruiterDashboard