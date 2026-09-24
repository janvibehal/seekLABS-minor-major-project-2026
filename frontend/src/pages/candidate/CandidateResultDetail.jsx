import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CandidateLayout from '../../components/layout/CandidateLayout'
import * as candidateApi from '../../api/candidate.api.js'

const DIMENSION_META = {
  algorithmCorrectness: 'Algorithmic Correctness',
  logicalReasoning: 'Reasoning & Approach',
  conceptCoverage: 'Concept Coverage',
  completeness: 'Completeness',
  dataStructure: 'Data Structure Selection',
  complexity: 'Time & Space Complexity',
  edgeCases: 'Edge Case Handling',
}

// A response counts as meaningful when it contains enough actual
// interview content to represent an attempted solution, rather than
// a short acknowledgement such as "yes", "ok", or "hmm".
const isMeaningfulResponse = (response) => {
  const text = String(response || '').trim()

  if (!text) return false

  const genericResponses = new Set([
    'yes',
    'no',
    'ok',
    'okay',
    'sure',
    'hmm',
    'hm',
    'yeah',
    'yep',
    'nope',
    'fine',
    'done',
    'got it',
    'i dont know',
    "i don't know",
  ])

  if (genericResponses.has(text.toLowerCase())) {
    return false
  }

  // Require a substantive response, not just a very short acknowledgement.
  return text.length >= 20
}

const isQuestionSolved = (question) => {
  const candidateResponses = question?.candidateResponses || []

  const hasMeaningfulChat = candidateResponses.some(
    isMeaningfulResponse,
  )

  // `question.solved` remains the source of truth for the saved/completed
  // state. Meaningful chat is required in addition to that state.
  return Boolean(question?.solved && hasMeaningfulChat)
}

function CandidateResultDetail() {
  const { id: interviewId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadResult = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await candidateApi.getResultDetail(interviewId)

        if (!cancelled) {
          setDetail(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load this result.')
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

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <CandidateLayout>
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
      </CandidateLayout>
    )
  }

  /* =====================================================
     ERROR
  ====================================================== */

  if (error || !detail) {
    return (
      <CandidateLayout>
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
      </CandidateLayout>
    )
  }

  const dimensions = detail.dimensions || {}
  const questionAnalysis = detail.questionAnalysis || []
  const strengths = detail.strengths || []
  const improvements = detail.improvements || []

  // Count a question as solved only when the saved/completed state is
  // present AND the candidate actually provided meaningful responses.
  const questionsSolved = questionAnalysis.filter(
    isQuestionSolved,
  ).length

  const totalQuestions =
    detail.totalQuestions ?? questionAnalysis.length

  const score = detail.overallScore ?? 0

  const getScoreLabel = () => {
    if (score >= 85) return 'Excellent Performance'
    if (score >= 70) return 'Strong Performance'
    if (score >= 50) return 'Good Foundation'
    return 'Needs Improvement'
  }

  return (
    <CandidateLayout>

      <div className="min-h-screen text-white">


        {/* =====================================================
            BACK BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() => navigate('/candidate/results')}
          className="group mb-7 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-blue-400"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Back to all results
        </button>


        {/* =====================================================
            HERO
        ====================================================== */}

        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#101b2d] via-[#0d1420] to-[#080d16] p-7 sm:p-10">

          {/* Background Glows */}

          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-400/10 blur-[120px]" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-96 rounded-full bg-blue-600/10 blur-[100px]" />


          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">


            {/* Left */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />

                <span className="text-xs font-medium text-blue-300">
                  Interview Evaluation
                </span>

              </div>


              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Performance Report
              </h1>


              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                A detailed breakdown of your interview performance,
                reasoning, and areas for improvement.
              </p>

            </div>


            {/* Score */}

            <div className="flex items-center gap-5">

              <div className="text-right">

                <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Overall Score
                </p>

                <p className="mt-2 text-sm font-medium text-blue-300">
                  {getScoreLabel()}
                </p>

              </div>


              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/[0.06]">

                <div className="absolute inset-2 rounded-full border border-blue-400/10" />

                <div className="relative text-center">

                  <p className="text-3xl font-semibold text-white">
                    {score}
                    <span className="text-lg text-blue-400">%</span>
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
                    Score
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            TOP STATS
        ====================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          <MiniStat
            label="Questions Solved"
            value={`${questionsSolved}/${totalQuestions}`}
            icon={<CheckIcon />}
          />

          <MiniStat
            label="Total Questions"
            value={detail.totalQuestions ?? 0}
            icon={<QuestionIcon />}
          />

          <MiniStat
            label="Overall Score"
            value={`${score}%`}
            icon={<ChartIcon />}
          />

        </div>


        {/* =====================================================
            FEEDBACK
        ====================================================== */}

        <div className="mt-8">

          <SectionHeader
            title="AI Feedback"
            subtitle="Overall assessment of your interview performance"
          />


          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1420] p-6 sm:p-7">

            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/[0.05] blur-[70px]" />


            <div className="relative flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10 text-blue-400">

                <MessageIcon />

              </div>


              <p className="max-w-4xl pt-1 text-sm leading-7 text-zinc-400">
                {detail.feedback || 'No feedback is available for this interview.'}
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            PERFORMANCE BREAKDOWN
        ====================================================== */}

        <div className="mt-10">

          <SectionHeader
            title="Performance Breakdown"
            subtitle="Your evaluation across key interview dimensions"
          />


          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1420]">

            {Object.entries(dimensions).map(([key, scoreValue], index) => (

              <DimensionRow
                key={key}
                index={index}
                title={DIMENSION_META[key] || key}
                score={Number(scoreValue) || 0}
              />

            ))}


            {Object.keys(dimensions).length === 0 && (

              <div className="px-6 py-12 text-center">

                <p className="text-sm text-zinc-500">
                  Performance dimensions are not available.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* =====================================================
            QUESTION ANALYSIS
        ====================================================== */}

        <div className="mt-10">

          <SectionHeader
            title="Question Analysis"
            subtitle="A detailed look at your responses during the interview"
          />


          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1420]">


            {questionAnalysis.length > 0 ? (

              questionAnalysis.map((question, index) => {

                const candidateResponses =
                  question.candidateResponses || []

                const aiResponses =
                  question.aiResponses || []


                return (

                  <article
                    key={question.questionId}
                    className="border-b border-white/[0.06] p-6 last:border-b-0 sm:p-7"
                  >


                    {/* Question Header */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">


                      <div className="flex gap-4">


                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-xs font-semibold text-blue-400">

                          {String(index + 1).padStart(2, '0')}

                        </div>


                        <div>

                          <h3 className="text-base font-semibold text-white">

                            {question.title}

                          </h3>


                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">

                            <span>
                              {question.difficulty || 'Unknown difficulty'}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-zinc-700" />

                            <span>
                              {question.candidateResponseCount ?? 0} candidate responses
                            </span>

                            <span className="h-1 w-1 rounded-full bg-zinc-700" />

                            <span>
                              {question.aiResponseCount ?? 0} AI responses
                            </span>

                          </div>

                        </div>

                      </div>


                      <StatusBadge solved={isQuestionSolved(question)} />

                    </div>


                    {/* Conversation */}

                    <div className="mt-7 space-y-5">


                      {/* Candidate Responses */}

                      {candidateResponses.map((message, messageIndex) => (

                        <div
                          key={`${question.questionId}-candidate-${messageIndex}`}
                          className="rounded-xl border border-blue-400/10 bg-blue-400/[0.04] p-4"
                        >

                          <div className="flex items-center gap-2">

                            <div className="h-2 w-2 rounded-full bg-blue-400" />

                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">
                              Candidate
                            </p>

                          </div>


                          <p className="mt-3 text-sm leading-7 text-zinc-400">
                            {message}
                          </p>

                        </div>

                      ))}


                      {/* AI Responses */}

                      {aiResponses.map((message, messageIndex) => (

                        <div
                          key={`${question.questionId}-ai-${messageIndex}`}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4"
                        >

                          <div className="flex items-center gap-2">

                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-[9px] font-bold text-zinc-400">
                              AI
                            </div>

                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                              AI Interviewer
                            </p>

                          </div>


                          <p className="mt-3 text-sm leading-7 text-zinc-400">
                            {message}
                          </p>

                        </div>

                      ))}


                      {/* Empty */}

                      {candidateResponses.length === 0 && (

                        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">

                          <p className="text-sm text-zinc-600">
                            No candidate response was recorded for this question.
                          </p>

                        </div>

                      )}

                    </div>

                  </article>

                )

              })

            ) : (

              <div className="px-6 py-14 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-400">
                  <QuestionIcon />
                </div>

                <p className="mt-4 text-sm text-zinc-500">
                  No question analysis is available.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* =====================================================
            STRENGTHS + IMPROVEMENTS
        ====================================================== */}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">


          {/* Strengths */}

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1420] p-6 sm:p-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">

                <CheckIcon />

              </div>


              <div>

                <h2 className="text-base font-semibold text-white">
                  Your Strengths
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Things you did particularly well
                </p>

              </div>

            </div>


            {strengths.length > 0 ? (

              <ul className="mt-6 space-y-3">

                {strengths.map((item, index) => (

                  <li
                    key={`${item}-${index}`}
                    className="flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
                  >

                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                      ✓
                    </span>

                    <span className="text-sm leading-6 text-zinc-400">
                      {item}
                    </span>

                  </li>

                ))}

              </ul>

            ) : (

              <p className="mt-6 text-sm text-zinc-600">
                No strengths were recorded.
              </p>

            )}

          </div>


          {/* Improvements */}

          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1420] p-6 sm:p-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">

                <ArrowIcon />

              </div>


              <div>

                <h2 className="text-base font-semibold text-white">
                  Areas to Improve
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Focus areas for your next interview
                </p>

              </div>

            </div>


            {improvements.length > 0 ? (

              <ul className="mt-6 space-y-3">

                {improvements.map((item, index) => (

                  <li
                    key={`${item}-${index}`}
                    className="flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
                  >

                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs text-amber-400">
                      →
                    </span>

                    <span className="text-sm leading-6 text-zinc-400">
                      {item}
                    </span>

                  </li>

                ))}

              </ul>

            ) : (

              <p className="mt-6 text-sm text-zinc-600">
                No improvement areas were recorded.
              </p>

            )}

          </div>

        </div>


        {/* Bottom spacing */}

        <div className="h-10" />

      </div>

    </CandidateLayout>
  )
}


/* ============================================================
   COMPONENTS
============================================================ */

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">

      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-sm text-zinc-600">
          {subtitle}
        </p>
      )}

    </div>
  )
}


function MiniStat({ label, value, icon }) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-[#0d1420] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/15 hover:bg-[#101925]">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-zinc-500">
            {label}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>

        </div>


        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/[0.07] text-blue-400">

          {icon}

        </div>

      </div>

    </div>
  )
}


function DimensionRow({ index, title, score }) {
  const safeScore = Math.min(Math.max(score, 0), 100)

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 last:border-b-0 md:flex-row md:items-center">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-xs font-semibold text-blue-400">

        {String(index + 1).padStart(2, '0')}

      </div>


      <div className="md:w-64">

        <h3 className="text-sm font-medium text-zinc-300">
          {title}
        </h3>

      </div>


      <div className="flex flex-1 items-center gap-4">

        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">

          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700"
            style={{
              width: `${safeScore}%`,
            }}
          />

        </div>


        <span className="w-11 text-right text-sm font-semibold text-blue-300">
          {safeScore}%
        </span>

      </div>

    </div>
  )
}


function StatusBadge({ solved }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
        solved
          ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400'
          : 'border-amber-500/15 bg-amber-500/10 text-amber-400'
      }`}
    >

      <span
        className={`h-1.5 w-1.5 rounded-full ${
          solved ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
      />

      {solved ? 'Solved' : 'Not Solved'}

    </span>
  )
}


/* ============================================================
   ICONS
============================================================ */

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


function QuestionIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />

      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2.5-2.5 2-2.5 4" />

      <path d="M12 17h.01" />
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