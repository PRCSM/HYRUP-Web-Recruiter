import React, { useEffect, useRef, useState } from 'react'
import { useChat } from '../contexts/ChatContext'
import { BackIcon } from '../assets/Icons' 

function ChatTextingArea() {
  const [message, setMessage] = useState('')
  const { selectedChat, messages, sendMessage, selectChat } = useChat()
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, selectedChat])

  const send = () => {
    const text = message.trim()
    if (!text || !selectedChat) return
    sendMessage(text, true)
    setMessage('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    // Wrapper: popup on small screens, normal on lg+
    <div
      className={`${selectedChat ? 'flex' : 'hidden'} lg:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-auto lg:left-auto lg:translate-x-0 lg:translate-y-0 inset-0 lg:static z-50 w-[95%] lg:w-[45%] lg:z-auto items-center justify-center p-2 lg:p-0`}
    >
      <div
        className="w-[85%] h-[90vh] lg:h-[87vh] lg:w-[100%] flex flex-col overflow-hidden rounded-[10px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] bg-[#FFF7E4]"
      >
        {/* Header */}
        <div className="m-2 rounded-xl border-2 border-neutral-800 bg-white px-4 py-3">
          {selectedChat ? (
            <div className="flex items-center gap-3">
              {/* Back (mobile only) */}
              <button
                type="button"
                onClick={() => selectChat(null)}
                className="lg:hidden grid h-10 w-10 place-items-center rounded-full border-2 border-neutral-800 bg-white hover:bg-neutral-100"
                aria-label="Back to chat list"
                title="Back"
              >
                <BackIcon className="h-5 w-5" />
              </button>

              <img src={selectedChat.img} alt={selectedChat.name} className="h-12 w-12 rounded-full border-2 border-neutral-800 object-cover" />
              <div className="leading-tight">
                <div className="text-lg font-semibold text-neutral-900">{selectedChat.name}</div>
                <div className="text-xs text-neutral-500">Online</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-neutral-600">Messages</div>
          )}
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {!selectedChat ? (
            <div className="h-full grid place-items-center">
              <div className="rounded-full bg-neutral-500 px-4 py-2 text-xs font-medium text-white">
                Select an applicant to start messaging
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="flex justify-center mt-4">
                  <span className="rounded-full bg-neutral-500 px-3 py-1 text-xs font-medium text-white">
                    Say hello to start the conversation
                  </span>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex items-start gap-2 ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                  {!m.isUser && (
                    <div className="h-10 w-10 shrink-0 rounded-full bg-sky-300 ring-2 ring-neutral-800" />
                  )}
                  <div
                    className={`max-w-[75%] whitespace-pre-wrap break-words border-2 p-3 text-sm leading-relaxed text-neutral-900 ${
                      m.isUser
                        ? 'rounded-2xl rounded-br-md border-neutral-800 bg-violet-200'
                        : 'rounded-2xl rounded-bl-md border-neutral-800 bg-white'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.isUser && (
                    <div className="h-10 w-10 shrink-0 rounded-full bg-orange-300 ring-2 ring-neutral-800" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Composer */}
        <div className="m-2 flex items-center gap-2 rounded-xl border-2 border-neutral-800 bg-white p-2">
          <input
            className="h-10 w-full flex-1 rounded-full border-2 border-neutral-800 bg-neutral-100 px-4 text-sm text-neutral-900 outline-none transition focus:bg-white disabled:cursor-not-allowed"
            placeholder="Type a new message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!selectedChat}
          />
          <button
            type="button"
            title="Attach file"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-neutral-800 bg-white text-base hover:bg-neutral-100 disabled:opacity-60"
            disabled={!selectedChat}
          >
            📎
          </button>
          
          <button
            type="button"
            onClick={send}
            disabled={!selectedChat || !message.trim()}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-neutral-800 bg-[#6ab7fa86] text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
            title="Send"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatTextingArea
