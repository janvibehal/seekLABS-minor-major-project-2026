import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CandidateLayout from '../../components/layout/CandidateLayout'
import * as candidateApi from '../../api/candidate.api.js'

const levelForScore = (score) => {
  if (score >= 80) return 'Strong'
  if (score >= 65) return 'Good'
  return 'Needs Practice'
}

// Static practice-set catalog - there's no question-bank browsing endpoint
// yet, so these stay illustrative until that's built.
const practiceSets = [
  {
    title: 'Interview Warm-up',
    description: 'Quick problems to get into interview mode.',
    questions: 5,
    duration: '20 min',
    difficulty: 'Easy',
  },
  {
    title: 'Algorithm Challenge',
    description: 'Test your algorithmic reasoning under pressure.',
    questions: 8,
    duration: '40 min',
    difficulty: 'Medium',
  },
  {
    title: 'Advanced Problem Solving',
    description: 'Complex problems requiring deeper reasoning.',
    questions: 5,
    duration: '45 min',
    difficulty: 'Hard',
  },
]

function CandidatePreparation() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [preparation, setPreparation] = useState(null)

  useEffect(() => {
    let cancelled = false

    candidateApi
      .getPreparation()
      .then((data) => !cancelled && setPreparation(data))
      .catch((err) => !cancelled && setError(err.message || 'Unable to load your preparation data.'))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <CandidateLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#285b8f]/30 border-t-[#285b8f]" />
        </div>
      </CandidateLayout>
    )
  }

  if (error) {
    return (
      <CandidateLayout>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">
          {error}
        </div>
      </CandidateLayout>
    )
  }

  const recommendations = preparation.weakTopics.map((topic, index) => {
    const match = preparation.topicScores.find((t) => t.topic === topic)
    return {
      title: topic,
      score: match?.score ?? 0,
      priority: index === 0 ? 'High Priority' : 'Medium Priority',
    }
  })

  return (
    <CandidateLayout>

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-8">

        <p className="text-sm font-medium text-blue-400">
          Skill Development
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
          Preparation
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Build your interview readiness by practicing the areas that
          matter most based on your performance.
        </p>

      </div>


      {/* =====================================================
          READINESS OVERVIEW
      ====================================================== */}

      <div className="grid gap-4 xl:grid-cols-3">

        {/* Overall Readiness */}

        <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-6 transition-all duration-300 hover:border-blue-400/20 hover:bg-[#0e1118]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Overall Readiness
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {preparation.overallProgress}%
              </h2>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10 text-blue-400">
              <TargetIcon />
            </div>

          </div>

          <div className="mt-6 h-2 bg-white/[0.06]">

            <div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400"
              style={{ width: `${preparation.overallProgress}%` }}
            />

          </div>

          <div className="mt-4 flex justify-between">

            <span className="text-xs text-zinc-500">
              Beginner
            </span>

            <span className="text-xs font-medium text-blue-300">
              {levelForScore(preparation.overallProgress) === 'Strong'
                ? 'Interview Ready'
                : levelForScore(preparation.overallProgress)}
            </span>

          </div>

        </div>


        {/* Questions Solved */}

        <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-6 transition-all duration-300 hover:border-blue-400/20 hover:bg-[#0e1118]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Questions Solved
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {preparation.questionsSolved}
              </h2>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10 text-blue-400">
              <CodeIcon />
            </div>

          </div>

          <p className="mt-5 text-xs text-zinc-500">
            Across all your interviews
          </p>

        </div>


        {/* Interviews Completed */}

        <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-6 transition-all duration-300 hover:border-blue-400/20 hover:bg-[#0e1118]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Interviews Completed
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {preparation.interviewsCompleted}
              </h2>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
              <FireIcon />
            </div>

          </div>

          <p className="mt-5 text-xs text-zinc-500">
            Keep completing interviews to sharpen your evaluation data.
          </p>

        </div>

      </div>


      {/* =====================================================
          RECOMMENDED FOCUS
      ====================================================== */}

      <div className="mt-8">

        <div className="mb-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            AI Recommendations
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Focus Areas
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Areas where additional practice could improve your interview
            performance.
          </p>

        </div>

        {recommendations.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-3">

            {recommendations.map((item) => (

              <RecommendationCard
                key={item.title}
                recommendation={item}
                onPractice={() => navigate('/candidate/interviews')}
              />

            ))}

          </div>
        ) : (
          <div className="border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-zinc-500">
            Complete an interview to get personalized focus areas.
          </div>
        )}

      </div>


      {/* =====================================================
          TOPIC PROGRESS
      ====================================================== */}

      <div className="mt-8">

        <div className="mb-4 flex items-end justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Skill Progress
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              Topic Performance
            </h2>

          </div>

        </div>


        {preparation.topicScores.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0d12]">

            {preparation.topicScores.map((topic) => (
              <TopicRow key={topic.topic} topic={topic} />
            ))}

          </div>
        ) : (
          <div className="border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-zinc-500">
            Complete an interview to see your topic breakdown.
          </div>
        )}

      </div>


      {/* =====================================================
          PRACTICE SETS
      ====================================================== */}

      <div className="mt-8">

        <div className="mb-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Practice
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Practice Sets
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Choose a practice session based on your current goals.
          </p>

        </div>


        <div className="grid gap-4 lg:grid-cols-3">

          {practiceSets.map((set) => (

            <PracticeCard
              key={set.title}
              practiceSet={set}
              onStart={() => navigate('/candidate/interviews')}
            />

          ))}

        </div>

      </div>


      {/* =====================================================
          PREPARATION PLAN
      ====================================================== */}

      <div className="mt-8 relative overflow-hidden rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-400/[0.09] via-[#0b0d12] to-[#0b0d12] p-6 lg:p-7">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              Recommended Preparation Plan
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Your next steps
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {preparation.weakTopics.length > 0
                ? `Spend the next few days strengthening ${preparation.weakTopics.join(', ')} before your next technical interview.`
                : 'Complete an interview to get a personalized preparation plan.'}
            </p>

          </div>


          <button
            type="button"
            onClick={() => navigate('/candidate/interviews')}
            className="shrink-0 rounded-xl bg-blue-400 px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-blue-300 hover:shadow-[0_0_30px_rgba(96,165,250,0.2)]"
          >
            Start Preparation →
          </button>

        </div>

      </div>

    </CandidateLayout>
  )
}


/* ============================================================
   RECOMMENDATION CARD
============================================================ */

function RecommendationCard({ recommendation, onPractice }) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-5 transition-all duration-300 hover:border-blue-400/20 hover:bg-[#0e1118]">

      <div className="flex items-start justify-between gap-4">

        <div>

          <span className="bg-[#fff5e8] px-2 py-1 text-[10px] font-semibold text-[#b77a2d]">
            {recommendation.priority}
          </span>

          <h3 className="mt-3 text-base font-semibold text-white">
            {recommendation.title}
          </h3>

        </div>

        <span className="text-lg font-bold text-blue-400">
          {recommendation.score}%
        </span>

      </div>

      <div className="mt-4 h-1.5 bg-white/[0.06]">

        <div
          className="h-full bg-gradient-to-r from-amber-500/80 to-amber-300/80"
          style={{
            width: `${recommendation.score}%`,
          }}
        />

      </div>


      <div className="mt-4 flex items-center justify-end">

        <button
          type="button"
          onClick={onPractice}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
        >
          Practice →
        </button>

      </div>

    </div>
  )
}


/* ============================================================
   TOPIC ROW
============================================================ */

function TopicRow({ topic }) {
  const level = levelForScore(topic.score)

  const statusStyles = {
    Strong: 'bg-emerald-400/10 text-emerald-300',
    Good: 'bg-blue-400/10 text-blue-300',
    'Needs Practice': 'rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300',
  }

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] px-6 py-5 last:border-b-0 md:grid md:grid-cols-[2fr_2fr_80px_110px] md:items-center md:gap-6">

      <div>

        <h3 className="text-sm font-semibold text-zinc-200">
          {topic.topic}
        </h3>

      </div>


      <div>

        <div className="h-1.5 bg-white/[0.06]">

          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{ width: `${topic.score}%` }}
          />

        </div>

      </div>


      <span className="font-semibold text-blue-400">
        {topic.score}%
      </span>


      <span
        className={`w-fit px-2 py-1 text-[10px] font-semibold ${
          statusStyles[level]
        }`}
      >
        {level}
      </span>

    </div>
  )
}


/* ============================================================
   PRACTICE CARD
============================================================ */

function PracticeCard({ practiceSet, onStart }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0d12] p-6">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10 text-blue-400">
          <CodeIcon />
        </div>

        <span className="bg-white/[0.06] px-2 py-1 text-[10px] font-semibold text-zinc-400">
          {practiceSet.difficulty}
        </span>

      </div>


      <h3 className="mt-5 text-base font-semibold text-white">
        {practiceSet.title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-zinc-400">
        {practiceSet.description}
      </p>


      <div className="mt-5 flex gap-5 text-xs text-zinc-500">

        <span>
          {practiceSet.questions} questions
        </span>

        <span>
          {practiceSet.duration}
        </span>

      </div>


      <button
        type="button"
        onClick={onStart}
        className="mt-5 w-full border border-blue-400/20 bg-blue-400/[0.06] py-2.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-400/10"
      >
        Start Practice →
      </button>

    </div>
  )
}


/* ============================================================
   ICONS
============================================================ */

function TargetIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}


function CodeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m14 5-4 14" />
    </svg>
  )
}


function FireIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 22c4.5 0 7-3.1 7-7.2 0-3.2-1.7-5.7-4.4-8.8.1 2.1-.5 3.3-1.6 4.3.1-4.1-1.9-7-5-8.8.4 3.7-2 5.8-2 9.2C6 17.8 8.5 22 12 22Z" />
    </svg>
  )
}


export default CandidatePreparation
