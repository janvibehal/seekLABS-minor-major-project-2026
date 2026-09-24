import CandidateSidebar from './CandidateSidebar'
import CandidateHeader from './CandidateHeader'

function CandidateLayout({ children }) {
  return (
    <div className="relative h-screen overflow-hidden bg-[#07090d] text-white">

      {/* =====================================================
          SUBTLE BACKGROUND EFFECTS
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Top Blue Glow */}

        <div className="absolute -top-40 right-[15%] h-[500px] w-[500px] rounded-full bg-blue-400/[0.035] blur-[140px]" />

        {/* Bottom Blue Glow */}

        <div className="absolute -bottom-48 left-[20%] h-[450px] w-[450px] rounded-full bg-blue-500/[0.025] blur-[150px]" />

      </div>


      {/* =====================================================
          FIXED SIDEBAR
      ====================================================== */}

      <CandidateSidebar />


      {/* =====================================================
          MAIN APPLICATION
      ====================================================== */}

      <div className="relative flex h-full min-w-0 flex-col lg:ml-[260px]">


        {/* HEADER */}

        <CandidateHeader />


        {/* =====================================================
            SCROLLABLE CONTENT
        ====================================================== */}

        <main className="relative min-h-0 flex-1 overflow-y-auto">

          <div className="mx-auto w-full max-w-[1600px] p-5 sm:p-6 lg:p-8 xl:p-10">

            {children}

          </div>

        </main>

      </div>

    </div>
  )
}

export default CandidateLayout