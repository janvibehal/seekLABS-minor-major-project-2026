import type { Request, Response } from "express";
import type { Difficulty } from "../../generated/prisma/enums.js";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import {
  createQuestion,
  findQuestions,
} from "../../repositories/question.repository.js";
import {
  createQuestionSchema,
  questionFilterSchema,
} from "../../validators/recruiter/question.validator.js";

export const getQuestionsController = async (req: Request, res: Response) => {
  const { difficulty } = questionFilterSchema.parse(req.query);
  const questions = await findQuestions(difficulty as Difficulty | undefined);

  return res.status(200).json({
    success: true,
    data: questions,
  });
};

export const createQuestionController = async (req: Request, res: Response) => {
  const input = createQuestionSchema.parse(req.body);
  const question = await createQuestion({
    ...input,
    examples: input.examples as InputJsonValue,
  });

  return res.status(201).json({
    success: true,
    message: "Question created successfully",
    data: question,
  });
};
