import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CandidateLayout from '../../components/layout/CandidateLayout'
import * as candidateApi from '../../api/candidate.api.js'

const DIMENSION_META = {
  algorithmCorrectness: {
    name: 'Algorithmic Correctness',
    description: 'Correctness and completeness of your algorithm.',
  },
  logicalReasoning: {
    name: 'Reasoning & Approach',
    description: 'Clarity and quality of your problem-solving approach.',
  },
  conceptCoverage: {
    name: 'Concept Coverage',
    description: 'Breadth of relevant concepts covered in your explanation.',
  },
  completeness: {
    name: 'Completeness',
    description: 'How thoroughly you worked through the interview.',
  },
  dataStructure: {
    name: 'Data Structure Selection',
    description: 'Appropriateness of the selected data structures.',
  },
  complexity: {
    name: 'Time & Space Complexity',
    description: 'Understanding and optimization of complexity.',
  },
  edgeCases: {
    name: 'Edge Case Handling',
    description: 'Ability to identify and handle important edge cases.',
  },
}

const levelForScore = (score) => {
  if (score >= 80) return 'Strong'
  if (score >= 65) return 'Good'
  return 'Needs Practice'
}

function CandidateResults() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [latestDetail, setLatestDetail] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const resultsList = await candidateApi.listResults()

        if (cancelled) return

        setResults(Array.isArray(resultsList) ? resultsList : [])

        if (resultsList?.length > 0) {
          const detail = await candidateApi.getResultDetail(
            resultsList[0].interviewId
          )

          if (!cancelled) {
            setLatestDetail(detail)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load your results.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <CandidateLayout>
        <div className="flex h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />

            <p className="text-sm text-slate-500">
              Loading your performance...
            </p>
          </div>
        </div>
      </CandidateLayout>
    )
  }

  if (error) {
    return (
      <CandidateLayout>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              !
            </div>

            <div>
              <p className="font-semibold text-red-400">
                Unable to load results
              </p>

              <p className="mt-1 text-sm text-red-300/70">
                {error}
              </p>
            </div>
          </div>
        </div>
      </CandidateLayout>
    )
  }

  if (results.length === 0) {
    return (
      <CandidateLayout>
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">

          <div className="w-full rounded-3xl border border-white/[0.08] bg-[#111827] p-10 text-center shadow-2xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <ChartIcon />
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Performance
            </p>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
              No results yet
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Complete an interview and your AI-powered performance
              analysis will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate('/candidate/interviews')}
              className="mt-7 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20"
            >
              View Interviews
              <span className="ml-2">→</span>
            </button>

          </div>

        </div>
      </CandidateLayout>
    )
  }

  const dimensionEntries = latestDetail?.dimensions
    ? Object.entries(latestDetail.dimensions)
    : []

  const strongest = dimensionEntries.length
    ? dimensionEntries.reduce((a, b) => (b[1] > a[1] ? b : a))
    : null

  const weakest = dimensionEntries.length
    ? dimensionEntries.reduce((a, b) => (b[1] < a[1] ? b : a))
    : null

  const previousScores = results
    .slice(1)
    .map((result) => result.overallScore)

  const previousAverage = previousScores.length
    ? Math.round(
        previousScores.reduce((a, b) => a + b, 0) /
          previousScores.length
      )
    : null

  const currentScore = results[0]?.overallScore || 0

  return (
    <CandidateLayout>

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">

        <div>

          <div className="flex items-center gap-2">

            <div className="h-2 w-2 rounded-full bg-violet-400 shadow-lg shadow-violet-500/60" />

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              Performance Analytics
            </p>

          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white lg:text-4xl">
            Interview Results
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Track your interview performance, discover your strengths,
            and identify the skills that need more practice.
          </p>

        </div>

        <button
          type="button"
          onClick={() => navigate('/candidate/preparation')}
          className="group flex w-fit items-center gap-3 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20"
        >
          Improve Your Skills

          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>

      </div>


      {/* =====================================================
          PERFORMANCE CARDS
      ====================================================== */}

      <div className="grid gap-5 xl:grid-cols-3">

        {/* OVERALL PERFORMANCE */}

        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827] p-7 transition hover:border-violet-500/30 hover:bg-[#131c2d]">

          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-500/[0.05] blur-3xl" />

          <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Overall Performance
          </p>

          <div className="relative mt-7 flex items-center gap-6">

            <ScoreCircle score={currentScore} />

            <div>

              <p className="text-xl font-bold text-white">
                {levelForScore(currentScore)}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Based on your most recent completed interview.
              </p>

            </div>

          </div>

          <div className="relative mt-7 border-t border-white/[0.06] pt-5">

            {previousAverage !== null ? (
              <div className="space-y-3">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    Previous average
                  </span>

                  <span className="text-sm font-semibold text-slate-300">
                    {previousAverage}%
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    Current score
                  </span>

                  <span
                    className={`text-sm font-semibold ${
                      currentScore >= previousAverage
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {currentScore}%
                    {currentScore >= previousAverage ? ' ↑' : ' ↓'}
                  </span>

                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Complete more interviews to unlock performance trends.
              </p>
            )}

          </div>

        </div>


        {/* STRONGEST AREA */}

        <div className="group rounded-2xl border border-white/[0.08] bg-[#111827] p-7 transition hover:border-emerald-500/30 hover:bg-[#131c2d]">

          <div className="flex items-start justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <StrengthIcon />
            </div>

            <span className="rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Best Skill
            </span>

          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Strongest Area
          </p>

          <h3 className="mt-3 text-xl font-bold text-white">
            {strongest
              ? DIMENSION_META[strongest[0]]?.name || strongest[0]
              : '—'}
          </h3>

          <div className="mt-5 flex items-end gap-2">

            <p className="text-4xl font-bold text-emerald-400">
              {strongest ? `${strongest[1]}` : '—'}
            </p>

            <span className="mb-1 text-sm text-emerald-400/70">
              %
            </span>

          </div>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {strongest
              ? DIMENSION_META[strongest[0]]?.description
              : ''}
          </p>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-700"
              style={{
                width: `${strongest ? strongest[1] : 0}%`,
              }}
            />

          </div>

        </div>


        {/* FOCUS AREA */}

        <div className="group rounded-2xl border border-white/[0.08] bg-[#111827] p-7 transition hover:border-amber-500/30 hover:bg-[#131c2d]">

          <div className="flex items-start justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <ImproveIcon />
            </div>

            <span className="rounded-full border border-amber-500/15 bg-amber-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              Focus Next
            </span>

          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Improvement Area
          </p>

          <h3 className="mt-3 text-xl font-bold text-white">
            {weakest
              ? DIMENSION_META[weakest[0]]?.name || weakest[0]
              : '—'}
          </h3>

          <div className="mt-5 flex items-end gap-2">

            <p className="text-4xl font-bold text-amber-400">
              {weakest ? `${weakest[1]}` : '—'}
            </p>

            <span className="mb-1 text-sm text-amber-400/70">
              %
            </span>

          </div>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {weakest
              ? DIMENSION_META[weakest[0]]?.description
              : ''}
          </p>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-700"
              style={{
                width: `${weakest ? weakest[1] : 0}%`,
              }}
            />

          </div>

        </div>

      </div>


      {/* =====================================================
          DIMENSION PERFORMANCE
      ====================================================== */}

      <section className="mt-10">

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Evaluation Breakdown
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            7-Dimension Performance
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            A detailed breakdown of your latest interview evaluation.
          </p>

        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827]">

          {dimensionEntries.map(([key, score], index) => (

            <DimensionRow
              key={key}
              index={index}
              dimension={{
                name: DIMENSION_META[key]?.name || key,
                description:
                  DIMENSION_META[key]?.description || '',
                score,
              }}
            />

          ))}

        </div>

      </section>


      {/* =====================================================
          HISTORY
      ====================================================== */}

      <section className="mt-10">

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Interview History
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Recent Results
            </h2>

          </div>

          <button
            type="button"
            onClick={() => navigate('/candidate/interviews')}
            className="text-xs font-semibold text-violet-400 transition hover:text-violet-300"
          >
            View Interviews →
          </button>

        </div>


        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827]">

          {results.map((result) => (

            <div
              key={result.interviewId}
              className="group flex flex-col gap-5 border-b border-white/[0.06] p-6 transition last:border-b-0 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <CodeIcon />
                </div>

                <div>

                  <h3 className="font-semibold text-slate-200">
                    {result.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {candidateApi.formatDate(result.completedAt)}
                  </p>

                </div>

              </div>


              <div className="flex flex-wrap items-center gap-6">

                <div className="min-w-[80px]">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Result
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {levelForScore(result.overallScore)}
                  </p>

                </div>


                <div className="min-w-[70px]">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Score
                  </p>

                  <p className="mt-1 text-xl font-bold text-violet-400">
                    {result.overallScore}%
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/candidate/results/${result.interviewId}`
                    )
                  }
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                >
                  View Details
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          AI INSIGHT
      ====================================================== */}

      {latestDetail && (

        <section className="relative mt-10 overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.10] to-[#111827] p-7">

          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-500/[0.08] blur-3xl" />

          <div className="relative flex items-start gap-5">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
              <InsightIcon />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                  AI Performance Insight
                </p>

              </div>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {latestDetail.feedback}
              </p>

              <button
                type="button"
                onClick={() => navigate('/candidate/preparation')}
                className="mt-5 text-sm font-semibold text-violet-400 transition hover:text-violet-300"
              >
                Practice this area →
              </button>

            </div>

          </div>

        </section>

      )}

    </CandidateLayout>
  )
}


/* ============================================================
   SCORE CIRCLE
============================================================ */

function ScoreCircle({ score }) {
  const circumference = 2 * Math.PI * 42
  const offset =
    circumference - (score / 100) * circumference

  return (
    <div className="relative h-28 w-28 shrink-0">

      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 100 100"
      >

        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#1e293b"
          strokeWidth="7"
        />

        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />

      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <span className="text-2xl font-bold text-white">
          {score}
        </span>

        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
          Score
        </span>

      </div>

    </div>
  )
}


/* ============================================================
   DIMENSION ROW
============================================================ */

function DimensionRow({ dimension, index }) {
  const scoreColor =
    dimension.score >= 80
      ? 'bg-emerald-400'
      : dimension.score >= 65
        ? 'bg-violet-400'
        : 'bg-amber-400'

  const textColor =
    dimension.score >= 80
      ? 'text-emerald-400'
      : dimension.score >= 65
        ? 'text-violet-400'
        : 'text-amber-400'

  return (
    <div className="group flex flex-col gap-5 border-b border-white/[0.06] p-6 transition last:border-b-0 hover:bg-white/[0.02] md:flex-row md:items-center">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-xs font-bold text-slate-400">
        {String(index + 1).padStart(2, '0')}
      </div>


      <div className="w-full md:w-72">

        <h3 className="font-semibold text-slate-200">
          {dimension.name}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {dimension.description}
        </p>

      </div>


      <div className="flex flex-1 items-center gap-4">

        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">

          <div
            className={`h-full rounded-full ${scoreColor} transition-all duration-700`}
            style={{
              width: `${dimension.score}%`,
            }}
          />

        </div>

        <span className={`w-12 text-right text-sm font-bold ${textColor}`}>
          {dimension.score}%
        </span>

      </div>

    </div>
  )
}


/* ============================================================
   ICONS
============================================================ */

function StrengthIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3v18" />
      <path d="m5 10 7-7 7 7" />
      <path d="M5 21h14" />
    </svg>
  )
}


function ImproveIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 20V4" />
      <path d="m5 11 7-7 7 7" />
    </svg>
  )
}


function InsightIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <circle cx="12" cy="7" r=".5" fill="currentColor" />
    </svg>
  )
}


function CodeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m14 5-4 14" />
    </svg>
  )
}


function ChartIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-4 3 2 4-6" />
    </svg>
  )
}


export default CandidateResults