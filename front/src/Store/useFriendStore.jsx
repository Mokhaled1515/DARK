
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

      if (newFriend) {
        const chatStore = useChatStore.getState();

        await chatStore.getConversations();

        const conversations = useChatStore.getState().conversations;

        const conversation =
          conversations.find(
            (c) =>
              String(c._id) === String(res.data.conversation?._id) ||
              String(c.conversationId) === String(res.data.conversation?._id),
          ) || res.data.conversation;

        if (conversation && typeof chatStore.openConversation === "function") {
          await chatStore.openConversation(conversation);
        }
      }

      return true;
    } catch (error) {
      console.error("Accept friend request error:", error);

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

    
    socket.on(
      "friendRequestAccepted",
      async ({ friend, conversation: acceptedConversation }) => {
        if (!friend) return;

        set((state) => ({
          friends: state.friends.some(
            (f) => String(f._id) === String(friend._id),
          )
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

        await chatStore.getConversations();

        const conversations = useChatStore.getState().conversations;

        const conversation =
          conversations.find(
            (c) =>
              String(c._id) === String(acceptedConversation?._id) ||
              String(c.conversationId) === String(acceptedConversation?._id),
          ) || acceptedConversation;

        if (conversation && typeof chatStore.openConversation === "function") {
          await chatStore.openConversation(conversation);
        }

        toast.success(`${friend.fullName} accepted your friend request! 🎉`);
      },
    );

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
