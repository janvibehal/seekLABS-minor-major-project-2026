import prisma from "../lib/prisma.js";
import type {
  SessionStatus,
  QuestionStatus,
} from "../generated/prisma/enums.js";

export const createSession = async (data: {
  interviewId: string;
  candidateId: string;
  currentQuestionId: string | null;
}) => {
  return prisma.interviewSession.create({
    data,
  });
};

export const findSessionById = async (sessionId: string) => {
  return prisma.interviewSession.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      interview: {
        include: {
          questions: {
            include: {
              question: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
};

export const findSessionByInterviewId = async (interviewId: string) => {
  return prisma.interviewSession.findUnique({
    where: {
      interviewId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const updateSessionCurrentQuestion = async (
  sessionId: string,
  currentQuestionId: string | null,
) => {
  return prisma.interviewSession.update({
    where: {
      id: sessionId,
    },
    data: {
      currentQuestionId,
    },
  });
};

export const endSession = async (
  sessionId: string,
  data: {
    status: SessionStatus;
    endedAt: Date;
    durationSeconds: number;
  },
) => {
  return prisma.interviewSession.updateMany({
    where: {
      id: sessionId,
      status: "IN_PROGRESS",
    },
    data,
  });
};

export const upsertQuestionAttempt = async (data: {
  sessionId: string;
  questionId: string;
  candidateId: string;
  status: QuestionStatus;
}) => {
  return prisma.questionAttempt.upsert({
    where: {
      sessionId_questionId: {
        sessionId: data.sessionId,
        questionId: data.questionId,
      },
    },
    update: {
      status: data.status,
      ...(data.status === "COMPLETED" ? { completedAt: new Date() } : {}),
    },
    create: {
      sessionId: data.sessionId,
      questionId: data.questionId,
      candidateId: data.candidateId,
      status: data.status,
    },
  });
};

export const updateInterviewQuestionStatus = async (
  interviewId: string,
  questionId: string,
  status: QuestionStatus,
) => {
  return prisma.interviewQuestion.update({
    where: {
      interviewId_questionId: {
        interviewId,
        questionId,
      },
    },
    data: {
      status,
    },
  });
};

export const countMessagesForQuestion = async (
  sessionId: string,
  questionId: string,
) => {
  return prisma.message.count({
    where: {
      sessionId,
      questionId,
      sender: "CANDIDATE",
    },
  });
};

export const countCompletedAttemptsByCandidate = async (
  candidateId: string,
) => {
  return prisma.questionAttempt.count({
    where: {
      candidateId,
      status: "COMPLETED",
    },
  });
};
