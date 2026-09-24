import type { Request, Response } from 'express'

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'

import type { InterviewStatus } from '../../generated/prisma/enums.js'

import {
  createRecruiterInterviews,
  deleteRecruiterInterview,
  getRecruiterInterviewById,
  getRecruiterInterviews,
  updateRecruiterInterview,
  updateRecruiterInterviewStatus,
} from '../../services/recruiter/interview.service.js'


// ─────────────────────────────────────────────
// CREATE INTERVIEW
// POST /api/v1/recruiter/interviews
// ─────────────────────────────────────────────

export const createInterviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const {
      title,
      type,
      company,
      focusAreas,
      scheduledAt,
      duration,
      candidateId,
      candidateIds,
      questionIds,
    } = req.body

    const normalizedCandidateIds = Array.isArray(candidateIds)
      ? candidateIds
      : candidateId
        ? [candidateId]
        : []

    if (
      !title ||
      !focusAreas ||
      !scheduledAt ||
      normalizedCandidateIds.length === 0 ||
      !questionIds
    ) {
      res.status(400).json({
        success: false,
        message:
          'title, focusAreas, scheduledAt, candidateIds and questionIds are required',
      })

      return
    }

    if (!Array.isArray(focusAreas)) {
      res.status(400).json({
        success: false,
        message: 'focusAreas must be an array',
      })

      return
    }

    if (!Array.isArray(questionIds)) {
      res.status(400).json({
        success: false,
        message: 'questionIds must be an array',
      })

      return
    }

    const interviews = await createRecruiterInterviews(
      recruiterId,
      {
        title,
        type,
        company,
        focusAreas,
        scheduledAt: new Date(scheduledAt),
        duration,
        candidateIds: normalizedCandidateIds,
        questionIds,
      },
    )

    res.status(201).json({
      success: true,
      message:
        normalizedCandidateIds.length === 1
          ? 'Interview created successfully'
          : `${normalizedCandidateIds.length} interviews created successfully`,
      data: interviews,
    })
  } catch (error) {
    console.error('Create interview error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to create interview',
    })
  }
}


// ─────────────────────────────────────────────
// GET ALL RECRUITER INTERVIEWS
// GET /api/v1/recruiter/interviews
// ─────────────────────────────────────────────

export const getInterviewsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const status =
      typeof req.query.status === 'string'
        ? (req.query.status as InterviewStatus)
        : undefined

    const interviews = await getRecruiterInterviews(
      recruiterId,
      status,
    )

    res.status(200).json({
      success: true,
      data: interviews,
    })
  } catch (error) {
    console.error('Get interviews error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
    })
  }
}


// ─────────────────────────────────────────────
// GET SINGLE INTERVIEW
// GET /api/v1/recruiter/interviews/:id
// ─────────────────────────────────────────────

export const getInterviewByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const interviewId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!interviewId) {
      res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      })

      return
    }

    const interview = await getRecruiterInterviewById(
      recruiterId,
      interviewId,
    )

    if (!interview) {
      res.status(404).json({
        success: false,
        message: 'Interview not found',
      })

      return
    }

    res.status(200).json({
      success: true,
      data: interview,
    })
  } catch (error) {
    console.error('Get interview error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview',
    })
  }
}


// ─────────────────────────────────────────────
// UPDATE INTERVIEW
// PATCH /api/v1/recruiter/interviews/:id
// ─────────────────────────────────────────────

export const updateInterviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const interviewId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!interviewId) {
      res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      })

      return
    }

    const {
      title,
      type,
      company,
      focusAreas,
      scheduledAt,
      duration,
      status,
    } = req.body

    const result = await updateRecruiterInterview(
      recruiterId,
      interviewId,
      {
        ...(title !== undefined ? { title } : {}),

        ...(type !== undefined ? { type } : {}),

        ...(company !== undefined ? { company } : {}),

        ...(focusAreas !== undefined
          ? { focusAreas }
          : {}),

        ...(scheduledAt !== undefined
          ? { scheduledAt: new Date(scheduledAt) }
          : {}),

        ...(duration !== undefined
          ? { duration }
          : {}),

        ...(status !== undefined
          ? { status: status as InterviewStatus }
          : {}),
      },
    )

    if (result.count === 0) {
      res.status(404).json({
        success: false,
        message: 'Interview not found',
      })

      return
    }

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
    })
  } catch (error) {
    console.error('Update interview error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update interview',
    })
  }
}


// ─────────────────────────────────────────────
// UPDATE INTERVIEW STATUS
// PATCH /api/v1/recruiter/interviews/:id/status
// ─────────────────────────────────────────────

export const updateInterviewStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const interviewId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!interviewId) {
      res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      })

      return
    }

    const { status } = req.body

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Interview status is required',
      })

      return
    }

    const result = await updateRecruiterInterviewStatus(
      recruiterId,
      interviewId,
      status as InterviewStatus,
    )

    if (result.count === 0) {
      res.status(404).json({
        success: false,
        message: 'Interview not found',
      })

      return
    }

    res.status(200).json({
      success: true,
      message: 'Interview status updated successfully',
    })
  } catch (error) {
    console.error('Update interview status error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update interview status',
    })
  }
}


// ─────────────────────────────────────────────
// DELETE INTERVIEW
// DELETE /api/v1/recruiter/interviews/:id
// ─────────────────────────────────────────────

export const deleteInterviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest
    const recruiterId = authenticatedReq.user.userId

    const interviewId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!interviewId) {
      res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      })

      return
    }

    const result = await deleteRecruiterInterview(
      recruiterId,
      interviewId,
    )

    if (result.count === 0) {
      res.status(404).json({
        success: false,
        message: 'Interview not found',
      })

      return
    }

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully',
    })
  } catch (error) {
    console.error('Delete interview error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to delete interview',
    })
  }
}