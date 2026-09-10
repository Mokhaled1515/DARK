// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios.js";
// import toast from "react-hot-toast";
// import { useAuthStore } from "./useAuthStore.js";
// import { useChatStore } from "./useChatStore.js";

// export const useFriendStore = create((set, get) => ({
//   friends: [],
//   pendingRequests: [],
//   searchResults: [],
//   isLoadingFriends: false,
//   isLoadingRequests: false,
//   isSearching: false,

//   getFriends: async () => {
//     set({ isLoadingFriends: true });
//     try {
//       const res = await axiosInstance.get("/friends");
//       set({ friends: res.data });
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to fetch friends");
//     } finally {
//       set({ isLoadingFriends: false });
//     }
//   },

//   getPendingRequests: async () => {
//     set({ isLoadingRequests: true });
//     try {
//       const res = await axiosInstance.get("/friends/requests");
//       set({ pendingRequests: res.data });
//     } catch (error) {
//       console.error("Error fetching requests:", error);
//     } finally {
//       set({ isLoadingRequests: false });
//     }
//   },

//   searchUsers: async (query) => {
//     if (!query.trim()) {
//       set({ searchResults: [] });
//       return;
//     }
//     set({ isSearching: true });
//     try {
//       const res = await axiosInstance.get(`/auth/search?query=${query}`);
//       set({ searchResults: res.data });
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Search failed");
//     } finally {
//       set({ isSearching: false });
//     }
//   },

//   sendFriendRequest: async (receiverId) => {
//     try {
//       const res = await axiosInstance.post("/friends/request", { receiverId });
//       toast.success("Friend request sent!");
//       set({
//         searchResults: get().searchResults.filter((u) => u._id !== receiverId),
//       });
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to send request");
//     }
//   },

//   // acceptFriendRequest: async (requestId) => {
//   //   try {
//   //     const res = await axiosInstance.post(`/friends/accept/${requestId}`);
//   //     toast.success("Friend request accepted!");

//   //     const newFriend = res.data.friend;

//   //     set((state) => ({
//   //       pendingRequests: state.pendingRequests.filter(
//   //         (r) => r._id !== requestId,
//   //       ),
//   //       friends: newFriend ? [...state.friends, newFriend] : state.friends,
//   //     }));

//   //     // 🟢 1. للشخص الذي قبل الطلب: فتح الشات تلقائياً مع الصديق الجديد
//   //     if (newFriend) {
//   //       useChatStore.getState().setSelectedUser(newFriend);
//   //     }
//   //   } catch (error) {
//   //     toast.error(error.response?.data?.message || "Failed to accept request");
//   //   }
//   // },
//   acceptFriendRequest: async (requestId) => {
//     try {
//       const res = await axiosInstance.post(`/friends/accept/${requestId}`);

//       toast.success("Friend request accepted!");

//       const newFriend = res.data.friend;

//       set((state) => ({
//         pendingRequests: state.pendingRequests.filter(
//           (r) => r._id !== requestId,
//         ),

//         friends: newFriend
//           ? state.friends.some((f) => f._id === newFriend._id)
//             ? state.friends
//             : [...state.friends, newFriend]
//           : state.friends,

//         // لو الشخص كان ظاهر في البحث، شيله فوراً
//         searchResults: newFriend
//           ? state.searchResults.filter((u) => u._id !== newFriend._id)
//           : state.searchResults,
//       }));

//       if (newFriend) {
//         const chatStore = useChatStore.getState();

//         await chatStore.getConversations();

//         chatStore.openChatWithUser(newFriend);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to accept request");
//     }
//   },

//   rejectFriendRequest: async (requestId) => {
//     try {
//       await axiosInstance.delete(`/friends/reject/${requestId}`);
//       set((state) => ({
//         pendingRequests: state.pendingRequests.filter(
//           (r) => r._id !== requestId,
//         ),
//       }));
//       toast.success("Request rejected");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to reject request");
//     }
//   },

//   removeFriend: async (friendId) => {
//     try {
//       await axiosInstance.delete(`/friends/remove/${friendId}`);
//       set((state) => ({
//         friends: state.friends.filter((f) => f._id !== friendId),
//       }));
//       toast.success("Friend removed");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to remove friend");
//     }
//   },

//   subscribeToFriendEvents: () => {
//     const socket = useAuthStore.getState().socket;
//     if (!socket) return;

//     socket.on("newFriendRequest", (newRequest) => {
//       set((state) => ({
//         pendingRequests: [newRequest, ...state.pendingRequests],
//       }));
//       toast.custom((t) => (
//         <div className="bg-base-100 p-4 rounded-xl shadow-lg border border-primary flex items-center gap-3">
//           <img
//             src={newRequest.sender.profilePic || "/avatar.png"}
//             className="w-10 h-10 rounded-full object-cover"
//             alt=""
//           />
//           <div>
//             <p className="font-bold text-sm">{newRequest.sender.fullName}</p>
//             <p className="text-xs opacity-70">sent you a friend request!</p>
//           </div>
//         </div>
//       ));
//     });

//     //   socket.on("friendRequestAccepted", async ({ friend, welcomeMsg }) => {
//     //   // 1. إضافة الصديق الجديد للقائمة
//     //   set((state) => ({
//     //     friends: [...state.friends, friend],
//     //   }));

//     //   const chatStore = useChatStore.getState();

//     //   // 2. تحديث قائمة المحادثات (Sidebar)
//     //   if (chatStore.getConversations) {
//     //     await chatStore.getConversations();
//     //   }

//     //   // 3. لو رسالة الترحيب موجودة، ضيفها للرسائل الحالية أو حدث الـ store فوراً
//     //   if (welcomeMsg) {
//     //     const activeConvId = chatStore.activeConversationId;
//     //     const convId = activeConvId?._id || activeConvId;

//     //     // لو هو فاتح الشات فعلاً مع الشخص ده، ضيف رسالة الترحيب للرسائل
//     //     if (convId === welcomeMsg.senderId || convId === welcomeMsg.receiverId) {
//     //       chatStore.setMessages([...chatStore.messages, welcomeMsg]);
//     //     }
//     //   }

//     //   toast.success(`${friend.fullName} accepted your friend request! 🎉`);
//     // });
//     socket.on("friendRequestAccepted", async ({ friend }) => {
//       if (!friend) return;

//       // ضيفه Friends ومتكرروش
//       set((state) => ({
//         friends: state.friends.some((f) => f._id === friend._id)
//           ? state.friends
//           : [...state.friends, friend],

//         // لو كان ظاهر Request Sent في Add شيله
//         searchResults: state.searchResults.filter(
//           (user) => user._id !== friend._id,
//         ),

//         // Safety لو موجود في pending
//         pendingRequests: state.pendingRequests.filter(
//           (request) =>
//             request.sender?._id !== friend._id &&
//             request.receiver?._id !== friend._id,
//         ),
//       }));

//       const chatStore = useChatStore.getState();

//       await chatStore.getConversations();

//       // افتح الشات تلقائياً للشخص الذي أرسل الطلب أيضاً
//       chatStore.openChatWithUser(friend);

//       toast.success(`${friend.fullName} accepted your friend request! 🎉`);
//     });
//   },

//   unsubscribeFromFriendEvents: () => {
//     const socket = useAuthStore.getState().socket;
//     if (!socket) return;
//     socket.off("newFriendRequest");
//     socket.off("friendRequestAccepted");
//   },
// }));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";
import { useChatStore } from "./useChatStore.js";

export const useFriendStore = create((set, get) => ({
  friends: [],
  pendingRequests: [],
  searchResults: [],

  isLoadingFriends: false,
  isLoadingRequests: false,
  isSearching: false,

  sentRequests: [],

  getFriends: async () => {
    set({ isLoadingFriends: true });

    try {
      const res = await axiosInstance.get("/friends");

      set({
        friends: Array.isArray(res.data) ? res.data : [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch friends");
    } finally {
      set({ isLoadingFriends: false });
    }
  },

  getPendingRequests: async () => {
    set({ isLoadingRequests: true });

    try {
      const res = await axiosInstance.get("/friends/requests");

      set({
        pendingRequests: Array.isArray(res.data) ? res.data : [],
      });
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      set({ isLoadingRequests: false });
    }
  },

  searchUsers: async (query) => {
    if (!query?.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });

    try {
      const res = await axiosInstance.get(
        `/auth/search?query=${encodeURIComponent(query.trim())}`,
      );

      const users = Array.isArray(res.data) ? res.data : [];

      const friends = get().friends || [];
      const pendingRequests = get().pendingRequests || [];
      const sentRequests = get().sentRequests || [];

      const friendIds = new Set(friends.map((friend) => String(friend._id)));

      const incomingPendingIds = new Set(
        pendingRequests.map((request) =>
          String(request.sender?._id || request.sender),
        ),
      );

      const outgoingPendingIds = new Set(sentRequests.map((id) => String(id)));

      /*
       * IMPORTANT:
       * Friends لا يظهروا في Add.
       */
      const filteredUsers = users.filter((user) => {
        const userId = String(user._id);

        if (friendIds.has(userId)) {
          return false;
        }

        return true;
      });

      set({
        searchResults: filteredUsers.map((user) => ({
          ...user,

          isFriend: friendIds.has(String(user._id)),

          hasIncomingRequest: incomingPendingIds.has(String(user._id)),

          hasOutgoingRequest: outgoingPendingIds.has(String(user._id)),
        })),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      set({ isSearching: false });
    }
  },

  sendFriendRequest: async (receiverId) => {
    try {
      await axiosInstance.post("/friends/request", {
        receiverId,
      });

      set((state) => ({
        sentRequests: [...state.sentRequests, receiverId],

        searchResults: state.searchResults.map((user) =>
          String(user._id) === String(receiverId)
            ? {
                ...user,
                hasOutgoingRequest: true,
              }
            : user,
        ),
      }));

      toast.success("Friend request sent!");

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");

      return false;
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      const res = await axiosInstance.post(`/friends/accept/${requestId}`);

      const newFriend = res.data.friend;

      set((state) => ({
        pendingRequests: state.pendingRequests.filter(
          (request) => String(request._id) !== String(requestId),
        ),

        friends: newFriend
          ? state.friends.some(
              (friend) => String(friend._id) === String(newFriend._id),
            )
            ? state.friends
            : [...state.friends, newFriend]
          : state.friends,

        searchResults: newFriend
          ? state.searchResults.filter(
              (user) => String(user._id) !== String(newFriend._id),
            )
          : state.searchResults,

        sentRequests: newFriend
          ? state.sentRequests.filter(
              (id) => String(id) !== String(newFriend._id),
            )
          : state.sentRequests,
      }));

      /*
       * مهم جدًا:
       *
       * الباك هو اللي عمل Conversation.
       * إحنا فقط نجيبها من السيرفر.
       */
      if (newFriend) {
        const chatStore = useChatStore.getState();

        await chatStore.getConversations();

        await chatStore.openChatWithUser(newFriend);
      }

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");

      return false;
    }
  },

  rejectFriendRequest: async (requestId) => {
    try {
      await axiosInstance.delete(`/friends/reject/${requestId}`);

      set((state) => ({
        pendingRequests: state.pendingRequests.filter(
          (request) => String(request._id) !== String(requestId),
        ),
      }));

      toast.success("Request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  },

  removeFriend: async (friendId) => {
    try {
      await axiosInstance.delete(`/friends/remove/${friendId}`);

      set((state) => ({
        friends: state.friends.filter(
          (friend) => String(friend._id) !== String(friendId),
        ),

        searchResults: state.searchResults.filter(
          (user) => String(user._id) !== String(friendId),
        ),
      }));

      /*
       * بعد إزالة الصداقة، نحدث المحادثات.
       */
      await useChatStore.getState().getConversations();

      toast.success("Friend removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    }
  },

  subscribeToFriendEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("newFriendRequest");

    socket.off("friendRequestAccepted");
    socket.off("friendRequestRejected");
    socket.on("newFriendRequest", (newRequest) => {
      set((state) => {
        const alreadyExists = state.pendingRequests.some(
          (request) => String(request._id) === String(newRequest._id),
        );

        if (alreadyExists) {
          return state;
        }

        return {
          pendingRequests: [newRequest, ...state.pendingRequests],
        };
      });

      toast.custom((t) => (
        <div className="bg-base-100 p-4 rounded-xl shadow-lg border border-primary flex items-center gap-3">
          <img
            src={newRequest.sender?.profilePic || "/avatar.png"}
            className="w-10 h-10 rounded-full object-cover"
            alt=""
          />

          <div>
            <p className="font-bold text-sm">{newRequest.sender?.fullName}</p>

            <p className="text-xs opacity-70">sent you a friend request!</p>
          </div>
        </div>
      ));
    });

    /*
     * الشخص الذي أرسل الطلب
     * يستقبل هذا الحدث عندما الطرف الآخر يقبل.
     */
    socket.on("friendRequestAccepted", async ({ friend }) => {
      if (!friend) return;

      set((state) => ({
        friends: state.friends.some((f) => String(f._id) === String(friend._id))
          ? state.friends
          : [...state.friends, friend],

        searchResults: state.searchResults.filter(
          (user) => String(user._id) !== String(friend._id),
        ),

        pendingRequests: state.pendingRequests.filter(
          (request) =>
            String(request.sender?._id || request.sender) !==
            String(friend._id),
        ),

        sentRequests: state.sentRequests.filter(
          (id) => String(id) !== String(friend._id),
        ),
      }));

      const chatStore = useChatStore.getState();

      /*
       * نجيب الـ Conversation الحقيقية
       * التي أنشأها الباك.
       */
      await chatStore.getConversations();

      /*
       * نفتح الشات عند الشخص الذي
       * أرسل الطلب أيضًا.
       */
      await chatStore.openChatWithUser(friend);

      toast.success(`${friend.fullName} accepted your friend request! 🎉`);
    });
    socket.on("friendRequestRejected", ({ senderId, rejectedBy }) => {
      if (!senderId) return;

      set((state) => ({
        sentRequests: state.sentRequests.filter(
          (id) => String(id) !== String(senderId),
        ),

        searchResults: state.searchResults.map((user) =>
          String(user._id) === String(senderId)
            ? {
                ...user,
                hasOutgoingRequest: false,
              }
            : user,
        ),
      }));

      toast.error(
        `${rejectedBy?.fullName || "User"} rejected your friend request.`,
      );
    });
  },

  unsubscribeFromFriendEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;
    socket.off("newFriendRequest");
    socket.off("friendRequestAccepted");
    socket.off("friendRequestRejected");
  },
}));
