import { useMemo, useState } from 'react'

function CreateJobModal({ onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    type: 'Full Time',
    description: '',
    skills: '',
    difficulty: 'Medium',

    // Hiring scope
    postingType: 'General',
    college: 'All Colleges',
  })

  const [selectedQuestions, setSelectedQuestions] = useState([
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      topic: 'Arrays',
      recommendedTime: 15,
      allocatedTime: 15,
    },
  ])

  const [questionSearch, setQuestionSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')

  /*
   * ============================================================
   * TEMPORARY QUESTION BANK
   * ============================================================
   *
   * Later this will come from the backend.
   *
   * GET /api/questions
   *
   */

  const questionBank = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      topic: 'Arrays',
      type: 'Coding',
      recommendedTime: 15,
      description:
        'Find two numbers in an array that add up to a target value.',
    },
    {
      id: 2,
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      topic: 'Stacks',
      type: 'Coding',
      recommendedTime: 15,
      description:
        'Determine whether a string containing brackets is valid.',
    },
    {
      id: 3,
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      topic: 'Strings',
      type: 'Coding',
      recommendedTime: 25,
      description:
        'Find the length of the longest substring without duplicate characters.',
    },
    {
      id: 4,
      title: 'Merge Intervals',
      difficulty: 'Medium',
      topic: 'Arrays',
      type: 'Coding',
      recommendedTime: 25,
      description:
        'Merge overlapping intervals and return the resulting ranges.',
    },
    {
      id: 5,
      title: 'LRU Cache',
      difficulty: 'Hard',
      topic: 'Design',
      type: 'Coding',
      recommendedTime: 35,
      description:
        'Design a cache that supports get and put operations in constant time.',
    },
    {
      id: 6,
      title: 'Binary Tree Level Order Traversal',
      difficulty: 'Medium',
      topic: 'Trees',
      type: 'Coding',
      recommendedTime: 20,
      description:
        'Return the level-order traversal of a binary tree.',
    },
    {
      id: 7,
      title: 'Number of Islands',
      difficulty: 'Medium',
      topic: 'Graphs',
      type: 'Coding',
      recommendedTime: 25,
      description:
        'Count the number of islands in a grid of land and water.',
    },
    {
      id: 8,
      title: 'Design URL Shortener',
      difficulty: 'Hard',
      topic: 'System Design',
      type: 'System Design',
      recommendedTime: 40,
      description:
        'Design a scalable URL shortening service.',
    },
    {
      id: 9,
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      topic: 'Linked Lists',
      type: 'Coding',
      recommendedTime: 15,
      description:
        'Reverse a singly linked list and return the new head.',
    },
    {
      id: 10,
      title: 'Kth Largest Element',
      difficulty: 'Medium',
      topic: 'Heaps',
      type: 'Coding',
      recommendedTime: 20,
      description:
        'Find the kth largest element in an unsorted array.',
    },
    {
      id: 11,
      title: 'Detect Cycle in Linked List',
      difficulty: 'Easy',
      topic: 'Linked Lists',
      type: 'Coding',
      recommendedTime: 15,
      description:
        'Determine whether a linked list contains a cycle.',
    },
    {
      id: 12,
      title: 'Course Schedule',
      difficulty: 'Medium',
      topic: 'Graphs',
      type: 'Coding',
      recommendedTime: 25,
      description:
        'Determine whether all courses can be completed given prerequisites.',
    },
  ]

  /*
   * ============================================================
   * FILTER QUESTIONS
   * ============================================================
   */

  const filteredQuestions = useMemo(() => {
    return questionBank.filter((question) => {
      const matchesSearch =
        question.title
          .toLowerCase()
          .includes(questionSearch.toLowerCase())

      const matchesDifficulty =
        difficultyFilter === 'All' ||
        question.difficulty === difficultyFilter

      const matchesTopic =
        topicFilter === 'All' ||
        question.topic === topicFilter

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesTopic
      )
    })
  }, [
    questionSearch,
    difficultyFilter,
    topicFilter,
  ])

  /*
   * ============================================================
   * TOTAL INTERVIEW TIME
   * ============================================================
   */

  const totalTime = selectedQuestions.reduce(
    (total, question) =>
      total + question.allocatedTime,
    0
  )

  const recommendedTotalTime =
    selectedQuestions.reduce(
      (total, question) =>
        total + question.recommendedTime,
      0
    )

  /*
   * ============================================================
   * FORM CHANGE
   * ============================================================
   */

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  /*
   * ============================================================
   * ADD QUESTION
   * ============================================================
   */

  const addQuestion = (question) => {
    const alreadyAdded = selectedQuestions.some(
      (item) => item.id === question.id
    )

    if (alreadyAdded) {
      return
    }

    setSelectedQuestions((previous) => [
      ...previous,
      {
        ...question,
        allocatedTime:
          question.recommendedTime,
      },
    ])
  }

  /*
   * ============================================================
   * REMOVE QUESTION
   * ============================================================
   */

  const removeQuestion = (questionId) => {
    setSelectedQuestions((previous) =>
      previous.filter(
        (question) =>
          question.id !== questionId
      )
    )
  }

  /*
   * ============================================================
   * CHANGE QUESTION TIME
   * ============================================================
   */

  const changeQuestionTime = (
    questionId,
    value
  ) => {
    const time = Math.max(
      1,
      Number(value) || 1
    )

    setSelectedQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? {
              ...question,
              allocatedTime: time,
            }
          : question
      )
    )
  }

  /*
   * ============================================================
   * MOVE QUESTION
   * ============================================================
   */

  const moveQuestion = (
    index,
    direction
  ) => {
    const newIndex = index + direction

    if (
      newIndex < 0 ||
      newIndex >= selectedQuestions.length
    ) {
      return
    }

    const updated = [
      ...selectedQuestions,
    ]

    const temp = updated[index]

    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    setSelectedQuestions(updated)
  }

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmit = (event) => {
    event.preventDefault()

    const interviewConfiguration = {
      ...formData,

      totalDuration: totalTime,

      recommendedDuration:
        recommendedTotalTime,

      questions:
        selectedQuestions.map(
          (question, index) => ({
            order: index + 1,
            questionId: question.id,
            allocatedTime:
              question.allocatedTime,
            recommendedTime:
              question.recommendedTime,
          })
        ),
    }

    console.log(
      'Create job:',
      interviewConfiguration
    )

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/50 p-4">

      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col bg-white shadow-2xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#3972a7]">
              New Position
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#17324f]">
              Create Interview Job
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Configure the position, hiring scope,
              and interview.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          >
            <CloseIcon />
          </button>

        </div>


        {/* =====================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="min-h-0 overflow-y-auto"
        >

          <div className="space-y-7 p-6">

            {/* =================================================
                JOB INFORMATION
            ================================================== */}

            <section>

              <div>

                <h3 className="text-xs font-bold text-[#17324f]">
                  Job Information
                </h3>

                <p className="mt-1 text-[10px] text-slate-400">
                  Define the position candidates are
                  applying for.
                </p>

              </div>


              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <Field
                  label="Job Title"
                  name="title"
                  placeholder="e.g. Backend Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="Department"
                  name="department"
                  placeholder="e.g. Engineering"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />

                <SelectField
                  label="Employment Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={[
                    'Full Time',
                    'Part Time',
                    'Internship',
                    'Contract',
                  ]}
                />

                <Field
                  label="Required Skills"
                  name="skills"
                  placeholder="Python, SQL, APIs..."
                  value={formData.skills}
                  onChange={handleChange}
                />

              </div>


              <div className="mt-4">

                <label className="text-[10px] font-semibold text-slate-500">
                  Job Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the role and responsibilities..."
                  className="mt-2 w-full resize-none border border-slate-200 px-3 py-2.5 text-xs text-slate-600 outline-none placeholder:text-slate-400 focus:border-[#8eb9df]"
                />

              </div>

            </section>


            {/* =================================================
                HIRING SCOPE
            ================================================== */}

            <section className="border-t border-slate-100 pt-6">

              <div>

                <h3 className="text-xs font-bold text-[#17324f]">
                  Hiring Scope
                </h3>

                <p className="mt-1 text-[10px] text-slate-400">
                  Choose whether this is a general posting
                  or targeted recruitment.
                </p>

              </div>


              <div className="mt-4 grid gap-4 md:grid-cols-2">

                {/* Posting Type */}

                <div>

                  <label className="text-[10px] font-semibold text-slate-500">
                    Posting Type
                  </label>

                  <select
                    name="postingType"
                    value={
                      formData.postingType
                    }
                    onChange={handleChange}
                    className="mt-2 w-full border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-[#8eb9df]"
                  >

                    <option value="General">
                      General Job Posting
                    </option>

                    <option value="On-Campus">
                      On-Campus
                    </option>

                    <option value="Off-Campus">
                      Off-Campus
                    </option>

                  </select>

                  <p className="mt-2 text-[9px] leading-4 text-slate-400">
                    Choose how candidates will be
                    recruited for this position.
                  </p>

                </div>


                {/* College */}

                <div>

                  <label className="text-[10px] font-semibold text-slate-500">
                    College
                  </label>

                  <select
                    name="college"
                    value={
                      formData.college
                    }
                    onChange={handleChange}
                    className="mt-2 w-full border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-[#8eb9df]"
                  >

                    <option value="All Colleges">
                      All Colleges
                    </option>

                    <option value="IIT Delhi">
                      IIT Delhi
                    </option>

                    <option value="IIT Bombay">
                      IIT Bombay
                    </option>

                    <option value="IIT Madras">
                      IIT Madras
                    </option>

                    <option value="NIT Trichy">
                      NIT Trichy
                    </option>

                    <option value="BITS Pilani">
                      BITS Pilani
                    </option>

                    <option value="VIT">
                      VIT
                    </option>

                    <option value="SRM University">
                      SRM University
                    </option>

                  </select>

                  <p className="mt-2 text-[9px] leading-4 text-slate-400">
                    Select a specific college for
                    targeted recruitment.
                  </p>

                </div>

              </div>


              {/* Scope Summary */}

              <div className="mt-4 flex items-center gap-3 border border-[#d7e7f5] bg-[#f5f9fd] px-4 py-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#e3f0fa] text-[#3972a7]">
                  <ScopeIcon />
                </div>

                <div>

                  <p className="text-[10px] font-semibold text-[#285b8f]">
                    {getScopeTitle(
                      formData.postingType,
                      formData.college
                    )}
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    {getScopeDescription(
                      formData.postingType,
                      formData.college
                    )}
                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                INTERVIEW CONFIGURATION
            ================================================== */}

            <section className="border-t border-slate-100 pt-6">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>

                  <h3 className="text-xs font-bold text-[#17324f]">
                    Interview Configuration
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Select questions and configure
                    the time allocated to each.
                  </p>

                </div>


                {/* TOTAL TIME */}

                <div className="flex items-center gap-5 border border-[#cfe2f4] bg-[#f4f9fe] px-5 py-3">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      Total Interview Time
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#17324f]">
                      {formatDuration(
                        totalTime
                      )}
                    </p>

                  </div>


                  <div className="h-8 w-px bg-[#d5e5f3]" />


                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      Recommended
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#3972a7]">
                      {formatDuration(
                        recommendedTotalTime
                      )}
                    </p>

                  </div>

                </div>

              </div>


              {/* Question Builder */}

              <div className="mt-5 grid min-h-[420px] grid-cols-1 gap-5 lg:grid-cols-[1fr_1.15fr]">

                {/* =================================================
                    QUESTION BANK
                ================================================== */}

                <div className="flex min-h-0 flex-col border border-slate-200">

                  <div className="shrink-0 border-b border-slate-200 p-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs font-bold text-[#17324f]">
                          Question Bank
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Select questions for this interview.
                        </p>

                      </div>

                      <span className="text-[10px] font-medium text-slate-400">
                        {filteredQuestions.length}{' '}
                        available
                      </span>

                    </div>


                    {/* Search */}

                    <div className="mt-4 flex items-center border border-slate-200 bg-slate-50 px-3">

                      <SearchIcon />

                      <input
                        type="text"
                        value={
                          questionSearch
                        }
                        onChange={(
                          event
                        ) =>
                          setQuestionSearch(
                            event.target.value
                          )
                        }
                        placeholder="Search questions..."
                        className="ml-2 w-full bg-transparent py-2.5 text-xs text-slate-600 outline-none placeholder:text-slate-400"
                      />

                    </div>


                    {/* Filters */}

                    <div className="mt-3 flex gap-2">

                      <select
                        value={
                          difficultyFilter
                        }
                        onChange={(
                          event
                        ) =>
                          setDifficultyFilter(
                            event.target.value
                          )
                        }
                        className="flex-1 border border-slate-200 bg-white px-2 py-2 text-[10px] text-slate-500 outline-none"
                      >

                        <option>
                          All
                        </option>

                        <option>
                          Easy
                        </option>

                        <option>
                          Medium
                        </option>

                        <option>
                          Hard
                        </option>

                      </select>


                      <select
                        value={
                          topicFilter
                        }
                        onChange={(
                          event
                        ) =>
                          setTopicFilter(
                            event.target.value
                          )
                        }
                        className="flex-1 border border-slate-200 bg-white px-2 py-2 text-[10px] text-slate-500 outline-none"
                      >

                        <option>
                          All
                        </option>

                        <option>
                          Arrays
                        </option>

                        <option>
                          Strings
                        </option>

                        <option>
                          Linked Lists
                        </option>

                        <option>
                          Trees
                        </option>

                        <option>
                          Graphs
                        </option>

                        <option>
                          Heaps
                        </option>

                        <option>
                          Stacks
                        </option>

                        <option>
                          Design
                        </option>

                        <option>
                          System Design
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* Questions */}

                  <div className="min-h-0 flex-1 overflow-y-auto">

                    {filteredQuestions.map(
                      (question) => {

                        const isSelected =
                          selectedQuestions.some(
                            (item) =>
                              item.id ===
                              question.id
                          )

                        return (
                          <QuestionBankItem
                            key={
                              question.id
                            }
                            question={
                              question
                            }
                            isSelected={
                              isSelected
                            }
                            onAdd={() =>
                              addQuestion(
                                question
                              )
                            }
                          />
                        )
                      }
                    )}

                    {filteredQuestions.length ===
                      0 && (
                      <div className="flex min-h-[250px] items-center justify-center px-6 text-center">

                        <p className="text-xs text-slate-400">
                          No questions match
                          your filters.
                        </p>

                      </div>
                    )}

                  </div>

                </div>


                {/* =================================================
                    SELECTED QUESTIONS
                ================================================== */}

                <div className="flex min-h-0 flex-col border border-slate-200">

                  <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4">

                    <div>

                      <p className="text-xs font-bold text-[#17324f]">
                        Interview Questions
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">

                        {selectedQuestions.length}{' '}
                        question
                        {selectedQuestions.length !==
                        1
                          ? 's'
                          : ''}{' '}
                        selected

                      </p>

                    </div>


                    <span className="bg-[#edf5fc] px-2.5 py-1 text-[9px] font-semibold text-[#3972a7]">
                      {formatDuration(
                        totalTime
                      )}
                    </span>

                  </div>


                  <div className="min-h-0 flex-1 overflow-y-auto">

                    {selectedQuestions.length ===
                    0 ? (
                      <EmptyQuestions />
                    ) : (
                      <div className="divide-y divide-slate-100">

                        {selectedQuestions.map(
                          (
                            question,
                            index
                          ) => (
                            <SelectedQuestion
                              key={
                                question.id
                              }
                              question={
                                question
                              }
                              index={index}
                              totalQuestions={
                                selectedQuestions.length
                              }
                              onRemove={() =>
                                removeQuestion(
                                  question.id
                                )
                              }
                              onTimeChange={(
                                value
                              ) =>
                                changeQuestionTime(
                                  question.id,
                                  value
                                )
                              }
                              onMove={(
                                direction
                              ) =>
                                moveQuestion(
                                  index,
                                  direction
                                )
                              }
                            />
                          )
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </section>

          </div>


          {/* =====================================================
              FOOTER
          ====================================================== */}

          <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">

            <div>

              {selectedQuestions.length >
                0 && (
                <p className="text-[10px] text-slate-400">

                  {selectedQuestions.length}{' '}
                  questions ·{' '}

                  {formatDuration(
                    totalTime
                  )}{' '}
                  total

                  {totalTime !==
                    recommendedTotalTime && (
                    <>
                      {' · '}
                      Recommended{' '}
                      {formatDuration(
                        recommendedTotalTime
                      )}
                    </>
                  )}

                </p>
              )}

            </div>


            <div className="flex gap-3">

              <button
                type="button"
                onClick={onClose}
                className="border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  selectedQuestions.length ===
                  0
                }
                className="bg-[#285b8f] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#214d79] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Job
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  )
}


/* ============================================================
   QUESTION BANK ITEM
============================================================ */

function QuestionBankItem({
  question,
  isSelected,
  onAdd,
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <p className="text-xs font-semibold text-slate-700">
              {question.title}
            </p>

            <DifficultyBadge
              difficulty={
                question.difficulty
              }
            />

          </div>


          <p className="mt-2 text-[10px] leading-5 text-slate-400">
            {question.description}
          </p>


          <div className="mt-3 flex flex-wrap items-center gap-4">

            <span className="text-[9px] text-slate-400">
              {question.topic}
            </span>

            <span className="text-[9px] text-slate-400">
              {question.type}
            </span>

            <span className="text-[9px] font-medium text-[#3972a7]">
              ~{question.recommendedTime}{' '}
              min recommended
            </span>

          </div>

        </div>


        <button
          type="button"
          onClick={onAdd}
          disabled={isSelected}
          className={`shrink-0 px-3 py-2 text-[9px] font-semibold transition ${
            isSelected
              ? 'cursor-not-allowed bg-slate-100 text-slate-400'
              : 'bg-[#edf5fc] text-[#3972a7] hover:bg-[#dcecf9]'
          }`}
        >
          {isSelected
            ? 'Added'
            : 'Add'}
        </button>

      </div>

    </div>
  )
}


/* ============================================================
   SELECTED QUESTION
============================================================ */

function SelectedQuestion({
  question,
  index,
  totalQuestions,
  onRemove,
  onTimeChange,
  onMove,
}) {
  const difference =
    question.allocatedTime -
    question.recommendedTime

  const isTooShort =
    difference <= -5

  const isTooLong =
    difference >= 10

  return (
    <div className="px-4 py-4">

      <div className="flex items-start gap-3">

        {/* Question Number */}

        <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#173b63] text-[10px] font-bold text-white">
          {index + 1}
        </div>


        <div className="min-w-0 flex-1">

          {/* Title */}

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className="text-xs font-semibold text-slate-700">
                {question.title}
              </p>

              <div className="mt-1 flex items-center gap-2">

                <DifficultyBadge
                  difficulty={
                    question.difficulty
                  }
                />

                <span className="text-[9px] text-slate-400">
                  {question.topic}
                </span>

              </div>

            </div>


            <button
              type="button"
              onClick={onRemove}
              className="text-[9px] font-medium text-slate-400 transition hover:text-red-500"
            >
              Remove
            </button>

          </div>


          {/* Time */}

          <div className="mt-4 flex items-end gap-3">

            <div className="w-28">

              <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Time
              </label>

              <div className="mt-1 flex items-center border border-slate-200">

                <input
                  type="number"
                  min="1"
                  value={
                    question.allocatedTime
                  }
                  onChange={(
                    event
                  ) =>
                    onTimeChange(
                      event.target.value
                    )
                  }
                  className="w-full px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none"
                />

                <span className="pr-2 text-[9px] text-slate-400">
                  min
                </span>

              </div>

            </div>


            <div className="pb-2">

              <p className="text-[9px] text-slate-400">
                Recommended
              </p>

              <p className="mt-0.5 text-[10px] font-semibold text-[#3972a7]">
                {question.recommendedTime}{' '}
                min
              </p>

            </div>

          </div>


          {/* Too Short */}

          {isTooShort && (
            <div className="mt-3 border border-[#f0d8a8] bg-[#fffaf0] px-3 py-2">

              <p className="text-[9px] text-[#9a6a20]">
                This may be too short for
                this question. Recommended
                time is{' '}

                <strong>
                  {question.recommendedTime}{' '}
                  minutes
                </strong>
                .
              </p>

            </div>
          )}


          {/* Too Long */}

          {isTooLong && (
            <div className="mt-3 border border-slate-200 bg-slate-50 px-3 py-2">

              <p className="text-[9px] text-slate-500">
                You have allocated more time
                than normally required for
                this question.
              </p>

            </div>
          )}


          {/* Reorder */}

          <div className="mt-3 flex items-center gap-2">

            <span className="mr-1 text-[9px] text-slate-400">
              Order
            </span>

            <button
              type="button"
              disabled={index === 0}
              onClick={() =>
                onMove(-1)
              }
              className="flex h-6 w-6 items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↑
            </button>

            <button
              type="button"
              disabled={
                index ===
                totalQuestions - 1
              }
              onClick={() =>
                onMove(1)
              }
              className="flex h-6 w-6 items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↓
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}


/* ============================================================
   EMPTY QUESTIONS
============================================================ */

function EmptyQuestions() {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-8 text-center">

      <div className="flex h-12 w-12 items-center justify-center bg-[#edf5fc] text-[#3972a7]">
        <QuestionIcon />
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-600">
        No questions selected
      </p>

      <p className="mt-2 max-w-xs text-[10px] leading-5 text-slate-400">
        Select questions from the
        question bank to build your
        interview.
      </p>

    </div>
  )
}


/* ============================================================
   DIFFICULTY BADGE
============================================================ */

function DifficultyBadge({
  difficulty,
}) {
  const classes =
    difficulty === 'Easy'
      ? 'bg-[#edf7f1] text-[#3d8a60]'
      : difficulty === 'Medium'
        ? 'bg-[#fff7e8] text-[#a06b19]'
        : 'bg-[#fceeee] text-[#a44d4d]'

  return (
    <span
      className={`px-1.5 py-0.5 text-[8px] font-semibold ${classes}`}
    >
      {difficulty}
    </span>
  )
}


/* ============================================================
   INPUT FIELD
============================================================ */

function Field({
  label,
  name,
  placeholder,
  value,
  onChange,
  required = false,
}) {
  return (
    <div>

      <label className="text-[10px] font-semibold text-slate-500">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full border border-slate-200 px-3 py-2.5 text-xs text-slate-600 outline-none placeholder:text-slate-400 focus:border-[#8eb9df]"
      />

    </div>
  )
}


/* ============================================================
   SELECT FIELD
============================================================ */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="text-[10px] font-semibold text-slate-500">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-[#8eb9df]"
      >

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}

      </select>

    </div>
  )
}


/* ============================================================
   FORMAT DURATION
============================================================ */

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(
    minutes / 60
  )

  const remaining =
    minutes % 60

  if (remaining === 0) {
    return `${hours} hr`
  }

  return `${hours} hr ${remaining} min`
}


/* ============================================================
   HIRING SCOPE
============================================================ */

function getScopeTitle(
  postingType,
  college
) {
  if (
    postingType ===
      'On-Campus' &&
    college !== 'All Colleges'
  ) {
    return `${college} · On-Campus`
  }

  if (
    postingType ===
      'Off-Campus' &&
    college !== 'All Colleges'
  ) {
    return `${college} · Off-Campus`
  }

  if (
    postingType ===
    'On-Campus'
  ) {
    return 'On-Campus · All Colleges'
  }

  if (
    postingType ===
    'Off-Campus'
  ) {
    return 'Off-Campus · All Colleges'
  }

  return 'General Job Posting'
}


function getScopeDescription(
  postingType,
  college
) {
  if (
    postingType ===
      'On-Campus' &&
    college !== 'All Colleges'
  ) {
    return `This position is targeted specifically at candidates from ${college}.`
  }

  if (
    postingType ===
      'Off-Campus' &&
    college !== 'All Colleges'
  ) {
    return `This position is available off-campus for candidates associated with ${college}.`
  }

  if (
    postingType ===
    'On-Campus'
  ) {
    return 'This position is intended for campus recruitment.'
  }

  if (
    postingType ===
    'Off-Campus'
  ) {
    return 'This position is available through off-campus recruitment.'
  }

  return 'This position is available as a general job posting.'
}


/* ============================================================
   ICONS
============================================================ */

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />

    </svg>
  )
}


function QuestionIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 5a3 3 0 0 1 3-3h13v18H7a3 3 0 0 0-3 3V5Z" />

      <path d="M7 20h13" />

      <path d="M8 7h8M8 11h8M8 15h5" />

    </svg>
  )
}


function ScopeIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 21h18" />

      <path d="M5 21V7l7-4 7 4v14" />

      <path d="M9 21v-5h6v5" />

      <path d="M8 9h1M15 9h1M8 12h1M15 12h1" />

    </svg>
  )
}


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


export default CreateJobModal