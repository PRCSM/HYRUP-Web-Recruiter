import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import apiService from "../services/apiService";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../config/firebase";

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

  // ✅ Track ongoing chat creation to prevent duplicates
  const [creatingChats, setCreatingChats] = useState(new Set());

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

    // Setting up chats listener for user (logs removed for production)

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

        // fetched chats (logging removed)

        // Sort manually on client side (by lastMessageTime or lastUpdated)
        const sortedChats = chatsData.sort((a, b) => {
          const timeA =
            a.lastMessageTime?.toDate?.() ||
            a.lastUpdated?.toDate?.() ||
            new Date(0);
          const timeB =
            b.lastMessageTime?.toDate?.() ||
            b.lastUpdated?.toDate?.() ||
            new Date(0);
          return timeB.getTime() - timeA.getTime(); // Descending order
        });

        let formattedChats = sortedChats
          .map((chat) => {
            const participantIds = chat.users || chat.participantIds || [];
            let otherParticipantFirebaseId = participantIds.find(
              (id) => id !== currentUser.uid
            );

            // FALLBACK for old chats: Extract participant ID from chat ID if not in arrays
            if (!otherParticipantFirebaseId && chat.id) {
              const idsFromChatId = chat.id.split("_");
              otherParticipantFirebaseId = idsFromChatId.find(
                (id) => id !== currentUser.uid
              );
              console.warn(
                `Chat ${chat.id}: No participant in users array, extracted from chatId:`,
                otherParticipantFirebaseId
              );

              // If still no valid participant ID, skip this broken chat
              if (!otherParticipantFirebaseId) {
                console.error(
                  `Chat ${chat.id}: BROKEN CHAT - Cannot extract participant. Skipping.`
                );
                return null; // Will be filtered out
              }
            }

            // Convert Firebase UID back to MongoDB ID for data fetching
            // Use mongoIdMapping if available, otherwise fall back to participantIds (old chats)
            const otherParticipantMongoId =
              chat.mongoIdMapping?.[otherParticipantFirebaseId] ||
              chat.participantIds?.find((id) => id !== currentUser.uid) ||
              otherParticipantFirebaseId;

            console.log(`Chat ${chat.id} participant lookup:`, {
              currentUserUid: currentUser.uid,
              otherParticipantFirebaseId,
              otherParticipantMongoId,
              participantNamesKeys: Object.keys(chat.participantNames || {}),
              foundName:
                chat.participantNames?.[otherParticipantMongoId] ||
                chat.participantNames?.[otherParticipantFirebaseId],
            });

            return {
              id: chat.id,
              name:
                chat.participantNames?.[otherParticipantMongoId] ||
                chat.participantNames?.[otherParticipantFirebaseId] ||
                "User",
              img:
                chat.participantImages?.[otherParticipantMongoId] ||
                chat.participantImages?.[otherParticipantFirebaseId] ||
                "/api/placeholder/100/100",
              lastMessage: chat.lastMessage || "",
              applicantId: otherParticipantMongoId, // Use MongoDB ID for backend API calls
              firebaseId: otherParticipantFirebaseId, // Keep Firebase UID for messaging
            };
          })
          .filter((chat) => chat !== null); // Remove broken chats

        // If any chat is missing a real name or image, fetch student details from backend
        const needFetch = formattedChats.filter(
          (c) =>
            (c.name === "User" || c.img === "/api/placeholder/100/100") &&
            c.applicantId
        );
        if (needFetch.length > 0) {
          (async () => {
            try {
              await Promise.all(
                needFetch.map(async (c) => {
                  try {
                    const resp = await apiService.getStudentById(c.applicantId);
                    const data =
                      resp && (resp.student || resp.data || resp.user || resp);
                    if (resp && resp.success && data) {
                      const fullName =
                        data.profile?.FullName ||
                        data.profile?.fullName ||
                        data.name;
                      const pic =
                        data.profile?.profilePicture ||
                        data.profile?.profilepicture ||
                        c.img;
                      formattedChats = formattedChats.map((fc) =>
                        fc.applicantId === c.applicantId
                          ? {
                              ...fc,
                              name: fullName || fc.name,
                              img: pic || fc.img,
                            }
                          : fc
                      );
                    }
                  } catch {
                    // fetching student for chat failed; ignore and continue
                  }
                })
              );
            } catch {
              // Error while fetching participant details; suppress console output
            } finally {
              setChats(formattedChats);
            }
          })();
        } else {
          setChats(formattedChats);
        }

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
      () => {
        // Error fetching chats; record message without printing to console
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

        // fetched messages for selected chat (logs removed)

        setMessagesByChat((prev) => ({
          ...prev,
          [selectedChatId]: messagesData,
        }));
      },
      (error) => {
        // Error fetching messages; suppress console output
      }
    );

    return () => unsubscribe();
  }, [selectedChatId]);

  // ✅ Add or find existing chat - PREVENTS DUPLICATES
  const addChat = async (applicant) => {
    if (!currentUser || !applicant) {
      // Missing current user or applicant
      return null;
    }

    // CRITICAL: Use Firebase UIDs for BOTH participants to ensure consistent chatId
    // Get the applicant's Firebase UID (might be in firebaseId field or use id as fallback)
    const applicantFirebaseId = applicant.firebaseId || applicant.id;

    // Generate consistent chat ID based on sorted Firebase UIDs
    const chatId = generateChatId(currentUser.uid, applicantFirebaseId);

    console.log("Creating/Finding chat with Firebase UIDs:", {
      currentUserUid: currentUser.uid,
      applicantFirebaseId: applicantFirebaseId,
      applicantMongoId: applicant.id,
      generatedChatId: chatId,
    });

    // Check if we're already creating this chat (prevent rapid duplicate calls)
    if (creatingChats.has(chatId)) {
      // Already creating this chat, just select it and return
      setSelectedChatId(chatId);
      return chatId;
    }

    setLoading(true);

    // Mark this chat as being created
    setCreatingChats((prev) => new Set(prev).add(chatId));

    try {
      // First, check if chat already exists in local state
      const existingLocalChat = chats.find((chat) => chat.id === chatId);

      if (existingLocalChat) {
        console.log(`✅ Found existing chat in local state: ${chatId}`);
        setSelectedChatId(existingLocalChat.id);
        setLoading(false);
        setCreatingChats((prev) => {
          const next = new Set(prev);
          next.delete(chatId);
          return next;
        });
        return existingLocalChat.id;
      }

      // Also check if chat exists in Firestore directly (in case local state isn't synced yet)
      const chatDocRef = doc(db, "chats", chatId);
      const chatSnapshot = await getDoc(chatDocRef);

      if (chatSnapshot.exists()) {
        console.log(`✅ Found existing chat in Firestore: ${chatId}`);
        setSelectedChatId(chatId);
        setLoading(false);
        setCreatingChats((prev) => {
          const next = new Set(prev);
          next.delete(chatId);
          return next;
        });
        return chatId;
      }

      // No existing chat found, create new one
      setPendingChat({
        applicantId: applicant.id,
        name: applicant.name,
      });

      // applicantFirebaseId already declared above - no need to redeclare
      console.log("Creating NEW chat document with Firebase UIDs:", {
        recruiter: currentUser.uid,
        applicant: applicantFirebaseId,
        applicantMongoId: applicant.id,
        chatId: chatId,
      });

      // Create chat document with BOTH old and new structure for compatibility
      const chatData = {
        // NEW STRUCTURE - Uses Firebase UIDs for message routing
        users: [currentUser.uid, applicantFirebaseId],
        lastMessageTime: serverTimestamp(),

        // OLD STRUCTURE (for compatibility) - Uses MongoDB ID for data fetching
        participantIds: [currentUser.uid, applicant.id],
        lastUpdated: serverTimestamp(),

        // Firebase ID Mapping - Maps MongoDB ID to Firebase UID for message routing
        firebaseIdMapping: {
          [applicant.id]: applicantFirebaseId, // MongoDB ID -> Firebase UID
          [currentUser.uid]: currentUser.uid, // Recruiter already uses Firebase UID
        },

        // Reverse mapping - Maps Firebase UID to MongoDB ID for data fetching
        mongoIdMapping: {
          [applicantFirebaseId]: applicant.id, // Firebase UID -> MongoDB ID
          [currentUser.uid]: currentUser.uid, // Recruiter uses same ID
        },

        // COMMON FIELDS - Store with BOTH Firebase UID and MongoDB ID as keys for compatibility
        participantNames: {
          // Recruiter (same ID for both)
          [currentUser.uid]: currentUser.displayName || "Recruiter",
          // Student (store with both Firebase UID and MongoDB ID)
          [applicant.id]: applicant.name || "Applicant",
          [applicantFirebaseId]: applicant.name || "Applicant",
        },
        participantImages: {
          // Recruiter (same ID for both)
          [currentUser.uid]: currentUser.photoURL || "",
          // Student (store with both Firebase UID and MongoDB ID)
          [applicant.id]: applicant.img || "/api/placeholder/100/100",
          [applicantFirebaseId]: applicant.img || "/api/placeholder/100/100",
        },
        lastMessage: "",
        createdAt: serverTimestamp(),
      };

      // Use setDoc with merge option to avoid overwriting if created simultaneously
      await setDoc(doc(db, "chats", chatId), chatData, { merge: true });

      // New chat created
      setSelectedChatId(chatId);
      return chatId;
    } catch {
      // Error creating chat (suppressed)
      setPendingChat(null);
      return null;
    } finally {
      setLoading(false);
      // Remove from creating set after a short delay to allow Firestore listener to sync
      setTimeout(() => {
        setCreatingChats((prev) => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
      }, 1000);
    }
  };

  // ✅ Select chat manually
  const selectChat = (id) => setSelectedChatId(id);

  // ✅ Remove duplicate chats - keeps only the chat with the proper ID format
  const removeDuplicateChats = async () => {
    if (!currentUser || chats.length === 0) return;

    try {
      // Group chats by participants (ignoring chat ID)
      const chatGroups = new Map();

      chats.forEach((chat) => {
        if (!chat.applicantId) return;

        // Generate the correct chat ID
        const correctChatId = generateChatId(currentUser.uid, chat.applicantId);

        if (!chatGroups.has(correctChatId)) {
          chatGroups.set(correctChatId, []);
        }
        chatGroups.get(correctChatId).push(chat);
      });

      // For each group with duplicates, delete all except the one with correct ID
      const deletePromises = [];

      for (const [correctChatId, duplicates] of chatGroups.entries()) {
        if (duplicates.length > 1) {
          // Keep the chat with the correct ID, delete others
          duplicates.forEach((chat) => {
            if (chat.id !== correctChatId) {
              deletePromises.push(deleteDoc(doc(db, "chats", chat.id)));
            }
          });
        }
      }

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        // Duplicates removed successfully
      }
    } catch {
      // Error removing duplicate chats
    }
  };

  // ✅ Delete a specific chat
  const deleteChat = async (chatId) => {
    if (!chatId) return;

    try {
      // Delete the chat document from Firestore
      await deleteDoc(doc(db, "chats", chatId));

      // If the deleted chat was selected, clear selection
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        localStorage.removeItem("selectedChatId");
      }

      return true;
    } catch {
      // Error deleting chat
      return false;
    }
  };

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
      // Cannot send message: missing required data
      return;
    }

    try {
      // Determine receiver ID from chat ID (this might be MongoDB ID)
      const chatUsers = selectedChatId.split("_");
      let receiverId = chatUsers.find((id) => id !== currentUser.uid);

      if (!receiverId) {
        // Could not determine receiver ID
        return;
      }

      // Get the chat document to access Firebase ID mapping
      const chatDocRef = doc(db, "chats", selectedChatId);
      const chatDoc = await getDoc(chatDocRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        // If firebaseIdMapping exists, use it to convert MongoDB ID -> Firebase UID
        if (
          chatData.firebaseIdMapping &&
          chatData.firebaseIdMapping[receiverId]
        ) {
          const firebaseUid = chatData.firebaseIdMapping[receiverId];
          console.log(`Mapping receiver: ${receiverId} -> ${firebaseUid}`);
          receiverId = firebaseUid;
        } else {
          // Fallback: If no mapping exists (old chats), receiverId stays as-is
          console.warn(
            "No Firebase ID mapping found for receiver:",
            receiverId
          );
        }
      }

      let fileUrl = "";
      let fileName = "";

      // Handle file upload to Firebase Storage
      if (attachment && attachment.file) {
        // Create a unique filename with timestamp
        const timestamp = Date.now();
        fileName = `${timestamp}_${attachment.name}`;

        // Create storage reference
        const storageRef = ref(
          storage,
          `chat_files/${selectedChatId}/${fileName}`
        );

        // Upload file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, attachment.file);

        // Get download URL
        fileUrl = await getDownloadURL(snapshot.ref);
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
        messageData.message = fileUrl; // Firebase Storage download URL
      } else {
        messageData.fileName = ""; // Empty for text messages
        messageData.message = messageText; // Text content
      }

      // Sending message (logs removed)

      // Save message to Firestore
      await addDoc(
        collection(db, "chats", selectedChatId, "messages"),
        messageData
      );

      // Update chat document
      await updateDoc(doc(db, "chats", selectedChatId), {
        lastMessage: attachment ? `📎 ${attachment.name}` : messageText,
        lastMessageTime: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      // Message sent successfully
    } catch (error) {
      // Error sending message (suppressed)
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
      isImage: m[5] === "1",
    };

    const cleanText = text.replace(re, "").trim();
    return { cleanText, file };
  };

  // ✅ Process messages for UI compatibility
  const processMessagesForUI = (rawMessages) => {
    if (!rawMessages) return [];

    return rawMessages.map((msg) => {
      // For messages in your new format
      if (msg.type) {
        let text = "";
        let file = null;

        // Handle file messages
        if (msg.fileName && msg.fileName !== "") {
          file = {
            name: msg.fileName,
            type:
              msg.type === "image" ? "image/jpeg" : "application/octet-stream",
            url: msg.message, // This is the Firebase Storage URL
            isImage: msg.type === "image",
          };

          // Create file tag for your existing UI
          const fileTag = `[file|${encodeURIComponent(
            msg.fileName
          )}|${encodeURIComponent(file.type)}|0|${encodeURIComponent(
            msg.message
          )}|${file.isImage ? 1 : 0}]`;
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
    removeDuplicateChats,
    deleteChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// ✅ Hook
export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
