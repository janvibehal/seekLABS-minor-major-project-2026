import { useEffect, useMemo, useState } from 'react'

import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'

import InterviewFilters from '../../components/recruiter/interviews/InterviewFilters'
import InterviewTable from '../../components/recruiter/interviews/InterviewTable'
import InterviewDetails from '../../components/recruiter/interviews/InterviewDetails'
import InterviewTimeline from '../../components/recruiter/interviews/InterviewTimeline'

import {
  getRecruiterInterviews,
} from '../../api/interview.api.js'


function RecruiterInterviews() {
  const [selectedInterview, setSelectedInterview] =
    useState(null)

  const [interviews, setInterviews] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)


  // ============================================================
  // FETCH INTERVIEWS FROM BACKEND
  // ============================================================

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getRecruiterInterviews()

      setInterviews(data || [])
    } catch (error) {
      console.error(
        'Failed to fetch interviews:',
        error,
      )

      setError(
        error.message ||
        'Failed to load interviews',
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchInterviews()
  }, [])


  // ============================================================
  // CALCULATE STATS FROM BACKEND DATA
  // ============================================================

  const stats = useMemo(() => {
    return {
      upcoming: interviews.filter(
        (interview) =>
          interview.status === 'SCHEDULED',
      ).length,

      inProgress: interviews.filter(
        (interview) =>
          interview.status === 'IN_PROGRESS',
      ).length,

      completed: interviews.filter(
        (interview) =>
          interview.status === 'COMPLETED',
      ).length,
    }
  }, [interviews])


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <RecruiterSidebar />


      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="ml-64 flex min-h-screen flex-col">

        <RecruiterHeader />


        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <main className="flex-1 px-6 py-7 lg:px-8 lg:py-8">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-6 xl:flex-row xl:items-end">


            {/* PAGE TITLE */}

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Recruitment
              </p>


              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
                Interviews
              </h1>


              <p className="mt-2 text-xs text-zinc-500">
                Schedule, manage, and monitor candidate interviews.
              </p>

            </div>


            {/* =================================================
                BACKEND CONNECTED STATS
            ================================================= */}

            {!loading && !error && (

              <div className="flex divide-x divide-white/10 border border-white/10">

                <MiniStat
                  label="Upcoming"
                  value={stats.upcoming}
                />

                <MiniStat
                  label="In Progress"
                  value={stats.inProgress}
                />

                <MiniStat
                  label="Completed"
                  value={stats.completed}
                />

              </div>

            )}

          </div>


          {/* =================================================
              LOADING PAGE STATE
          ================================================= */}

          {loading && (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-8 w-8 animate-spin border-2 border-zinc-700 border-t-white" />

                <p className="mt-4 text-xs text-zinc-500">
                  Loading interviews...
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              ERROR PAGE STATE
          ================================================= */}

          {!loading && error && (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <p className="text-sm font-semibold text-red-400">
                  Failed to load interviews
                </p>


                <p className="mt-2 text-xs text-zinc-500">
                  {error}
                </p>


                <button
                  type="button"
                  onClick={fetchInterviews}
                  className="
                    mt-5
                    border border-white/15
                    px-4 py-2
                    text-xs
                    font-medium
                    text-zinc-300
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  Try Again
                </button>

              </div>

            </div>

          )}


          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          {!loading && !error && (

            <>

              {/* =============================================
                  TIMELINE
              ============================================== */}

              <div className="mt-7">

                <InterviewTimeline
                  interviews={interviews}
                />

              </div>


              {/* =============================================
                  FILTERS
              ============================================== */}

              <div className="mt-6">

                <InterviewFilters
                  interviews={interviews}
                />

              </div>


              {/* =============================================
                  TABLE
              ============================================== */}

              <div className="mt-5">

                <InterviewTable
                  interviews={interviews}
                  onInterviewSelect={
                    setSelectedInterview
                  }
                  onRefresh={fetchInterviews}
                />

              </div>

            </>

          )}

        </main>

      </div>


      {/* =====================================================
          INTERVIEW DETAILS
      ===================================================== */}

      {selectedInterview && (

        <InterviewDetails
          interviewId={selectedInterview}
          onClose={() =>
            setSelectedInterview(null)
          }
        />

      )}

    </div>
  )
}


/* ============================================================
   MINI STAT
============================================================ */

function MiniStat({
  label,
  value,
}) {
  return (
    <div className="min-w-[115px] px-5 py-4 text-right">

      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>


      <p className="mt-2 text-lg font-semibold tracking-tight text-zinc-100">
        {value}
      </p>

    </div>
  )
}


export default RecruiterInterviews