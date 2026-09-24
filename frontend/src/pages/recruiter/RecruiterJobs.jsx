import { useState } from 'react'
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'
import JobFilters from '../../components/recruiter/jobs/JobFilters'
import JobList from '../../components/recruiter/jobs/JobList'
import CreateJobModal from '../../components/recruiter/jobs/CreateJobModal'

function RecruiterJobs() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f4f8fc]">

      <RecruiterSidebar />

      <div className="ml-64 flex min-h-screen flex-col">

        <RecruiterHeader />

        <main className="flex-1 p-6 lg:p-8">

          {/* Page Header */}

          <div className="flex items-end justify-between">

            <div>

              <p className="text-xs font-medium text-[#3972a7]">
                Recruitment
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17324f]">
                Jobs
              </h1>

              <p className="mt-2 text-xs text-slate-400">
                Create and manage your interview openings.
              </p>

            </div>


            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-[#285b8f] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#214d79]"
            >
              <PlusIcon />
              Create New Job
            </button>

          </div>


          {/* Filters */}

          <div className="mt-7">

            <JobFilters />

          </div>


          {/* Jobs */}

          <div className="mt-5">

            <JobList />

          </div>

        </main>

      </div>


      {/* Create Job Modal */}

      {isCreateModalOpen && (
        <CreateJobModal
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

    </div>
  )
}


function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}


export default RecruiterJobs