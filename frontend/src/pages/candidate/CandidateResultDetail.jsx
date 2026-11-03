
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as candidateApi from '../../api/candidate.api.js'

const RUBRICS = [
  { key: 'algorithmCorrectness', aiKey: 'algorithm_correctness', label: 'Algorithmic Correctness' },
  { key: 'logicalReasoning', aiKey: 'logical_reasoning', label: 'Reasoning & Approach' },
  { key: 'conceptCoverage', aiKey: 'concept_coverage', label: 'Concept Coverage' },
  { key: 'completeness', aiKey: 'completeness', label: 'Completeness' },
  { key: 'dataStructure', aiKey: 'data_structure', label: 'Data Structure Selection' },
  { key: 'complexity', aiKey: 'complexity', label: 'Time & Space Complexity' },
  { key: 'edgeCases', aiKey: 'edge_cases', label: 'Edge Case Handling' },
]

const toValidScore = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const score = Number(value)

  if (!Number.isFinite(score)) {
    return null
  }

  return Math.min(100, Math.max(0, score))
}

function CandidateResultDetail() {
  const { id: interviewId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)

  // Fetch results for ONLY the interview ID in the URL
  useEffect(() => {
    let cancelled = false

    const loadResult = async () => {
      if (!interviewId) {
        setError('Interview ID is missing.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      setDetail(null)

      try {
        const selectedDetail =
          await candidateApi.getResultDetail(interviewId)

        console.log('SELECTED INTERVIEW RESULT:', selectedDetail)
        console.log('DIMENSIONS:', selectedDetail?.dimensions)

        if (!cancelled) {
          setDetail(selectedDetail)
        }
      } catch (err) {
        console.error('Failed to load interview result:', err)

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Unable to load this result.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadResult()

    return () => {
      cancelled = true
    }
  }, [interviewId])

  // Get rubric scores from this interview only
  const rubricScores = useMemo(() => {
    const dimensions = detail?.dimensions || {}

    return RUBRICS.map((rubric) => ({
      ...rubric,
      score: toValidScore(dimensions[rubric.key]),
    })).filter((rubric) => rubric.score !== null)
  }, [detail])

  const questionPerformance = useMemo(() => {
    return [...(detail?.questionPerformance || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    )
  }, [detail])

  // Identify the highest and lowest scoring rubrics
  const { strengths, improvements } = useMemo(() => {
    if (!rubricScores.length) {
      return {
        strengths: [],
        improvements: [],
      }
    }

    const highest = Math.max(
      ...rubricScores.map((item) => item.score)
    )

    const lowest = Math.min(
      ...rubricScores.map((item) => item.score)
    )

    return {
      strengths: rubricScores.filter(
        (item) => item.score === highest
      ),
      improvements: rubricScores.filter(
        (item) => item.score === lowest
      ),
    }
  }, [rubricScores])

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />
            <div className="absolute inset-2 rounded-full bg-blue-400/10 blur-md" />
          </div>

          <p className="text-sm text-zinc-500">
            Loading your interview results...
          </p>
        </div>
      </div>
    )
  }

  // ERROR STATE
  if (error || !detail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <ErrorIcon />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            Unable to load results
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {error || 'Result not found.'}
          </p>

          <button
            type="button"
            onClick={() => navigate('/candidate/results')}
            className="mt-6 rounded-xl bg-blue-400 px-5 py-2.5 text-sm font-semibold text-[#06111f] transition hover:bg-blue-300"
          >
            Back to Results
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full text-white">

      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => navigate('/candidate/results')}
        className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-blue-400"
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Back to all results
      </button>

      {/* PAGE HEADER */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#10151d] via-[#0b0d11] to-[#07090d] px-5 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-96 rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-medium text-blue-300">
              Candidate Performance
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {detail.title || 'Interview Performance'}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Interview Performance
            <span className="mx-2 text-zinc-600">·</span>
            Your scores across the seven evaluation dimensions.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2">
            <span className="text-xs font-medium text-emerald-300">
              Questions answered
            </span>
            <span className="text-sm font-semibold text-white">
              {detail.questionsAnswered ?? 0} / {detail.totalQuestions ?? 0}
            </span>
          </div>
        </div>
      </section>

      {/* AI FEEDBACK */}
      <section className="mt-6">
        <SectionHeader
          title="AI Feedback"
          subtitle="Feedback recorded for this interview"
        />

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1420] p-6 sm:p-7">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/[0.05] blur-[70px]" />

          <div className="relative flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10 text-blue-400">
              <MessageIcon />
            </div>

            <p className="max-w-4xl pt-1 text-sm leading-7 text-zinc-400">
              {detail.feedback ||
                'No feedback is available for this interview.'}
            </p>
          </div>
        </div>
      </section>

      {/* PERFORMANCE BREAKDOWN */}
      <section className="mt-8">
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Overall average"
            value={toValidScore(detail.overallScore)}
            suffix="%"
            tone="blue"
          />
          <SummaryCard
            label="Questions assessed"
            value={questionPerformance.filter((item) => item.answered).length}
            suffix={` / ${detail.totalQuestions ?? 0}`}
            tone="emerald"
          />
          <SummaryCard
            label="Rubrics averaged"
            value={rubricScores.length}
            suffix={` / ${RUBRICS.length}`}
            tone="violet"
          />
        </div>

        <SectionHeader
          title="Performance Breakdown"
          subtitle="Interview average across every assessed question"
        />

        {rubricScores.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rubricScores.map((rubric, index) => (
              <DimensionCard
                key={rubric.key}
                index={index}
                title={rubric.label}
                score={rubric.score}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.10] bg-[#0d1420] px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-400/[0.06] text-blue-300">
              <ChartIcon />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-zinc-300">
              No rubric scores available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Rubric scores will appear here once this interview has been evaluated.
            </p>
          </div>
        )}

        <p className="mt-4 text-xs leading-5 text-zinc-600">
          These scores belong only to this interview. Rubrics that were not assessed are excluded.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader
          title="Question-by-question performance"
          subtitle="Expand a question to see its individual rubric scores and average"
        />

        {questionPerformance.length > 0 ? (
          <div className="space-y-3">
            {questionPerformance.map((question) => (
              <QuestionPerformanceCard
                key={question.questionId}
                question={question}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.10] bg-[#0d1420] px-6 py-10 text-center text-sm text-zinc-500">
            Per-question scores are not available for this evaluation.
          </div>
        )}
      </section>

      {/* STRENGTHS AND AREAS TO IMPROVE */}
      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <RubricList
          title="Your Strengths"
          subtitle="Your highest-performing rubric(s) in this interview"
          items={strengths}
          type="strength"
          emptyText="Strengths will appear once rubric scores are available."
        />

        <RubricList
          title="Areas to Improve"
          subtitle="Your lowest-performing rubric(s) in this interview"
          items={improvements}
          type="improvement"
          emptyText="Areas to improve will appear once rubric scores are available."
        />
      </section>

      <div className="h-10" />
    </div>
  )
}

/* SECTION HEADER */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-blue-400" />
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
      </div>

      {subtitle && (
        <p className="ml-3 mt-1.5 text-sm leading-6 text-zinc-500">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function SummaryCard({ label, value, suffix, tone }) {
  const colors = {
    blue: 'border-blue-400/20 bg-blue-400/[0.06] text-blue-300',
    emerald: 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300',
    violet: 'border-violet-400/20 bg-violet-400/[0.06] text-violet-300',
  }

  return (
    <div className={`rounded-2xl border p-5 ${colors[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {value ?? '—'}
        <span className="ml-1 text-sm font-medium text-zinc-500">
          {suffix}
        </span>
      </p>
    </div>
  )
}

function QuestionPerformanceCard({ question }) {
  const scores = RUBRICS.map((rubric) => ({
    ...rubric,
    score: toValidScore(
      question.scores?.[rubric.key]?.score ??
      question.scores?.[rubric.aiKey]?.score ??
      question.scores?.[rubric.key] ??
      question.scores?.[rubric.aiKey]
    ),
  })).filter((rubric) => rubric.score !== null)

  return (
    <details className="group rounded-2xl border border-white/[0.07] bg-[#0d1420]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-xs font-semibold text-blue-300">
            {String(question.order || 0).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {question.title}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {question.answered ? 'Answered' : 'Not answered'}
              {question.difficulty ? ` · ${question.difficulty}` : ''}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-lg font-semibold text-white">
            {question.overallScore === null || question.overallScore === undefined
              ? '—'
              : `${Number(question.overallScore).toFixed(1)}%`}
          </span>
          <span className="text-zinc-500 transition-transform group-open:rotate-180">
            ↓
          </span>
        </div>
      </summary>

      <div className="grid gap-3 border-t border-white/[0.06] p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {scores.length > 0 ? (
          scores.map((rubric) => (
            <div key={rubric.key} className="rounded-xl bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-400">{rubric.label}</span>
                <span className="text-sm font-semibold text-white">
                  {rubric.score.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"
                  style={{ width: `${rubric.score}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">
            No rubric scores were recorded for this question.
          </p>
        )}
      </div>
    </details>
  )
}

/* RUBRIC PERFORMANCE CARD */
function DimensionCard({ index, title, score }) {
  const safeScore = Math.min(Math.max(score, 0), 100)

  const level =
    safeScore >= 80
      ? 'Strong'
      : safeScore >= 60
        ? 'Developing'
        : 'Needs focus'

  return (
    <article className="group rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#111c2b] to-[#0c131e] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-[11px] font-semibold text-blue-300">
            {String(index + 1).padStart(2, '0')}
          </span>

          <h3 className="pt-1 text-sm font-medium leading-5 text-zinc-300">
            {title}
          </h3>
        </div>

        <span className="shrink-0 text-xl font-semibold tracking-tight text-white">
          {safeScore.toFixed(1)}
          <span className="ml-0.5 text-xs font-medium text-zinc-500">
            %
          </span>
        </span>
      </div>

      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300 transition-all duration-700"
          style={{ width: `${safeScore}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-600">
          This Interview
        </span>

        <span className="text-[10px] font-medium text-zinc-500">
          {level}
        </span>
      </div>
    </article>
  )
}

/* STRENGTHS / IMPROVEMENTS */
function RubricList({ title, subtitle, items, type, emptyText }) {
  const isStrength = type === 'strength'

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#101a28] to-[#0b121c] p-6 sm:p-7 lg:p-8">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isStrength
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-amber-500/10 text-amber-400'
          }`}
        >
          {isStrength ? <CheckIcon /> : <ArrowIcon />}
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-xs text-zinc-600">
            {subtitle}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
            >
              <span className="text-sm leading-6 text-zinc-300">
                {item.label}
              </span>

              <span
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  isStrength
                    ? 'bg-emerald-400/10 text-emerald-300'
                    : 'bg-amber-400/10 text-amber-300'
                }`}
              >
                {item.score.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-zinc-600">
          {emptyText}
        </p>
      )}
    </div>
  )
}

/* ICONS */
function CheckIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-5 3 2 5-6" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 11.5a8 8 0 0 1-8 8 8.6 8.6 0 0 1-3.4-.7L4 20l1.2-3.7A8 8 0 1 1 20 11.5Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  )
}

export default CandidateResultDetail
