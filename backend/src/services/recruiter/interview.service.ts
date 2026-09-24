import type { InterviewStatus } from '../../generated/prisma/enums.js'

import {
  createInterview,
  deleteInterviewByRecruiter,
  findInterviewByIdAndRecruiter,
  findInterviewsByRecruiter,
  updateInterviewByRecruiter,
  updateInterviewStatusByRecruiter,
} from '../../repositories/recruiter/interview.repository.js'


// ─────────────────────────────────────────────
// CREATE INTERVIEW
// ─────────────────────────────────────────────

export const createRecruiterInterview = async (
  recruiterId: string,

  data: {
    title: string
    type?: string
    company?: string
    focusAreas: string[]
    scheduledAt: Date
    duration?: number
    candidateId: string
    questionIds: string[]
  },
) => {
  return createInterview({
    ...data,
    recruiterId,
  })
}


// ─────────────────────────────────────────────
// CREATE INTERVIEWS FOR MULTIPLE CANDIDATES
// ─────────────────────────────────────────────

export const createRecruiterInterviews = async (
  recruiterId: string,

  data: {
    title: string
    type?: string
    company?: string
    focusAreas: string[]
    scheduledAt: Date
    duration?: number
    candidateIds: string[]
    questionIds: string[]
  },
) => {
  return Promise.all(
    data.candidateIds.map((candidateId) =>
      createInterview({
        title: data.title,
        focusAreas: data.focusAreas,
        scheduledAt: data.scheduledAt,
        candidateId,
        recruiterId,
        questionIds: data.questionIds,
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.company !== undefined ? { company: data.company } : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
      }),
    ),
  )
}


// ─────────────────────────────────────────────
// GET ALL RECRUITER INTERVIEWS
// ─────────────────────────────────────────────

export const getRecruiterInterviews = async (
  recruiterId: string,
  status?: InterviewStatus,
) => {
  const interviews = await findInterviewsByRecruiter(
    recruiterId,
    status,
  )

  return interviews.map((interview) => ({
    id: interview.id,

    title: interview.title,

    type: interview.type,

    company: interview.company,

    focusAreas: interview.focusAreas,

    scheduledAt: interview.scheduledAt,

    duration: interview.duration,

    status: interview.status,

    candidate: {
      id: interview.candidate.id,

      name:
        `${interview.candidate.firstName} ${interview.candidate.lastName}`,

      email: interview.candidate.email,

      initials:
        `${interview.candidate.firstName.charAt(0)}${interview.candidate.lastName.charAt(0)}`,
    },

    score: interview.evaluation?.overallScore ?? null,

    session: interview.session
      ? {
          id: interview.session.id,

          status: interview.session.status,

          startedAt: interview.session.startedAt,

          endedAt: interview.session.endedAt,
        }
      : null,

    questionCount: interview.questions.length,

    createdAt: interview.createdAt,
  }))
}


// ─────────────────────────────────────────────
// GET SINGLE INTERVIEW
// ─────────────────────────────────────────────

export const getRecruiterInterviewById = async (
  recruiterId: string,
  interviewId: string,
) => {
  return findInterviewByIdAndRecruiter(
    interviewId,
    recruiterId,
  )
}


// ─────────────────────────────────────────────
// UPDATE INTERVIEW
// ─────────────────────────────────────────────

export const updateRecruiterInterview = async (
  recruiterId: string,
  interviewId: string,

  data: {
    title?: string
    type?: string
    company?: string | null
    focusAreas?: string[]
    scheduledAt?: Date
    duration?: number
    status?: InterviewStatus
  },
) => {
  return updateInterviewByRecruiter(
    interviewId,
    recruiterId,
    data,
  )
}


// ─────────────────────────────────────────────
// UPDATE INTERVIEW STATUS
// ─────────────────────────────────────────────

export const updateRecruiterInterviewStatus = async (
  recruiterId: string,
  interviewId: string,
  status: InterviewStatus,
) => {
  return updateInterviewStatusByRecruiter(
    interviewId,
    recruiterId,
    status,
  )
}


// ─────────────────────────────────────────────
// DELETE INTERVIEW
// ─────────────────────────────────────────────

export const deleteRecruiterInterview = async (
  recruiterId: string,
  interviewId: string,
) => {
  return deleteInterviewByRecruiter(
    interviewId,
    recruiterId,
  )
}