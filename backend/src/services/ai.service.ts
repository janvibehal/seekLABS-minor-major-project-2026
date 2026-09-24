/**
 * This module is a stand-in for the real NLP extraction / adaptive
 * question-engine pipeline (see AI/ and evaluation/ at the repo root).
 *
 * It exposes the same shape the real pipeline will eventually need to
 * fulfil, so swapping the mock implementation for a call into that
 * pipeline (or an HTTP call to a Python service) later is a one-file change.
 */

interface QuestionLike {
  id: string
  title: string
  description: string
}

const FOLLOW_UPS = [
  "That's a reasonable start — can you walk me through the time complexity of your approach?",
  'Good. What data structure are you using here, and why is it a good fit?',
  'How would your approach handle an empty input or an edge case?',
  "Interesting — is there a way to reduce the space complexity you're describing?",
  'Can you clarify how you would test this solution?',
]

export const buildOpeningMessage = (question: QuestionLike): string => {
  return `Let's start with this problem: "${question.title}". ${question.description} Take your time, and walk me through your approach.`
}

export const buildTransitionMessage = (nextQuestion: QuestionLike): string => {
  return `Nice work on the previous problem. Let's move on to: "${nextQuestion.title}". ${nextQuestion.description}`
}

export const buildClosingMessage = (): string => {
  return "That's the last question for this interview. Great job — click 'End Interview' whenever you're ready, and I'll put together your results."
}

/**
 * Decides whether the candidate has said enough about the current
 * question to move on. This is a placeholder heuristic (message count)
 * — the real adaptive engine will use the extraction/evaluation layer
 * to judge concept coverage instead.
 */
export const shouldAdvanceQuestion = (candidateMessageCount: number): boolean => {
  return candidateMessageCount >= 3
}

export const generateFollowUp = (candidateMessageCount: number): string => {
  const index = candidateMessageCount % FOLLOW_UPS.length
  return FOLLOW_UPS[index] as string
}

interface DimensionScores {
  algorithmCorrectness: number
  logicalReasoning: number
  conceptCoverage: number
  completeness: number
  dataStructure: number
  complexity: number
  edgeCases: number
}

interface GeneratedEvaluation extends DimensionScores {
  overallScore: number
  strengths: string[]
  improvements: string[]
  feedback: string
}

/**
 * Produces a plausible-looking evaluation from the transcript so the
 * results screens have real data to render. Replace with a call into
 * the scoring/ pipeline once it's wired up to this backend.
 */
export const generateEvaluation = (params: {
  candidateMessageCount: number
  totalQuestions: number
  completedQuestions: number
}): GeneratedEvaluation => {
  const { candidateMessageCount, totalQuestions, completedQuestions } = params

  const completionRatio =
    totalQuestions > 0 ? completedQuestions / totalQuestions : 0

  const engagement = Math.min(candidateMessageCount / (totalQuestions * 3 || 1), 1)

  const base = 55 + completionRatio * 25 + engagement * 15

  const jitter = (seed: number) => Math.round(((seed * 37) % 15) - 7)

  const clamp = (value: number) => Math.max(35, Math.min(98, Math.round(value)))

  const dimensions: DimensionScores = {
    algorithmCorrectness: clamp(base + jitter(1)),
    logicalReasoning: clamp(base + jitter(2)),
    conceptCoverage: clamp(base + jitter(3)),
    completeness: clamp(base * completionRatio + 20 + jitter(4)),
    dataStructure: clamp(base + jitter(5)),
    complexity: clamp(base + jitter(6)),
    edgeCases: clamp(base - 5 + jitter(7)),
  }

  const overallScore = clamp(
    (dimensions.algorithmCorrectness +
      dimensions.logicalReasoning +
      dimensions.conceptCoverage +
      dimensions.completeness +
      dimensions.dataStructure +
      dimensions.complexity +
      dimensions.edgeCases) /
      7,
  )

  const strengths: string[] = []
  const improvements: string[] = []

  if (dimensions.logicalReasoning >= 75) {
    strengths.push('Clear, structured reasoning when explaining the approach')
  }
  if (dimensions.algorithmCorrectness >= 75) {
    strengths.push('Correct handling of the core algorithm')
  }
  if (dimensions.dataStructure >= 75) {
    strengths.push('Good choice of data structures for the problem')
  }
  if (strengths.length === 0) {
    strengths.push('Engaged consistently with each question')
  }

  if (dimensions.edgeCases < 65) {
    improvements.push('Spend more time discussing edge cases before coding')
  }
  if (dimensions.complexity < 65) {
    improvements.push('Explain time and space complexity more explicitly')
  }
  if (completionRatio < 1) {
    improvements.push('Try to work through every question within the session')
  }
  if (improvements.length === 0) {
    improvements.push('Keep practicing to maintain this level of consistency')
  }

  const feedback = `You completed ${completedQuestions} of ${totalQuestions} questions. Overall you scored ${overallScore}%, with the strongest performance in ${
    dimensions.algorithmCorrectness >= dimensions.logicalReasoning
      ? 'algorithm correctness'
      : 'logical reasoning'
  }. Focus on the improvement areas below before your next interview.`

  return {
    ...dimensions,
    overallScore,
    strengths,
    improvements,
    feedback,
  }
}
