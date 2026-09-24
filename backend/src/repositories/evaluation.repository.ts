import prisma from "../lib/prisma.js";

export const createEvaluation = async (data: {
  interviewId: string;
  sessionId: string;
  candidateId: string;
  overallScore: number;
  algorithmCorrectness: number;
  logicalReasoning: number;
  conceptCoverage: number;
  completeness: number;
  dataStructure: number;
  complexity: number;
  edgeCases: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}) => {
  return prisma.evaluation.create({
    data,
  });
};

export const findEvaluationByInterviewId = async (interviewId: string) => {
  return prisma.evaluation.findUnique({
    where: {
      interviewId,
    },
    include: {
      session: {
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
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
      },
    },
  });
};

export const findEvaluationsByCandidate = async (candidateId: string) => {
  return prisma.evaluation.findMany({
    where: {
      candidateId,
    },
    include: {
      interview: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
