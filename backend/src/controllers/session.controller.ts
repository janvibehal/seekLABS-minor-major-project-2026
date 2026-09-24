import type { Request, Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'

import {
  getSessionDetail,
  getSessionMessages,
  sendCandidateMessage,
  endInterviewSession,
} from '../services/session.service.js'

import {
  sessionIdParamSchema,
  sendMessageSchema,
} from '../validators/session.validator.js'

export const getSession = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const { sessionId } = sessionIdParamSchema.parse(req.params)

  const data = await getSessionDetail(user.userId, sessionId)

  return res.status(200).json({
    success: true,
    data,
  })
}

export const getMessages = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const { sessionId } = sessionIdParamSchema.parse(req.params)

  const data = await getSessionMessages(user.userId, sessionId)

  return res.status(200).json({
    success: true,
    data,
  })
}

export const sendMessage = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const { sessionId } = sessionIdParamSchema.parse(req.params)
  const input = sendMessageSchema.parse(req.body)

  const data = await sendCandidateMessage(user.userId, sessionId, input)

  return res.status(201).json({
    success: true,
    data,
  })
}

export const end = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const { sessionId } = sessionIdParamSchema.parse(req.params)

  const data = await endInterviewSession(user.userId, sessionId)

  return res.status(200).json({
    success: true,
    message: data.message,
    data,
  })
}
