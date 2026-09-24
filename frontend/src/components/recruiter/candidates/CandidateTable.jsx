import CandidateRow from './CandidateRow'

function CandidateTable({
  candidates = [],
  onCandidateSelect,
}) {
  return (
    <div className="overflow-hidden border border-[#242424] bg-[#0d0d0d]">

      {/* =====================================================
          TABLE HEADER
      ====================================================== */}

      <div className="grid grid-cols-[2fr_1.5fr_0.8fr_1fr_1fr_40px] border-b border-[#242424] bg-[#111111] px-6 py-4">

        <TableHeading>
          Candidate
        </TableHeading>

        <TableHeading>
          Job
        </TableHeading>

        <TableHeading>
          AI Score
        </TableHeading>

        <TableHeading>
          Interview
        </TableHeading>

        <TableHeading>
          Status
        </TableHeading>

        <span />

      </div>


      {/* =====================================================
          TABLE ROWS
      ====================================================== */}

      <div className="divide-y divide-[#202020]">

        {candidates.length > 0 ? (

          candidates.map((candidate) => {

            const candidateId =
              candidate.id ||
              candidate.candidateId ||
              candidate.userId

            return (
              <CandidateRow
                key={candidateId}
                candidate={candidate}
                onClick={() =>
                  onCandidateSelect?.(candidate)
                }
              />
            )
          })

        ) : (

          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">

            <p className="text-sm font-medium text-zinc-300">
              No candidates found
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Candidates matching your filters will appear here.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}


function TableHeading({ children }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
      {children}
    </span>
  )
}


export default CandidateTable