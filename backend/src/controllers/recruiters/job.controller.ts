import type { Request, Response } from 'express'

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'

import {
  createRecruiterJob,
  getRecruiterJobs,
  getRecruiterJobById,
  removeRecruiterJob,
} from '../../services/recruiter/job.service.js'

import {
  createJobSchema,
} from '../../validators/recruiter/job.validator.js'


export const createJobController = async (
  req: Request,
  res: Response,
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const validatedData = createJobSchema.parse(req.body)

    const job = await createRecruiterJob(
      recruiterId,
      validatedData,
    )

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    })
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        'Failed to create job',
    })
  }
}


export const getJobsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const jobs = await getRecruiterJobs(recruiterId)

    return res.status(200).json({
      success: true,
      data: jobs,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        'Failed to fetch jobs',
    })
  }
}


export const getJobByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const jobId = req.params.jobId

    if (!jobId || Array.isArray(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Job ID is required',
      })
    }

    const job = await getRecruiterJobById(
      recruiterId,
      jobId,
    )

    return res.status(200).json({
      success: true,
      data: job,
    })
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message:
        error?.message ||
        'Job not found',
    })
  }
}


export const deleteJobController = async (
  req: Request,
  res: Response,
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const jobId = req.params.jobId

    if (!jobId || Array.isArray(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Job ID is required',
      })
    }

    const result = await removeRecruiterJob(
      recruiterId,
      jobId,
    )

    return res.status(200).json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message:
        error?.message ||
        'Job not found',
    })
  }
}