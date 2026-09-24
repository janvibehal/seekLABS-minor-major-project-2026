import { useState } from 'react'

function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!message.trim() || disabled) {
      return
    }

    onSend?.(message.trim())

    setMessage('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (message.trim() && !disabled) {
        event.currentTarget.form.requestSubmit()
      }
    }
  }

  return (
    <div className="shrink-0 border-t border-white/10 bg-[#0d1626] p-4">

      <form onSubmit={handleSubmit}>

        <div className="border border-white/10 bg-[#111c2d] transition focus-within:border-[#568dbb]/60 focus-within:bg-[#132033]">

          {/* Textarea */}

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Explain your approach..."
            rows={3}
            disabled={disabled}
            className="w-full resize-none bg-transparent px-4 py-3.5 text-[13px] leading-6 text-slate-200 outline-none placeholder:text-slate-600 disabled:opacity-50"
          />


          {/* Input Footer */}

          <div className="flex items-center justify-between border-t border-white/5 px-3 py-2.5">

            <div className="flex items-center gap-2">

              <div className="h-1.5 w-1.5 rounded-full bg-[#78b9f2]" />

              <span className="text-[9px] text-slate-600">
                {disabled ? 'Waiting for a response...' : 'Your response is being evaluated'}
              </span>

            </div>


            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="flex h-8 items-center gap-2 bg-[#78aeda] px-4 text-[10px] font-semibold text-[#08111d] transition hover:bg-[#8fc1e6] disabled:cursor-not-allowed disabled:opacity-30"
            >

              Send

              <SendIcon />

            </button>

          </div>

        </div>


        <div className="mt-2 flex justify-between px-1">

          <span className="text-[9px] text-slate-700">
            Enter to send
          </span>

          <span className="text-[9px] text-slate-700">
            Shift + Enter for new line
          </span>

        </div>

      </form>

    </div>
  )
}


function SendIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}


export default ChatInput
