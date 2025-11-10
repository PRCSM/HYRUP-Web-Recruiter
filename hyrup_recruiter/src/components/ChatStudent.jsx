import React from "react";
import { useChat } from "../contexts/ChatContext";

function ChatStudent() {
  const {
    chats,
    selectedChatId,
    selectChat,
    loading,
    currentUser,
    removeDuplicateChats,
    deleteChat,
  } = useChat();

  // Check for potential duplicates - MUST be before any conditional returns
  const hasPotentialDuplicates = React.useMemo(() => {
    const applicantIds = new Set();
    const duplicates = [];

    chats.forEach((chat) => {
      if (chat.applicantId) {
        if (applicantIds.has(chat.applicantId)) {
          duplicates.push(chat.applicantId);
        } else {
          applicantIds.add(chat.applicantId);
        }
      }
    });

    return duplicates.length > 0;
  }, [chats]);

  const handleCleanupDuplicates = async () => {
    if (window.confirm("This will remove duplicate chat entries. Continue?")) {
      await removeDuplicateChats();
    }
  };

  const handleDeleteChat = async (e, chatId, chatName) => {
    e.stopPropagation(); // Prevent chat selection when clicking X

    if (window.confirm(`Delete chat with ${chatName}?`)) {
      const success = await deleteChat(chatId);
      if (!success) {
        alert("Failed to delete chat. Please try again.");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-[#FFF7E4] rounded-[10px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] w-[95%] md:w-[60%] lg:w-[25%] h-[87vh] p-4">
        <h1 className="text-xl text-left md:text-2xl font-[BungeeShade] mb-3 text-black">
          Applicants
        </h1>
        <div className="w-[95%] text-sm text-center text-neutral-600">
          Please sign in to view chats
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF7E4] rounded-[10px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] w-[95%] md:w-[60%] lg:w-[25%] h-[87vh] p-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl text-left md:text-2xl font-[BungeeShade] text-black">
          Applicants
        </h1>
        {hasPotentialDuplicates && (
          <button
            onClick={handleCleanupDuplicates}
            className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 border border-red-400 rounded text-red-700 font-[Jost-Medium]"
            title="Remove duplicate chats"
          >
            Clean
          </button>
        )}
      </div>

      {loading && (
        <div className="w-[95%] text-sm text-center text-neutral-600 mb-4">
          Loading chats...
        </div>
      )}

      <div className="flex flex-col gap-4 items-center">
        {chats.length === 0 && !loading && (
          <div className="w-[95%] text-sm text-center text-neutral-600">
            No chats yet. Open a profile and press Chat to start.
          </div>
        )}

        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => selectChat(c.id)}
            className={`relative w-[95%] h-[80px] bg-[#FFFFF3] rounded-[10px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex justify-start items-center gap-4 p-4 cursor-pointer transition-all duration-200 ${
              selectedChatId === c.id ? "bg-[#FFEDD5]" : "hover:bg-[#FFEDD5]"
            }`}
          >
            <img
              className="h-12 w-12 rounded-full object-cover border border-black"
              src={c.img}
              alt={`${c.name} profile`}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/100x100?text=Avatar";
              }}
            />
            <div className="flex flex-col justify-center items-start overflow-hidden flex-1">
              <h2 className="text-lg font-[Jost-Bold] text-black truncate w-full">
                {c.name}
              </h2>
              <p className="text-sm font-[Jost-Regular] text-[#00000091] truncate w-full">
                {c.lastMessage}
              </p>
            </div>
            {/* Delete button */}
            <button
              onClick={(e) => handleDeleteChat(e, c.id, c.name)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
              title="Delete chat"
            >
              <span className="text-xs font-bold">✕</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatStudent;
