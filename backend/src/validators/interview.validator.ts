import { z } from 'zod'

export const interviewStatusFilterSchema = z.object({
  status: z
    .enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED'])
    .optional(),
})

export type InterviewStatusFilter = z.infer<typeof interviewStatusFilterSchema>

export const interviewIdParamSchema = z.object({
  interviewId: z.string().min(1, 'interviewId is required'),
})
