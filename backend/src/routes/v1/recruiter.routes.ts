import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import { requireRole } from "../../middleware/rbac.middleware.js";

import {
  createJobController,
  getJobsController,
  getJobByIdController,
  deleteJobController,
} from "../../controllers/recruiters/job.controller.js";

import {
  getCandidatesController,
  getCandidateByIdController,
  listAllCandidatesForSelection,
} from "../../controllers/recruiters/candidate.controller.js";

import {
  createQuestionController,
  getQuestionsController,
} from "../../controllers/recruiters/question.controller.js";

import {
  createInterviewController,
  getInterviewsController,
  getInterviewByIdController,
  updateInterviewController,
  updateInterviewStatusController,
  deleteInterviewController,
} from "../../controllers/recruiters/interview.controller.js";


const router = Router();


// ─────────────────────────────────────────────
// RECRUITER DASHBOARD
// ─────────────────────────────────────────────

router.get(
  "/dashboard",
  authenticate,
  requireRole("RECRUITER"),
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome to the recruiter dashboard",
    });
  },
);


// ─────────────────────────────────────────────
// RECRUITER JOBS
// ─────────────────────────────────────────────

// GET all jobs

router.get(
  "/jobs",
  authenticate,
  requireRole("RECRUITER"),
  getJobsController,
);


// GET one job

router.get(
  "/jobs/:jobId",
  authenticate,
  requireRole("RECRUITER"),
  getJobByIdController,
);


// CREATE a job

router.post(
  "/jobs",
  authenticate,
  requireRole("RECRUITER"),
  createJobController,
);


// DELETE a job

router.delete(
  "/jobs/:jobId",
  authenticate,
  requireRole("RECRUITER"),
  deleteJobController,
);


// ─────────────────────────────────────────────
// RECRUITER INTERVIEWS
// ─────────────────────────────────────────────

router.get(
  "/questions",
  authenticate,
  requireRole("RECRUITER"),
  getQuestionsController,
);


router.post(
  "/questions",
  authenticate,
  requireRole("RECRUITER"),
  createQuestionController,
);


// GET all interviews created by recruiter

router.get(
  "/interviews",
  authenticate,
  requireRole("RECRUITER"),
  getInterviewsController,
);


// GET one interview

router.get(
  "/interviews/:id",
  authenticate,
  requireRole("RECRUITER"),
  getInterviewByIdController,
);


// CREATE interview

router.post(
  "/interviews",
  authenticate,
  requireRole("RECRUITER"),
  createInterviewController,
);


// UPDATE interview

router.patch(
  "/interviews/:id",
  authenticate,
  requireRole("RECRUITER"),
  updateInterviewController,
);


// UPDATE interview status

router.patch(
  "/interviews/:id/status",
  authenticate,
  requireRole("RECRUITER"),
  updateInterviewStatusController,
);


// DELETE interview

router.delete(
  "/interviews/:id",
  authenticate,
  requireRole("RECRUITER"),
  deleteInterviewController,
);


// ─────────────────────────────────────────────
// RECRUITER CANDIDATES
// ─────────────────────────────────────────────

// GET all candidates visible to this recruiter

router.get(
  "/candidates",
  authenticate,
  requireRole("RECRUITER"),
  getCandidatesController,
);


// GET all registered candidates
// Used for the Create Interview candidate dropdown

router.get(
  "/candidate-options",
  authenticate,
  requireRole("RECRUITER"),
  listAllCandidatesForSelection,
);


// GET one candidate

router.get(
  "/candidates/:candidateId",
  authenticate,
  requireRole("RECRUITER"),
  getCandidateByIdController,
);


export default router;