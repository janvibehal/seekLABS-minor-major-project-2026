import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface AccessTokenPayload {
  userId: string
  role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE'
}

export const generateAccessToken = (
  payload: AccessTokenPayload,
): string => {
  return jwt.sign(
    payload,
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as '15m',
    },
  )
}

export interface RefreshTokenPayload {
  userId: string
}

export const generateRefreshToken = (
  payload: RefreshTokenPayload,
): string => {
  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as '7d',
    },
  )
}

export const verifyRefreshToken = (
  token: string,
): RefreshTokenPayload => {
  return jwt.verify(
    token,
    env.JWT_REFRESH_SECRET,
  ) as RefreshTokenPayload
}