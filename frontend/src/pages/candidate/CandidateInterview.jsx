import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import InterviewLayout from '../../components/candidate/interviews/InterviewLayout'
import * as candidateApi from '../../api/candidate.api.js'

const mapQuestion = (question) => ({
  ...question,
  status: candidateApi.toLowerStatus(question.status),
})

const mapMessage = (message) => ({
  id: message.id,
  sender: candidateApi.toChatSender(message.sender),
  message: message.message,
  questionId: message.questionId,
  time: new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }),
})

function CandidateInterview() {
  const { id: interviewId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [sessionId, setSessionId] = useState(null)
  const [title, setTitle] = useState('Interview')
  const [questions, setQuestions] = useState([])
  const [activeQuestionId, setActiveQuestionId] = useState(null)
  const [viewedQuestionId, setViewedQuestionId] = useState(null)
  const [messages, setMessages] = useState([])

  const [sending, setSending] = useState(false)
  const [ending, setEnding] = useState(false)
  const [autoSubmitting, setAutoSubmitting] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [submittingAssessment, setSubmittingAssessment] = useState(false)

  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [screenProtected, setScreenProtected] = useState(false)
  const [interactionWarning, setInteractionWarning] = useState(false)

  const [remainingSeconds, setRemainingSeconds] = useState(null)

  const startedAtRef = useRef(null)
  const durationSecondsRef = useRef(null)
  const autoSubmitStartedRef = useRef(false)

  // ------------------------------------------------------------
  // INITIALIZE INTERVIEW
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      setLoading(true)
      setError('')

      try {
        const interview = await candidateApi.getInterview(interviewId)

        if (cancelled) return

        setTitle(interview.title)

        const started = await candidateApi.startInterview(interviewId)

        if (cancelled) return

        const [sessionData, messageData] = await Promise.all([
          candidateApi.getSession(started.sessionId),
          candidateApi.getMessages(started.sessionId),
        ])

        if (cancelled) return

        const mappedQuestions = sessionData.questions.map(mapQuestion)

        setSessionId(started.sessionId)
        setQuestions(mappedQuestions)

        setActiveQuestionId(sessionData.session.currentQuestionId)
        setViewedQuestionId(sessionData.session.currentQuestionId)

        setMessages(messageData.map(mapMessage))

        const completed = sessionData.session.status === 'COMPLETED'
        const expired = sessionData.session.status === 'EXPIRED'

        setSessionEnded(completed || expired)

        startedAtRef.current = new Date(
          sessionData.session.startedAt,
        ).getTime()

        durationSecondsRef.current = sessionData.session.duration

        // If the backend tells us the session has already ended,
        // don't start a countdown.
        if (completed || expired) {
          setRemainingSeconds(0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Unable to load this interview.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (interviewId) {
      init()
    }

    return () => {
      cancelled = true
    }
  }, [interviewId])

  // ------------------------------------------------------------
  // COUNTDOWN TIMER
  // ------------------------------------------------------------
  useEffect(() => {
    if (
      !sessionId ||
      !startedAtRef.current ||
      !durationSecondsRef.current ||
      sessionEnded
    ) {
      return
    }

    const tick = () => {
      const elapsedSeconds = Math.max(
        0,
        Math.floor(
          (Date.now() - startedAtRef.current) / 1000,
        ),
      )

      const remaining = Math.max(
        0,
        durationSecondsRef.current - elapsedSeconds,
      )

      setRemainingSeconds(remaining)
    }

    tick()

    const intervalId = window.setInterval(tick, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [sessionId, sessionEnded])

  // ------------------------------------------------------------
  // INTERACTION PROTECTION
  // ------------------------------------------------------------
  // Prevent pasting during the interview.
  // Copying, cutting, text selection, and keyboard shortcuts remain allowed.
  //
  // This is browser-level protection only; it cannot prevent
  // every possible external capture or OS-level action.
  useEffect(() => {
    let warningTimeoutId = null

    const showInteractionWarning = () => {
      setInteractionWarning(true)
      setScreenProtected(true)

      if (warningTimeoutId) {
        window.clearTimeout(warningTimeoutId)
      }

      warningTimeoutId = window.setTimeout(() => {
        setInteractionWarning(false)
        setScreenProtected(false)
      }, 3000)
    }

    const handlePaste = (event) => {
      event.preventDefault()
      showInteractionWarning()
    }

    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('paste', handlePaste)

      if (warningTimeoutId) {
        window.clearTimeout(warningTimeoutId)
      }
    }
  }, [])

  const closeInteractionWarning = useCallback(() => {
    setInteractionWarning(false)
    setScreenProtected(false)
  }, [])

  // ------------------------------------------------------------
  // END INTERVIEW EVALUATION STATE
  // ------------------------------------------------------------
  // While an answer is being evaluated:
  //   - End Interview is disabled
  //   - its label becomes "Evaluating..."
  //   - hovering over it for 2 seconds shows a custom explanation bubble
  //
  // Everything is handled here so no other component needs to change.
  useEffect(() => {
    if (!sending || sessionEnded) return

    const cleanupItems = []
    let scanTimer = null

    const findEndInterviewButtons = () => {
      return Array.from(document.querySelectorAll('button')).filter((button) => {
        const text = String(button.textContent || '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase()

        return text === 'end interview' || text === 'evaluating...'
      })
    }

    const addEvaluationState = () => {
      const buttons = findEndInterviewButtons()

      buttons.forEach((button) => {
        if (button.dataset.evaluationLocked === 'true') return

        const originalHTML = button.innerHTML

        button.dataset.evaluationLocked = 'true'
        button.dataset.originalHTML = originalHTML

        // Keep the actual button disabled for the entire evaluation.
        button.disabled = true
        button.setAttribute('aria-disabled', 'true')

        // Only the visible button text changes to Evaluating...
        button.innerHTML = 'Evaluating...'

        let hoverTimer = null
        let bubble = null

        const removeBubble = () => {
          if (hoverTimer) {
            window.clearTimeout(hoverTimer)
            hoverTimer = null
          }

          if (bubble) {
            bubble.remove()
            bubble = null
          }
        }

        const showBubble = () => {
          if (bubble || !document.body.contains(button)) return

          const rect = button.getBoundingClientRect()

          bubble = document.createElement('div')
          bubble.setAttribute('role', 'tooltip')

          bubble.style.position = 'fixed'
          bubble.style.zIndex = '10000'
          bubble.style.boxSizing = 'border-box'

          // Responsive width. It can never be wider than the viewport.
          bubble.style.width = 'min(360px, calc(100vw - 32px))'
          bubble.style.maxWidth = 'calc(100vw - 32px)'

          bubble.style.padding = '11px 16px'
          bubble.style.borderRadius = '9999px'
          bubble.style.background = '#ffffff'
          bubble.style.color = '#475569'
          bubble.style.fontSize = '13px'
          bubble.style.fontWeight = '500'
          bubble.style.lineHeight = '1.4'
          bubble.style.textAlign = 'center'

          // Allow the long message to wrap instead of overflowing.
          bubble.style.whiteSpace = 'normal'
          bubble.style.overflowWrap = 'break-word'
          bubble.style.wordBreak = 'normal'

          bubble.style.border = '1px solid #e5e7eb'
          bubble.style.boxShadow =
            '0 4px 12px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(15, 23, 42, 0.08)'

          bubble.style.pointerEvents = 'none'

          // Blue-grey dot, matching the Evaluating indicator.
          const dot = document.createElement('span')
          dot.style.display = 'inline-block'
          dot.style.width = '9px'
          dot.style.height = '9px'
          dot.style.minWidth = '9px'
          dot.style.borderRadius = '50%'
          dot.style.background = '#8faecc'
          dot.style.marginRight = '9px'
          dot.style.verticalAlign = 'middle'

          // Requested explanation.
          const label = document.createElement('span')
          label.textContent =
            'You cannot end the interview while evaluation is happening'
          label.style.verticalAlign = 'middle'

          bubble.appendChild(dot)
          bubble.appendChild(label)

          // Add first so the real rendered width/height can be measured.
          document.body.appendChild(bubble)

          const bubbleRect = bubble.getBoundingClientRect()
          const viewportPadding = 16

          // Center it around the button, then clamp it horizontally.
          let left =
            rect.left +
            rect.width / 2 -
            bubbleRect.width / 2

          left = Math.max(
            viewportPadding,
            Math.min(
              left,
              window.innerWidth -
                bubbleRect.width -
                viewportPadding,
            ),
          )

          // Prefer above the button.
          let top =
            rect.top -
            bubbleRect.height -
            12

          // If there is not enough room above, put it below.
          if (top < viewportPadding) {
            top = rect.bottom + 12
          }

          // Final vertical clamp.
          top = Math.max(
            viewportPadding,
            Math.min(
              top,
              window.innerHeight -
                bubbleRect.height -
                viewportPadding,
            ),
          )

          bubble.style.left = `${left}px`
          bubble.style.top = `${top}px`
        }

        const handleMouseEnter = () => {
          if (hoverTimer) {
            window.clearTimeout(hoverTimer)
          }

          // Show only after hovering for more than 2 seconds.
          hoverTimer = window.setTimeout(showBubble, 2000)
        }

        const handleMouseLeave = () => {
          removeBubble()
        }

        button.addEventListener('mouseenter', handleMouseEnter)
        button.addEventListener('mouseleave', handleMouseLeave)

        cleanupItems.push(() => {
          removeBubble()

          button.removeEventListener('mouseenter', handleMouseEnter)
          button.removeEventListener('mouseleave', handleMouseLeave)

          if (document.body.contains(button)) {
            // Restore the original button exactly as it was.
            button.disabled = false
            button.removeAttribute('aria-disabled')
            button.innerHTML = button.dataset.originalHTML

            delete button.dataset.evaluationLocked
            delete button.dataset.originalHTML
          }
        })
      })
    }

    addEvaluationState()

    // InterviewLayout can render/update the top bar after evaluation starts,
    // so detect the button if it appears or changes during that time.
    const observer = new MutationObserver(() => {
      addEvaluationState()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    scanTimer = window.setTimeout(() => {
      addEvaluationState()
    }, 100)

    return () => {
      observer.disconnect()

      if (scanTimer) {
        window.clearTimeout(scanTimer)
      }

      cleanupItems.forEach((cleanup) => cleanup())
    }
  }, [sending, sessionEnded])

  // ------------------------------------------------------------
  // SEND CANDIDATE MESSAGE
  // ------------------------------------------------------------
  const handleSendMessage = useCallback(
    async (text) => {
      if (
        !sessionId ||
        !activeQuestionId ||
        sending ||
        ending ||
        sessionEnded
      ) {
        return
      }

      setSending(true)
      setError('')

      const optimisticId = `optimistic-${Date.now()}`

      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          sender: 'candidate',
          message: text,
          questionId: activeQuestionId,
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ])

      try {
        const result = await candidateApi.sendMessage(sessionId, {
          questionId: activeQuestionId,
          message: text,
        })

        // The backend can tell us that the session expired while
        // this answer was being submitted.
        if (result?.sessionEnded) {
          setMessages((prev) =>
            prev.filter(
              (message) => message.id !== optimisticId,
            ),
          )

          setSessionEnded(true)
          setSending(false)

          if (result?.expired) {
            setSubmittingAssessment(false)
            navigate('/candidate/interviews')
          } else {
            setSubmittingAssessment(true)
            navigate(`/candidate/results/${interviewId}`)
          }

          return
        }

        setMessages((prev) => [
          ...prev.filter(
            (message) => message.id !== optimisticId,
          ),
          mapMessage(result.candidateMessage),
          mapMessage(result.aiMessage),
        ])

        if (
          result.currentQuestionId &&
          result.currentQuestionId !== activeQuestionId
        ) {
          setActiveQuestionId(result.currentQuestionId)
          setViewedQuestionId(result.currentQuestionId)

          const sessionData =
            await candidateApi.getSession(sessionId)

          setQuestions(
            sessionData.questions.map(mapQuestion),
          )
        } else if (!result.currentQuestionId) {
          const sessionData =
            await candidateApi.getSession(sessionId)

          setQuestions(
            sessionData.questions.map(mapQuestion),
          )
        }
      } catch (err) {
        setMessages((prev) =>
          prev.filter(
            (message) => message.id !== optimisticId,
          ),
        )

        setError(
          err?.message ||
            'Unable to send your message. Please try again.',
        )
      } finally {
        setSending(false)
      }
    },
    [
      sessionId,
      activeQuestionId,
      sending,
      ending,
      sessionEnded,
      interviewId,
      navigate,
    ],
  )

  // ------------------------------------------------------------
  // END INTERVIEW
  // ------------------------------------------------------------
  const handleEndInterview = useCallback(
    async (automatic = false, confirmed = false) => {
      if (
        !sessionId ||
        ending ||
        sending ||
        sessionEnded
      ) {
        return
      }

      // Manual submission MUST show confirmation first.
      // Automatic timer submission bypasses this block.
      if (!automatic && !confirmed) {
        setShowExitConfirmation(true)
        return
      }

      if (automatic) {
        autoSubmitStartedRef.current = true
        setAutoSubmitting(true)
      }

      setEnding(true)
      setSubmittingAssessment(true)
      setError('')

      try {
        const result = await candidateApi.endInterview(sessionId)

        setSessionEnded(true)

        if (result?.expired) {
          setSubmittingAssessment(false)
          navigate('/candidate/interviews')
          return
        }

        navigate(`/candidate/results/${interviewId}`)
      } catch (err) {
        if (automatic) {
          autoSubmitStartedRef.current = false
          setAutoSubmitting(false)
        }

        setSubmittingAssessment(false)

        setError(
          err?.message ||
            'Unable to end the interview. Please try again.',
        )
      } finally {
        setEnding(false)
      }
    },
    [
      sessionId,
      ending,
      sending,
      sessionEnded,
      interviewId,
      navigate,
    ],
  )

  // ------------------------------------------------------------
  // CONFIRM MANUAL EXIT
  // ------------------------------------------------------------
  const confirmEndInterview = useCallback(() => {
    setShowExitConfirmation(false)

    handleEndInterview(false, true)
  }, [handleEndInterview])

  // ------------------------------------------------------------
  // AUTOMATIC SUBMISSION WHEN TIMER REACHES ZERO
  // ------------------------------------------------------------
  useEffect(() => {
    if (
      remainingSeconds !== 0 ||
      sessionEnded ||
      autoSubmitStartedRef.current
    ) {
      return
    }

    // If an answer is currently being submitted, wait for it
    // to finish.
    if (sending) {
      return
    }

    handleEndInterview(true)
  }, [
    remainingSeconds,
    sessionEnded,
    sending,
    handleEndInterview,
  ])

  // ------------------------------------------------------------
  // SUBMISSION STATE
  // ------------------------------------------------------------
  if (submittingAssessment) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f8fc] px-6">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-semibold text-green-700">
            ✓
          </div>

          <h1 className="text-3xl font-semibold text-gray-900">
            Thank You for the Attempt
          </h1>

          <p className="mt-4 text-lg text-gray-700">
            Your assessment is being submitted.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Please do not close or refresh this page.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold text-gray-700">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#285b8f]" />
            Submitting assessment...
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f8fc]">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#285b8f]/30 border-t-[#285b8f]" />
      </div>
    )
  }

  // ------------------------------------------------------------
  // FATAL ERROR STATE
  // ------------------------------------------------------------
  if (error && !sessionId) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#f4f8fc] px-6 text-center">
        <p className="max-w-md text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate('/candidate/interviews')
          }
          className="bg-[#285b8f] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Interviews
        </button>
      </div>
    )
  }

  // ------------------------------------------------------------
  // TIMER LABEL
  // ------------------------------------------------------------
  const timeLabel =
    remainingSeconds === null
      ? null
      : `${String(
          Math.floor(remainingSeconds / 60),
        ).padStart(2, '0')}:${String(
          remainingSeconds % 60,
        ).padStart(2, '0')}`

  // ------------------------------------------------------------
  // INTERVIEW UI
  // ------------------------------------------------------------
  return (
    <>
      {error && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 shadow-sm">
          {error}
        </div>
      )}

      {/* Evaluating indicator */}
      {sending && (
        <div
          className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-md"
          aria-live="polite"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#285b8f]" />

          <span>Evaluating</span>

          <span
            className="flex gap-0.5"
            aria-hidden="true"
          >
            <span className="animate-bounce [animation-delay:-0.3s]">
              .
            </span>

            <span className="animate-bounce [animation-delay:-0.15s]">
              .
            </span>

            <span className="animate-bounce">
              .
            </span>
          </span>
        </div>
      )}

      <InterviewLayout
        title={title}
        questions={questions}
        activeQuestionId={activeQuestionId}
        viewedQuestionId={viewedQuestionId}
        onQuestionSelect={setViewedQuestionId}
        messages={messages}
        onSendMessage={handleSendMessage}
        sending={sending}
        sessionEnded={sessionEnded}
        timeLabel={timeLabel}
        onEndInterview={() => {
          if (sending || ending || sessionEnded) return
          handleEndInterview(false)
        }}
        // Treat evaluation as a temporary "ending" state for the
        // interview controls. This keeps End Interview disabled while
        // the current answer is being evaluated without changing the
        // actual ending state used by the submission flow.
        ending={ending}
        autoSubmitting={autoSubmitting}
        endInterviewDisabled={sending || ending || sessionEnded}
      />

      {/* --------------------------------------------------------
          EXIT CONFIRMATION MODAL
      -------------------------------------------------------- */}
      {showExitConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-confirmation-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2
              id="exit-confirmation-title"
              className="text-xl font-semibold text-gray-900"
            >
              Are you sure you want to exit?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Your interview will be submitted immediately
              and you will not be able to continue.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              {/* CLOSE = stay in interview */}
              <button
                type="button"
                onClick={() =>
                  setShowExitConfirmation(false)
                }
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>

              {/* YES = submit interview */}
              <button
                type="button"
                onClick={confirmEndInterview}
                className="rounded-lg bg-[#285b8f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#214d7a]"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          SCREEN PROTECTION
      -------------------------------------------------------- */}
      {screenProtected &&
        !submittingAssessment &&
        !sessionEnded && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 px-6 backdrop-blur-md"
            role="alert"
            aria-live="assertive"
          >
            {interactionWarning && (
              <div className="w-full max-w-md rounded-2xl border border-white/20 bg-black/80 px-6 py-5 text-center text-white shadow-2xl backdrop-blur-xl">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/20 text-xl text-red-300">
                  !
                </div>

                <h2 className="text-lg font-semibold">
                  Action Not Allowed
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/80">
                  Pasting is not allowed during the interview.
                </p>

                <button
                  type="button"
                  onClick={closeInteractionWarning}
                  className="mt-5 rounded-lg border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
    </>
  )
}

export default CandidateInterview