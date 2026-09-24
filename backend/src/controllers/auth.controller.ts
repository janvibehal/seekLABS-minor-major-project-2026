import type { Request, Response } from 'express'
import { registerUser , loginUser , refreshAccessToken , getCurrentUser , logoutUser} from '../services/auth.service.js'
import { registerSchema , loginSchema } from '../validators/auth.validator.js'
import { setRefreshTokenCookie , clearRefreshTokenCookie } from '../utils/cookies.js'
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'

export const register = async (
  req: Request,
  res: Response,
) => {
  const input = registerSchema.parse(req.body)

  const user = await registerUser(input)

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: user,
  })
}

export const login = async (
  req: Request,
  res: Response,
) => {
  const input = loginSchema.parse(req.body)

  const result = await loginUser(input)

  setRefreshTokenCookie(res, result.refreshToken)

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result.user,
    accessToken: result.accessToken,
  })
}


export const refresh = async (
  req: Request,
  res: Response,
) => {
  const refreshToken = req.cookies.refreshToken as
    | string
    | undefined

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is missing',
    })
  }

  const result = await refreshAccessToken(refreshToken)

  return res.status(200).json({
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  })
}

export const me = async (
  req: Request,
  res: Response,
) => {
  const authenticatedRequest =
    req as AuthenticatedRequest

  const user = await getCurrentUser(
    authenticatedRequest.user.userId,
  )

  return res.status(200).json({
    success: true,
    data: user,
  })
}


export const logout = async (
  req: Request,
  res: Response,
) => {
  const refreshToken = req.cookies.refreshToken as
    | string
    | undefined

  if (refreshToken) {
    await logoutUser(refreshToken)
  }

  clearRefreshTokenCookie(res)

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}