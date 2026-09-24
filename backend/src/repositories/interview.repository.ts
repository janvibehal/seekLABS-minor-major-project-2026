import prisma from '../lib/prisma.js'
import type { InterviewStatus } from '../generated/prisma/enums.js'

export const findInterviewsByCandidate = async (
  candidateId: string,
  status?: InterviewStatus,
) => {
  return prisma.interview.findMany({
    where: {
      candidateId,
      ...(status ? { status } : {}),
    },
    include: {
      evaluation: true,
      session: true,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })
}

export const findInterviewById = async (interviewId: string) => {
  return prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
    include: {
      evaluation: true,
      session: true,
    },
  })
}

export const findInterviewWithQuestions = async (interviewId: string) => {
  return prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
    include: {
      questions: {
        include: {
          question: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
      session: true,
    },
  })
}

export const countInterviewsByCandidateAndStatus = async (
  candidateId: string,
  status: InterviewStatus,
) => {
  return prisma.interview.count({
    where: {
      candidateId,
      status,
    },
  })
}

export const updateInterviewStatus = async (
  interviewId: string,
  status: InterviewStatus,
) => {
  return prisma.interview.update({
    where: {
      id: interviewId,
    },
    data: {
      status,
    },
  })
}
