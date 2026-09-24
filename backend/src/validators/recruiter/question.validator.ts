import { z } from "zod";

export const questionDifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const questionFilterSchema = z.object({
  difficulty: questionDifficultySchema.optional(),
});

export const createQuestionSchema = z.object({
  title: z.string().trim().min(2).max(200),
  difficulty: questionDifficultySchema.default("MEDIUM"),
  topics: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().min(1),
  examples: z.array(z.unknown()).default([]),
  constraints: z.array(z.string().trim().min(1)).default([]),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
