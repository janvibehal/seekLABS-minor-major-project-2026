import { useEffect, useMemo, useState } from 'react'

import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'

import CandidateFilters from '../../components/recruiter/candidates/CandidateFilters'
import CandidateTable from '../../components/recruiter/candidates/CandidateTable'
import CandidateDetails from '../../components/recruiter/candidates/CandidateDetails'

import {
  getRecruiterCandidates,
  getRecruiterCandidateById,
} from '../../api/recruiterCandidate.api.js'


// ============================================================
// STATUS LABELS
//
// The schema only tracks each interview's real execution
// status (InterviewStatus), not a separate hiring decision
// like "Shortlisted"/"Rejected" — there's no field for that
// yet. So the table's Status column reflects the interview's
// actual status, just presented as a friendly label.
// ============================================================

const STATUS_LABELS = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
}


const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}


function RecruiterCandidates() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [candidates, setCandidates] = useState([])

  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [loadingCandidate, setLoadingCandidate] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    job: '',
    status: '',
    score: '',
  })


  // ============================================================
  // LOAD ALL CANDIDATES
  // ============================================================

  useEffect(() => {
    let cancelled = false

    const loadCandidates = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getRecruiterCandidates()

        if (cancelled) return

        setCandidates(
          Array.isArray(data)
            ? data
            : [],
        )

      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            'Unable to load candidates.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCandidates()

    return () => {
      cancelled = true
    }
  }, [])


  // ============================================================
  // NORMALIZE CANDIDATES FOR THE TABLE
  //
  // getRecruiterCandidates() returns { name, email, latestScore,
  // averageScore, latestInterview: { title, status, scheduledAt } }.
  // CandidateRow expects a flatter { score, job, date, interview,
  // status, initials } shape — this is the single place that
  // bridges the two, so the table always shows real data.
  // ============================================================

  const normalizedCandidates = useMemo(() => {
    return candidates.map((candidate) => {

      const latestInterview =
        candidate.latestInterview || null

      const statusLabel =
        STATUS_LABELS[latestInterview?.status] ||
        'Not started'

      const score =
        candidate.latestScore ??
        null

      return {
        ...candidate,

        name: candidate.name || 'Unknown Candidate',

        initials: getInitials(
          candidate.name || candidate.email || '',
        ),

        job: latestInterview?.title || 'No interview yet',

        date: latestInterview?.scheduledAt
          ? new Date(
              latestInterview.scheduledAt,
            ).toLocaleDateString()
          : '—',

        score,

        interview: statusLabel,

        status: statusLabel,
      }
    })
  }, [candidates])


  // ============================================================
  // FILTER OPTIONS (derived from real data)
  // ============================================================

  const jobOptions = useMemo(() => {
    const titles = new Set(
      normalizedCandidates
        .map((candidate) => candidate.job)
        .filter(
          (job) => job && job !== 'No interview yet',
        ),
    )

    return Array.from(titles).sort()
  }, [normalizedCandidates])


  // ============================================================
  // FILTER CANDIDATES
  // ============================================================

  const filteredCandidates = useMemo(() => {
    const searchTerm = filters.search
      .trim()
      .toLowerCase()

    return normalizedCandidates.filter((candidate) => {

      const email =
        candidate.email?.toLowerCase() ||
        ''

      const name =
        candidate.name?.toLowerCase() ||
        ''


      // Search by name or email

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        email.includes(searchTerm)


      // Job

      const matchesJob =
        !filters.job ||
        candidate.job === filters.job


      // Status

      const matchesStatus =
        !filters.status ||
        candidate.status === filters.status


      // Score bucket

      const matchesScore = (() => {
        if (!filters.score) return true

        if (
          candidate.score === null ||
          candidate.score === undefined
        ) {
          return false
        }

        if (filters.score === '90+') {
          return candidate.score >= 90
        }

        if (filters.score === '80+') {
          return candidate.score >= 80
        }

        if (filters.score === '70+') {
          return candidate.score >= 70
        }

        if (filters.score === 'below70') {
          return candidate.score < 70
        }

        return true
      })()


      return (
        matchesSearch &&
        matchesJob &&
        matchesStatus &&
        matchesScore
      )
    })

  }, [normalizedCandidates, filters])


  // ============================================================
  // OPEN CANDIDATE DETAILS
  // ============================================================

  const handleCandidateSelect = async (candidate) => {

    const candidateId =
      candidate.candidateId ||
      candidate.id ||
      candidate.userId

    if (!candidateId) {
      setError(
        'Unable to identify this candidate.',
      )

      return
    }


    try {
      setLoadingCandidate(true)
      setError('')

      const candidateDetail =
        await getRecruiterCandidateById(
          candidateId,
        )

      setSelectedCandidate(
        candidateDetail,
      )

    } catch (err) {

      console.error(
        'Failed to load candidate details:',
        err,
      )

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load candidate details.',
      )

    } finally {
      setLoadingCandidate(false)
    }
  }


  // ============================================================
  // CLOSE CANDIDATE DETAILS
  // ============================================================

  const handleCloseDetails = () => {
    setSelectedCandidate(null)
  }


  // ============================================================
  // RETRY
  // ============================================================

  const handleRetry = async () => {
    try {
      setLoading(true)
      setError('')

      const data =
        await getRecruiterCandidates()

      setCandidates(
        Array.isArray(data)
          ? data
          : [],
      )

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load candidates.',
      )

    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <RecruiterSidebar />


      {/* =====================================================
          MAIN APPLICATION
      ====================================================== */}

      <div className="ml-64 flex min-h-screen flex-col">

        <RecruiterHeader />


        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <main className="flex-1 px-6 py-8 lg:px-10">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#242424] pb-8 md:flex-row md:items-end">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Recruitment
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Candidates
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Review candidate profiles, interview activity,
                and AI evaluation results.
              </p>

            </div>


            {/* TOTAL CANDIDATES */}

            <div className="border-l border-[#2a2a2a] pl-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                Total Candidates
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">

                {loading
                  ? '—'
                  : candidates.length}

              </p>

            </div>

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
                onClick={handleRetry}
                className="border border-[#4a2a2a] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-[#211111]"
              >
                Retry
              </button>

            </div>

          )}


          {/* =================================================
              FILTERS
          ================================================= */}

          {!loading && !error && (

            <div className="border-b border-[#242424] pb-6">

              <CandidateFilters
                filters={filters}
                onFilterChange={setFilters}
                jobOptions={jobOptions}
              />

            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="flex min-h-[400px] items-center justify-center">

              <div className="flex flex-col items-center">

                <div className="h-7 w-7 animate-spin border-2 border-zinc-800 border-t-white" />

                <p className="mt-4 text-xs text-zinc-600">
                  Loading candidates...
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              CANDIDATE TABLE
          ================================================= */}

          {!loading && !error && (

            <div className="mt-6">

              {filteredCandidates.length > 0 ? (

                <CandidateTable
                  candidates={filteredCandidates}
                  onCandidateSelect={
                    handleCandidateSelect
                  }
                />

              ) : (

                <div className="border border-[#242424] py-20 text-center">

                  <p className="text-sm font-medium text-zinc-300">
                    No candidates found
                  </p>

                  <p className="mt-2 text-xs text-zinc-600">
                    Try adjusting your search or filters.
                  </p>

                </div>

              )}

            </div>

          )}

        </main>

      </div>


      {/* =====================================================
          CANDIDATE DETAIL LOADING
      ====================================================== */}

      {loadingCandidate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">

          <div className="border border-[#292929] bg-[#111111] px-8 py-6">

            <div className="flex items-center gap-3">

              <div className="h-5 w-5 animate-spin border-2 border-zinc-700 border-t-white" />

              <p className="text-sm text-zinc-400">
                Loading candidate profile...
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          CANDIDATE DETAILS
      ====================================================== */}

      {selectedCandidate && !loadingCandidate && (

        <CandidateDetails
          candidate={selectedCandidate}
          onClose={handleCloseDetails}
        />

      )}

    </div>
  )
}


export default RecruiterCandidates