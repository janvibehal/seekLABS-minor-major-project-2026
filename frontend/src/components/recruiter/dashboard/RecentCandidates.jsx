import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getRecruiterCandidates,
} from '../../../api/recruiterCandidate.api.js'


function RecentCandidates() {
  const navigate = useNavigate()

  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // ============================================================
  // LOAD CANDIDATES
  // ============================================================

  useEffect(() => {
    let cancelled = false

    const loadCandidates = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getRecruiterCandidates()

        if (cancelled) return

        // Show latest candidates
        setCandidates(
          Array.isArray(data)
            ? data.slice(0, 5)
            : [],
        )

      } catch (err) {
        console.error(
          'Failed to load recent candidates:',
          err,
        )

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            'Unable to load recent candidates.',
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
  // GET INITIALS
  // ============================================================

  const getInitials = (candidate) => {
    const firstName =
      candidate.firstName || ''

    const lastName =
      candidate.lastName || ''

    if (firstName || lastName) {
      return `${firstName[0] || ''}${lastName[0] || ''}`
        .toUpperCase()
    }

    if (candidate.name) {
      return candidate.name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }

    return 'C'
  }


  // ============================================================
  // GET CANDIDATE NAME
  // ============================================================

  const getCandidateName = (candidate) => {
    if (candidate.name) {
      return candidate.name
    }

    const fullName =
      `${candidate.firstName || ''} ${
        candidate.lastName || ''
      }`.trim()

    return fullName || 'Unknown Candidate'
  }


  // ============================================================
  // GET ROLE
  // ============================================================

  const getCandidateRole = (candidate) => {
    return (
      candidate.role ||
      candidate.jobTitle ||
      candidate.position ||
      candidate.appliedRole ||
      'Candidate'
    )
  }


  // ============================================================
  // GET SCORE
  // ============================================================

  const getCandidateScore = (candidate) => {
    return (
      candidate.overallScore ??
      candidate.averageScore ??
      candidate.score ??
      null
    )
  }


  // ============================================================
  // GET STATUS
  // ============================================================

  const getCandidateStatus = (candidate) => {
    return (
      candidate.status ||
      candidate.interviewStatus ||
      'New'
    )
  }


  return (
    <section className="border border-[#242424] bg-[#0d0d0d]">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between border-b border-[#242424] px-6 py-5">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Recruitment
          </p>

          <h2 className="mt-2 text-base font-semibold tracking-tight text-white">
            Recent Candidates
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Latest candidates in your recruitment pipeline.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate('/recruiter/candidates')
          }
          className="border border-[#2a2a2a] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition hover:border-zinc-600 hover:text-white"
        >
          View All
        </button>

      </div>


      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (

        <div className="flex min-h-[260px] items-center justify-center">

          <div className="flex flex-col items-center">

            <div className="h-6 w-6 animate-spin border-2 border-zinc-800 border-t-white" />

            <p className="mt-4 text-xs text-zinc-600">
              Loading candidates...
            </p>

          </div>

        </div>

      )}


      {/* =====================================================
          ERROR
      ====================================================== */}

      {!loading && error && (

        <div className="px-6 py-10">

          <p className="text-sm text-red-400">
            {error}
          </p>

        </div>

      )}


      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {!loading && !error && candidates.length === 0 && (

        <div className="py-16 text-center">

          <p className="text-sm font-medium text-zinc-400">
            No candidates yet
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            Candidates will appear here when they enter your
            recruitment pipeline.
          </p>

        </div>

      )}


      {/* =====================================================
          CANDIDATES
      ====================================================== */}

      {!loading && !error && candidates.length > 0 && (

        <div>

          {candidates.map((candidate, index) => {

            const score =
              getCandidateScore(candidate)

            const candidateName =
              getCandidateName(candidate)

            const role =
              getCandidateRole(candidate)

            const status =
              getCandidateStatus(candidate)

            return (

              <button
                key={
                  candidate.id ||
                  candidate.candidateId ||
                  index
                }
                type="button"
                onClick={() =>
                  navigate('/recruiter/candidates')
                }
                className="flex w-full items-center justify-between border-b border-[#1f1f1f] px-6 py-5 text-left transition last:border-b-0 hover:bg-[#111111]"
              >


                {/* LEFT */}

                <div className="flex min-w-0 items-center gap-4">


                  {/* INITIALS */}

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#303030] text-xs font-semibold text-zinc-300">

                    {getInitials(candidate)}

                  </div>


                  {/* INFORMATION */}

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-zinc-200">

                      {candidateName}

                    </p>

                    <p className="mt-1 truncate text-xs text-zinc-600">

                      {role}

                    </p>

                  </div>

                </div>


                {/* RIGHT */}

                <div className="ml-6 flex shrink-0 items-center gap-8">


                  {/* SCORE */}

                  <div className="hidden text-right sm:block">

                    <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
                      AI Score
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">

                      {score !== null
                        ? `${score}%`
                        : '—'}

                    </p>

                  </div>


                  {/* STATUS */}

                  <div className="text-right">

                    <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
                      Status
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">

                      {status}

                    </p>

                  </div>


                  {/* ARROW */}

                  <span className="text-zinc-600 transition group-hover:text-white">

                    →

                  </span>

                </div>

              </button>

            )
          })}

        </div>

      )}

    </section>
  )
}


export default RecentCandidates