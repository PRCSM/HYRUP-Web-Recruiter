import React, { createContext, useContext, useMemo, useState } from "react";

const ChatContext = createContext(undefined);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]); // [{id,name,img,lastMessage}]
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({}); // { chatId: [{id,text,isUser,ts}] }

  const addChat = (applicant) => {
    if (!applicant) return;
    const id = applicant.id || applicant.email || String(Date.now());
    const exists = chats.find((c) => c.id === id);
    if (!exists) {
      setChats((prev) => [{ id, name: applicant.name || "Unknown", img: applicant.img, lastMessage: "" }, ...prev]);
    }
    if (!messagesByChat[id]) {
      setMessagesByChat((prev) => ({ ...prev, [id]: [] }));
    }
    setSelectedChatId(id);
  };

  const selectChat = (id) => setSelectedChatId(id);

  const sendMessage = (text, isUser = true) => {
    const t = text?.trim();
    if (!t || !selectedChatId) return;
    setMessagesByChat((prev) => {
      const list = prev[selectedChatId] || [];
      const next = [...list, { id: `${selectedChatId}-${list.length + 1}`, text: t, isUser, ts: Date.now() }];
      return { ...prev, [selectedChatId]: next };
    });
    setChats((prev) => prev.map((c) => (c.id === selectedChatId ? { ...c, lastMessage: t } : c)));
  };

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  const value = {
    chats,
    selectedChatId,
    selectedChat,
    messages: messagesByChat[selectedChatId] || [],
    addChat,
    selectChat,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
};