import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db , storage } from "../config/firebase";

// ✅ Create context
const ChatContext = createContext(undefined);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingChat, setPendingChat] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [chatsError, setChatsError] = useState(null);

  // ✅ Generate consistent chat ID for two users
  const generateChatId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  // ✅ Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Restore selected chat from localStorage on mount
  useEffect(() => {
    const savedChatId = localStorage.getItem("selectedChatId");
    if (savedChatId) setSelectedChatId(savedChatId);
  }, []);

  // ✅ Persist selected chat to localStorage
  useEffect(() => {
    if (selectedChatId) localStorage.setItem("selectedChatId", selectedChatId);
    else localStorage.removeItem("selectedChatId");
  }, [selectedChatId]);

  // ✅ Listen for current user's chats - SIMPLIFIED QUERY TO AVOID INDEX ERRORS
  useEffect(() => {
    if (!authInitialized) return;
    if (!currentUser) {
      setChats([]);
      return;
    }

    console.log("Setting up chats listener for user:", currentUser.uid);

    // Use a simpler query that doesn't require composite indexes
    const chatsQuery = query(
      collection(db, "chats"),
      where("users", "array-contains", currentUser.uid)
      // Removed orderBy to avoid index requirements - we'll sort manually
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        setChatsError(null);
        const chatsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched chats:", chatsData);

        // Sort manually on client side (by lastMessageTime or lastUpdated)
        const sortedChats = chatsData.sort((a, b) => {
          const timeA = a.lastMessageTime?.toDate?.() || a.lastUpdated?.toDate?.() || new Date(0);
          const timeB = b.lastMessageTime?.toDate?.() || b.lastUpdated?.toDate?.() || new Date(0);
          return timeB.getTime() - timeA.getTime(); // Descending order
        });

        const formattedChats = sortedChats.map((chat) => {
          const participantIds = chat.users || chat.participantIds || [];
          const otherParticipantId = participantIds.find(
            (id) => id !== currentUser.uid
          );
          
          return {
            id: chat.id,
            name: chat.participantNames?.[otherParticipantId] || "User",
            img: chat.participantImages?.[otherParticipantId] || "/api/placeholder/100/100",
            lastMessage: chat.lastMessage || "",
            applicantId: otherParticipantId,
          };
        });

        setChats(formattedChats);

        if (pendingChat && formattedChats.length > 0) {
          const foundChat = formattedChats.find(
            (chat) =>
              chat.applicantId === pendingChat.applicantId ||
              chat.name === pendingChat.name
          );
          if (foundChat) {
            setSelectedChatId(foundChat.id);
            setPendingChat(null);
          }
        }
      },
      (error) => {
        console.error("Error fetching chats:", error);
        setChatsError(error.message);
      }
    );

    return () => unsubscribe();
  }, [authInitialized, currentUser, pendingChat]);

  // ✅ Listen for messages of the selected chat
  useEffect(() => {
    if (!selectedChatId) return;

    const messagesQuery = query(
      collection(db, "chats", selectedChatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));

        console.log("Fetched messages for chat", selectedChatId, ":", messagesData);

        setMessagesByChat((prev) => ({
          ...prev,
          [selectedChatId]: messagesData,
        }));
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe();
  }, [selectedChatId]);

  // ✅ Add or find existing chat - FIXED TO USE setDoc INSTEAD OF updateDoc
  const addChat = async (applicant) => {
    if (!currentUser || !applicant) {
      console.error("No current user or applicant provided");
      return null;
    }

    setLoading(true);
    try {
      // Generate consistent chat ID
      const chatId = generateChatId(currentUser.uid, applicant.id);
      
      console.log("Looking for chat with ID:", chatId);
      console.log("Current chats:", chats);

      // Check if chat already exists in local state
      const existingChat = chats.find(chat => chat.id === chatId);

      if (existingChat) {
        console.log("Found existing chat:", existingChat);
        setSelectedChatId(existingChat.id);
        setLoading(false);
        return existingChat.id;
      }

      console.log("No existing chat found, creating new one...");
      setPendingChat({
        applicantId: applicant.id,
        name: applicant.name,
      });

      // Create chat document with BOTH old and new structure for compatibility
      const chatData = {
        // NEW STRUCTURE
        users: [currentUser.uid, applicant.id],
        lastMessageTime: serverTimestamp(),
        
        // OLD STRUCTURE (for compatibility)
        participantIds: [currentUser.uid, applicant.id],
        lastUpdated: serverTimestamp(),
        
        // COMMON FIELDS
        participantNames: {
          [currentUser.uid]: currentUser.displayName || "Recruiter",
          [applicant.id]: applicant.name || "Applicant",
        },
        participantImages: {
          [currentUser.uid]: currentUser.photoURL || "",
          [applicant.id]: applicant.img || "/api/placeholder/100/100",
        },
        lastMessage: "",
        createdAt: serverTimestamp(),
      };

      console.log("Creating chat with data:", chatData);

      // ✅ FIX: Use setDoc instead of updateDoc for new documents
      await setDoc(doc(db, "chats", chatId), chatData);
      
      console.log("New chat created:", chatId);
      setSelectedChatId(chatId);
      return chatId;
    } catch (error) {
      console.error("Error creating chat:", error);
      setPendingChat(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Select chat manually
  const selectChat = (id) => setSelectedChatId(id);

  // ✅ Send message
// const sendMessage = async (text, attachment = null) => {
//   const messageText = text?.trim();
//   if ((!messageText && !attachment) || !selectedChatId || !currentUser) {
//     console.error("Cannot send message: missing required data");
//     return;
//   }

//   try {
//     // Determine receiver ID from chat ID
//     const chatUsers = selectedChatId.split('_');
//     const receiverId = chatUsers.find(id => id !== currentUser.uid);

//     if (!receiverId) {
//       console.error("Could not determine receiver ID");
//       return;
//     }

//     // Create message data in YOUR DESIRED FORMAT
//     const messageData = {
//       // Your requested fields
//       isRead: false,
//       receiverId: receiverId,
//       senderId: currentUser.uid,
//       timestamp: serverTimestamp(),
//       type: attachment ? (attachment.isImage ? "image" : "file") : "text",
//       isUser: true, // Keep isUser field
//     };

//     // Handle file attachment
//     if (attachment) {
//       messageData.fileName = attachment.name; // File name
//       messageData.message = attachment.url;   // Firebase Storage URL
//     } else {
//       messageData.fileName = "";              // Empty for text messages
//       messageData.message = messageText;      // Text content
//     }

//     console.log("Sending message with data:", messageData);

//     await addDoc(collection(db, "chats", selectedChatId, "messages"), messageData);

//     // Update chat document
//     await updateDoc(doc(db, "chats", selectedChatId), {
//       lastMessage: attachment ? `📎 ${attachment.name}` : messageText,
//       lastMessageTime: serverTimestamp(),
//       lastUpdated: serverTimestamp(),
//     });

//     console.log("Message sent successfully");
//   } catch (error) {
//     console.error("Error sending message:", error);
//   }
// };

// ✅ Send message with file upload to Firebase Storage
const sendMessage = async (text, attachment = null) => {
  const messageText = text?.trim();
  if ((!messageText && !attachment) || !selectedChatId || !currentUser) {
    console.error("Cannot send message: missing required data");
    return;
  }

  try {
    // Determine receiver ID from chat ID
    const chatUsers = selectedChatId.split('_');
    const receiverId = chatUsers.find(id => id !== currentUser.uid);

    if (!receiverId) {
      console.error("Could not determine receiver ID");
      return;
    }

    let fileUrl = "";
    let fileName = "";

    // Handle file upload to Firebase Storage
    if (attachment && attachment.file) {
      try {
        // Create a unique filename with timestamp
        const timestamp = Date.now();
        const fileExtension = attachment.name.split('.').pop();
        fileName = `${timestamp}_${attachment.name}`;
        
        // Create storage reference
        const storageRef = ref(storage, `chat_files/${selectedChatId}/${fileName}`);
        
        // Upload file to Firebase Storage
        console.log("Uploading file to Firebase Storage...");
        const snapshot = await uploadBytes(storageRef, attachment.file);
        
        // Get download URL
        fileUrl = await getDownloadURL(snapshot.ref);
        console.log("File uploaded successfully. URL:", fileUrl);
        
      } catch (uploadError) {
        console.error("Error uploading file to Firebase Storage:", uploadError);
        throw uploadError;
      }
    }

    // Create message data
    const messageData = {
      isRead: false,
      receiverId: receiverId,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
      type: attachment ? (attachment.isImage ? "image" : "file") : "text",
      isUser: true,
    };

    // Set message content based on attachment
    if (attachment) {
      messageData.fileName = fileName; // The actual filename stored in Storage
      messageData.message = fileUrl;   // Firebase Storage download URL
    } else {
      messageData.fileName = "";       // Empty for text messages
      messageData.message = messageText; // Text content
    }

    console.log("Sending message with data:", messageData);

    // Save message to Firestore
    await addDoc(collection(db, "chats", selectedChatId, "messages"), messageData);

    // Update chat document
    await updateDoc(doc(db, "chats", selectedChatId), {
      lastMessage: attachment ? `📎 ${attachment.name}` : messageText,
      lastMessageTime: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });

    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
  // ✅ Parse file tags from messages
  const parseFileTag = (text) => {
    if (!text) return { cleanText: text, file: null };
    
    const re = /\[file\|([^|]+)\|([^|]+)\|(\d+)\|([^\]|]+)\|(0|1)\]/;
    const m = text.match(re);
    
    if (!m) return { cleanText: text, file: null };
    
    const file = {
      name: decodeURIComponent(m[1]),
      type: decodeURIComponent(m[2]),
      size: Number(m[3]),
      url: decodeURIComponent(m[4]),
      isImage: m[5] === '1',
    };
    
    const cleanText = text.replace(re, '').trim();
    return { cleanText, file };
  };

  // ✅ Process messages for UI compatibility
const processMessagesForUI = (rawMessages) => {
  if (!rawMessages) return [];
  
  return rawMessages.map(msg => {
    // For messages in your new format
    if (msg.type) {
      let text = "";
      let file = null;
      
      // Handle file messages
      if (msg.fileName && msg.fileName !== "") {
        file = {
          name: msg.fileName,
          type: msg.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
          url: msg.message, // This is the Firebase Storage URL
          isImage: msg.type === 'image',
        };
        
        // Create file tag for your existing UI
        const fileTag = `[file|${encodeURIComponent(msg.fileName)}|${encodeURIComponent(file.type)}|0|${encodeURIComponent(msg.message)}|${file.isImage ? 1 : 0}]`;
        text = fileTag;
      } else {
        // Text message
        text = msg.message || "";
      }
      
      return {
        ...msg,
        text: text,
        isUser: msg.senderId === currentUser?.uid,
        hasAttachment: !!msg.fileName && msg.fileName !== "",
      };
    }
    
    // If it's already in old format, just return as is
    return msg;
  });
};
  // ✅ Derived data for selected chat
  const selectedChat = useMemo(() => {
    if (!selectedChatId) return null;
    return chats.find((c) => c.id === selectedChatId) || null;
  }, [chats, selectedChatId]);

  // ✅ Get processed messages for current chat
  const messages = useMemo(() => {
    const rawMessages = messagesByChat[selectedChatId] || [];
    return processMessagesForUI(rawMessages);
  }, [messagesByChat, selectedChatId, currentUser]);

  // ✅ Provide context value
  const value = {
    chats,
    selectedChatId,
    selectedChat,
    messages,
    addChat,
    selectChat,
    sendMessage,
    loading,
    currentUser,
    parseFileTag,
    chatsError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// ✅ Hook
export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};