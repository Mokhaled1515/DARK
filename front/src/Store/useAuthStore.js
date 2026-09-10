import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js"; // 👈 استدعاء useChatStore
import toast from "react-hot-toast";
const baseURL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket(res.data);
    } catch (error) {
      console.error("Error in CheckAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", formData);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  clearAuth: () => {
    set({ authUser: null, isCheckingAuth: false, onlineUsers: [] });
    get().disconnectSocket();
  },

  connectSocket: (user) => {
    if (!user || get().socket?.connected) return;

    const socket = io(baseURL, { query: { userId: user._id } });
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      const safeUserIds = Array.isArray(userIds) ? userIds : [];
      const stringifiedUserIds = safeUserIds.map((id) => String(id));
      // console.log("Online users:", safeUserIds);
      set({ onlineUsers: stringifiedUserIds });
    });

    socket.on("userOffline", ({ userId, lastSeen }) => {
      useChatStore.getState().updateUserLastSeen?.(userId, lastSeen);
    });
  },


  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },
}));
