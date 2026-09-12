import { useWallpaper } from "../context/wallpaper.js";
import { useChatStore } from "../Store/useChatStore.js";
import { useFriendStore } from "../Store/useFriendStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation.js";
import { useEffect } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatContainer from "../components/ChatContainer";
import { useAuthStore } from "../Store/useAuthStore.js";

function ChatPage() {
  const { frameStyle } = useWallpaper();
  const getConversations = useChatStore((state) => state.getConversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const getUsers = useChatStore((state) => state.getUsers);
  const subscribeToMessages = useChatStore(
    (state) => state.subscribeToMessages,
  );
  const unsubscribeFromMessages = useChatStore(
    (state) => state.unsubscribeFromMessages,
  );

  const getFriends = useFriendStore((state) => state.getFriends);
  const getPendingRequests = useFriendStore(
    (state) => state.getPendingRequests,
  );
  const subscribeToFriendEvents = useFriendStore(
    (state) => state.subscribeToFriendEvents,
  );
  const unsubscribeFromFriendEvents = useFriendStore(
    (state) => state.unsubscribeFromFriendEvents,
  );

  const { activeConversationId, isLargeScreen } = useSelectedConversation();

  useEffect(() => {
    getUsers();
    getConversations();
    getFriends();
    getPendingRequests();

    subscribeToFriendEvents();
    return () => {
      unsubscribeFromFriendEvents();
    };
  }, [
    getConversations,
    getUsers,
    getFriends,
    getPendingRequests,
    subscribeToFriendEvents,
    unsubscribeFromFriendEvents,
  ]);

  
  useEffect(() => {
    if (!activeConversationId) return;
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("markMessagesAsSeen", {
        conversationId: activeConversationId,
      });
    }
  }, [activeConversationId]);

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden p-2 sm:p-3 md:p-8"
      style={frameStyle}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border border-border bg-background text-foreground">
        <ChatSidebar />
        <div
          className={`flex-1 flex-col overflow-hidden ${
            !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          <ChatContainer />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
