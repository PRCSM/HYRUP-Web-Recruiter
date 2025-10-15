import React from 'react'
import { useChat } from '../contexts/ChatContext'

function ChatStudent() {
  const { chats, selectedChatId, selectChat } = useChat()

  return (
    <div className="bg-[#FFF7E4]  rounded-[10px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] w-[95%] md:w-[60%]  lg:w-[25%] h-[87vh] p-4">
      <h1 className="text-xl text-left md:text-2xl font-[BungeeShade] mb-3 text-black">Applicants</h1>

      <div className="flex flex-col gap-4 items-center">
        {chats.length === 0 && (
          <div className="w-[95%] text-sm text-center text-neutral-600">
            No chats yet. Open a profile and press Chat to start.
          </div>
        )}

        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => selectChat(c.id)}
            className={`w-[95%] h-[80px] bg-[#FFFFF3] rounded-[10px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex justify-start items-center gap-4 p-4 cursor-pointer transition-all duration-200 ${
              selectedChatId === c.id ? 'bg-[#FFEDD5]' : 'hover:bg-[#FFEDD5]'
            }`}
          >
            <img className="h-full rounded-full object-cover border border-black" src={c.img} alt={`${c.name} profile`} />
            <div className="flex flex-col justify-center items-start overflow-hidden">
              <h2 className="text-lg font-[Jost-Bold] text-black truncate max-w-[180px]">{c.name}</h2>
              <p className="text-sm font-[Jost-Regular] text-[#00000091] truncate max-w-[220px]">
                {c.lastMessage || 'Say hello 👋'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatStudent
