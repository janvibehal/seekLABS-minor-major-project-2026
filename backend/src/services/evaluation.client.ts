const EVALUATION_SERVICE_URL =
  process.env.EVALUATION_SERVICE_URL || "http://127.0.0.1:8000";

// Sent as X-API-Key. Must equal INTERVIEW_AI_API_KEY on the AI service
// when that is set; leave empty when the AI service has no key.
const EVALUATION_SERVICE_API_KEY = process.env.EVALUATION_SERVICE_API_KEY || "";

/**
 * The AI service could not produce an evaluation right now (network
 * failure or a 5xx response such as 503). Retrying later may succeed,
 * and no result must be saved in the meantime.
 */
export class EvaluationUnavailableError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);

    this.name = "EvaluationUnavailableError";

    this.status = status;
  }
}

type HistoryItem = Record<string, unknown>;

export type FinalQuestionInput = {
  questionId: string;

  problem: Record<string, unknown>;

  candidateAnswer: string;

  history: HistoryItem[];
};

type EvaluationRequest = {
  problem: Record<string, unknown>;
  candidateAnswer: unknown;
  history: HistoryItem[];

  // Identify the interview turn so the AI service can keep adaptive
  // state per (session, question).
  candidateId?: string;
  sessionId?: string;
  questionId?: string;
  timeRemainingSeconds?: number;
  maxTurns?: number;

  // /v1/evaluate/final only: every question of the interview.
  questions?: FinalQuestionInput[];
};

const describeValue = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

/**
 * Normalize the candidate answer at the backend → AI boundary.
 *
 * Supported forms:
 * - "answer"
 * - { message | content | text | answer: "answer" }
 * - nested message objects
 * - arrays containing one of the supported forms
 */
const normalizeCandidateAnswer = (
  value: unknown,
  path = "candidateAnswer",
): string => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      try {
        return normalizeCandidateAnswer(value[index], `${path}[${index}]`);
      } catch {
        // Try the next array item.
      }
    }

    throw new Error(
      `Candidate answer must be a string. Received an array with no string answer.\n` +
        `Path: ${path}\n` +
        `Value: ${describeValue(value)}`,
    );
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    const directKeys = ["message", "content", "text", "answer"] as const;

    for (const key of directKeys) {
      const candidate = obj[key];

      if (typeof candidate === "string") {
        return candidate;
      }
    }

    // Recursively handle nested message/content/text/answer objects.
    for (const key of directKeys) {
      const candidate = obj[key];

      if (candidate && typeof candidate === "object") {
        try {
          return normalizeCandidateAnswer(candidate, `${path}.${key}`);
        } catch {
          // Try the next supported key.
        }
      }
    }
  }

  throw new Error(
    `Candidate answer must be a string.\n` +
      `Path: ${path}\n` +
      `Type: ${typeof value}\n` +
      `Value: ${describeValue(value)}`,
  );
};

const requestEvaluation = async (path: string, input: EvaluationRequest) => {
  const candidateAnswer = normalizeCandidateAnswer(input.candidateAnswer);

  if (
    path !== "/v1/evaluate/opening" &&
    path !== "/v1/evaluate/final" &&
    !candidateAnswer.trim()
  ) {
    throw new Error("Candidate answer cannot be empty.");
  }

  const requestBody: Record<string, unknown> = {
    problem: input.problem,
    candidate_answer: candidateAnswer,
    history: input.history,
  };

  if (input.candidateId) requestBody.candidate_id = input.candidateId;

  if (input.sessionId) requestBody.session_id = input.sessionId;

  if (input.questionId) requestBody.question_id = input.questionId;

  if (input.timeRemainingSeconds !== undefined) {
    requestBody.time_remaining_seconds = input.timeRemainingSeconds;
  }

  if (input.maxTurns !== undefined) requestBody.max_turns = input.maxTurns;

  if (input.questions) {
    requestBody.questions = input.questions.map((question) => ({
      question_id: question.questionId,
      problem: question.problem,
      candidate_answer: question.candidateAnswer,
      history: question.history,
    }));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (EVALUATION_SERVICE_API_KEY) {
    headers["X-API-Key"] = EVALUATION_SERVICE_API_KEY;
  }

  let response: Response;

  try {
    response = await fetch(`${EVALUATION_SERVICE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    console.error("[EVALUATION ERROR] request to evaluation service failed:", error);

    throw new EvaluationUnavailableError(
      `Evaluation service network request failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  console.log(`[EVALUATION] ${path} -> HTTP ${response.status}`);

  const rawResponse = await response.text();

  let payload: any = {};

  if (rawResponse.trim()) {
    try {
      payload = JSON.parse(rawResponse);
    } catch {
      const message = `Evaluation service returned non-JSON response (HTTP ${response.status}): ${rawResponse.slice(0, 500)}`;

      throw response.status >= 500
        ? new EvaluationUnavailableError(message, response.status)
        : new Error(message);
    }
  }

  if (!response.ok || !payload.success) {
    const errorMessage =
      payload?.detail ||
      payload?.message ||
      payload?.error ||
      `Evaluation service request failed with HTTP ${response.status}`;

    const message =
      typeof errorMessage === "string"
        ? errorMessage
        : describeValue(errorMessage);

    console.error("[EVALUATION ERROR]", message);

    throw response.status >= 500
      ? new EvaluationUnavailableError(message, response.status)
      : new Error(message);
  }

  return payload.data;
};

export const evaluateTurn = (input: EvaluationRequest) =>
  requestEvaluation("/v1/evaluate/turn", input);

export const evaluateOpening = (input: EvaluationRequest) =>
  requestEvaluation("/v1/evaluate/opening", input);

export const evaluateFinal = (input: EvaluationRequest) =>
  requestEvaluation("/v1/evaluate/final", input);
