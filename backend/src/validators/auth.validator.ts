import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50),

  email: z
    .string()
    .email('Please provide a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100),
})

export type RegisterInput = z.infer<typeof registerSchema>


export const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>