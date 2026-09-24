import { useEffect, useState } from 'react'

import { getRecruiterInterviews } from '../../../api/interview.api.js'


// ============================================================
// The `Evaluation` model (backend/prisma/schema.prisma) stores
// each dimension as its own flat Int column - there is no
// `dimensions` array on the backend. This maps those columns
// to display labels and averages them across every evaluated
// interview belonging to the recruiter.
// ============================================================
const DIMENSION_LABELS = [
  { key: 'algorithmCorrectness', name: 'Algorithm Correctness' },
  { key: 'logicalReasoning', name: 'Logical Reasoning' },
  { key: 'conceptCoverage', name: 'Concept Coverage' },
  { key: 'completeness', name: 'Completeness' },
  { key: 'dataStructure', name: 'Data Structure' },
  { key: 'complexity', name: 'Complexity' },
  { key: 'edgeCases', name: 'Edge Cases' },
]

const average = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length


function DimensionPerformance() {
  const [dimensions, setDimensions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ============================================================
  // FETCH + AGGREGATE EVALUATION DATA
  // ============================================================

  useEffect(() => {
    let cancelled = false

    const fetchEvaluations = async () => {
      try {
        setLoading(true)
        setError(null)

        // getRecruiterInterviews already unwraps the
        // `{ success, data }` envelope (see api/interview.api.js).
        const interviews = await getRecruiterInterviews()

        if (cancelled) return

        const evaluations = interviews
          .map((interview) => interview.evaluation)
          .filter(Boolean)

        const aggregated = DIMENSION_LABELS
          .map(({ key, name }) => {
            const scores = evaluations
              .map((evaluation) => evaluation[key])
              .filter((value) => value !== undefined && value !== null)

            if (scores.length === 0) return null

            return { name, score: Math.round(average(scores)) }
          })
          .filter(Boolean)

        setDimensions(aggregated)
      } catch (err) {
        console.error('Fetch dimension performance error:', err)

        if (!cancelled) {
          setError(err?.message || 'Failed to load evaluation dimensions.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchEvaluations()

    return () => {
      cancelled = true
    }
  }, [])

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <section className="border border-slate-200 bg-white">
        <div className="flex min-h-[300px] flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#3972a7]" />
          <p className="mt-4 text-xs text-slate-400">
            Loading evaluation performance...
          </p>
        </div>
      </section>
    )
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <section className="border border-slate-200 bg-white">
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold text-red-500">
            Failed to load evaluation dimensions
          </p>
          <p className="mt-2 text-xs text-slate-400">{error}</p>
        </div>
      </section>
    )
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (dimensions.length === 0) {
    return (
      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-[#17324f]">
            Evaluation Dimensions
          </h2>
          <p className="mt-1 text-[10px] text-slate-400">
            Candidate performance across evaluation dimensions.
          </p>
        </div>

        <div className="flex min-h-[220px] items-center justify-center px-6 text-center">
          <div>
            <p className="text-sm font-semibold text-slate-600">
              No evaluation available
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Evaluation dimensions will appear once your interviews have been evaluated.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold text-[#17324f]">
          Evaluation Dimensions
        </h2>
        <p className="mt-1 text-[10px] text-slate-400">
          Candidate performance across evaluation dimensions.
        </p>
      </div>

      <div className="p-5">
        <div className="space-y-5">
          {dimensions.map((dimension) => (
            <Dimension key={dimension.name} name={dimension.name} score={dimension.score} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Dimension({ name, score }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0))

  const scoreLabel =
    normalizedScore >= 80
      ? 'Strong'
      : normalizedScore >= 70
        ? 'Good'
        : 'Needs improvement'

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-600">{name}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[9px] text-slate-400">{scoreLabel}</span>
          <span className="w-7 text-right text-xs font-bold text-[#17324f]">
            {normalizedScore}
          </span>
        </div>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden bg-slate-100">
        <div
          className="h-full bg-[#6fa9dc] transition-all duration-500"
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  )
}

export default DimensionPerformance