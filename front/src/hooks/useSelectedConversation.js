// import { useMediaQuery } from "./useMediaQuery.js";
// import { formatMessageTime } from "../lib/utils.js";
// import { useChatStore } from "../Store/useChatStore.js";
// import { useAuthStore } from "../Store/useAuthStore.js";

// export function getInitials(name) {
//   if (!name || typeof name !== "string") return "";
//   return name
//     .split(" ")
//     .filter(Boolean)
//     .map((namePart) => namePart[0])
//     .join("");
// }

// function mapUserToConversation({ user, messages, authUser, onlineUsers }) {
//   const safeMessages = Array.isArray(messages) ? messages : [];
//   const mappedMessages = safeMessages.map((message) => ({
//     id: message?._id || message?.id,
//     role: String(message?.senderId) === String(authUser?._id) ? "me" : "them",
//     text: message?.text || "",
//     time: formatMessageTime(message?.createdAt),
//     imageUrl: message?.image || message?.imageUrl || null,
//     videoUrl: message?.video || message?.videoUrl || null,
//     audioUrl: message?.audio || message?.audioUrl || null,
//     audio: message?.audio || message?.audioUrl || null,
//     senderId: message?.senderId,
//     createdAt: message?.createdAt,
//     isRead: message?.isRead || false,
//   }));

//   const safeBlockedUsers = Array.isArray(authUser?.blockedUsers)
//     ? authUser.blockedUsers
//     : [];

//   const isBlocked =
//     Boolean(
//       safeBlockedUsers.some(
//         (blockedId) =>
//           String(typeof blockedId === "object" ? blockedId?._id : blockedId) ===
//           String(user?._id),
//       ),
//     ) || Boolean(user?.isBlocked);

//   const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];

//   return {
//     id: user?._id,
//     peer: {
//       name: user?.fullName,
//       subtitle: user?.email,
//       isOnline: safeOnlineUsers.includes(user?._id),
//       avatarUrl: user?.profilePic,
//       initials: getInitials(user?.fullName),
//       createdAt: user?.createdAt,
//       lastSeen: user?.lastSeen || user?.updatedAt,
//       isBlocked,
//     },
//     messages: mappedMessages,
//   };
// }

// export const useSelectedConversation = () => {
//   const activeConversationId = useChatStore(
//     (state) => state.activeConversationId,
//   );

//   const conversations = useChatStore((state) => state.conversations);
//   const users = useChatStore((state) => state.users);
//   const storeMessages = useChatStore((state) => state.messages);

//   const authUser = useAuthStore((state) => state.authUser);
//   const onlineUsers = useChatStore((state) => state.onlineUsers);

//   const isLargeScreen = window.innerWidth >= 1024;

//   const safeConversations = Array.isArray(conversations) ? conversations : [];
//   const safeUsers = Array.isArray(users) ? users : [];
//   const safeStoreMessages = Array.isArray(storeMessages) ? storeMessages : [];

//   const rawConv =
//     safeConversations.find(
//       (c) =>
//         String(c?._id || c?.id || c?.peer?._id || c?.peer?.id) ===
//         String(activeConversationId),
//     ) ||
//     safeUsers.find(
//       (u) => String(u?._id || u?.id) === String(activeConversationId),
//     );

//   if (!rawConv) {
//     return { activeConversation: null, activeConversationId, isLargeScreen };
//   }

//   const targetUser = rawConv.peer || rawConv;
//   const messagesList = rawConv.messages || safeStoreMessages;

//   const activeConversation = mapUserToConversation({
//     user: targetUser,
//     messages: messagesList,
//     authUser,
//     onlineUsers,
//   });

//   return { activeConversation, activeConversationId, isLargeScreen };
// };

// export const useSelectedConversation = () => {
//   const activeConversationId = useChatStore(
//     (state) => state.activeConversationId,
//   );
// const conversations = useChatStore((state) => state.conversations) || [];
// const users = useChatStore((state) => state.users) || [];
// const storeMessages = useChatStore((state) => state.messages) || [];

//   const isLargeScreen = window.innerWidth >= 1024;

//   const rawConv =
//     conversations.find(
//       (c) =>
//         String(c._id || c.id || c.peer?._id || c.peer?.id) ===
//         String(activeConversationId),
//     ) ||
//     users.find((u) => String(u._id || u.id) === String(activeConversationId));

//   if (!rawConv) {
//     return { activeConversation: null, activeConversationId, isLargeScreen };
//   }

//   const peer = rawConv.peer || rawConv;
//   const activeConversation = {
//     ...rawConv,
//     peer: {
//       ...peer,
//       name: peer.fullName || peer.name,
//       initials: (peer.fullName || peer.name || "U").slice(0, 2).toUpperCase(),
//     },
//     messages: storeMessages,
//   };

//   return { activeConversation, activeConversationId, isLargeScreen };
// };

import { useMediaQuery } from "./useMediaQuery.js";
import { formatMessageTime } from "../lib/utils.js";
import { useChatStore } from "../Store/useChatStore.js";
import { useAuthStore } from "../Store/useAuthStore.js";

export function getInitials(name) {
  if (!name || typeof name !== "string") return "";

  return name
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("");
}

function mapUserToConversation({
  user,
  messages,
  authUser,
  onlineUsers,
  conversationId,
}) {
  const safeMessages = Array.isArray(messages) ? messages : [];

  const mappedMessages = safeMessages.map((message) => ({
    id: message?._id || message?.id,

    role: String(message?.senderId) === String(authUser?._id) ? "me" : "them",

    text: message?.text || "",

    time: formatMessageTime(message?.createdAt),

    imageUrl: message?.image || message?.imageUrl || null,

    videoUrl: message?.video || message?.videoUrl || null,

    audioUrl: message?.audio || message?.audioUrl || null,

    audio: message?.audio || message?.audioUrl || null,

    senderId: message?.senderId,
    receiverId: message?.receiverId,

    createdAt: message?.createdAt,

    isRead: message?.isRead || false,
  }));

  const safeBlockedUsers = Array.isArray(authUser?.blockedUsers)
    ? authUser.blockedUsers
    : [];

  const isBlocked =
    Boolean(
      safeBlockedUsers.some(
        (blockedId) =>
          String(typeof blockedId === "object" ? blockedId?._id : blockedId) ===
          String(user?._id),
      ),
    ) || Boolean(user?.isBlocked);

  const safeOnlineUsers = Array.isArray(onlineUsers)
    ? onlineUsers.map((id) => String(id))
    : [];

  return {
    // ده Conversation ID
    id: conversationId,

    // ده الشخص الآخر
    peer: {
      _id: user?._id,
      name: user?.fullName || user?.name,
      subtitle: user?.email,
      isOnline: safeOnlineUsers.includes(String(user?._id)),
      avatarUrl: user?.profilePic || user?.avatarUrl,
      initials: getInitials(user?.fullName || user?.name),
      createdAt: user?.createdAt,
      lastSeen: user?.lastSeen || user?.updatedAt,
      isBlocked,
    },

    messages: mappedMessages,
  };
}

export const useSelectedConversation = () => {
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  const conversations = useChatStore((state) => state.conversations);

  const users = useChatStore((state) => state.users);

  const storeMessages = useChatStore((state) => state.messages);

  const authUser = useAuthStore((state) => state.authUser);

  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const isLargeScreen = window.innerWidth >= 1024;

  const safeConversations = Array.isArray(conversations) ? conversations : [];

  const safeUsers = Array.isArray(users) ? users : [];

  const safeStoreMessages = Array.isArray(storeMessages) ? storeMessages : [];

  /*
   * IMPORTANT
   *
   * activeConversationId = Conversation ID
   *
   * لذلك نبحث في conversationId
   */
  const rawConv = safeConversations.find(
    (conversation) =>
      String(conversation?.conversationId) === String(activeConversationId),
  );

  if (!rawConv) {
    return {
      activeConversation: null,
      activeConversationId,
      isLargeScreen,
    };
  }

  /*
   * Backend conversations are flattened:
   *
   * {
   *   _id: USER_ID,
   *   fullName: "...",
   *   profilePic: "...",
   *   unreadCount: 0,
   *   lastMessage: "...",
   *   conversationId: CONVERSATION_ID
   * }
   *
   * لذلك rawConv نفسه هو الـ peer.
   */
  const targetUser = rawConv.peer || rawConv;

  const messagesList = safeStoreMessages;

  const activeConversation = mapUserToConversation({
    user: targetUser,
    messages: messagesList,
    authUser,
    onlineUsers,
    conversationId: rawConv.conversationId,
  });

  return {
    activeConversation,
    activeConversationId,
    isLargeScreen,
  };
};
