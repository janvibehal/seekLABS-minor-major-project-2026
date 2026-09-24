function ChatMessage({ message }) {
  const isAI = message.sender === 'ai'

  return (
    <div
      className={`flex gap-3 ${
        isAI ? 'justify-start' : 'justify-end'
      }`}
    >

      {/* AI Avatar */}

      {isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#6da7dc]/20 bg-[#142337]">

          <div className="h-2.5 w-2.5 rounded-full bg-[#78b9f2] shadow-[0_0_10px_rgba(120,185,242,0.65)]" />

        </div>
      )}


      {/* Message */}

      <div
        className={`max-w-[82%] ${
          isAI
            ? 'border border-white/[0.06] bg-[#121c2c] text-slate-300'
            : 'bg-[#285b8f] text-white'
        } px-4 py-3.5`}
      >

        {/* Sender */}

        <div className="mb-1.5 flex items-center gap-2">

          <span
            className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${
              isAI
                ? 'text-[#78b9f2]'
                : 'text-blue-200'
            }`}
          >
            {isAI ? 'Agent' : 'You'}
          </span>

        </div>


        {/* Message Text */}

        <p className="text-[13px] leading-6">
          {message.message}
        </p>


        {/* Timestamp */}

        <p
          className={`mt-2.5 text-[9px] ${
            isAI
              ? 'text-slate-600'
              : 'text-blue-200/60'
          }`}
        >
          {message.time}
        </p>

      </div>

    </div>
  )
}

export default ChatMessage