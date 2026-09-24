import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'
import AnalyticsStats from '../../components/recruiter/analytics/AnalyticsStats'
import DimensionPerformance from '../../components/recruiter/analytics/DimensionPerformance'
import ScoreDistribution from '../../components/recruiter/analytics/ScoreDistribution'
import HiringFunnel from '../../components/recruiter/analytics/HiringFunnel'

function RecruiterAnalytics() {
  return (
    <div className="min-h-screen bg-[#f4f8fc]">

      <RecruiterSidebar />

      <div className="ml-64 flex min-h-screen flex-col">

        <RecruiterHeader />

        <main className="flex-1 p-6 lg:p-8">

          {/* Header */}

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="text-xs font-medium text-[#3972a7]">
                Insights
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17324f]">
                Analytics
              </h1>

              <p className="mt-2 text-xs text-slate-400">
                Understand candidate performance across your AI interviews.
              </p>

            </div>


            {/* Date Range */}

            <select
              defaultValue="30"
              className="w-fit border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
            >
              <option value="7">
                Last 7 days
              </option>

              <option value="30">
                Last 30 days
              </option>

              <option value="90">
                Last 90 days
              </option>

              <option value="365">
                This year
              </option>

            </select>

          </div>


          {/* Overview */}

          <div className="mt-7">
            <AnalyticsStats />
          </div>


          {/* Performance */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">

            <DimensionPerformance />

            <ScoreDistribution />

          </div>


          {/* Funnel */}

          <div className="mt-6">

            <HiringFunnel />

          </div>

        </main>

      </div>

    </div>
  )
}

export default RecruiterAnalytics