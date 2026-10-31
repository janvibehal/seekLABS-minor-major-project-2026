import {
  findSessionById,
  updateSessionCurrentQuestion,
  upsertQuestionAttempt,
  updateInterviewQuestionStatus,
  countMessagesForQuestion,
  endSession as endSessionRepo,
} from "../repositories/session.repository.js";

import {
  createMessage,
  findMessagesBySession,
} from "../repositories/message.repository.js";

import { updateInterviewStatus } from "../repositories/interview.repository.js";

import {
  createEvaluation,
  findEvaluationByInterviewId,
} from "../repositories/evaluation.repository.js";

import {
  evaluateFinal,
  evaluateTurn,
  EvaluationUnavailableError,
} from "./evaluation.client.js";

import { buildClosingMessage, buildTransitionMessage } from "./ai.service.js";

import type { SendMessageInput } from "../validators/session.validator.js";

import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../utils/app-error.js";

type OwnedSession = NonNullable<Awaited<ReturnType<typeof findSessionById>>>;

type InterviewQuestionWithQuestion =
  NonNullable<OwnedSession>["interview"]["questions"][number];

// Hard cap on candidate messages per question.
//
// It is sent to the AI service, which usually stops earlier (the
// candidate reached the target solution), and it is the only rule used
// for questions the AI service cannot run adaptively (no reference
// solutions). Override with MAX_TURNS_PER_QUESTION.
const configuredMaxTurns = Math.floor(
  Number(process.env.MAX_TURNS_PER_QUESTION),
);

const MAX_TURNS_PER_QUESTION =
  configuredMaxTurns > 0 ? configuredMaxTurns : 5;

const assertOwnedSession = async (candidateId: string, sessionId: string) => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new NotFoundError("Interview session not found");
  }

  if (session.candidateId !== candidateId) {
    throw new ForbiddenError("This interview session does not belong to you");
  }

  return session;
};

const isSessionExpired = (session: OwnedSession) => {
  const durationSeconds = session.interview.duration * 60;

  const elapsedSeconds = (Date.now() - session.startedAt.getTime()) / 1000;

  return elapsedSeconds >= durationSeconds;
};

const getElapsedDurationSeconds = (session: OwnedSession) => {
  return Math.max(
    0,

    Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
  );
};

// ============================================================
// EXPIRE INTERVIEW
// ============================================================

const expireInterviewSession = async (
  candidateId: string,
  sessionId: string,
) => {
  const session = await assertOwnedSession(candidateId, sessionId);

  const endedAt = new Date();

  const durationSeconds = Math.max(
    0,

    Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000),
  );

  const result = await endSessionRepo(sessionId, {
    status: "EXPIRED",

    endedAt,

    durationSeconds,
  });

  if (result.count > 0) {
    await updateInterviewStatus(session.interview.id, "EXPIRED");
  }

  return {
    message: "Interview time has expired.",

    durationSeconds,

    expired: true,
  };
};

// ============================================================
// GET SESSION
// ============================================================

export const getSessionDetail = async (
  candidateId: string,
  sessionId: string,
) => {
  let session = await assertOwnedSession(candidateId, sessionId);

  if (session.status === "IN_PROGRESS" && isSessionExpired(session)) {
    const messages = await findMessagesBySession(sessionId);

    const hasCandidateAttempt = messages.some(
      (message) => message.sender === "CANDIDATE",
    );

    if (hasCandidateAttempt) {
      try {
        await endInterviewSession(candidateId, sessionId);
      } catch (error) {
        // The AI evaluation is temporarily unavailable. The session
        // stays IN_PROGRESS and the evaluation is retried on the
        // next request; nothing is saved until it succeeds.
        if (!(error instanceof EvaluationUnavailableError)) {
          throw error;
        }

        console.warn("Final evaluation pending:", error.message);
      }
    } else {
      await expireInterviewSession(candidateId, sessionId);
    }

    // Re-fetch so the response contains
    // the updated session status.
    session = await assertOwnedSession(candidateId, sessionId);
  }

  const questions = session.interview.questions.map(
    ({ question, status, order }: InterviewQuestionWithQuestion) => ({
      id: question.id,

      title: question.title,

      difficulty: question.difficulty,

      topics: question.topics,

      description: question.description,

      examples: question.examples,

      constraints: question.constraints,

      status,

      order,
    }),
  );

  return {
    session: {
      id: session.id,

      status: session.status,

      duration: session.interview.duration * 60,

      startedAt: session.startedAt,

      currentQuestionId: session.currentQuestionId,
    },

    questions,
  };
};

// ============================================================
// GET MESSAGES
// ============================================================

export const getSessionMessages = async (
  candidateId: string,
  sessionId: string,
) => {
  await assertOwnedSession(candidateId, sessionId);

  const messages = await findMessagesBySession(sessionId);

  return messages.map(
    (message: Awaited<ReturnType<typeof findMessagesBySession>>[number]) => ({
      id: message.id,

      sender: message.sender,

      message: message.message,

      questionId: message.questionId,

      createdAt: message.createdAt,
    }),
  );
};

// ============================================================
// SEND CANDIDATE MESSAGE
// ============================================================

export const sendCandidateMessage = async (
  candidateId: string,
  sessionId: string,
  input: SendMessageInput,
) => {
  const session = await assertOwnedSession(candidateId, sessionId);

  if (session.status !== "IN_PROGRESS") {
    throw new ConflictError("This interview session has already ended");
  }

  if (isSessionExpired(session)) {
    const messages = await findMessagesBySession(sessionId);

    const hasCandidateAttempt = messages.some(
      (message) => message.sender === "CANDIDATE",
    );

    if (hasCandidateAttempt) {
      try {
        await endInterviewSession(candidateId, sessionId);
      } catch (error) {
        if (!(error instanceof EvaluationUnavailableError)) {
          throw error;
        }

        console.warn("Final evaluation pending:", error.message);

        return {
          sessionEnded: true,

          expired: false,

          submitted: true,

          evaluationPending: true,

          message:
            "Interview time has expired. Your answers are saved; the evaluation is pending.",
        };
      }

      return {
        sessionEnded: true,

        expired: false,

        submitted: true,

        message:
          "Interview time has expired. The interview has been submitted.",
      };
    }

    await expireInterviewSession(candidateId, sessionId);

    return {
      sessionEnded: true,

      expired: true,

      submitted: false,

      message: "Interview time has expired.",
    };
  }

  const orderedQuestions = session.interview.questions;

  const currentIndex = orderedQuestions.findIndex(
    (interviewQuestion: InterviewQuestionWithQuestion) =>
      interviewQuestion.question.id === input.questionId,
  );

  if (currentIndex === -1) {
    throw new NotFoundError("Question not found on this interview");
  }

  // --------------------------------------------------------
  // SAVE CANDIDATE MESSAGE
  // --------------------------------------------------------

  const candidateMessage = await createMessage({
    sessionId,

    questionId: input.questionId,

    sender: "CANDIDATE",

    message: input.message,
  });

  const candidateAnswer =
    typeof input.message === "string" ? input.message : String(input.message);

  const currentQuestion = orderedQuestions[currentIndex]?.question;

  if (!currentQuestion) {
    throw new NotFoundError("Question not found on this interview");
  }

  // --------------------------------------------------------
  // EVALUATE CURRENT TURN
  // --------------------------------------------------------

  const evaluation = await evaluateTurn({
    problem: {
      id: input.questionId,

      title: currentQuestion.title,

      difficulty: currentQuestion.difficulty,

      topics: currentQuestion.topics,

      description: currentQuestion.description,

      examples: currentQuestion.examples,

      constraints: currentQuestion.constraints,
    },

    candidateAnswer,

    candidateId,

    sessionId,

    questionId: input.questionId,

    // Seconds left in the whole interview; the AI service has no clock.
    timeRemainingSeconds: Math.max(
      1,
      session.interview.duration * 60 - getElapsedDurationSeconds(session),
    ),

    maxTurns: MAX_TURNS_PER_QUESTION,

    history: (await findMessagesBySession(sessionId))
      .filter((message) => message.questionId === input.questionId)
      .map((message) => ({
        sender: message.sender,

        message: message.message,

        questionId: message.questionId,
      })),
  });

  await upsertQuestionAttempt({
    sessionId,

    questionId: input.questionId,

    candidateId,

    status: "CURRENT",
  });

  // --------------------------------------------------------
  // QUESTION ADVANCEMENT
  // --------------------------------------------------------

  const candidateMessageCount = await countMessagesForQuestion(
    sessionId,
    input.questionId,
  );

  // The AI service decides when a question is finished (adaptive
  // policy). The turn cap is a backstop, and the only rule when the
  // question has no reference solutions.
  const advance =
    evaluation.adaptive?.finished === true ||
    candidateMessageCount >= MAX_TURNS_PER_QUESTION;

  let aiText: string | null = evaluation.message ?? null;

  let nextQuestionId: string | null = session.currentQuestionId;

  if (advance) {
    await upsertQuestionAttempt({
      sessionId,

      questionId: input.questionId,

      candidateId,

      status: "COMPLETED",
    });

    await updateInterviewQuestionStatus(
      session.interview.id,

      input.questionId,

      "COMPLETED",
    );

    const nextQuestion = orderedQuestions[currentIndex + 1]?.question ?? null;

    if (nextQuestion) {
      await updateInterviewQuestionStatus(
        session.interview.id,

        nextQuestion.id,

        "CURRENT",
      );

      await updateSessionCurrentQuestion(
        sessionId,

        nextQuestion.id,
      );

      nextQuestionId = nextQuestion.id;

      aiText = buildTransitionMessage(nextQuestion);
    } else {
      nextQuestionId = null;

      aiText = buildClosingMessage();
    }
  }

  if (!aiText) {
    throw new Error("The evaluation service returned no interviewer message.");
  }

  // IMPORTANT:
  // The AI response belongs to the question that was just
  // evaluated, NOT the next question.
  const aiMessage = await createMessage({
    sessionId,

    questionId: input.questionId,

    sender: "AI",

    message: aiText,
  });

  return {
    candidateMessage: {
      id: candidateMessage.id,

      sender: candidateMessage.sender,

      message: candidateMessage.message,

      questionId: candidateMessage.questionId,

      createdAt: candidateMessage.createdAt,
    },

    aiMessage: {
      id: aiMessage.id,

      sender: aiMessage.sender,

      message: aiMessage.message,

      questionId: aiMessage.questionId,

      createdAt: aiMessage.createdAt,
    },

    currentQuestionId: nextQuestionId,
  };
};

// ============================================================
// END INTERVIEW
// ============================================================

export const endInterviewSession = async (
  candidateId: string,
  sessionId: string,
) => {
  const session = await assertOwnedSession(candidateId, sessionId);

  // --------------------------------------------------------
  // ALREADY COMPLETED
  // --------------------------------------------------------

  if (session.status === "COMPLETED") {
    const existingEvaluation = await findEvaluationByInterviewId(
      session.interview.id,
    );

    return {
      message: "Interview already completed",

      durationSeconds: session.durationSeconds ?? 0,

      overallScore: existingEvaluation?.overallScore ?? null,
    };
  }

  const endedAt = new Date();

  const durationSeconds = Math.max(
    0,

    Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000),
  );

  const messages = await findMessagesBySession(sessionId);

  // --------------------------------------------------------
  // FINAL EVALUATION
  // --------------------------------------------------------
  //
  // The result is cumulative: the AI service evaluates every question
  // of the interview and returns one combined result.
  //
  // The session is finalized only after the evaluation succeeds. If
  // the AI service is unavailable an EvaluationUnavailableError
  // propagates, the session stays IN_PROGRESS and the evaluation is
  // retried later. A failed evaluation is never saved as a score of 0.
  // --------------------------------------------------------

  const finalQuestions = session.interview.questions.map(
    ({ question }: InterviewQuestionWithQuestion) => ({
      questionId: question.id,

      problem: {
        id: question.id,

        title: question.title,

        difficulty: question.difficulty,

        topics: question.topics,

        description: question.description,

        examples: question.examples,

        constraints: question.constraints,
      },

      candidateAnswer: messages
        .filter(
          (message) =>
            message.sender === "CANDIDATE" &&
            message.questionId === question.id,
        )
        .map((message) => message.message)
        .join("\n\n"),

      history: messages
        .filter((message) => message.questionId === question.id)
        .map((message) => ({
          sender: message.sender,

          message: message.message,

          questionId: message.questionId,
        })),
    }),
  );

  const finalEvaluation: {
    overallScore: number;

    evaluation?: {
      scores?: Record<
        string,
        {
          score?: number | null;
        }
      >;

      reasoning?: string;

      errors?: string[];
    };
  } = await evaluateFinal({
    problem: {},

    candidateAnswer: "",

    history: [],

    candidateId,

    sessionId,

    questions: finalQuestions,
  });

  // --------------------------------------------------------
  // EXTRACT SCORES
  // --------------------------------------------------------

  const scores = finalEvaluation.evaluation?.scores || {};

  const score = (name: string) => {
    const value = scores[name]?.score;

    return typeof value === "number" ? Math.round(value) : 0;
  };

  const overallScore =
    typeof finalEvaluation.overallScore === "number"
      ? Math.round(finalEvaluation.overallScore)
      : 0;

  // --------------------------------------------------------
  // MARK SESSION COMPLETED
  // --------------------------------------------------------

  const endResult = await endSessionRepo(sessionId, {
    status: "COMPLETED",

    endedAt,

    durationSeconds,
  });

  // Another request may have completed the session while
  // the final evaluation was running.
  if (endResult.count === 0) {
    const existingEvaluation = await findEvaluationByInterviewId(
      session.interview.id,
    );

    return {
      message: "Interview already completed",

      durationSeconds: session.durationSeconds ?? durationSeconds,

      overallScore: existingEvaluation?.overallScore ?? overallScore,
    };
  }

  // --------------------------------------------------------
  // MARK INTERVIEW COMPLETED
  // --------------------------------------------------------

  await updateInterviewStatus(session.interview.id, "COMPLETED");

  // --------------------------------------------------------
  // SAVE FINAL EVALUATION
  // --------------------------------------------------------

  await createEvaluation({
    interviewId: session.interview.id,

    sessionId,

    candidateId,

    overallScore,

    algorithmCorrectness: score("algorithm_correctness"),

    logicalReasoning: score("logical_reasoning"),

    conceptCoverage: score("concept_coverage"),

    completeness: score("completeness"),

    dataStructure: score("data_structure"),

    complexity: score("complexity"),

    edgeCases: score("edge_cases"),

    strengths: [],

    improvements: [],

    feedback:
      finalEvaluation.evaluation?.reasoning ||
      "Interview submitted successfully.",
  });

  return {
    message: "Interview completed successfully",

    durationSeconds,

    overallScore,
  };
};
