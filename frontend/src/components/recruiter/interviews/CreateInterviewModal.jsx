import { useEffect, useMemo, useState } from 'react'

import { createInterview } from '../../../api/interview.api.js'
import {
  getRecruiterQuestions,
  importRecruiterLeetCodeQuestion,
} from '../../../api/question.api.js'
import { getCandidateOptions } from '../../../api/recruiterCandidate.api.js'


function CreateInterviewModal({ onClose, onSuccess }) {
  // ============================================================
  // FORM STATE
  // ============================================================

  const [title, setTitle] = useState('')
  const [type, setType] = useState('Technical Interview')
  const [company, setCompany] = useState('')
  const [selectedCandidateIds, setSelectedCandidateIds] =
    useState([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [focusAreas, setFocusAreas] = useState([])


  // ============================================================
  // CANDIDATES STATE
  // ============================================================

  const [candidates, setCandidates] = useState([])
  const [loadingCandidates, setLoadingCandidates] =
    useState(false)

  const [candidateError, setCandidateError] =
    useState(null)


  // ============================================================
  // QUESTIONS STATE
  // ============================================================

  const [questions, setQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] =
    useState([])

  const [difficulty, setDifficulty] =
    useState('ALL')

  const [showDifficultyMenu, setShowDifficultyMenu] =
    useState(false)

  const [loadingQuestions, setLoadingQuestions] =
    useState(false)

  const [questionError, setQuestionError] =
    useState(null)

  const [questionSearch, setQuestionSearch] =
    useState('')

  const [importingQuestionSlug, setImportingQuestionSlug] =
    useState(null)


  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] =
    useState(1)

  const QUESTIONS_PER_PAGE = 5


  // ============================================================
  // CREATE STATE
  // ============================================================

  const [creating, setCreating] =
    useState(false)

  const [error, setError] =
    useState(null)


  // ============================================================
  // FETCH CANDIDATES
  // ============================================================

  useEffect(() => {
    let cancelled = false

    const fetchCandidates = async () => {
      try {
        setLoadingCandidates(true)
        setCandidateError(null)

        const data =
          await getCandidateOptions()

        console.log(
          'RECRUITER CANDIDATES:',
          data,
        )

        if (!cancelled) {
          setCandidates(
            Array.isArray(data)
              ? data
              : [],
          )
        }

      } catch (err) {
        console.error(
          'Candidate fetch error:',
          err,
        )

        if (!cancelled) {
          setCandidateError(
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load candidates.',
          )
        }

      } finally {
        if (!cancelled) {
          setLoadingCandidates(false)
        }
      }
    }

    fetchCandidates()

    return () => {
      cancelled = true
    }
  }, [])


  // ============================================================
  // FETCH QUESTIONS
  // ============================================================

  useEffect(() => {
    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        setLoadingQuestions(true)
        setQuestionError(null)

        const response =
          await getRecruiterQuestions(
            difficulty === 'ALL'
              ? undefined
              : difficulty,
            questionSearch,
          )

        if (cancelled) {
          return
        }

        // Support the response shapes used by the recruiter
        // questions endpoint and older/local implementations.
        const nextQuestions =
          Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.questions)
                ? response.questions
                : Array.isArray(response?.data?.questions)
                  ? response.data.questions
                  : Array.isArray(response?.data?.data)
                    ? response.data.data
                    : []

        // Always replace the visible library with the latest result.
        setQuestions(nextQuestions)
        setCurrentPage(1)

      } catch (err) {
        console.error(
          'Question fetch error:',
          err,
        )

        if (!cancelled) {
          setQuestionError(
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load LeetCode questions.',
          )
        }

      } finally {
        if (!cancelled) {
          setLoadingQuestions(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [
    difficulty,
    questionSearch,
  ])


  // ============================================================
  // NORMALIZE QUESTIONS
  // ============================================================

  const normalizedQuestions = useMemo(() => {
    return questions.map((question) => ({
      remoteId:
        question.leetcode_id ||
        question.questionFrontendId ||
        question.problem_id ||
        question.id ||
        question.titleSlug ||
        question.title,

      title:
        question.title ||
        'Untitled Question',

      slug:
        question.title_slug ||
        question.titleSlug ||
        question.slug ||
        '',

      leetcodeId:
        question.leetcode_id ||
        question.questionFrontendId ||
        '',

      difficulty:
        question.difficulty ||
        'UNKNOWN',

      topics:
        question.topic_tags ||
        question.topicTags ||
        question.tags ||
        [],

      referenceSupported:
        question.reference_supported !== false,
    }))
  }, [questions])


  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      normalizedQuestions.length /
        QUESTIONS_PER_PAGE,
    ),
  )

  const paginatedQuestions =
    normalizedQuestions.slice(
      (currentPage - 1) *
        QUESTIONS_PER_PAGE,
      currentPage *
        QUESTIONS_PER_PAGE,
    )


  // ============================================================
  // SELECT / REMOVE QUESTION
  // ============================================================

  const toggleQuestion = async (question) => {
    const existing = selectedQuestions.find(
      (item) =>
        item.remoteId === question.remoteId,
    )

    if (existing) {
      setSelectedQuestions((previous) =>
        previous.filter(
          (item) =>
            item.remoteId !== question.remoteId,
        ),
      )
      return
    }

    if (!question.referenceSupported) {
      setQuestionError(
        'This problem is currently unavailable because the AI reference dataset does not contain a reference solution for it.',
      )
      return
    }

    if (!question.slug) {
      setQuestionError(
        'This LeetCode problem does not have a valid slug.',
      )
      return
    }

    try {
      setQuestionError(null)
      setImportingQuestionSlug(
        question.slug,
      )

      const imported =
        await importRecruiterLeetCodeQuestion(
          question.slug,
        )

      setSelectedQuestions((previous) => {
        if (
          previous.some(
            (item) =>
              item.id === imported.id,
          )
        ) {
          return previous
        }

        return [
          ...previous,
          {
            ...question,

            id: imported.id,

            title:
              imported.title ||
              question.title,

            difficulty:
              imported.difficulty ||
              question.difficulty,

            topics:
              imported.topics ||
              question.topics,

            // Every newly selected question starts at 10 minutes.
            time: 10,
          },
        ]
      })

    } catch (err) {
      console.error(
        'LeetCode import error:',
        err,
      )

      setQuestionError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to add this LeetCode question.',
      )

    } finally {
      setImportingQuestionSlug(null)
    }
  }


  // ============================================================
  // UPDATE QUESTION TIME
  // ============================================================

  const updateQuestionTime = (
    questionId,
    value,
  ) => {
    // Allow the input to temporarily be empty while typing.
    if (value === '') {
      setSelectedQuestions((previous) =>
        previous.map((question) =>
          question.id === questionId
            ? {
                ...question,
                time: '',
              }
            : question,
        ),
      )

      return
    }

    const time = Number(value)

    if (
      !Number.isFinite(time)
    ) {
      return
    }

    setSelectedQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? {
              ...question,
              time:
                time < 1
                  ? 1
                  : time,
            }
          : question,
      ),
    )
  }


  // ============================================================
  // NORMALIZE TIME AFTER TYPING
  // ============================================================

  const normalizeQuestionTime = (
    questionId,
    value,
  ) => {
    const time = Number(value)

    setSelectedQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? {
              ...question,
              time:
                !Number.isFinite(time) ||
                time < 1
                  ? 10
                  : Math.floor(time),
            }
          : question,
      ),
    )
  }


  // ============================================================
  // INCREASE QUESTION TIME
  // ============================================================

  const increaseQuestionTime = (
    questionId,
    currentTime,
  ) => {
    const time =
      Number(currentTime) || 10

    updateQuestionTime(
      questionId,
      time + 5,
    )
  }


  // ============================================================
  // DECREASE QUESTION TIME
  // ============================================================

  const decreaseQuestionTime = (
    questionId,
    currentTime,
  ) => {
    const time =
      Number(currentTime) || 10

    updateQuestionTime(
      questionId,
      Math.max(10, time - 5),
    )
  }


  // ============================================================
  // TOTAL TIME
  // ============================================================

  const totalTime =
    selectedQuestions.reduce(
      (total, question) =>
        total +
        (Number(question.time) || 0),
      0,
    )


  // ============================================================
  // DIFFICULTY STYLING
  // ============================================================

  const getDifficultyClass = (
    questionDifficulty,
  ) => {
    const value =
      questionDifficulty?.toUpperCase()

    if (value === 'EASY') {
      return 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
    }

    if (value === 'MEDIUM') {
      return 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
    }

    if (value === 'HARD') {
      return 'border border-red-500/20 bg-red-500/10 text-red-400'
    }

    return 'border border-zinc-700 bg-zinc-800 text-zinc-400'
  }


  // ============================================================
  // CREATE INTERVIEW
  // ============================================================

  const handleCreateInterview = async (
    event,
  ) => {
    event.preventDefault()

    setError(null)

    if (!title.trim()) {
      setError(
        'Please enter an interview title.',
      )
      return
    }

    if (
      selectedCandidateIds.length ===
      0
    ) {
      setError(
        'Please select at least one candidate.',
      )
      return
    }

    if (!scheduledAt) {
      setError(
        'Please select an interview schedule.',
      )
      return
    }

    if (
      selectedQuestions.length ===
      0
    ) {
      setError(
        'Please select at least one question.',
      )
      return
    }

    try {
      setCreating(true)

      const payload = {
        title: title.trim(),

        type,

        company:
          company.trim() ||
          undefined,

        candidateIds:
          selectedCandidateIds,

        focusAreas,

        scheduledAt:
          new Date(
            scheduledAt,
          ).toISOString(),

        duration: totalTime,

        questionIds:
          selectedQuestions.map(
            (question) =>
              question.id,
          ),
      }

      console.log(
        'CREATE INTERVIEW PAYLOAD:',
        payload,
      )

      await createInterview(payload)

      onSuccess?.()

      onClose()

    } catch (err) {
      console.error(
        'Create interview error:',
        err,
      )

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create interview.',
      )

    } finally {
      setCreating(false)
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">

      <div className="my-8 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-zinc-800 bg-[#111111] shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-5">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Recruiter Dashboard
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              Create Interview
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Configure the candidate, questions and interview schedule.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
          >
            <CloseIcon />
          </button>

        </div>


        <form
          onSubmit={handleCreateInterview}
          className="min-h-0 flex-1 overflow-y-auto"
        >

          <div className="space-y-8 p-6">

            {/* INTERVIEW DETAILS */}

            <section>

              <SectionTitle>
                Interview Details
              </SectionTitle>

              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <Field
                  label="Interview Title"
                  required
                >

                  <input
                    value={title}
                    onChange={(event) =>
                      setTitle(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Full Stack Developer Interview"
                    className="w-full border border-zinc-700 bg-[#181818] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />

                </Field>


                <Field label="Interview Type">

                  <select
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target.value,
                      )
                    }
                    className="w-full border border-zinc-700 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  >

                    <option value="Technical Interview">
                      Technical Interview
                    </option>

                    <option value="Coding Interview">
                      Coding Interview
                    </option>

                    <option value="DSA Interview">
                      DSA Interview
                    </option>

                  </select>

                </Field>


                <Field label="Company">

                  <input
                    value={company}
                    onChange={(event) =>
                      setCompany(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. SeekLABS"
                    className="w-full border border-zinc-700 bg-[#181818] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />

                </Field>


                <Field
                  label="Candidates"
                  required
                >

                  <div className="border border-zinc-700 bg-[#181818]">

                    <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">

                      <label className="flex cursor-pointer items-center gap-3 text-xs text-zinc-300">

                        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">

                          <input
                            type="checkbox"
                            checked={
                              candidates.length >
                                0 &&
                              selectedCandidateIds.length ===
                                candidates.length
                            }
                            onChange={(event) => {

                              if (
                                event.target.checked
                              ) {

                                setSelectedCandidateIds(
                                  candidates.map(
                                    (candidate) =>
                                      candidate.id,
                                  ),
                                )

                              } else {

                                setSelectedCandidateIds(
                                  [],
                                )

                              }

                            }}
                            disabled={
                              loadingCandidates ||
                              candidates.length ===
                                0
                            }
                            className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                          />

                          <span className="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-600 bg-[#181818] transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40">

                            {selectedCandidateIds.length ===
                              candidates.length &&
                              candidates.length >
                                0 && (

                              <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                className="h-3 w-3 text-white"
                                aria-hidden="true"
                              >

                                <path
                                  d="M3.5 8.25 6.5 11l6-6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                              </svg>

                            )}

                          </span>

                        </span>

                        <span>

                          {selectedCandidateIds.length ===
                            candidates.length &&
                          candidates.length >
                            0
                            ? 'Deselect All'
                            : 'Select All'}

                        </span>

                      </label>


                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">

                        {
                          selectedCandidateIds.length
                        }{' '}

                        selected

                      </span>

                    </div>


                    <div className="max-h-48 overflow-y-auto">

                      {loadingCandidates ? (

                        <p className="px-4 py-4 text-xs text-zinc-500">
                          Loading candidates...
                        </p>

                      ) : candidates.length ===
                        0 ? (

                        <p className="px-4 py-4 text-xs text-zinc-500">
                          No candidates available.
                        </p>

                      ) : (

                        candidates.map(
                          (
                            candidate,
                          ) => {

                            const name =
                              candidate.name ||
                              `${
                                candidate.firstName ||
                                ''
                              } ${
                                candidate.lastName ||
                                ''
                              }`.trim()

                            const selected =
                              selectedCandidateIds.includes(
                                candidate.id,
                              )

                            return (

                              <label
                                key={
                                  candidate.id
                                }
                                className="flex cursor-pointer items-center gap-3 border-b border-zinc-800/70 px-4 py-3 last:border-b-0 hover:bg-zinc-800/40"
                              >

                                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">

                                  <input
                                    type="checkbox"
                                    checked={
                                      selected
                                    }
                                    onChange={() => {

                                      setSelectedCandidateIds(
                                        (
                                          previous,
                                        ) =>
                                          previous.includes(
                                            candidate.id,
                                          )
                                            ? previous.filter(
                                                (
                                                  id,
                                                ) =>
                                                  id !==
                                                  candidate.id,
                                              )
                                            : [
                                                ...previous,
                                                candidate.id,
                                              ],
                                      )

                                    }}
                                    className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0"
                                  />

                                  <span className="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-600 bg-[#181818] transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40">

                                    {selected && (

                                      <svg
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="h-3 w-3 text-white"
                                        aria-hidden="true"
                                      >

                                        <path
                                          d="M3.5 8.25 6.5 11l6-6"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />

                                      </svg>

                                    )}

                                  </span>

                                </span>


                                <div className="min-w-0">

                                  <p className="truncate text-sm text-white">

                                    {name ||
                                      'Unnamed Candidate'}

                                  </p>


                                  <p className="truncate text-[10px] text-zinc-500">

                                    {
                                      candidate.email
                                    }

                                  </p>

                                </div>

                              </label>

                            )

                          },
                        )

                      )}

                    </div>

                  </div>


                  {candidateError && (

                    <p className="mt-2 text-[10px] text-red-400">
                      {candidateError}
                    </p>

                  )}

                </Field>


                <Field
                  label="Schedule"
                  required
                >

                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) =>
                      setScheduledAt(
                        event.target.value,
                      )
                    }
                    className="w-full border border-zinc-700 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 [color-scheme:dark]"
                  />

                </Field>

              </div>

            </section>


            {/* SELECTED QUESTIONS */}

            <section>

              <SectionTitle>
                Selected Questions
              </SectionTitle>

              <div className="mt-4 space-y-2">

                {selectedQuestions.length ===
                0 ? (

                  <div className="border border-zinc-800 bg-[#111111] px-5 py-8 text-center">

                    <p className="text-xs text-zinc-600">
                      No questions selected yet.
                    </p>

                  </div>

                ) : (

                  selectedQuestions.map(
                    (
                      question,
                      index,
                    ) => (

                      <div
                        key={question.id}
                        className="flex items-center gap-4 border border-zinc-800 bg-[#111111] px-4 py-3"
                      >

                        <span className="w-6 text-[10px] font-semibold text-zinc-600">
                          {index + 1}
                        </span>


                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-3">

                            <span className="text-[10px] font-semibold text-blue-400">

                              #

                              {
                                question.leetcodeId ||
                                '—'
                              }

                            </span>


                            <p className="truncate text-xs font-medium text-zinc-200">

                              {
                                question.title
                              }

                            </p>

                          </div>


                          <p className="mt-1 text-[9px] text-zinc-600">

                            {
                              question.difficulty
                            }

                          </p>

                        </div>


                        {/* TIME COUNTER */}

                        <div className="flex items-center gap-3">

                          <label className="text-[9px] uppercase tracking-wider text-zinc-600">
                            Minutes
                          </label>


                          <div className="flex items-center border border-zinc-700 bg-[#181818]">

                            {/* DECREASE BY 5 */}

                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuestionTime(
                                  question.id,
                                  question.time,
                                )
                              }
                              disabled={
                                Number(
                                  question.time ||
                                    10,
                                ) <= 1
                              }
                              className="flex h-9 w-9 items-center justify-center border-r border-zinc-700 text-lg leading-none text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Decrease interview time by 5 minutes"
                            >
                              −
                            </button>


                            {/* TYPE TIME */}

                            <input
                              type="number"
                              min="10"
                              step="5"
                              value={question.time}
                              onChange={(event) =>
                                updateQuestionTime(
                                  question.id,
                                  event.target.value,
                                )
                              }
                              onBlur={(event) =>
                                normalizeQuestionTime(
                                  question.id,
                                  event.target.value,
                                )
                              }
                              className="h-9 w-16 appearance-none border-0 bg-transparent px-1 text-center text-sm font-medium text-white outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />


                            {/* INCREASE BY 5 */}

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuestionTime(
                                  question.id,
                                  question.time,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center border-l border-zinc-700 text-lg leading-none text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                              aria-label="Increase interview time by 5 minutes"
                            >
                              +
                            </button>

                          </div>

                        </div>


                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            toggleQuestion(
                              question,
                            )
                          }
                          className="border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/20"
                        >
                          Remove
                        </button>

                      </div>

                    ),
                  )

                )}

              </div>

            </section>


            {/* QUESTION LIBRARY */}

            <section>

              <div className="flex items-end justify-between">

                <div>

                  <SectionTitle>
                    Question Library
                  </SectionTitle>


                  <p className="mt-2 text-xs text-zinc-500">
                    Search the full free LeetCode problem library by ID or name.
                  </p>

                </div>


                <div className="text-[10px] text-zinc-600">

                  {
                    normalizedQuestions.length
                  }{' '}

                  visible

                </div>

              </div>


              <div className="mt-5 border border-zinc-800 bg-[#111111]">

                {/* SEARCH */}

                <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 md:flex-row">

                  <div className="relative flex-1">

                    <input
                      value={questionSearch}
                      onChange={(
                        event,
                      ) => {

                        setQuestionSearch(
                          event.target
                            .value,
                        )

                        setCurrentPage(
                          1,
                        )

                      }}
                      placeholder="Search by LeetCode ID or problem name..."
                      className="w-full border border-zinc-700 bg-[#181818] px-4 py-3 text-xs text-white outline-none placeholder:text-zinc-600 transition focus:border-blue-500"
                    />

                  </div>


                  <div className="relative">

                    <button
                      type="button"
                      onClick={() =>
                        setShowDifficultyMenu(
                          (
                            previous,
                          ) =>
                            !previous,
                        )
                      }
                      className="flex min-w-[170px] items-center justify-between border border-zinc-700 bg-[#181818] px-4 py-3 text-xs text-zinc-300 transition hover:border-zinc-600"
                    >

                      <span>

                        {
                          {
                            ALL:
                              'All Difficulties',
                            EASY:
                              'Easy',
                            MEDIUM:
                              'Medium',
                            HARD:
                              'Hard',
                          }[
                            difficulty
                          ]
                        }

                      </span>


                      <SortIcon />

                    </button>


                    {showDifficultyMenu && (

                      <div className="absolute right-0 top-full z-20 mt-1 min-w-[170px] border border-zinc-700 bg-[#181818] shadow-xl">

                        {[
                          {
                            value: 'ALL',
                            label:
                              'All Difficulties',
                          },
                          {
                            value: 'EASY',
                            label: 'Easy',
                          },
                          {
                            value: 'MEDIUM',
                            label:
                              'Medium',
                          },
                          {
                            value: 'HARD',
                            label: 'Hard',
                          },
                        ].map(
                          (
                            option,
                          ) => (

                            <button
                              key={
                                option.value
                              }
                              type="button"
                              onClick={() => {

                                setDifficulty(
                                  option.value,
                                )

                                setShowDifficultyMenu(
                                  false,
                                )

                                setCurrentPage(
                                  1,
                                )

                              }}
                              className={`block w-full px-4 py-3 text-left text-xs transition ${
                                difficulty ===
                                option.value
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                              }`}
                            >

                              {
                                option.label
                              }

                            </button>

                          ),
                        )}

                      </div>

                    )}

                  </div>

                </div>


                {/* ERROR */}

                {questionError && (

                  <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">

                    <p className="text-[10px] text-amber-400">
                      {questionError}
                    </p>

                  </div>

                )}


                {/* QUESTIONS */}

                <div className="relative min-h-[430px]">

                  {/* Keep existing questions visible while
                      search/filter results are loading. */}

                  {paginatedQuestions.length >
                    0 && (

                    <div
                      className={
                        loadingQuestions
                          ? 'pointer-events-none opacity-50 transition-opacity'
                          : 'transition-opacity'
                      }
                    >

                      {paginatedQuestions.map(
                        (
                          question,
                        ) => {

                          const selected =
                            selectedQuestions.some(
                              (
                                item,
                              ) =>
                                item.remoteId ===
                                question.remoteId,
                            )

                          return (

                            <div
                              key={
                                question.remoteId
                              }
                              className={`flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4 transition ${
                                selected
                                  ? 'bg-blue-500/5'
                                  : 'hover:bg-zinc-900'
                              }`}
                            >

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-3">

                                  <span className="shrink-0 text-[10px] font-semibold text-blue-400">

                                    #

                                    {
                                      question.leetcodeId ||
                                      '—'
                                    }

                                  </span>


                                  <p className="truncate text-sm font-medium text-zinc-200">

                                    {
                                      question.title
                                    }

                                  </p>

                                </div>


                                <div className="mt-3 flex flex-wrap gap-2">

                                  <span
                                    className={`px-2 py-1 text-[9px] font-semibold ${getDifficultyClass(
                                      question.difficulty,
                                    )}`}
                                  >

                                    {
                                      question.difficulty
                                    }

                                  </span>


                                  {question.topics
                                    ?.slice(
                                      0,
                                      3,
                                    )
                                    .map(
                                      (
                                        topic,
                                        index,
                                      ) => {

                                        const topicName =
                                          typeof topic ===
                                          'string'
                                            ? topic
                                            : topic?.name ||
                                              topic?.slug ||
                                              `Topic ${
                                                index +
                                                1
                                              }`

                                        return (

                                          <span
                                            key={`${topicName}-${index}`}
                                            className="border border-zinc-800 bg-zinc-900 px-2 py-1 text-[9px] text-zinc-500"
                                          >

                                            {
                                              topicName
                                            }

                                          </span>

                                        )

                                      },
                                    )}

                                </div>

                              </div>


                              <button
                                type="button"
                                onClick={() =>
                                  toggleQuestion(
                                    question,
                                  )
                                }
                                disabled={
                                  !question.referenceSupported ||
                                  importingQuestionSlug ===
                                    question.slug
                                }
                                className={`min-w-[80px] px-4 py-2 text-[10px] font-semibold transition ${
                                  !question.referenceSupported
                                    ? 'cursor-not-allowed border border-zinc-800 bg-zinc-900 text-zinc-600'
                                    : selected
                                      ? 'border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                      : 'border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                                } disabled:cursor-wait disabled:opacity-70`}
                              >

                                {
                                  importingQuestionSlug ===
                                  question.slug
                                    ? 'Adding...'
                                    : !question.referenceSupported
                                      ? 'Unavailable'
                                      : selected
                                        ? 'Remove'
                                        : 'Add'
                                }

                              </button>

                            </div>

                          )

                        },
                      )}

                    </div>

                  )}


                  {/* INITIAL LOADING */}

                  {paginatedQuestions.length ===
                    0 &&
                    loadingQuestions && (

                    <div className="flex min-h-[430px] items-center justify-center">

                      <div className="text-center">

                        <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-400" />

                        <p className="mt-4 text-xs text-zinc-600">
                          Loading questions...
                        </p>

                      </div>

                    </div>

                  )}


                  {/* NO RESULTS */}

                  {!loadingQuestions &&
                    paginatedQuestions.length ===
                      0 && (

                    <div className="flex min-h-[430px] items-center justify-center px-5 text-center">

                      <div>

                        <p className="text-xs text-zinc-500">
                          No questions found.
                        </p>

                        <p className="mt-2 text-[10px] text-zinc-700">
                          Try a different problem ID or problem name.
                        </p>

                      </div>

                    </div>

                  )}


                  {/* UPDATING INDICATOR */}

                  {loadingQuestions &&
                    paginatedQuestions.length >
                      0 && (

                    <div className="absolute right-4 top-4 z-10 flex items-center gap-2 border border-zinc-700 bg-[#181818] px-3 py-2 text-[10px] text-zinc-500">

                      <span className="h-2.5 w-2.5 animate-spin rounded-full border border-zinc-600 border-t-blue-400" />

                      Updating...

                    </div>

                  )}

                </div>


                {/* PAGINATION */}

                {!loadingQuestions &&
                  normalizedQuestions.length >
                    0 && (

                  <div className="flex items-center justify-between border-t border-zinc-800 bg-[#111111] px-5 py-4">

                    <p className="text-[10px] text-zinc-500">

                      Page {currentPage} of{' '}

                      {totalPages}

                    </p>


                    <div className="flex gap-2">

                      <button
                        type="button"
                        disabled={
                          currentPage ===
                          1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (
                              previous,
                            ) =>
                              previous -
                              1,
                          )
                        }
                        className="border border-zinc-700 px-4 py-2 text-[10px] text-zinc-400 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>


                      <button
                        type="button"
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (
                              previous,
                            ) =>
                              previous +
                              1,
                          )
                        }
                        className="border border-zinc-700 px-4 py-2 text-[10px] text-zinc-400 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>

                    </div>

                  </div>

                )}

              </div>

            </section>


            {/* ERROR */}

            {error && (

              <div className="border border-red-500/20 bg-red-500/10 px-5 py-4">

                <p className="text-xs font-medium text-red-400">
                  {error}
                </p>

              </div>

            )}

          </div>


          {/* FOOTER */}

          <div className="sticky bottom-0 flex shrink-0 items-center justify-between border-t border-zinc-800 bg-[#111111] px-6 py-4">

            <div className="text-[10px] text-zinc-500">

              {
                selectedQuestions.length
              }{' '}

              question
              {
                selectedQuestions.length !==
                1
                  ? 's'
                  : ''
              }{' '}

              selected

            </div>


            <div className="flex gap-3">

              <button
                type="button"
                onClick={onClose}
                disabled={creating}
                className="border border-zinc-700 px-5 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  creating ||
                  loadingCandidates ||
                  selectedCandidateIds.length ===
                    0 ||
                  selectedQuestions.length ===
                    0 ||
                  !scheduledAt ||
                  !title.trim()
                }
                className="bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {creating
                  ? 'Creating Interview...'
                  : `Create Interview (${totalTime} min)`}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  )
}


/* ============================================================
   REUSABLE COMPONENTS
============================================================ */

function SectionTitle({
  children,
}) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
      {children}
    </p>
  )
}


function Field({
  label,
  required,
  children,
}) {
  return (
    <div>

      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-500">

        {label}

        {required && (

          <span className="ml-1 text-red-400">
            *
          </span>

        )}

      </label>


      {children}

    </div>
  )
}


/* ============================================================
   ICONS
============================================================ */

function CloseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >

      <path d="m6 6 12 12M18 6 6 18" />

    </svg>
  )
}


function SortIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >

      <path d="M4 7h10" />

      <path d="M4 12h16" />

      <path d="M4 17h7" />

      <path d="m16 5 3 2-3 2" />

    </svg>
  )
}


export default CreateInterviewModal