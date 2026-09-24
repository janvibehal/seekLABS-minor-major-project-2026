import prisma from "../lib/prisma.js";
import type { Difficulty } from "../generated/prisma/enums.js";
import type { InputJsonValue } from "@prisma/client/runtime/client";

export const findQuestions = async (difficulty?: Difficulty) => {
  return prisma.question.findMany({
    ...(difficulty ? { where: { difficulty } } : {}),
    orderBy: { createdAt: "desc" },
  });
};

export const createQuestion = async (data: {
  title: string;
  difficulty: Difficulty;
  topics: string[];
  description: string;
  examples: InputJsonValue;
  constraints: string[];
}) => {
  return prisma.question.create({ data });
};

export const findQuestionById = async (questionId: string) => {
  return prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });
};

export const findQuestionsByIds = async (questionIds: string[]) => {
  return prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
  });
};
