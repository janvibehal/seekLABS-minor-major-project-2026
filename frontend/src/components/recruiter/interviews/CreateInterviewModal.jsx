import { useEffect, useMemo, useState } from 'react'

import { createInterview } from '../../../api/interview.api.js'
import { getRecruiterQuestions } from '../../../api/question.api.js'
import { getCandidateOptions } from '../../../api/recruiterCandidate.api.js'


function CreateInterviewModal({ onClose, onSuccess }) {
  // ============================================================
  // FORM STATE
  // ============================================================

  const [title, setTitle] = useState('')
  const [type, setType] = useState('Technical Interview')
  const [company, setCompany] = useState('')
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([])
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

    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true)
        setQuestionError(null)

        const questionList =
          await getRecruiterQuestions(
            difficulty === 'ALL'
              ? undefined
              : difficulty,
          )

        if (!cancelled) {
          setQuestions(
            Array.isArray(questionList)
              ? questionList
              : [],
          )

          setCurrentPage(1)
        }

      } catch (err) {
        console.error(
          'Question fetch error:',
          err,
        )

        if (!cancelled) {
          setQuestionError(
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load questions.',
          )
        }

      } finally {
        if (!cancelled) {
          setLoadingQuestions(false)
        }
      }
    }

    fetchQuestions()

    return () => {
      cancelled = true
    }
  }, [difficulty])


  // ============================================================
  // NORMALIZE QUESTIONS
  // ============================================================

  const normalizedQuestions = useMemo(() => {
    return questions.map((question) => ({
      id:
        question.questionFrontendId ||
        question.id ||
        question.titleSlug ||
        question.slug ||
        question.title,

      title:
        question.title ||
        'Untitled Question',

      slug:
        question.titleSlug ||
        question.slug ||
        '',

      difficulty:
        question.difficulty ||
        'UNKNOWN',

      topics:
        question.topicTags ||
        question.tags ||
        [],
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

  const toggleQuestion = (question) => {
    setSelectedQuestions((previous) => {
      const exists = previous.some(
        (item) =>
          item.id === question.id,
      )

      if (exists) {
        return previous.filter(
          (item) =>
            item.id !== question.id,
        )
      }

      return [
        ...previous,
        {
          ...question,
          time: 10,
        },
      ]
    })
  }


  // ============================================================
  // UPDATE QUESTION TIME
  // ============================================================

  const updateQuestionTime = (
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
                Number.isNaN(time) ||
                time < 1
                  ? 1
                  : time,
            }
          : question,
      ),
    )
  }


  // ============================================================
  // TOTAL TIME
  // ============================================================

  const totalTime =
    selectedQuestions.reduce(
      (total, question) =>
        total +
        Number(question.time || 0),
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


    if (selectedCandidateIds.length === 0) {
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


    if (selectedQuestions.length === 0) {
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
          company.trim() || undefined,

        candidateIds: selectedCandidateIds,

        focusAreas,

        scheduledAt:
          new Date(
            scheduledAt,
          ).toISOString(),

        duration: totalTime,

        questionIds:
          selectedQuestions.map(
            (question) => question.id,
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


        {/* =====================================================
            HEADER
        ====================================================== */}

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


        {/* =====================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleCreateInterview}
          className="min-h-0 flex-1 overflow-y-auto"
        >

          <div className="space-y-8 p-6">


            {/* =================================================
                INTERVIEW DETAILS
            ================================================== */}

            <section>

              <SectionTitle>
                Interview Details
              </SectionTitle>


              <div className="mt-5 grid gap-5 md:grid-cols-2">


                {/* TITLE */}

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


                {/* TYPE */}

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


                {/* COMPANY */}

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


                {/* CANDIDATE SELECTION */}

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
                              candidates.length > 0 &&
                              selectedCandidateIds.length === candidates.length
                            }
                            onChange={(event) => {
                              if (event.target.checked) {
                                setSelectedCandidateIds(
                                  candidates.map((candidate) => candidate.id),
                                )
                              } else {
                                setSelectedCandidateIds([])
                              }
                            }}
                            disabled={
                              loadingCandidates ||
                              candidates.length === 0
                            }
                            className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                          />
                          <span className="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-600 bg-[#181818] transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40">
                            {selectedCandidateIds.length === candidates.length && candidates.length > 0 && (
                              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-white" aria-hidden="true">
                                <path d="M3.5 8.25 6.5 11l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                        </span>
                        <span>
                          {selectedCandidateIds.length === candidates.length && candidates.length > 0
                            ? 'Deselect All'
                            : 'Select All'}
                        </span>
                      </label>

                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        {selectedCandidateIds.length} selected
                      </span>

                    </div>

                    <div className="max-h-48 overflow-y-auto">

                      {loadingCandidates ? (
                        <p className="px-4 py-4 text-xs text-zinc-500">
                          Loading candidates...
                        </p>
                      ) : candidates.length === 0 ? (
                        <p className="px-4 py-4 text-xs text-zinc-500">
                          No candidates available.
                        </p>
                      ) : (
                        candidates.map((candidate) => {
                          const name =
                            candidate.name ||
                            `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim()

                          const selected = selectedCandidateIds.includes(
                            candidate.id,
                          )

                          return (
                            <label
                              key={candidate.id}
                              className="flex cursor-pointer items-center gap-3 border-b border-zinc-800/70 px-4 py-3 last:border-b-0 hover:bg-zinc-800/40"
                            >
                              <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => {
                                    setSelectedCandidateIds((previous) =>
                                      previous.includes(candidate.id)
                                        ? previous.filter((id) => id !== candidate.id)
                                        : [...previous, candidate.id],
                                    )
                                  }}
                                  className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0"
                                />
                                <span className="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-600 bg-[#181818] transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40">
                                  {selected && (
                                    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-white" aria-hidden="true">
                                      <path d="M3.5 8.25 6.5 11l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                              </span>

                              <div className="min-w-0">
                                <p className="truncate text-sm text-white">
                                  {name || 'Unnamed Candidate'}
                                </p>
                                <p className="truncate text-[10px] text-zinc-500">
                                  {candidate.email}
                                </p>
                              </div>
                            </label>
                          )
                        })
                      )}

                    </div>

                  </div>

                  {candidateError && (
                    <p className="mt-2 text-[10px] text-red-400">
                      {candidateError}
                    </p>
                  )}

                </Field>


                {/* SCHEDULE */}

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
                    className="w-full border border-zinc-700 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  />

                </Field>


                {/* FOCUS AREA */}

                <Field label="Focus Area">

                  <select
                    value=""
                    onChange={(event) => {
                      const value =
                        event.target.value

                      if (
                        value &&
                        !focusAreas.includes(
                          value,
                        )
                      ) {
                        setFocusAreas([
                          ...focusAreas,
                          value,
                        ])
                      }
                    }}
                    className="w-full border border-zinc-700 bg-[#181818] px-4 py-3 text-sm text-zinc-300 outline-none transition focus:border-blue-500"
                  >

                    <option value="">
                      Select a topic
                    </option>

                    <option value="Arrays">
                      Arrays
                    </option>

                    <option value="Strings">
                      Strings
                    </option>

                    <option value="Trees">
                      Trees
                    </option>

                    <option value="Graphs">
                      Graphs
                    </option>

                    <option value="Dynamic Programming">
                      Dynamic Programming
                    </option>

                    <option value="Binary Search">
                      Binary Search
                    </option>

                    <option value="Linked Lists">
                      Linked Lists
                    </option>

                    <option value="Stacks">
                      Stacks
                    </option>

                    <option value="Queues">
                      Queues
                    </option>

                  </select>

                </Field>

              </div>


              {/* SELECTED FOCUS AREAS */}

              {focusAreas.length > 0 && (

                <div className="mt-4 flex flex-wrap gap-2">

                  {focusAreas.map((area) => (

                    <button
                      key={area}
                      type="button"
                      onClick={() =>
                        setFocusAreas(
                          focusAreas.filter(
                            (item) =>
                              item !== area,
                          ),
                        )
                      }
                      className="flex items-center gap-2 border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-medium text-blue-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >

                      {area}

                      <span className="text-sm">
                        ×
                      </span>

                    </button>

                  ))}

                </div>

              )}

            </section>


            {/* =================================================
                SELECTED QUESTIONS
            ================================================== */}

            <section className="overflow-hidden border border-zinc-800 bg-[#151515]">

              <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">

                <div>

                  <SectionTitle>
                    Selected Questions
                  </SectionTitle>

                  <p className="mt-2 text-[10px] text-zinc-500">
                    Configure an individual time limit for every question.
                  </p>

                </div>


                <div className="text-right">

                  <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
                    Total Duration
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalTime} min
                  </p>

                </div>

              </div>


              {selectedQuestions.length === 0 ? (

                <div className="px-5 py-10 text-center">

                  <p className="text-xs text-zinc-500">
                    No questions selected yet.
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-zinc-800">

                  {selectedQuestions.map(
                    (question, index) => (

                      <div
                        key={question.id}
                        className="flex items-center gap-4 px-5 py-4"
                      >

                        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-blue-500/10 text-[10px] font-semibold text-blue-400">
                          {index + 1}
                        </span>


                        <div className="min-w-0 flex-1">

                          <p className="truncate text-xs font-medium text-zinc-200">
                            {question.title}
                          </p>

                          <span
                            className={`mt-2 inline-block px-2 py-1 text-[9px] font-semibold ${getDifficultyClass(
                              question.difficulty,
                            )}`}
                          >
                            {question.difficulty}
                          </span>

                        </div>


                        <div className="flex items-center gap-2">

                          <input
                            type="number"
                            min="1"
                            value={question.time}
                            onChange={(event) =>
                              updateQuestionTime(
                                question.id,
                                event.target.value,
                              )
                            }
                            className="w-16 border border-zinc-700 bg-[#0d0d0d] px-2 py-2 text-center text-xs text-white outline-none focus:border-blue-500"
                          />

                          <span className="text-[10px] text-zinc-500">
                            min
                          </span>


                          <button
                            type="button"
                            onClick={() =>
                              toggleQuestion(
                                question,
                              )
                            }
                            className="ml-2 text-lg text-zinc-500 transition hover:text-red-400"
                          >
                            ×
                          </button>

                        </div>

                      </div>

                    ),
                  )}

                </div>

              )}

            </section>


            {/* =================================================
                QUESTION LIBRARY
            ================================================== */}

            <section className="overflow-hidden border border-zinc-800 bg-[#151515]">


              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">

                <div>

                  <SectionTitle>
                    Question Library
                  </SectionTitle>

                  <p className="mt-2 text-[10px] text-zinc-500">
                    Select questions from your backend question bank.
                  </p>

                </div>


                {/* DIFFICULTY FILTER */}

                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setShowDifficultyMenu(
                        !showDifficultyMenu,
                      )
                    }
                    className="flex h-9 items-center gap-2 border border-zinc-700 px-3 text-[10px] font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                  >

                    <SortIcon />

                    {difficulty}

                  </button>


                  {showDifficultyMenu && (

                    <div className="absolute right-0 top-11 z-30 w-40 overflow-hidden border border-zinc-700 bg-[#181818] shadow-2xl">

                      {[
                        'ALL',
                        'EASY',
                        'MEDIUM',
                        'HARD',
                      ].map((item) => (

                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setDifficulty(item)

                            setShowDifficultyMenu(
                              false,
                            )
                          }}
                          className={`block w-full px-4 py-3 text-left text-[10px] transition hover:bg-zinc-800 ${
                            difficulty === item
                              ? 'text-blue-400'
                              : 'text-zinc-400'
                          }`}
                        >

                          {item === 'ALL'
                            ? 'All Questions'
                            : item}

                        </button>

                      ))}

                    </div>

                  )}

                </div>

              </div>


              {/* LOADING */}

              {loadingQuestions && (

                <div className="px-5 py-14 text-center">

                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-400" />

                  <p className="mt-4 text-xs text-zinc-500">
                    Loading questions...
                  </p>

                </div>

              )}


              {/* QUESTION ERROR */}

              {questionError &&
                !loadingQuestions && (

                  <div className="px-5 py-12 text-center">

                    <p className="text-xs font-medium text-red-400">
                      Failed to load questions
                    </p>

                    <p className="mt-2 text-[10px] text-zinc-500">
                      {questionError}
                    </p>

                  </div>

                )}


              {/* QUESTIONS */}

              {!loadingQuestions &&
                !questionError && (

                  <div className="divide-y divide-zinc-800">

                    {paginatedQuestions.map(
                      (question) => {

                        const selected =
                          selectedQuestions.some(
                            (item) =>
                              item.id ===
                              question.id,
                          )

                        return (

                          <div
                            key={question.id}
                            className="flex items-center gap-4 px-5 py-5 transition hover:bg-zinc-900/50"
                          >

                            <div className="min-w-0 flex-1">

                              <p className="text-sm font-medium text-zinc-200">
                                {question.title}
                              </p>


                              <div className="mt-3 flex flex-wrap gap-2">

                                <span
                                  className={`px-2 py-1 text-[9px] font-semibold ${getDifficultyClass(
                                    question.difficulty,
                                  )}`}
                                >
                                  {question.difficulty}
                                </span>


                                {question.topics
                                  ?.slice(0, 3)
                                  .map(
                                    (topic, index) => {

                                      const topicName =
                                        typeof topic ===
                                        'string'
                                          ? topic
                                          : topic?.name ||
                                            topic?.slug ||
                                            `Topic ${index + 1}`

                                      return (

                                        <span
                                          key={`${topicName}-${index}`}
                                          className="border border-zinc-800 bg-zinc-900 px-2 py-1 text-[9px] text-zinc-500"
                                        >
                                          {topicName}
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
                              className={`min-w-[80px] px-4 py-2 text-[10px] font-semibold transition ${
                                selected
                                  ? 'border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : 'border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                              }`}
                            >
                              {selected
                                ? 'Remove'
                                : 'Add'}
                            </button>

                          </div>

                        )
                      },
                    )}


                    {paginatedQuestions.length ===
                      0 && (

                      <div className="px-5 py-14 text-center">

                        <p className="text-xs text-zinc-500">
                          No questions found.
                        </p>

                      </div>

                    )}

                  </div>

                )}


              {/* PAGINATION */}

              {!loadingQuestions &&
                !questionError &&
                normalizedQuestions.length > 0 && (

                  <div className="flex items-center justify-between border-t border-zinc-800 bg-[#111111] px-5 py-4">

                    <p className="text-[10px] text-zinc-500">
                      Page {currentPage} of{' '}
                      {totalPages}
                    </p>


                    <div className="flex gap-2">

                      <button
                        type="button"
                        disabled={
                          currentPage === 1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (previous) =>
                              previous - 1,
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
                            (previous) =>
                              previous + 1,
                          )
                        }
                        className="border border-zinc-700 px-4 py-2 text-[10px] text-zinc-400 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>

                    </div>

                  </div>

                )}

            </section>


            {/* =================================================
                ERROR
            ================================================== */}

            {error && (

              <div className="border border-red-500/20 bg-red-500/10 px-5 py-4">

                <p className="text-xs font-medium text-red-400">
                  {error}
                </p>

              </div>

            )}

          </div>


          {/* ===================================================
              FOOTER
          ==================================================== */}

          <div className="sticky bottom-0 flex shrink-0 items-center justify-between border-t border-zinc-800 bg-[#111111] px-6 py-4">

            <div className="text-[10px] text-zinc-500">

              {selectedQuestions.length}{' '}
              question
              {selectedQuestions.length !== 1
                ? 's'
                : ''}{' '}
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
                  loadingCandidates
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

function SectionTitle({ children }) {
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