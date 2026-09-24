function ChatHeader({ isActive = true }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d1626] px-5">

      {/* AI Identity */}

      <div className="flex items-center gap-3">

        <div className="relative flex h-10 w-10 items-center justify-center border border-[#6da7dc]/30 bg-[#16263b]">

          <div className="h-3 w-3 rounded-full bg-[#78b9f2] shadow-[0_0_12px_rgba(120,185,242,0.8)]" />

        </div>

        <div>

          <div className="flex items-center gap-2">

            <p className="text-sm font-semibold tracking-tight text-white">
              Agent
            </p>

            {isActive && (
              <span className="border border-[#4ade80]/20 bg-[#4ade80]/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#7ee2a0]">
                Live
              </span>
            )}

          </div>

          <p className="mt-0.5 text-[10px] text-slate-500">
            Adaptive interview mode
          </p>

        </div>

      </div>


      {/* Right Controls */}

      <div className="flex items-center gap-4">

        <div className="hidden text-right sm:block">

          <p className="text-[9px] uppercase tracking-[0.15em] text-slate-600">
            Session
          </p>

          <p className="text-[10px] font-medium text-slate-400">
            {isActive ? 'Active' : 'Ended'}
          </p>

        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-500 transition hover:border-white/20 hover:bg-white/5 hover:text-slate-300"
          title="More options"
        >
          <MoreIcon />
        </button>

      </div>

    </div>
  )
}


function MoreIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
}


export default ChatHeader