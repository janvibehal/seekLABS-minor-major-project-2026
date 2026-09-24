import prisma from "../../lib/prisma.js";

import type { InterviewStatus } from "../../generated/prisma/enums.js";

// ─────────────────────────────────────────────
// CREATE INTERVIEW
// ─────────────────────────────────────────────

export const createInterview = async (data: {
  title: string;
  type?: string;
  company?: string;
  focusAreas: string[];
  scheduledAt: Date;
  duration?: number;
  candidateId: string;
  recruiterId: string;
  questionIds: string[];
}) => {
  const {
    title,
    type,
    company,
    focusAreas,
    scheduledAt,
    duration,
    candidateId,
    recruiterId,
    questionIds,
  } = data;

  const existingQuestions = questionIds.length
    ? await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true },
      })
    : [];

  const existingQuestionIds = new Set(
    existingQuestions.map((question) => question.id),
  );

  return prisma.interview.create({
    data: {
      title,

      type: type ?? "Technical Interview",

      ...(company !== undefined ? { company } : {}),

      focusAreas,

      scheduledAt,

      duration: duration ?? 45,

      candidateId,

      recruiterId,

      questions: {
        create: questionIds
          .map((questionId, index) => ({
            questionId,
            order: index + 1,
          }))
          .filter(({ questionId }) => existingQuestionIds.has(questionId)),
      },
    },

    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      questions: {
        include: {
          question: true,
        },

        orderBy: {
          order: "asc",
        },
      },
    },
  });
};

// ─────────────────────────────────────────────
// GET ALL INTERVIEWS CREATED BY RECRUITER
// ─────────────────────────────────────────────

export const findInterviewsByRecruiter = async (
  recruiterId: string,
  status?: InterviewStatus,
) => {
  return prisma.interview.findMany({
    where: {
      recruiterId,

      ...(status !== undefined ? { status } : {}),
    },

    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      questions: {
        include: {
          question: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              topics: true,
            },
          },
        },

        orderBy: {
          order: "asc",
        },
      },

      evaluation: true,

      session: true,
    },

    orderBy: {
      scheduledAt: "desc",
    },
  });
};

// ─────────────────────────────────────────────
// GET SINGLE INTERVIEW
// ONLY IF IT BELONGS TO THE RECRUITER
// ─────────────────────────────────────────────

export const findInterviewByIdAndRecruiter = async (
  interviewId: string,
  recruiterId: string,
) => {
  return prisma.interview.findFirst({
    where: {
      id: interviewId,
      recruiterId,
    },

    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      questions: {
        include: {
          question: true,
        },

        orderBy: {
          order: "asc",
        },
      },

      session: {
        include: {
          attempts: {
            include: {
              question: true,
            },
          },
        },
      },

      evaluation: true,
    },
  });
};

// ─────────────────────────────────────────────
// UPDATE INTERVIEW STATUS
// ─────────────────────────────────────────────

export const updateInterviewStatusByRecruiter = async (
  interviewId: string,
  recruiterId: string,
  status: InterviewStatus,
) => {
  return prisma.interview.updateMany({
    where: {
      id: interviewId,
      recruiterId,
    },

    data: {
      status,
    },
  });
};

// ─────────────────────────────────────────────
// UPDATE INTERVIEW
// ─────────────────────────────────────────────

export const updateInterviewByRecruiter = async (
  interviewId: string,
  recruiterId: string,

  data: {
    title?: string;
    type?: string;
    company?: string | null;
    focusAreas?: string[];
    scheduledAt?: Date;
    duration?: number;
    status?: InterviewStatus;
  },
) => {
  return prisma.interview.updateMany({
    where: {
      id: interviewId,
      recruiterId,
    },

    data,
  });
};

// ─────────────────────────────────────────────
// DELETE INTERVIEW
// ONLY IF IT BELONGS TO THE RECRUITER
// ─────────────────────────────────────────────

export const deleteInterviewByRecruiter = async (
  interviewId: string,
  recruiterId: string,
) => {
  return prisma.interview.deleteMany({
    where: {
      id: interviewId,
      recruiterId,
    },
  });
};
