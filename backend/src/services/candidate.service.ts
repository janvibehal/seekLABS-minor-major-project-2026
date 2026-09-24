
import { findUserById } from "../repositories/user.repository.js";
import { findInterviewsByCandidate } from "../repositories/interview.repository.js";

import {
  findEvaluationByInterviewId,
  findEvaluationsByCandidate,
} from "../repositories/evaluation.repository.js";

import {
  NotFoundError,
  ForbiddenError,
} from "../utils/app-error.js";


type CandidateInterview = Awaited<
  ReturnType<typeof findInterviewsByCandidate>
>[number];

type CandidateEvaluation = Awaited<
  ReturnType<typeof findEvaluationsByCandidate>
>[number];


/* ============================================================
   CANDIDATE DASHBOARD
============================================================ */

export const getCandidateDashboard = async (
  candidateId: string
) => {
  const [candidate, interviews] = await Promise.all([
    findUserById(candidateId),
    findInterviewsByCandidate(candidateId),
  ]);


  if (!candidate) {
    throw new NotFoundError("Candidate not found");
  }


  /* ============================================================
     INTERVIEW GROUPS
  ============================================================ */

  const completed = interviews.filter(
    (interview: CandidateInterview) =>
      interview.status === "COMPLETED"
  );


  const upcoming = interviews.filter(
    (interview: CandidateInterview) =>
      interview.status === "SCHEDULED"
  );


  /*
    IMPORTANT:

    An interview can be marked COMPLETED before its AI
    evaluation/result has been created.

    Therefore, only interviews with an actual evaluation
    should be used for recent results.
  */

  const evaluated = completed.filter(
    (interview: CandidateInterview) =>
      interview.evaluation !== null &&
      interview.evaluation !== undefined
  );


  /* ============================================================
     SCORES
  ============================================================ */

  const scores = evaluated
    .map(
      (interview: CandidateInterview) =>
        interview.evaluation?.overallScore
    )
    .filter(
      (score: number | undefined): score is number =>
        typeof score === "number"
    );


  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce(
            (sum: number, score: number) =>
              sum + score,
            0
          ) / scores.length
        )
      : 0;


  /* ============================================================
     INTERVIEW SUMMARY
  ============================================================ */

  const toSummary = (
    interview: CandidateInterview
  ) => ({
    id: interview.id,

    title: interview.title,

    status: interview.status,

    scheduledAt: interview.scheduledAt,

    duration: interview.duration,

    score:
      interview.evaluation?.overallScore ?? null,
  });


  /* ============================================================
     DASHBOARD RESPONSE
  ============================================================ */

  return {
    candidate: {
      firstName: candidate.firstName,

      lastName: candidate.lastName,

      email: candidate.email,
    },


    stats: {
      totalInterviews: interviews.length,

      // All completed interviews
      completedInterviews: completed.length,

      // Completed interviews that actually have results
      evaluatedInterviews: evaluated.length,

      averageScore,

      upcomingInterviews: upcoming.length,
    },


    /*
      Only evaluated interviews are sent here.

      This prevents:

      GET /candidate/results/:interviewId

      from being called for an interview that does not
      have an Evaluation record.
    */

    recentInterviews: evaluated
      .sort(
        (
          a: CandidateInterview,
          b: CandidateInterview
        ) =>
          b.scheduledAt.getTime() -
          a.scheduledAt.getTime()
      )
      .slice(0, 5)
      .map(toSummary),


    upcomingInterviews: upcoming
      .sort(
        (
          a: CandidateInterview,
          b: CandidateInterview
        ) =>
          a.scheduledAt.getTime() -
          b.scheduledAt.getTime()
      )
      .slice(0, 5)
      .map(toSummary),
  };
};


/* ============================================================
   LIST CANDIDATE RESULTS
============================================================ */

export const listCandidateResults = async (
  candidateId: string
) => {
  const evaluations =
    await findEvaluationsByCandidate(candidateId);


  return evaluations.map(
    (evaluation: CandidateEvaluation) => ({
      interviewId: evaluation.interviewId,

      title: evaluation.interview.title,

      company: evaluation.interview.company,

      completedAt: evaluation.createdAt,

      overallScore: evaluation.overallScore,
    })
  );
};


/* ============================================================
   GET RESULT DETAIL
============================================================ */

export const getCandidateResultDetail = async (
  candidateId: string,
  interviewId: string
) => {

  const evaluation =
    await findEvaluationByInterviewId(interviewId);


  if (!evaluation) {
    throw new NotFoundError(
      "Results not found for this interview"
    );
  }


  if (evaluation.candidateId !== candidateId) {
    throw new ForbiddenError(
      "This result does not belong to you"
    );
  }


  /* ============================================================
     QUESTION ANALYSIS
  ============================================================ */

  const questionAnalysis =
    evaluation.session.interview.questions.map(
      ({ question, status, order }) => {

        const messages =
          evaluation.session.messages.filter(
            (message) =>
              message.questionId === question.id
          );


        const candidateMessages =
          messages.filter(
            (message) =>
              message.sender === "CANDIDATE"
          );


        const aiMessages =
          messages.filter(
            (message) =>
              message.sender === "AI"
          );


        return {
          questionId: question.id,

          order,

          title: question.title,

          difficulty: question.difficulty,

          status,

          solved: status === "COMPLETED",

          candidateResponseCount:
            candidateMessages.length,

          aiResponseCount:
            aiMessages.length,

          candidateResponses:
            candidateMessages.map(
              (message) => message.message
            ),

          aiResponses:
            aiMessages.map(
              (message) => message.message
            ),
        };
      }
    );


  const solvedQuestions =
    questionAnalysis.filter(
      (question) => question.solved
    ).length;


  /* ============================================================
     RESULT RESPONSE
  ============================================================ */

  return {
    interviewId: evaluation.interviewId,

    overallScore: evaluation.overallScore,

    questionsSolved: solvedQuestions,

    totalQuestions: questionAnalysis.length,


    dimensions: {
      algorithmCorrectness:
        evaluation.algorithmCorrectness,

      logicalReasoning:
        evaluation.logicalReasoning,

      conceptCoverage:
        evaluation.conceptCoverage,

      completeness:
        evaluation.completeness,

      dataStructure:
        evaluation.dataStructure,

      complexity:
        evaluation.complexity,

      edgeCases:
        evaluation.edgeCases,
    },


    strengths: evaluation.strengths,

    improvements: evaluation.improvements,

    feedback: evaluation.feedback,
  };
};
