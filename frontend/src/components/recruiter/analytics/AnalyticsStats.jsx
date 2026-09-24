import { useEffect, useState } from 'react'
import { getRecruiterAnalytics } from '../../../api/interview.api.js'

function AnalyticsStats() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadAnalytics = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getRecruiterAnalytics()

        if (!cancelled) {
          setStats(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Unable to load analytics.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [])


  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2 xl:grid-cols-4">

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-[#111111] p-6"
          >
            <div className="h-3 w-28 animate-pulse bg-zinc-800" />

            <div className="mt-5 h-8 w-20 animate-pulse bg-zinc-800" />

            <div className="mt-4 h-3 w-32 animate-pulse bg-zinc-800" />
          </div>
        ))}

      </div>
    )
  }


  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <div className="border border-zinc-800 bg-[#111111] p-5">

        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Analytics unavailable
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          {error}
        </p>

      </div>
    )
  }


  /* ============================================================
     DATA
  ============================================================ */

  const analyticsStats = [
    {
      label: 'Interviews Completed',
      value: stats?.interviewsCompleted ?? 0,
      change: stats?.interviewsCompletedChange,
      description: 'Completed interviews',
    },
    {
      label: 'Average AI Score',
      value: stats?.averageScore
        ? `${stats.averageScore}%`
        : '0%',
      change: stats?.averageScoreChange,
      description: 'Average candidate performance',
    },
    {
      label: 'Pass Rate',
      value: stats?.passRate
        ? `${stats.passRate}%`
        : '0%',
      change: stats?.passRateChange,
      description: 'Candidates meeting requirements',
    },
    {
      label: 'Average Interview Time',
      value: stats?.averageInterviewTime
        ? `${stats.averageInterviewTime}m`
        : '0m',
      change: stats?.averageInterviewTimeChange,
      description: 'Average completion duration',
    },
  ]


  return (
    <div className="grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2 xl:grid-cols-4">

      {analyticsStats.map((stat) => (

        <div
          key={stat.label}
          className="group bg-[#111111] p-6 transition hover:bg-[#151515]"
        >

          {/* Label */}

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {stat.label}
          </p>


          {/* Value */}

          <div className="mt-5 flex items-end justify-between gap-4">

            <p className="text-3xl font-semibold tracking-tight text-zinc-100">
              {stat.value}
            </p>

            {stat.change !== undefined &&
              stat.change !== null && (

                <span
                  className={`text-xs font-medium ${
                    String(stat.change).startsWith('-')
                      ? 'text-zinc-500'
                      : 'text-zinc-300'
                  }`}
                >
                  {stat.change}
                </span>

              )}

          </div>


          {/* Footer */}

          <div className="mt-5 border-t border-zinc-800 pt-4">

            <p className="text-[11px] text-zinc-600">
              {stat.description}
            </p>

          </div>

        </div>

      ))}

    </div>
  )
}

export default AnalyticsStats