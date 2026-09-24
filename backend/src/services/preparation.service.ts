import { findEvaluationsByCandidate } from '../repositories/evaluation.repository.js'
import { countCompletedAttemptsByCandidate } from '../repositories/session.repository.js'

// Maps each scored dimension to the topic areas it roughly corresponds to,
// so a low dimension score can be surfaced as an actionable topic to review.
const DIMENSION_TOPICS: Record<string, string[]> = {
  algorithmCorrectness: ['Algorithms'],
  logicalReasoning: ['Problem Solving'],
  conceptCoverage: ['Core Concepts'],
  completeness: ['Time Management'],
  dataStructure: ['Data Structures'],
  complexity: ['Time & Space Complexity'],
  edgeCases: ['Edge Cases'],
}

export const getCandidatePreparation = async (candidateId: string) => {
  const [evaluations, questionsSolved] = await Promise.all([
    findEvaluationsByCandidate(candidateId),
    countCompletedAttemptsByCandidate(candidateId),
  ])

  if (evaluations.length === 0) {
    return {
      overallProgress: 0,
      questionsSolved,
      interviewsCompleted: 0,
      topicScores: [],
      weakTopics: [],
      recommendedTopics: ['Data Structures', 'Algorithms', 'Problem Solving'],
    }
  }

  const dimensionKeys = Object.keys(DIMENSION_TOPICS) as Array<
    keyof typeof DIMENSION_TOPICS
  >

  type CandidateEvaluation = Awaited<
    ReturnType<typeof findEvaluationsByCandidate>
  >[number]

  const averages = dimensionKeys.map((key) => {
    const sum = evaluations.reduce((total: number, evaluation: CandidateEvaluation) => {
      const value = evaluation[key as keyof typeof evaluation]
      return total + (typeof value === 'number' ? value : 0)
    }, 0)

    return {
      key,
      topic: DIMENSION_TOPICS[key]![0]!,
      average: Math.round(sum / evaluations.length),
    }
  })

  const sortedAscending = [...averages].sort((a, b) => a.average - b.average)

  const overallProgress = Math.round(
    averages.reduce((sum, item) => sum + item.average, 0) / averages.length,
  )

  return {
    overallProgress,
    questionsSolved,
    interviewsCompleted: evaluations.length,
    topicScores: averages.map(({ topic, average }) => ({
      topic,
      score: average,
    })),
    weakTopics: sortedAscending.slice(0, 3).map((item) => item.topic),
    recommendedTopics: sortedAscending.slice(0, 3).map((item) => item.topic),
  }
}
