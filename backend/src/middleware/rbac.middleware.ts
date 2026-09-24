import type { NextFunction, Request, Response } from 'express'
import type { AuthenticatedRequest } from './auth.middleware.js'
import type { Role } from '../generated/prisma/enums.js'

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authenticatedRequest = req as AuthenticatedRequest

    if (!authenticatedRequest.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!roles.includes(authenticatedRequest.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      })
    }

    next()
  }
}
