function ActiveJobs({
  interviews = [],
  loading = false,
}) {
  return (
    <section className="border border-white/10 bg-[#111111]">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

        <div>
          <h2 className="text-sm font-bold text-zinc-100">
            Active Interviews
          </h2>

          <p className="mt-1 text-[10px] text-zinc-500">
            Currently scheduled and ongoing interviews
          </p>
        </div>

        <span className="text-[10px] font-medium text-zinc-500">
          {loading
            ? '—'
            : `${interviews.length} active`}
        </span>

      </div>


      {/* 
       * 4 rows visible.
       * Additional interviews scroll inside
       * this section.
       */}
      <div
        className="divide-y divide-white/[0.06] overflow-y-auto"
        style={{
          maxHeight: '348px',
        }}
      >

        {loading ? (
          <div className="px-5 py-10 text-center">

            <p className="text-xs text-zinc-500">
              Loading interviews...
            </p>

          </div>
        ) : interviews.length === 0 ? (
          <div className="px-5 py-10 text-center">

            <p className="text-xs text-zinc-500">
              No active interviews.
            </p>

          </div>
        ) : (
          interviews.map(
            (interview) => (
              <div
                key={
                  interview.key ||
                  interview.id
                }
                className="px-5 py-4 transition hover:bg-[#151515]"
              >

                {/* TITLE */}
                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <p className="truncate text-xs font-semibold text-zinc-200">
                      {interview.title ||
                        'Untitled Interview'}
                    </p>

                    {interview.company && (
                      <p className="mt-1 truncate text-[10px] text-zinc-600">
                        {interview.company}
                      </p>
                    )}

                  </div>


                  {/* STATUS */}
                  <span className="shrink-0 border border-zinc-700 bg-[#181818] px-2 py-1 text-[9px] font-semibold text-zinc-400">
                    {interview.status ===
                    'IN_PROGRESS'
                      ? 'In Progress'
                      : 'Scheduled'}
                  </span>

                </div>


                {/* DETAILS */}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] text-zinc-500">

                  <span>
                    {interview.candidateCount ===
                    1
                      ? '1 candidate'
                      : `${interview.candidateCount || 0} candidates`}
                  </span>


                  {interview.duration && (
                    <span>
                      {interview.duration}{' '}
                      min
                    </span>
                  )}


                  {typeof interview.questionCount ===
                    'number' && (
                    <span>
                      {
                        interview.questionCount
                      }{' '}
                      {interview.questionCount ===
                      1
                        ? 'question'
                        : 'questions'}
                    </span>
                  )}


                  {interview.scheduledAt && (
                    <span>
                      {new Date(
                        interview.scheduledAt,
                      ).toLocaleDateString()}
                    </span>
                  )}

                </div>

              </div>
            ),
          )
        )}

      </div>

    </section>
  )
}


export default ActiveJobs