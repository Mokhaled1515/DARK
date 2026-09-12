import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import toast from "react-hot-toast";

const getPeerId = (conversation) =>
  conversation?.peer?._id ||
  conversation?.recipient?._id ||
  conversation?.user?._id ||
  conversation?._id ||
  conversation?.userId ||
  null;

const getConversationId = (conversation) =>
  conversation?.conversationId || conversation?.conversation?._id || null;
let messagesRequestId = 0;

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectedUser: null,

      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,

      activeConversationId: null,

      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,
      typingUsers: {},

    
      getUsers: async () => {
        set({ isUsersLoading: true });

        try {
          const res = await axiosInstance.get("/messages/users");

          const safeUsers = Array.isArray(res.data) ? res.data : [];

          set((state) => ({
            users: safeUsers,

            selectedUser:
              state.selectedUser &&
              safeUsers.some(
                (user) => String(user._id) === String(state.selectedUser._id),
              )
                ? state.selectedUser
                : state.selectedUser,
          }));
        } catch (error) {
          console.log("Error in getUsers:", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      
      getConversations: async () => {
        set({ isConversationsLoading: true });

        try {
          const res = await axiosInstance.get("/messages/conversations");

          const conversations = Array.isArray(res.data) ? res.data : [];

          set({ conversations });

          return conversations;
        } catch (error) {
          console.log("Error in getConversations:", error.message);
          return [];
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (peerId) => {
        if (!peerId) return;

        const requestId = ++messagesRequestId;

       
        set({ isMessagesLoading: true });

        try {
          const res = await axiosInstance.get(`/messages/${peerId}`);

        
          if (requestId !== messagesRequestId) {
            return;
          }

          const messages = Array.isArray(res.data) ? res.data : [];

       

          set({
            messages,
          });
        } catch (error) {
          if (requestId !== messagesRequestId) return;

          toast.error(
            error.response?.data?.message || "Failed to load messages",
          );
        } finally {
          if (requestId === messagesRequestId) {
            set({ isMessagesLoading: false });
          }
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser } = get();

        if (!selectedUser?._id) return false;

        try {
          const isFormData = messageData instanceof FormData;

          const config = isFormData
            ? {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            : {};

          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData,
            config,
          );

          set((state) => ({
            messages: [...state.messages, res.data],
            composerText: "",
          }));

          await get().getConversations();

          return true;
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to send message",
          );

          return false;
        }
      },

    
      sendTextMessage: async () => {
        const messageText = get().composerText.trim();

        if (!messageText) return false;

        return get().sendMessage({
          text: messageText,
        });
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!file) return false;

        const { selectedUser } = get();

        const receiverId = selectedUser?._id;

        if (!receiverId) {
          toast.error("No receiver selected");
          return false;
        }

        set({ isSendingMedia: true });

        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await axiosInstance.post(
            `/messages/send/${receiverId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          set((state) => ({
            messages: [...state.messages, res.data],
          }));

          await get().getConversations();

          return res.data;
        } catch (error) {
          console.error("Error sending media:", error);

          toast.error(error.response?.data?.message || "Failed to send media");

          return false;
        } finally {
          set({ isSendingMedia: false });
        }
      },
   
      sendVoiceMessage: async (audioBlob) => {
        if (!audioBlob) return false;

        const formData = new FormData();

        formData.append("file", audioBlob, "voice-note.webm");

        set({ isSendingMedia: true });

        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },

 
      reactToMessage: async (messageId, emoji) => {
        try {
          const res = await axiosInstance.put(
            `/messages/reaction/${messageId}`,
            { emoji },
          );

          const updatedMessage = res.data;

          set((state) => ({
            messages: state.messages.map((msg) =>
              String(msg?._id || msg?.id) === String(messageId)
                ? updatedMessage
                : msg,
            ),
          }));
        } catch (error) {
          console.error("Failed to react:", error);

          toast.error(error.response?.data?.error || "Failed to react");
        }
      },

      
      deleteMessage: async (messageId) => {
        try {
          await axiosInstance.delete(`/messages/${messageId}`);

          set((state) => ({
            messages: state.messages.filter(
              (msg) => String(msg?._id || msg?.id) !== String(messageId),
            ),
          }));
        } catch (error) {
          console.error("Failed to delete message:", error);

          toast.error(
            error.response?.data?.error || "Failed to delete message",
          );
        }
      },

     
      markMessagesAsRead: async (peerId) => {
        if (!peerId) return;

        try {
          await axiosInstance.put(`/messages/read/${peerId}`);

          set((state) => ({
            conversations: state.conversations.map((conv) => {
              if (String(getPeerId(conv)) !== String(peerId)) {
                return conv;
              }

              return {
                ...conv,
                unreadCount: 0,
              };
            }),
          }));
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      },

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) return;

        socket.off("newMessage");
        socket.off("messageDeleted");
        socket.off("messageReacted");
        socket.off("messagesSeen");

        socket.on("newMessage", (newMessage) => {
          const currentUserId = useAuthStore.getState().authUser?._id;

          if (!newMessage?.senderId) return;

          if (String(newMessage.senderId) === String(currentUserId)) {
            return;
          }

          set((state) => {
            const senderId = String(newMessage.senderId);

            const incomingConversationId = newMessage.conversationId
              ? String(newMessage.conversationId)
              : null;

            const isCurrentConversation =
              incomingConversationId &&
              String(state.activeConversationId) === incomingConversationId;

            const conversations = state.conversations.map((conv) => {
              const peerId = getPeerId(conv);

              if (String(peerId) !== senderId) {
                return conv;
              }

              return {
                ...conv,

                lastMessage:
                  newMessage.text ||
                  (newMessage.image
                    ? "Image"
                    : newMessage.video
                      ? "Video"
                      : newMessage.audio
                        ? "Audio"
                        : "New message"),

                unreadCount: isCurrentConversation
                  ? 0
                  : Number(conv.unreadCount || 0) + 1,
              };
            });

            return {
              conversations,

          
              messages: isCurrentConversation
                ? [...state.messages, newMessage]
                : state.messages,
            };
          });
        });

      
        socket.on("messageDeleted", (updatedMessage) => {
          const messageId = updatedMessage._id || updatedMessage.id;

          set((state) => ({
            messages: state.messages.filter(
              (msg) => String(msg._id || msg.id) !== String(messageId),
            ),
          }));
        });

      
        socket.on("messageReacted", (updatedMessage) => {
          const messageId = updatedMessage._id || updatedMessage.id;

          set((state) => ({
            messages: state.messages.map((msg) =>
              String(msg._id || msg.id) === String(messageId)
                ? updatedMessage
                : msg,
            ),
          }));
        });

     
        socket.on("messagesSeen", ({ conversationId }) => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              String(msg.conversationId) === String(conversationId)
                ? {
                    ...msg,
                    isRead: true,
                  }
                : msg,
            ),
          }));
        });
      },

   
      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) return;

        socket.off("newMessage");
        socket.off("messageDeleted");
        socket.off("messageReacted");
        socket.off("messagesSeen");
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),

      openConversation: async (conversation) => {
        if (!conversation) return;

        const conversationId = getConversationId(conversation);

        const peer =
          conversation.peer ||
          conversation.recipient ||
          conversation.user ||
          conversation;

        const peerId =
          peer?._id || conversation.userId || getPeerId(conversation);

        if (!conversationId || !peerId) {
          console.warn("Invalid conversation:", conversation);
          return;
        }

      
        set({
          activeConversationId: conversationId,
          selectedUser: peer,
          sidebarTab: "chats",
        });

        await get().getMessages(peerId);

        await get().markMessagesAsRead(peerId);
      },
     

      openChatWithUser: async (user) => {
  if (!user?._id) return;

  const userId = String(user._id);

  const existingConversation = get().conversations.find(
    (conv) => String(getPeerId(conv)) === userId,
  );

  if (existingConversation) {
    await get().openConversation(existingConversation);
    return;
  }

  
  set({
    selectedUser: user,
    activeConversationId: null,
    sidebarTab: "chats",
    messages: [],
  });

  await get().getMessages(userId);

  await get().getConversations();

  const updatedConversation = get().conversations.find(
    (conv) => String(getPeerId(conv)) === userId,
  );

  if (updatedConversation) {
    await get().openConversation(updatedConversation);
  } else {
    set({
      selectedUser: user,
      activeConversationId: null,
      sidebarTab: "chats",
    });
  }

  await get().markMessagesAsRead(userId);
},


      setActiveConversationId: (conversationId) => {
        if (!conversationId) {
          set({
            activeConversationId: null,
            selectedUser: null,
          });

          return;
        }

        const conversation = get().conversations.find(
          (conv) => String(conv.conversationId) === String(conversationId),
        );

        const peer =
          conversation?.peer ||
          conversation?.recipient ||
          conversation?.user ||
          conversation ||
          null;

        set({
          activeConversationId: conversationId,
          selectedUser: peer,
        });
      },

      
      setSearchQuery: (searchQuery) => set({ searchQuery }),

    
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),

     
      setComposerText: (composerText) => set({ composerText }),

     
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      
      sendTypingStatus: (receiverId, isTyping) => {
        const socket = useAuthStore.getState().socket;

        if (!socket || !receiverId) return;

        socket.emit(isTyping ? "typing" : "stopTyping", {
          receiverId,
        });
      },

      toggleBlockUser: async (userId) => {
        try {
          const res = await axiosInstance.put(`/users/block/${userId}`);

          const updatedUser = res.data;

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              String(getPeerId(conv)) === String(userId)
                ? {
                    ...conv,
                    peer: {
                      ...conv.peer,
                      ...updatedUser,
                    },
                  }
                : conv,
            ),

            selectedUser:
              state.selectedUser &&
              String(state.selectedUser._id) === String(userId)
                ? {
                    ...state.selectedUser,
                    ...updatedUser,
                  }
                : state.selectedUser,
          }));

          toast.success(
            updatedUser.isBlocked
              ? "User blocked successfully"
              : "User unblocked successfully",
          );
        } catch (error) {
          toast.error(
            error.response?.data?.error || "Failed to update block status",
          );
        }
      },
    }),

    {
      name: "DARK-chat-storage",

      partialize: (state) => ({
        isSoundEnabled: state.isSoundEnabled,
      }),
    },
  ),
);
