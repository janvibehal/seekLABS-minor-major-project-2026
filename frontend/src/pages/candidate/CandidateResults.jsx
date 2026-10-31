import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

        const safeResults = Array.isArray(resultsList)
          ? resultsList
          : []

        setResults(safeResults)

        if (safeResults.length > 0) {
          const detail = await candidateApi.getResultDetail(
            safeResults[0].interviewId
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

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400" />
          <p className="text-sm text-zinc-500">
            Loading your results...
          </p>
        </div>
      </div>
    )
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
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
    )
  }

  // EMPTY STATE
  if (results.length === 0) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#10141b] px-6 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-400/[0.08] text-blue-400">
            <ChartIcon />
          </div>

          <h1 className="mt-6 text-xl font-semibold text-white">
            No results yet
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Your interview performance and AI-generated feedback
            will appear here once you complete your first interview.
          </p>

          <button
            type="button"
            onClick={() => navigate('/candidate/interviews')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-400 px-5 py-2.5 text-sm font-semibold text-[#061018] transition hover:bg-blue-300"
          >
            Explore Interviews
            <span>→</span>
          </button>
        </div>
      </div>
    )
  }

  const dimensionEntries = latestDetail?.dimensions
    ? Object.entries(latestDetail.dimensions)
    : []

  const strongest = dimensionEntries.length
    ? dimensionEntries.reduce((a, b) => b[1] > a[1] ? b : a)
    : null

  const weakest = dimensionEntries.length
    ? dimensionEntries.reduce((a, b) => b[1] < a[1] ? b : a)
    : null

  const previousScores = results
    .slice(1)
    .map((result) => Number(result.overallScore) || 0)

  const previousAverage = previousScores.length
    ? Math.round(
        previousScores.reduce((a, b) => a + b, 0) /
          previousScores.length
      )
    : null

  const currentScore = Number(results[0]?.overallScore) || 0

  return (
    <div className="min-h-full text-white">

      {/* PAGE HEADER */}
      <section className="relative mb-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#10151d] via-[#0b0d11] to-[#07090d] px-5 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-blue-400/[0.07] blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-[20%] h-32 w-64 rounded-full bg-blue-500/[0.035] blur-[80px]" />

        <div className="relative">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Your Results
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
            Review your interview performance, see what you did well,
            and discover where you can improve.
          </p>
        </div>
      </section>

      {/* PERFORMANCE OVERVIEW */}
      <section className="mb-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">
            Performance Overview
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Based on your most recent completed interview.
          </p>
        </div>

        <div className="grid gap-3 xl:grid-cols-3">

          {/* OVERALL PERFORMANCE */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#10141b] p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-400/[0.06] blur-3xl" />

            <p className="relative text-xs font-medium text-zinc-500">
              Overall Performance
            </p>

            <div className="relative mt-5 flex items-center gap-5">
              <ScoreCircle score={currentScore} />

              <div>
                <p className="text-xl font-semibold text-white">
                  {levelForScore(currentScore)}
                </p>

                <p className="mt-1 max-w-[150px] text-xs leading-5 text-zinc-500">
                  Your latest interview evaluation.
                </p>
              </div>
            </div>

            <div className="relative mt-5 border-t border-white/[0.06] pt-4">
              {previousAverage !== null ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      Previous average
                    </span>
                    <span className="text-sm font-medium text-zinc-300">
                      {previousAverage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      Latest performance
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
                <p className="text-xs leading-5 text-zinc-500">
                  Complete more interviews to see how your performance
                  changes over time.
                </p>
              )}
            </div>
          </div>

          {/* STRONGEST AREA */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#10141b] p-5 transition hover:border-emerald-400/20">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-400">
                <StrengthIcon />
              </div>

              <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                Your strength
              </span>
            </div>

            <p className="mt-5 text-xs text-zinc-500">
              Strongest Area
            </p>

            <h3 className="mt-2 text-lg font-semibold text-white">
              {strongest
                ? DIMENSION_META[strongest[0]]?.name || strongest[0]
                : 'Not available'}
            </h3>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-emerald-400">
                {strongest ? strongest[1] : '—'}
              </span>
              {strongest && (
                <span className="text-sm text-emerald-400/70">%</span>
              )}
            </div>

            <p className="mt-2 min-h-10 text-xs leading-5 text-zinc-500">
              {strongest
                ? DIMENSION_META[strongest[0]]?.description
                : 'Your strongest skill will appear after evaluation.'}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{
                  width: `${strongest ? strongest[1] : 0}%`,
                }}
              />
            </div>
          </div>

          {/* IMPROVEMENT AREA */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#10141b] p-5 transition hover:border-amber-400/20">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/[0.08] text-amber-400">
                <ImproveIcon />
              </div>

              <span className="rounded-full border border-amber-400/15 bg-amber-400/[0.05] px-2.5 py-1 text-[10px] font-medium text-amber-400">
                Focus next
              </span>
            </div>

            <p className="mt-5 text-xs text-zinc-500">
              Improvement Area
            </p>

            <h3 className="mt-2 text-lg font-semibold text-white">
              {weakest
                ? DIMENSION_META[weakest[0]]?.name || weakest[0]
                : 'Not available'}
            </h3>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-amber-400">
                {weakest ? weakest[1] : '—'}
              </span>
              {weakest && (
                <span className="text-sm text-amber-400/70">%</span>
              )}
            </div>

            <p className="mt-2 min-h-10 text-xs leading-5 text-zinc-500">
              {weakest
                ? DIMENSION_META[weakest[0]]?.description
                : 'Your improvement areas will appear after evaluation.'}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-700"
                style={{
                  width: `${weakest ? weakest[1] : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* DIMENSION BREAKDOWN */}
      <section className="mb-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">
            Performance Breakdown
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            See how you performed across the seven evaluation dimensions.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#10141b]">
          {dimensionEntries.length > 0 ? (
            dimensionEntries.map(([key, score], index) => (
              <DimensionRow
                key={key}
                index={index}
                dimension={{
                  name: DIMENSION_META[key]?.name || key,
                  description: DIMENSION_META[key]?.description || '',
                  score,
                }}
              />
            ))
          ) : (
            <p className="p-5 text-sm text-zinc-500">
              Evaluation breakdown is not available for this interview.
            </p>
          )}
        </div>
      </section>

      {/* INTERVIEW HISTORY */}
      <section className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">
              Recent Results
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Revisit your completed interview evaluations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/candidate/interviews')}
            className="shrink-0 text-xs font-medium text-blue-400 transition hover:text-blue-300"
          >
            All Interviews →
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#10141b]">
          {results.map((result) => (
            <div
              key={result.interviewId}
              className="flex flex-col gap-4 border-b border-white/[0.06] p-4 transition last:border-b-0 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/[0.08] text-blue-400">
                  <CodeIcon />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-zinc-200">
                    {result.title}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    {candidateApi.formatDate(result.completedAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    Result
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-300">
                    {levelForScore(Number(result.overallScore) || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    Score
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-400">
                    {result.overallScore}%
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/candidate/results/${result.interviewId}`)
                  }
                  className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-blue-300"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI FEEDBACK */}
      {latestDetail?.feedback && (
        <section className="relative overflow-hidden rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-400/[0.07] to-[#10141b] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-blue-400/[0.06] blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/[0.10] text-blue-400">
              <InsightIcon />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                AI Performance Feedback
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {latestDetail.feedback}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}


/* SCORE CIRCLE */
function ScoreCircle({ score }) {
  const circumference = 2 * Math.PI * 42
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0))
  const offset = circumference - (safeScore / 100) * circumference

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#272d38"
          strokeWidth="7"
        />

        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-white">
          {safeScore}
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">
          Score
        </span>
      </div>
    </div>
  )
}


/* DIMENSION ROW */
function DimensionRow({ dimension, index }) {
  const score = Number(dimension.score) || 0

  const scoreColor =
    score >= 80
      ? 'bg-emerald-400'
      : score >= 65
        ? 'bg-blue-400'
        : 'bg-amber-400'

  const textColor =
    score >= 80
      ? 'text-emerald-400'
      : score >= 65
        ? 'text-blue-400'
        : 'text-amber-400'

  return (
    <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 transition last:border-b-0 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-5 sm:px-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[10px] font-semibold text-zinc-500">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="w-full sm:w-64">
        <h3 className="text-sm font-medium text-zinc-200">
          {dimension.name}
        </h3>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {dimension.description}
        </p>
      </div>

      <div className="flex flex-1 items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full ${scoreColor} transition-all duration-700`}
            style={{
              width: `${Math.min(100, Math.max(0, score))}%`,
            }}
          />
        </div>

        <span className={`w-10 text-right text-xs font-semibold ${textColor}`}>
          {score}%
        </span>
      </div>
    </div>
  )
}


/* ICONS */
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
      className="h-6 w-6"
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