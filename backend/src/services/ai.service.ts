/**
 * Interview message templates built from the question stored in the
 * database.
 *
 * Interviewer follow-ups and every score come from the AI evaluation
 * service (see evaluation.client.ts); nothing in this module invents
 * questions or evaluations.
 */

interface QuestionLike {
  id: string
  title: string
  description: string
}

export const buildOpeningMessage = (question: QuestionLike): string => {
  return `Let's start with this problem: "${question.title}". ${question.description} Take your time, and walk me through your approach.`
}

export const buildTransitionMessage = (nextQuestion: QuestionLike): string => {
  return `Nice work on the previous problem. Let's move on to: "${nextQuestion.title}". ${nextQuestion.description}`
}

export const buildClosingMessage = (): string => {
  return "That's the last question for this interview. Great job — click 'End Interview' whenever you're ready, and I'll put together your results."
}
