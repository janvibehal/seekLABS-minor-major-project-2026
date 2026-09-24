import { useEffect, useMemo, useState } from 'react'


function CandidateDetails({ candidate, onClose }) {

  // ============================================================
  // GET INTERVIEWS
  // ============================================================

  const interviews = candidate.interviews || []


  // ============================================================
  // FIND FIRST INTERVIEW WITH EVALUATION
  // ============================================================

  const firstEvaluatedInterview = useMemo(() => {
    return interviews.find(
      (interview) => interview.evaluation,
    ) || interviews[0] || null
  }, [interviews])


  // ============================================================
  // SELECTED INTERVIEW
  // ============================================================

  const [selectedInterviewId, setSelectedInterviewId] =
    useState(firstEvaluatedInterview?.id || '')


  // Reset selection when candidate changes

  useEffect(() => {
    setSelectedInterviewId(
      firstEvaluatedInterview?.id || '',
    )
  }, [candidate.id, firstEvaluatedInterview])


  // ============================================================
  // CURRENT SELECTED INTERVIEW
  // ============================================================

  const selectedInterview = useMemo(() => {
    return interviews.find(
      (interview) =>
        interview.id === selectedInterviewId,
    ) || null
  }, [interviews, selectedInterviewId])


  const evaluation =
    selectedInterview?.evaluation || null


  const overallScore =
    evaluation?.overallScore ?? null


  // ============================================================
  // INITIALS
  // ============================================================

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }


  // ============================================================
  // EVALUATION DIMENSIONS
  // ============================================================

  const dimensions = evaluation
    ? [
        {
          label: 'Algorithm Correctness',
          score: evaluation.algorithmCorrectness,
        },
        {
          label: 'Logical Reasoning',
          score: evaluation.logicalReasoning,
        },
        {
          label: 'Concept Coverage',
          score: evaluation.conceptCoverage,
        },
        {
          label: 'Completeness',
          score: evaluation.completeness,
        },
        {
          label: 'Data Structure Selection',
          score: evaluation.dataStructure,
        },
        {
          label: 'Time & Space Complexity',
          score: evaluation.complexity,
        },
        {
          label: 'Edge Case Handling',
          score: evaluation.edgeCases,
        },
      ].filter(
        (dimension) =>
          dimension.score !== null &&
          dimension.score !== undefined,
      )
    : []


  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">

      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close candidate details"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />


      {/* =====================================================
          SIDE PANEL
      ====================================================== */}

      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-zinc-800 bg-[#111111] shadow-2xl">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-5">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Candidate Profile
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              {candidate.name}
            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-zinc-800 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
          >
            <CloseIcon />
          </button>

        </div>


        {/* =================================================
            SCROLLABLE CONTENT
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto">


          {/* =================================================
              CANDIDATE PROFILE
          ================================================= */}

          <div className="border-b border-zinc-800 px-6 py-6">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center border border-zinc-700 bg-zinc-900 text-sm font-semibold text-white">

                {getInitials(candidate.name)}

              </div>


              <div>

                <h3 className="text-sm font-semibold text-white">
                  {candidate.name}
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  {candidate.email}
                </p>

                <p className="mt-2 text-xs text-zinc-400">
                  {candidate.stats?.totalInterviews || 0} interviews
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              STATS
          ================================================= */}

          <div className="grid grid-cols-3 divide-x divide-zinc-800 border-b border-zinc-800">

            <StatBox
              label="Total"
              value={
                candidate.stats?.totalInterviews ?? 0
              }
            />

            <StatBox
              label="Completed"
              value={
                candidate.stats?.completedInterviews ?? 0
              }
            />

            <StatBox
              label="Evaluated"
              value={
                candidate.stats?.evaluatedInterviews ?? 0
              }
            />

          </div>


          {/* =================================================
              INTERVIEW SELECTOR
          ================================================= */}

          <div className="border-b border-zinc-800 px-6 py-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Interview Evaluation
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Select an interview to view its results.
                </p>

              </div>

              <span className="text-xs text-zinc-600">
                {interviews.length} total
              </span>

            </div>


            {/* DROPDOWN */}

            {interviews.length > 0 ? (

              <div className="mt-5">

                <select
                  value={selectedInterviewId}
                  onChange={(event) =>
                    setSelectedInterviewId(
                      event.target.value,
                    )
                  }
                  className="w-full appearance-none border border-zinc-700 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500"
                >

                  {interviews.map((interview) => (

                    <option
                      key={interview.id}
                      value={interview.id}
                      className="bg-[#181818]"
                    >

                      {interview.title}
                      {' — '}
                      {interview.status}
                      {interview.evaluation
                        ? ` — Score: ${interview.evaluation.overallScore}`
                        : ' — Evaluation Pending'}

                    </option>

                  ))}

                </select>

              </div>

            ) : (

              <div className="mt-5 border border-dashed border-zinc-800 py-8 text-center">

                <p className="text-sm text-zinc-500">
                  No interviews found for this candidate.
                </p>

              </div>

            )}

          </div>


          {/* =================================================
              SELECTED INTERVIEW INFO
          ================================================= */}

          {selectedInterview && (

            <div className="border-b border-zinc-800 px-6 py-6">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">


                {/* INTERVIEW INFO */}

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                    Selected Interview
                  </p>

                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {selectedInterview.title}
                  </h3>


                  <div className="mt-3 flex flex-wrap gap-2">

                    {selectedInterview.type && (

                      <Badge>
                        {selectedInterview.type}
                      </Badge>

                    )}

                    <Badge>
                      {selectedInterview.status}
                    </Badge>


                    {selectedInterview.duration && (

                      <Badge>
                        {selectedInterview.duration} min
                      </Badge>

                    )}

                  </div>

                </div>


                {/* SCORE */}

                {evaluation ? (

                  <div className="border border-zinc-800 bg-[#151515] px-5 py-4 text-left sm:text-right">

                    <p className="text-3xl font-semibold tracking-tight text-white">
                      {overallScore}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                      AI Score
                    </p>

                  </div>

                ) : (

                  <div className="border border-zinc-800 bg-[#151515] px-4 py-3">

                    <p className="text-xs text-zinc-500">
                      Evaluation pending
                    </p>

                  </div>

                )}

              </div>


              {/* SCORE BAR */}

              {evaluation && (

                <div className="mt-6">

                  <div className="flex items-center justify-between text-xs">

                    <span className="text-zinc-500">
                      Overall Performance
                    </span>

                    <span className="font-semibold text-white">
                      {overallScore}/100
                    </span>

                  </div>


                  <div className="mt-3 h-1.5 w-full overflow-hidden bg-zinc-800">

                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(overallScore || 0, 0),
                          100,
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              )}

            </div>

          )}


          {/* =================================================
              EVALUATION BREAKDOWN
          ================================================= */}

          {evaluation && dimensions.length > 0 && (

            <div className="border-b border-zinc-800 px-6 py-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Evaluation Breakdown
              </p>


              <div className="mt-6 space-y-5">

                {dimensions.map((dimension) => (

                  <ScoreRow
                    key={dimension.label}
                    label={dimension.label}
                    score={dimension.score}
                  />

                ))}

              </div>

            </div>

          )}


          {/* =================================================
              NO EVALUATION
          ================================================= */}

          {selectedInterview && !evaluation && (

            <div className="border-b border-zinc-800 px-6 py-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-zinc-800 bg-[#151515]">

                <DocumentIcon />

              </div>

              <p className="mt-5 text-sm font-medium text-zinc-300">
                No evaluation available
              </p>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
                This interview has been completed, but an AI evaluation
                has not been generated yet.
              </p>

            </div>

          )}


          {/* =================================================
              AI FEEDBACK
          ================================================= */}

          {evaluation?.feedback && (

            <div className="border-b border-zinc-800 px-6 py-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                AI Feedback
              </p>

              <p className="mt-4 text-sm leading-6 text-zinc-400">
                {evaluation.feedback}
              </p>

            </div>

          )}


          {/* =================================================
              STRENGTHS
          ================================================= */}

          {evaluation?.strengths && (

            <div className="border-b border-zinc-800 px-6 py-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Strengths
              </p>


              <div className="mt-4 space-y-3">

                {Array.isArray(evaluation.strengths)

                  ? evaluation.strengths.map(
                      (strength, index) => (

                        <InsightItem
                          key={index}
                          text={strength}
                        />

                      ),
                    )

                  : (

                    <InsightItem
                      text={evaluation.strengths}
                    />

                  )}

              </div>

            </div>

          )}


          {/* =================================================
              IMPROVEMENTS
          ================================================= */}

          {evaluation?.improvements && (

            <div className="px-6 py-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Areas for Improvement
              </p>


              <div className="mt-4 space-y-3">

                {Array.isArray(evaluation.improvements)

                  ? evaluation.improvements.map(
                      (improvement, index) => (

                        <InsightItem
                          key={index}
                          text={improvement}
                        />

                      ),
                    )

                  : (

                    <InsightItem
                      text={evaluation.improvements}
                    />

                  )}

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  )
}


// ============================================================
// COMPONENTS
// ============================================================

function StatBox({ label, value }) {
  return (
    <div className="px-5 py-5">

      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-white">
        {value}
      </p>

    </div>
  )
}


function Badge({ children }) {
  return (
    <span className="border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[10px] text-zinc-500">
      {children}
    </span>
  )
}


function InsightItem({ text }) {
  return (
    <div className="border-l border-zinc-600 pl-4">

      <p className="text-sm leading-6 text-zinc-400">
        {text}
      </p>

    </div>
  )
}


function ScoreRow({ label, score }) {
  const safeScore = Math.min(
    Math.max(Number(score) || 0, 0),
    100,
  )

  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="text-xs text-zinc-400">
          {label}
        </span>

        <span className="text-xs font-semibold text-white">
          {safeScore}
        </span>

      </div>


      <div className="mt-2 h-1.5 w-full overflow-hidden bg-zinc-800">

        <div
          className="h-full bg-zinc-200 transition-all duration-500"
          style={{
            width: `${safeScore}%`,
          }}
        />

      </div>

    </div>
  )
}


function CloseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}


function DocumentIcon() {
  return (
    <svg
      className="h-5 w-5 text-zinc-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}


export default CandidateDetails