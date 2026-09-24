import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'

function ChatMessages({ messages = [] }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#0b1220] px-5 py-6">

      <div className="mx-auto max-w-2xl">

        {/* Conversation label */}

        <div className="mb-6 flex items-center gap-3">

          <div className="h-px flex-1 bg-white/5" />

          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-600">
            Interview Conversation
          </span>

          <div className="h-px flex-1 bg-white/5" />

        </div>


        <div className="space-y-6">

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))}

          <div ref={bottomRef} />

        </div>

      </div>

    </div>
  )
}

export default ChatMessages
