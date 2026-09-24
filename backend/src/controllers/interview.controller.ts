import type { Request, Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'

import {
  listCandidateInterviews,
  getCandidateInterview,
  startInterview,
} from '../services/interview.service.js'

import {
  interviewIdParamSchema,
  interviewStatusFilterSchema,
} from '../validators/interview.validator.js'

export const listInterviews = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const { status } = interviewStatusFilterSchema.parse(req.query)

  const data = await listCandidateInterviews(user.userId, status)

  return res.status(200).json({
    success: true,
    data,
  })
}

export const getInterview = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const { interviewId } = interviewIdParamSchema.parse(req.params)

  const data = await getCandidateInterview(user.userId, interviewId)

  return res.status(200).json({
    success: true,
    data,
  })
}

export const start = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const { interviewId } = interviewIdParamSchema.parse(req.params)

  const data = await startInterview(user.userId, interviewId)

  return res.status(200).json({
    success: true,
    data,
  })
}
