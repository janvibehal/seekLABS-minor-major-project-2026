import type { Request, Response } from 'express'

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'

import {
  getRecruiterCandidateById,
  getRecruiterCandidates,
  getAllCandidatesForSelection,
} from '../../services/recruiter/candidate.service.js'


// ─────────────────────────────────────────────
// GET ALL CANDIDATES FOR INTERVIEW SELECTION
// GET /api/v1/recruiter/candidate-options
// ─────────────────────────────────────────────

export const listAllCandidatesForSelection = async (
  _req: Request,
  res: Response,
) => {
  try {
    const candidates =
      await getAllCandidatesForSelection()

    return res.status(200).json({
      success: true,
      data: candidates,
    })
  } catch (error: any) {
    console.error(
      'Get candidate options error:',
      error,
    )

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        'Failed to fetch candidate options',
    })
  }
}


// ─────────────────────────────────────────────
// GET ALL RECRUITER CANDIDATES
// GET /api/v1/recruiter/candidates
// ─────────────────────────────────────────────

export const getCandidatesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const authenticatedReq =
      req as AuthenticatedRequest

    const recruiterId =
      authenticatedReq.user.userId

    const candidates =
      await getRecruiterCandidates(
        recruiterId,
      )

    return res.status(200).json({
      success: true,
      data: candidates,
    })
  } catch (error: any) {
    console.error(
      'Get recruiter candidates error:',
      error,
    )

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        'Failed to fetch candidates',
    })
  }
}


// ─────────────────────────────────────────────
// GET SINGLE CANDIDATE
// GET /api/v1/recruiter/candidates/:candidateId
// ─────────────────────────────────────────────

export const getCandidateByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const authenticatedReq =
      req as AuthenticatedRequest

    const recruiterId =
      authenticatedReq.user.userId

    const candidateId =
      req.params.candidateId

    if (
      !candidateId ||
      Array.isArray(candidateId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid candidate ID is required',
      })
    }

    const candidate =
      await getRecruiterCandidateById(
        recruiterId,
        candidateId,
      )

    return res.status(200).json({
      success: true,
      data: candidate,
    })
  } catch (error: any) {
    console.error(
      'Get recruiter candidate error:',
      error,
    )

    return res.status(404).json({
      success: false,
      message:
        error?.message ||
        'Candidate not found',
    })
  }
}