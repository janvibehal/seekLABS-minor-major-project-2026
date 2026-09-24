import { useEffect, useState } from 'react'

import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'

import StatsOverview from '../../components/recruiter/dashboard/StatsOverview'
import ActiveJobs from '../../components/recruiter/dashboard/ActiveJobs'
import HiringPipeline from '../../components/recruiter/dashboard/HiringPipeline'
import RecentCandidates from '../../components/recruiter/dashboard/RecentCandidates'

import * as recruiterInterviewApi from '../../api/interview.api.js'


function RecruiterDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [interviews, setInterviews] = useState([])

  const [dashboardData, setDashboardData] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    totalInterviews: 0,
    averageScore: 0,
  })


  useEffect(() => {
    let cancelled = false


    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')


        /* =====================================================
           FETCH ALL RECRUITER INTERVIEWS
        ====================================================== */

        const response =
          await recruiterInterviewApi.getRecruiterInterviews()


        if (cancelled) return


        /* =====================================================
           NORMALIZE API RESPONSE

           Supports both:

           []
           
           and

           {
             success: true,
             data: []
           }
        ====================================================== */

        const interviewList = Array.isArray(response)
          ? response
          : response?.data || []


        setInterviews(interviewList)


        /* =====================================================
           TOTAL INTERVIEWS
        ====================================================== */

        const totalInterviews =
          interviewList.length


        /* =====================================================
           TOTAL UNIQUE CANDIDATES

           Using Set prevents the same candidate from being
           counted multiple times.

           Example:

           Candidate A → 3 interviews
           Candidate B → 2 interviews
           Candidate C → 1 interview

           Total Candidates = 3
           Total Interviews = 6
        ====================================================== */

        const uniqueCandidateIds = new Set(
          interviewList
            .map((interview) => {

              // Adjusted to support multiple possible
              // backend structures

              return (
                interview.candidateId ||
                interview.candidate?.id ||
                interview.candidate?._id ||
                interview.session?.candidateId ||
                null
              )

            })
            .filter(Boolean),
        )


        const totalCandidates =
          uniqueCandidateIds.size


        /* =====================================================
           ACTIVE JOBS

           Count unique jobs represented in interviews.
        ====================================================== */

        const uniqueJobIds = new Set(
          interviewList
            .map((interview) => {

              return (
                interview.jobId ||
                interview.job?.id ||
                interview.job?._id ||
                interview.roleId ||
                interview.role?.id ||
                null
              )

            })
            .filter(Boolean),
        )


        const activeJobs =
          uniqueJobIds.size


        /* =====================================================
           AVERAGE SCORE

           Only include interviews that actually have scores.
        ====================================================== */

        const scores = interviewList
          .map((interview) => {

            if (
              typeof interview.overallScore === 'number'
            ) {
              return interview.overallScore
            }


            if (
              typeof interview.score === 'number'
            ) {
              return interview.score
            }


            if (
              typeof interview.result?.overallScore === 'number'
            ) {
              return interview.result.overallScore
            }


            if (
              typeof interview.interviewResult?.overallScore === 'number'
            ) {
              return interview.interviewResult.overallScore
            }


            return null

          })
          .filter(
            (score) =>
              score !== null &&
              score !== undefined,
          )


        const averageScore =
          scores.length > 0
            ? Math.round(
                scores.reduce(
                  (sum, score) => sum + score,
                  0,
                ) / scores.length,
              )
            : 0


        /* =====================================================
           UPDATE DASHBOARD
        ====================================================== */

        setDashboardData({
          totalCandidates,
          activeJobs,
          totalInterviews,
          averageScore,
        })


      } catch (err) {

        console.error(
          'Dashboard loading error:',
          err,
        )


        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
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


  return (
    <div className="min-h-screen bg-[#090909] text-white">

      <RecruiterSidebar />


      <div className="ml-64 flex min-h-screen flex-col">

        <RecruiterHeader />


        <main className="flex-1 px-6 py-8 lg:px-10">


          {/* PAGE HEADER */}

          <div className="mb-10 border-b border-zinc-800 pb-8">

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


          {/* ERROR */}

          {error && (

            <div className="mb-6 border border-red-950 bg-[#110909] px-5 py-4">

              <p className="text-sm text-red-400">
                {error}
              </p>

            </div>

          )}


          {/* STATS */}

          <StatsOverview
            stats={dashboardData}
            loading={loading}
          />


          {/* JOBS + PIPELINE */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">

            <ActiveJobs
              interviews={interviews}
              loading={loading}
            />

            <HiringPipeline
              interviews={interviews}
              loading={loading}
            />

          </div>


          {/* RECENT CANDIDATES */}

          <div className="mt-6">

            <RecentCandidates
              interviews={interviews}
              loading={loading}
            />

          </div>

        </main>

      </div>

    </div>
  )
}


export default RecruiterDashboard