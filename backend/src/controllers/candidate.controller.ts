import type { Request, Response } from 'express'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'

import {
  getCandidateDashboard,
  listCandidateResults,
  getCandidateResultDetail,
} from '../services/candidate.service.js'

import { getCandidatePreparation } from '../services/preparation.service.js'

import { interviewIdParamSchema } from '../validators/interview.validator.js'


export const dashboard = async (
  req: Request,
  res: Response,
) => {
  const { user } =
    req as AuthenticatedRequest

  const data =
    await getCandidateDashboard(
      user.userId,
    )

  return res.status(200).json({
    success: true,
    data,
  })
}


export const listResults = async (
  req: Request,
  res: Response,
) => {
  const { user } =
    req as AuthenticatedRequest

  const data =
    await listCandidateResults(
      user.userId,
    )

  return res.status(200).json({
    success: true,
    data,
  })
}


export const getResultDetail = async (
  req: Request,
  res: Response,
) => {
  const { user } =
    req as AuthenticatedRequest

  const { interviewId } =
    interviewIdParamSchema.parse(
      req.params,
    )

  const data =
    await getCandidateResultDetail(
      user.userId,
      interviewId,
    )

  return res.status(200).json({
    success: true,
    data,
  })
}


export const preparation = async (
  req: Request,
  res: Response,
) => {
  const { user } =
    req as AuthenticatedRequest

  const data =
    await getCandidatePreparation(
      user.userId,
    )

  return res.status(200).json({
    success: true,
    data,
  })
}