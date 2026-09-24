import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/app-error.js'

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  console.error(error)

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues,
    })
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    })
  }

  if (error instanceof Error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}