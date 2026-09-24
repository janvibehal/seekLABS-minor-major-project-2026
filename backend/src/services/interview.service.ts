import {
  countInterviewsByCandidateAndStatus,
  findInterviewById,
  findInterviewWithQuestions,
  findInterviewsByCandidate,
  updateInterviewStatus,
} from "../repositories/interview.repository.js";

import {
  createSession,
  findSessionByInterviewId,
  updateInterviewQuestionStatus,
} from "../repositories/session.repository.js";

import { createMessage } from "../repositories/message.repository.js";

import { evaluateOpening } from "./evaluation.client.js";

import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../utils/app-error.js";

import type { InterviewStatus } from "../generated/prisma/enums.js";

export const listCandidateInterviews = async (
  candidateId: string,
  status?: InterviewStatus,
) => {
  const interviews = await findInterviewsByCandidate(candidateId, status);
  const now = Date.now();

  // Persist expiry for scheduled interviews that were never started.
  // The availability window is [scheduledAt, scheduledAt + duration].
  await Promise.all(
    interviews.map(async (interview) => {
      if (interview.status !== "SCHEDULED") return;

      const scheduledAtMs = new Date(interview.scheduledAt).getTime();
      const expiryAtMs =
        scheduledAtMs + interview.duration * 60 * 1000;

      if (now >= expiryAtMs) {
        await updateInterviewStatus(interview.id, "EXPIRED");

        // When no explicit status filter was requested, reflect the
        // persisted status immediately in this response as well.
        if (!status) {
          interview.status = "EXPIRED";
        }
      }
    }),
  );

  return interviews.map(
    (
      interview: Awaited<ReturnType<typeof findInterviewsByCandidate>>[number],
    ) => ({
      id: interview.id,
      title: interview.title,
      type: interview.type,
      company: interview.company,
      topics: interview.focusAreas,
      scheduledAt: interview.scheduledAt,
      duration: interview.duration,
      status: interview.status,
      score: interview.evaluation?.overallScore ?? null,
      // The actual session timestamps let the candidate UI sort completed
      // interviews by when they were actually taken, rather than only by
      // the originally scheduled time.
      startedAt: interview.session?.startedAt ?? null,
      endedAt: interview.session?.endedAt ?? null,
    }),
  );
};

export const getCandidateInterview = async (
  candidateId: string,
  interviewId: string,
) => {
  const interview = await findInterviewById(interviewId);

  if (!interview) {
    throw new NotFoundError("Interview not found");
  }

  if (interview.candidateId !== candidateId) {
    throw new ForbiddenError("This interview does not belong to you");
  }

  let effectiveStatus = interview.status;

  if (interview.status === "SCHEDULED") {
    const scheduledAtMs = new Date(interview.scheduledAt).getTime();
    const expiryAtMs =
      scheduledAtMs + interview.duration * 60 * 1000;

    if (Date.now() >= expiryAtMs) {
      await updateInterviewStatus(interview.id, "EXPIRED");
      effectiveStatus = "EXPIRED";
    }
  }

  return {
    id: interview.id,
    title: interview.title,
    type: interview.type,
    company: interview.company,
    topics: interview.focusAreas,
    scheduledAt: interview.scheduledAt,
    duration: interview.duration,
    status: effectiveStatus,
    score: interview.evaluation?.overallScore ?? null,
    sessionId: interview.session?.id ?? null,
  };
};

export const startInterview = async (
  candidateId: string,
  interviewId: string,
) => {
  const interview = await findInterviewWithQuestions(interviewId);

  if (!interview) {
    throw new NotFoundError("Interview not found");
  }

  if (interview.candidateId !== candidateId) {
    throw new ForbiddenError("This interview does not belong to you");
  }

  if (interview.status === "COMPLETED") {
    throw new ConflictError("This interview has already been completed");
  }

  if (interview.status === "EXPIRED" || interview.status === "CANCELLED") {
    throw new ConflictError("This interview is no longer available");
  }

  // The scheduled time is an eligibility boundary, not just display data.
  // Enforce it on the backend so a candidate cannot bypass the UI by
  // navigating directly to the interview URL or calling the start endpoint.
  const scheduledAt = new Date(interview.scheduledAt);
  const now = new Date();
  const expiryAt = new Date(
    scheduledAt.getTime() + interview.duration * 60 * 1000,
  );

  if (scheduledAt.getTime() > now.getTime()) {
    throw new ConflictError(
      `This interview is scheduled to start at ${scheduledAt.toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        },
      )}. Please return at the scheduled time.`,
    );
  }

  // A scheduled interview that was never started expires when its scheduled
  // duration window ends.
  if (now.getTime() >= expiryAt.getTime()) {
    await updateInterviewStatus(interviewId, "EXPIRED");
    throw new ConflictError(
      "This interview has expired and can no longer be started.",
    );
  }

  const existingSession = await findSessionByInterviewId(interviewId);

  if (existingSession) {
    const firstQuestion = interview.questions[0]?.question ?? null;

    if (existingSession.messages.length === 0 && firstQuestion) {
      const opening = await evaluateOpening({
        problem: {
          id: firstQuestion.id,
          title: firstQuestion.title,
          description: firstQuestion.description,
        },
        candidateAnswer: "",
        history: [],
      });

      await createMessage({
        sessionId: existingSession.id,
        questionId: firstQuestion.id,
        sender: "AI",
        message: opening.message,
      });
    }

    return {
      sessionId: existingSession.id,
      status: existingSession.status,
      startedAt: existingSession.startedAt,
      currentQuestionId: existingSession.currentQuestionId,
    };
  }

  const firstQuestion = interview.questions[0]?.question ?? null;

  const session = await createSession({
    interviewId,
    candidateId,
    currentQuestionId: firstQuestion?.id ?? null,
  });

  await updateInterviewStatus(interviewId, "IN_PROGRESS");

  if (firstQuestion) {
    await updateInterviewQuestionStatus(
      interviewId,
      firstQuestion.id,
      "CURRENT",
    );

    const opening = await evaluateOpening({
      problem: {
        id: firstQuestion.id,
        title: firstQuestion.title,
        description: firstQuestion.description,
      },
      candidateAnswer: "",
      history: [],
    });

    await createMessage({
      sessionId: session.id,
      questionId: firstQuestion.id,
      sender: "AI",
      message: opening.message,
    });
  }

  return {
    sessionId: session.id,
    status: session.status,
    startedAt: session.startedAt,
    currentQuestionId: session.currentQuestionId,
  };
};

export const getCandidateInterviewStats = async (candidateId: string) => {
  const [total, completed, upcoming, inProgress] = await Promise.all([
    findInterviewsByCandidate(candidateId).then((list) => list.length),
    countInterviewsByCandidateAndStatus(candidateId, "COMPLETED"),
    countInterviewsByCandidateAndStatus(candidateId, "SCHEDULED"),
    countInterviewsByCandidateAndStatus(candidateId, "IN_PROGRESS"),
  ]);

  return { total, completed, upcoming, inProgress };
};
