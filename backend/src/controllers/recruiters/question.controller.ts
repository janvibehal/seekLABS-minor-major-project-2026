import type {
  Request,
  Response,
} from "express"

import type { Difficulty } from "../../generated/prisma/enums.js"

import type { InputJsonValue } from "@prisma/client/runtime/client"

import {
  createQuestion,
  findQuestions,
} from "../../repositories/question.repository.js"

import {
  getRecruiterLeetCodeQuestions,
  importLeetCodeQuestion,
} from "../../services/recruiter/question.service.js"

import {
  createQuestionSchema,
  questionFilterSchema,
} from "../../validators/recruiter/question.validator.js"

export const getQuestionsController =
  async (
    req: Request,
    res: Response,
  ) => {
    const {
      difficulty,
    } =
      questionFilterSchema.parse(
        req.query,
      )

    const query =
      typeof req.query.query ===
      "string"
        ? req.query.query.trim()
        : ""

    const pageRaw =
      typeof req.query.page ===
      "string"
        ? Number(req.query.page)
        : 1

    const page =
      Number.isFinite(pageRaw) &&
      pageRaw >= 1
        ? Math.floor(pageRaw)
        : 1

    const limit = 5

    const skip =
      (page - 1) * limit

    if (
      query ||
      req.query.source ===
        "leetcode"
    ) {
      const result =
        await getRecruiterLeetCodeQuestions(
          {
            query,

            ...(difficulty
              ? {
                  difficulty:
                    difficulty as Difficulty,
                }
              : {}),

            limit,
            skip,
          },
        )

      return res.status(200).json({
        success: true,

        data: result.data,

        pagination:
          result.pagination,
      })
    }

    const questions =
      await findQuestions(
        difficulty as
          | Difficulty
          | undefined,
      )

    return res.status(200).json({
      success: true,
      data: questions,
    })
  }

export const importLeetCodeQuestionController =
  async (
    req: Request,
    res: Response,
  ) => {
    const titleSlug =
      typeof req.body?.titleSlug ===
      "string"
        ? req.body.titleSlug.trim()
        : ""

    if (!titleSlug) {
      return res.status(400).json({
        success: false,
        message:
          "titleSlug is required",
      })
    }

    const question =
      await importLeetCodeQuestion(
        titleSlug,
      )

    return res.status(200).json({
      success: true,

      message:
        "LeetCode question added to the question bank",

      data: question,
    })
  }

export const createQuestionController =
  async (
    req: Request,
    res: Response,
  ) => {
    const input =
      createQuestionSchema.parse(
        req.body,
      )

    const question =
      await createQuestion({
        ...input,

        examples:
          input.examples as InputJsonValue,
      })

    return res.status(201).json({
      success: true,
      message:
        "Question created successfully",
      data: question,
    })
  }