import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'

function RecruiterSettings() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <RecruiterSidebar />

      <div className="ml-64 flex min-h-screen flex-col">
        <RecruiterHeader />

        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="border-b border-white/10 pb-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600">
                Management
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                Settings
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Recruiter settings will appear here.
              </p>
            </div>

            <div className="mt-6 min-h-[420px] border border-white/10 bg-[#0d0d0d]" />
          </div>
        </main>
      </div>
    </div>
  )
}

export default RecruiterSettings