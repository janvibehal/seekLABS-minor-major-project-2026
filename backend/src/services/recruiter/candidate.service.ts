import {
  findCandidateByIdForRecruiter,
  findCandidatesByRecruiter,
  findAllCandidatesForSelection,
} from '../../repositories/recruiter/candidate.repository.js'

import { NotFoundError } from '../../utils/app-error.js'

// ─────────────────────────────────────────────
// GET ALL CANDIDATES FOR INTERVIEW SELECTION
// ─────────────────────────────────────────────

export const getAllCandidatesForSelection = async () => {
  const candidates = await findAllCandidatesForSelection()

  return candidates.map((candidate) => ({
    id: candidate.id,

    firstName: candidate.firstName,
    lastName: candidate.lastName,

    name: `${candidate.firstName || ''} ${
      candidate.lastName || ''
    }`.trim(),

    email: candidate.email,

    joinedAt: candidate.createdAt,
  }))
}

// ─────────────────────────────────────────────
// GET ALL CANDIDATES FOR A RECRUITER
// ─────────────────────────────────────────────

export const getRecruiterCandidates = async (
  recruiterId: string,
) => {
  const candidates = await findCandidatesByRecruiter(
    recruiterId,
  )

  return candidates.map((candidate) => {
    const interviews = candidate.candidateInterviews || []

    const scores = interviews
      .map(
        (interview) =>
          interview.evaluation?.overallScore,
      )
      .filter(
        (score): score is number =>
          typeof score === 'number',
      )

    const latestInterview = interviews[0] ?? null

    const latestScore =
      latestInterview?.evaluation?.overallScore ?? null

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (sum, score) => sum + score,
              0,
            ) / scores.length,
          )
        : null

    return {
      id: candidate.id,

      firstName: candidate.firstName,
      lastName: candidate.lastName,

      name: `${candidate.firstName || ''} ${
        candidate.lastName || ''
      }`.trim(),

      email: candidate.email,

      interviewCount: interviews.length,

      latestInterview: latestInterview
        ? {
            id: latestInterview.id,
            title: latestInterview.title,
            type: latestInterview.type,
            company: latestInterview.company,
            scheduledAt: latestInterview.scheduledAt,
            status: latestInterview.status,
          }
        : null,

      latestScore,

      averageScore,
    }
  })
}


// ─────────────────────────────────────────────
// GET SINGLE CANDIDATE FOR A RECRUITER
// ─────────────────────────────────────────────

export const getRecruiterCandidateById = async (
  recruiterId: string,
  candidateId: string,
) => {
  const candidate =
    await findCandidateByIdForRecruiter(
      candidateId,
      recruiterId,
    )

  if (!candidate) {
    throw new NotFoundError(
      'Candidate not found',
    )
  }

  const interviews =
    candidate.candidateInterviews || []


  // ============================================================
  // SCORES
  // ============================================================

  const scores = interviews
    .map(
      (interview) =>
        interview.evaluation?.overallScore,
    )
    .filter(
      (score): score is number =>
        typeof score === 'number',
    )

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce(
            (sum, score) => sum + score,
            0,
          ) / scores.length,
        )
      : null


  // ============================================================
  // NORMALIZE INTERVIEWS
  // ============================================================

  const normalizedInterviews =
    interviews.map((interview) => ({
      id: interview.id,

      title: interview.title,

      type: interview.type,

      company: interview.company,

      status: interview.status,

      scheduledAt: interview.scheduledAt,

      duration: interview.duration,


      // Evaluation

      evaluation: interview.evaluation
        ? {
            overallScore:
              interview.evaluation.overallScore,

            algorithmCorrectness:
              interview.evaluation.algorithmCorrectness,

            logicalReasoning:
              interview.evaluation.logicalReasoning,

            conceptCoverage:
              interview.evaluation.conceptCoverage,

            completeness:
              interview.evaluation.completeness,

            dataStructure:
              interview.evaluation.dataStructure,

            complexity:
              interview.evaluation.complexity,

            edgeCases:
              interview.evaluation.edgeCases,

            strengths:
              interview.evaluation.strengths,

            improvements:
              interview.evaluation.improvements,

            feedback:
              interview.evaluation.feedback,
          }
        : null,
    }))


  // ============================================================
  // RESPONSE
  // ============================================================

  return {
    id: candidate.id,

    firstName: candidate.firstName,

    lastName: candidate.lastName,

    name: `${candidate.firstName || ''} ${
      candidate.lastName || ''
    }`.trim(),

    email: candidate.email,

    joinedAt: candidate.createdAt,


    stats: {
      totalInterviews: interviews.length,

      completedInterviews:
        interviews.filter(
          (interview) =>
            interview.status === 'COMPLETED',
        ).length,

      evaluatedInterviews:
        interviews.filter(
          (interview) =>
            interview.evaluation !== null &&
            interview.evaluation !== undefined,
        ).length,

      averageScore,
    },


    interviews: normalizedInterviews,
  }
}