import React, { useEffect, useRef, useState } from 'react'
import { useChat } from '../contexts/ChatContext'
import { BackIcon, RxCross2 } from '../assets/Icons' 

function ChatTextingArea() {
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [showPreview, setShowPreview] = useState(false) // NEW: modal preview
  const fileInputRef = useRef(null)
  const { selectedChat, messages, sendMessage, selectChat } = useChat()
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, selectedChat])

  // Encodes an attachment into a simple tag inside message text.
  const makeFileTag = (a) =>
    `[file|${encodeURIComponent(a.name)}|${encodeURIComponent(a.type)}|${a.size}|${encodeURIComponent(a.url)}|${a.isImage ? 1 : 0}]`

  const parseFileTag = (text) => {
    const re = /\[file\|([^|]+)\|([^|]+)\|(\d+)\|([^\]|]+)\|(0|1)\]/
    const m = text?.match(re)
    if (!m) return { cleanText: text, file: null }
    const file = {
      name: decodeURIComponent(m[1]),
      type: decodeURIComponent(m[2]),
      size: Number(m[3]),
      url: decodeURIComponent(m[4]),
      isImage: m[5] === '1',
    }
    const cleanText = text.replace(re, '').trim()
    return { cleanText, file }
  }

  const openPicker = () => fileInputRef.current?.click()

  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAttachment({
      file,
      url,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      isImage: (file.type || '').startsWith('image/'),
    })
    setShowPreview(true) // OPEN preview like WhatsApp
    e.target.value = ''
  }

  // PREVIEW CARD (WhatsApp-like)
  const AttachmentCard = ({ file }) => (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-neutral-800 bg-black/5 ${
        file.isImage ? 'w-[200px] h-[320px] sm:w-[340px] sm:h-[360px]' : 'w-[200px]'
      } group cursor-pointer`}
      onClick={() => { setAttachment(file); setShowPreview(true) }}
      title={file.name}
    >
      {file.isImage ? (
        <>
          <img
            src={file.url}
            alt={file.name}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          {/* Removed center overlay pill */}
        </>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-white">
          <div className="grid h-12 w-12 place-items-center rounded-md border border-neutral-300 bg-white">📎</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-neutral-900">{file.name}</div>
            <a
              href={file.url}
              download={file.name}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:underline"
            >
              Download
            </a>
          </div>
        </div>
      )}
      {/* Optional hover download stays */}
      <a
        href={file.url}
        download={file.name}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 hidden group-hover:grid h-9 w-9 place-items-center rounded-full border-2 border-white/70 bg-black/50 text-white"
        title="Download"
      >
        ⬇
      </a>
    </div>
  )

  const clearAttachment = () => {
    // IMPORTANT: Do not revoke the object URL here because it is used inside the sent message.
    // URL.revokeObjectURL would break the just-sent image preview.
    setAttachment(null)
    setShowPreview(false)
  }

  const send = () => {
    const text = message.trim()
    if (!selectedChat) return
    if (!text && !attachment) return
    const payload = attachment
      ? [text, makeFileTag(attachment)].filter(Boolean).join('\n')
      : text
    sendMessage(payload, true)
    setMessage('')
    clearAttachment()
    setShowPreview(false) // close preview after sending
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') setShowPreview(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  return (
    <div
      className={`${selectedChat ? 'flex' : 'hidden'} lg:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-auto lg:left-auto lg:translate-x-0 lg:translate-y-0 inset-0 lg:static z-50 w-[95%] lg:w-[45%] lg:z-auto items-center justify-center p-2 lg:p-0`}
    >
      <div className="w-[100%] h-[90vh] lg:h-[87vh] lg:w-[100%] flex flex-col overflow-hidden rounded-[10px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] bg-[#FFF7E4]">
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
              {messages.map((m) => {
                const { cleanText, file } = parseFileTag(m.text)
                return (
                  <div key={m.id} className={`flex items-start gap-2 ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                    {!m.isUser && (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-sky-300 ring-2 ring-neutral-800" />
                    )}

                    <div className="flex max-w-[89%] md:max-w-[75%] flex-col items-start gap-2">
                      {cleanText && (
                        <div
                          className={`whitespace-pre-wrap break-words border-2 p-3 text-sm leading-relaxed text-neutral-900 ${
                            m.isUser
                              ? 'rounded-2xl rounded-br-md border-neutral-800 bg-violet-200'
                              : 'rounded-2xl rounded-bl-md border-neutral-800 bg-white'
                          }`}
                        >
                          {cleanText}
                        </div>
                      )}

                      {file && <AttachmentCard file={file} />}
                    </div>

                    {m.isUser && (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-orange-300 ring-2 ring-neutral-800" />
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Composer */}
        <div className="m-2 flex flex-col gap-2 rounded-xl border-2 border-neutral-800 bg-white p-2">
          {/* Attachment chip (tap to open preview) */}
          {attachment && (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border-2 border-neutral-800 bg-[#FFFFF3] p-2 cursor-pointer"
              onClick={() => setShowPreview(true)}
              title="Tap to preview"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {attachment.isImage ? (
                  <img src={attachment.url} alt={attachment.name} className="h-12 w-12 rounded-md object-cover ring-1 ring-neutral-300" />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-md border border-neutral-300 bg-white">📎</div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-neutral-900">{attachment.name}</div>
                  <div className="text-xs text-neutral-500">{(attachment.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearAttachment() }}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-neutral-800 bg-white hover:bg-neutral-100"
                title="Remove attachment"
              >
                <RxCross2 />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              className="h-10 w-full flex-1 rounded-full border-2 border-neutral-800 bg-neutral-100 px-4 text-sm text-neutral-900 outline-none transition focus:bg-white disabled:cursor-not-allowed"
              placeholder="Type a new message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={!selectedChat}
            />
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" className="hidden" onChange={onPickFile} />
            <button
              type="button"
              title="Attach file"
              onClick={openPicker}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-neutral-800 bg-white text-base hover:bg-neutral-100 disabled:opacity-60"
              disabled={!selectedChat}
            >
              📎
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!selectedChat || (!message.trim() && !attachment)}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-neutral-800 bg-[#6ab7fa86] text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
              title="Send"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp-like full-screen preview modal */}
      {attachment && showPreview && (
        <div
          className="fixed inset-0 z-[70] bg-[#FFF7E4] rounded-[10px] flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowPreview(false) // close on backdrop click
          }}
        >
          <div className="relative w-full max-w-[900px] h-[85vh] rounded-xl border-2 border-black bg-[#0b0b0b] overflow-hidden">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setShowPreview(false)}  // Back closes preview
                aria-label="Back"
                title="Back"
              >
                <BackIcon className="h-5 w-5" />
              </button>
              <div className="text-white/80 text-sm truncate px-2">{attachment.name}</div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={clearAttachment}
                aria-label="Remove"
                title="Remove"
              >
                <RxCross2 />
              </button>
            </div>

            {/* Preview area */}
            <div className="absolute inset-x-0 top-12 bottom-16 grid place-items-center">
              {attachment.isImage ? (
                <img src={attachment.url} alt={attachment.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-white/90 text-center">
                  <div className="text-5xl mb-4">📎</div>
                  <div className="text-sm">{attachment.name}</div>
                  <div className="text-xs text-white/60">{(attachment.size / 1024).toFixed(1)} KB</div>
                </div>
              )}
            </div>

            {/* Caption + actions (bottom bar) */}
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/40 p-3">
              <input
                className="h-11 flex-1 rounded-full border-2 border-white/30 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 outline-none"
                placeholder="Add a caption"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
              />
              <button
                className="grid h-11 w-11 place-items-center rounded-full border-2 border-white/30 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-white/20 disabled:border-white/20"
                onClick={send}
                disabled={!selectedChat || (!message.trim() && !attachment)}
                title="Send"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatTextingArea
