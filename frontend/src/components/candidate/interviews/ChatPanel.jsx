import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

function ChatPanel({ messages, onSendMessage, sending, sessionEnded }) {
  return (
    <section className="flex min-h-0 flex-col border-l border-[#202b3b] bg-[#0b1220] text-white">

      <ChatHeader isActive={!sessionEnded} />

      <ChatMessages messages={messages} />

      <ChatInput onSend={onSendMessage} disabled={sending || sessionEnded} />

    </section>
  )
}

export default ChatPanel
