import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { AccessTokenPayload } from '../utils/jwt.js'

export interface AuthenticatedRequest
  extends Request {
  user: AccessTokenPayload
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization

  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization header',
    })
  }

  try {
    const payload = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as AccessTokenPayload

    ;(req as AuthenticatedRequest).user = payload

    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    })
  }
}