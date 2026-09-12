import React, { useState, useEffect } from "react";
import {
  getInitials,
  useSelectedConversation,
} from "../../hooks/useSelectedConversation.js";
import { useAuthStore } from "../../Store/useAuthStore.js";
import { useChatStore } from "../../Store/useChatStore.js";
import { useFriendStore } from "../../Store/useFriendStore";
import { APP_NAME, AppLogo } from "../AppLogo";
import { UserButton } from "@clerk/clerk-react";
import { SearchField, Tabs, Button, Avatar } from "@heroui/react";
import {
  MessageSquareIcon,
  UsersIcon,
  UserPlusIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { ConversationRow } from "./ConversationRow";

function mapUserForList(item, onlineUsers, currentUserId) {
  const peer = item?.peer || item?.recipient || item;

  const peerId = String(
    peer?._id || peer?.id || item?._id || item?.userId || "",
  );

  const conversationId = item?.conversationId
    ? String(item.conversationId)
    : null;

  const normalizedOnlineUsers = (onlineUsers || []).map((id) => String(id));

  const isOnline = Boolean(peerId && normalizedOnlineUsers.includes(peerId));

  const name =
    peer?.fullName || peer?.name || item?.fullName || item?.name || "Unknown";

  const avatarUrl =
    peer?.profilePic ||
    peer?.avatarUrl ||
    item?.profilePic ||
    item?.avatarUrl ||
    "";

  const unreadMap = item?.unreadCounts || {};

  const unreadCount = currentUserId
    ? (unreadMap[currentUserId] ??
      unreadMap.get?.(currentUserId) ??
      item?.unreadCount ??
      0)
    : (item?.unreadCount ?? 0);

  return {
    ...item,
    id: conversationId || peerId,
    conversationId,
    userId: peerId,
    name,
    avatarUrl,
    initials: getInitials(name),
    isOnline,
    peer: {
      ...peer,
      _id: peerId,
      name,
      avatarUrl,
      initials: getInitials(name),
      isOnline,
    },

    unreadCount: Number(unreadCount),
    lastMessage: item?.lastMessage || "",
  };
}

function ChatSidebar() {
  const conversations = useChatStore((state) => state.conversations);
  const getUsers = useChatStore((state) => state.getUsers);
  const getConversations = useChatStore((state) => state.getConversations);
  const markMessagesAsRead = useChatStore((state) => state.markMessagesAsRead);
  const subscribeToMessages = useChatStore(
    (state) => state.subscribeToMessages,
  );
  const unsubscribeFromMessages = useChatStore(
    (state) => state.unsubscribeFromMessages,
  );

  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);
  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );

  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const authUser = useAuthStore((state) => state.authUser);
  const socket = useAuthStore((state) => state.socket);

  const friends = useFriendStore((state) => state.friends);
 
  const pendingRequests = useFriendStore((state) => state.pendingRequests);
  const getPendingRequests = useFriendStore(
    (state) => state.getPendingRequests,
  );
  const subscribeToFriendEvents = useFriendStore(
    (state) => state.subscribeToFriendEvents,
  );
  const unsubscribeFromFriendEvents = useFriendStore(
    (state) => state.unsubscribeFromFriendEvents,
  );

  const searchResults = useFriendStore((state) => state.searchResults);

  const searchUsers = useFriendStore((state) => state.searchUsers);
  const sendFriendRequest = useFriendStore((state) => state.sendFriendRequest);
  const rejectFriendRequest = useFriendStore(
    (state) => state.rejectFriendRequest,
  );
  const acceptFriendRequest = useFriendStore(
    (state) => state.acceptFriendRequest,
  );

  const sentRequests = useFriendStore((state) => state.sentRequests);
  const [loadingUserId, setLoadingUserId] = useState(null);

  const { activeConversationId, isLargeScreen } = useSelectedConversation();


  useEffect(() => {
    const currentUserId = authUser?._id || authUser?.id;

    if (!currentUserId || !socket) return;

   
    getConversations();
    getUsers();

   
    getPendingRequests();

   
    subscribeToMessages();
    subscribeToFriendEvents();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromFriendEvents();
    };
  }, [
    authUser,
    socket,
    getConversations,
    getUsers,
    getPendingRequests,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToFriendEvents,
    unsubscribeFromFriendEvents,
  ]);

  const currentUserId = authUser?._id || authUser?.id;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const safeFriends = Array.isArray(friends) ? friends : [];

  const conversationUsers = safeConversations.map((item) =>
    mapUserForList(item, onlineUsers, currentUserId),
  );
  const friendUsers = safeFriends.map((item) =>
    mapUserForList(item, onlineUsers, currentUserId),
  );

  const filteredConversations = normalizedSearchQuery
    ? conversationUsers.filter((conversation) =>
        conversation.peer.name.toLowerCase().includes(normalizedSearchQuery),
      )
    : conversationUsers;

  const filteredFriends = normalizedSearchQuery
    ? friendUsers.filter((user) =>
        user.name.toLowerCase().includes(normalizedSearchQuery),
      )
    : friendUsers;

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (sidebarTab === "add") {
      searchUsers(value);
    }
  };

  const handleSendRequest = async (userId) => {
    setLoadingUserId(userId);

    try {
      await sendFriendRequest(userId);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleSelectFriend = async (userId) => {
    try {
      const chatStore = useChatStore.getState();

      const conversation = chatStore.conversations.find(
        (conv) =>
          String(
            conv?.peer?._id ||
              conv?.recipient?._id ||
              conv?.user?._id ||
              conv?.userId,
          ) === String(userId),
      );

      if (conversation) {
        await chatStore.openConversation(conversation);
      } else {
        await chatStore.openChatWithUser({
          _id: userId,
        });
      }
    } catch (error) {
      console.error("Failed to open chat:", error);
    }
  };

  const handleAcceptRequest = async (req) => {
    try {
      await acceptFriendRequest(req._id);

      setSidebarTab("chats");
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };
  return (
    <aside
      className={`w-full shrink-0 flex-col overflow-hidden border-r border-border lg:w-72 ${
        !isLargeScreen && activeConversationId ? "hidden lg:flex" : "flex"
      }`}
    >
      <div className="shrink-0 border-b border-border px-2 pb-2 pt-2.5 sm:px-3 sm:pt-3">
        <div className="flex items-center gap-2 px-0.5 sm:gap-2.5 sm:px-1">
          <AppLogo
            size={32}
            className="size-8 shrink-0 rounded-[9px] sm:size-8.5"
            alt=""
          />
          <p className="flex-1 truncate text-lg font-bold tracking-tight sm:text-[22px]">
            {APP_NAME}
          </p>

          <div className="flex items-center">
            <UserButton
              afterSignOutUrl="/auth"
              appearance={{
                elements: {
                  avatarBox: "size-8",
                },
              }}
            />
          </div>
        </div>
      </div>

      <Tabs
        selectedKey={sidebarTab}
        onSelectionChange={(key) => {
          const tabKey = String(key);
          setSidebarTab(tabKey);
          if (tabKey === "add" && searchQuery) {
            searchUsers(searchQuery);
          }
        }}
        variant="secondary"
        className="flex flex-1 flex-col overflow-y-auto"
      >
        <div className="shrink-0 border-b border-border px-3 pb-2 pt-2">
          <SearchField
            fullWidth
            variant="secondary"
            className="w-full"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label={
              sidebarTab === "add" ? "Search new users" : "Search conversations"
            }
          >
            <SearchField.Group className="rounded-xl">
              <SearchField.SearchIcon />
              <SearchField.Input
                placeholder={
                  sidebarTab === "add" ? "Search new users..." : "Search"
                }
                aria-label={
                  sidebarTab === "add"
                    ? "Search new users"
                    : "Search conversations"
                }
              />
              {searchQuery ? <SearchField.ClearButton /> : null}
            </SearchField.Group>
          </SearchField>
        </div>

        <Tabs.ListContainer className="shrink-0 border-b border-border px-2 pb-2 pt-1">
          <Tabs.List className="w-full gap-0.5">
            <Tabs.Tab id="chats" className="flex-1 justify-center gap-1.5">
              <MessageSquareIcon className="size-3.5 opacity-80" aria-hidden />
              Chats
            </Tabs.Tab>
            <Tabs.Tab id="users" className="flex-1 justify-center gap-1.5">
              <UsersIcon className="size-3.5 opacity-80" aria-hidden />
              Friends
            </Tabs.Tab>
          
            <Tabs.Tab
              id="add"
              className="relative flex-1 justify-center gap-1.5"
            >
              <UserPlusIcon className="size-3.5 opacity-80" aria-hidden />
              Add
           
              {pendingRequests.length > 0 && (
                <span
                  className="
      absolute -top-0.5 -right-0.5
      flex h-5 min-w-5
      items-center justify-center
      rounded-full
      bg-green-500
      px-1
      text-[10px]
      font-bold
      leading-none
      text-white
      shadow-sm
    "
                >
                  {pendingRequests.length > 99 ? "99+" : pendingRequests.length}
                </span>
              )}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel
          id="chats"
          className="flex-1 overflow-x-hidden overflow-y-auto outline-none"
        >
          {filteredConversations.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No conversations match your search.
            </p>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                user={conversation}
                selected={conversation.id === activeConversationId}
                onSelect={async () => {
                  const chatStore = useChatStore.getState();
                  await chatStore.openConversation(conversation);
                }}
              />
            ))
          )}
        </Tabs.Panel>

        <Tabs.Panel
          id="users"
          className="flex-1 overflow-x-hidden overflow-y-auto outline-none"
        >
          {filteredFriends.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No friends yet.
            </p>
          ) : (
            filteredFriends.map((user) => (
              <ConversationRow
                key={user.id}
                user={user}
                selected={user.id === activeConversationId}
                onSelect={() => handleSelectFriend(user.id)}
              />
            ))
          )}
        </Tabs.Panel>

        <Tabs.Panel
          id="add"
          className="flex-1 overflow-x-hidden overflow-y-auto outline-none p-2 space-y-4"
        >
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted px-2 uppercase tracking-wider">
                Pending Requests
              </p>
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={req.sender?.profilePic}
                      fallback={req.sender?.fullName?.[0]}
                      className="size-8"
                    />
                    <span className="text-sm font-medium truncate max-w-[100px]">
                      {req.sender?.fullName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      isIconOnly
                      color="success"
                      variant="flat"
                      className="size-8 min-w-8 rounded-lg"
                      aria-label="Accept friend request"
                      onClick={() => handleAcceptRequest(req)}
                    >
                      <CheckIcon className="size-4" />
                    </Button>

                    <Button
                      size="sm"
                      isIconOnly
                      color="danger"
                      variant="flat"
                      className="size-8 min-w-8 rounded-lg"
                      aria-label="Reject friend request"
                      onClick={() => rejectFriendRequest(req._id)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted px-2 uppercase tracking-wider">
              Find People
            </p>
            {searchResults.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted">
                Search by name or email above.
              </p>
            ) : (
              searchResults.map((user) => {
                const isFriend = friends.some(
                  (friend) => String(friend._id) === String(user._id),
                );

                const isSent = sentRequests.some(
                  (id) => String(id) === String(user._id),
                );

                const isIncomingRequest = pendingRequests.some(
                  (request) =>
                    String(request.sender?._id || request.sender) ===
                    String(user._id),
                );
                const isLoading = loadingUserId === user._id;

                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-2.5 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar
                        src={user?.profilePic}
                        fallback={user?.fullName?.[0] || "U"}
                        className="size-10 shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user.fullName}
                        </p>

                        {user.email && (
                          <p className="truncate text-xs text-muted">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={
                        isSent || isIncomingRequest ? "flat" : "secondary"
                      }
                      isDisabled={isSent || isIncomingRequest || isLoading}
                      isLoading={isLoading}
                      onClick={() => handleSendRequest(user._id)}
                      className="shrink-0 rounded-lg px-3 font-medium"
                    >
                      {isSent
                        ? "Request Sent"
                        : isIncomingRequest
                          ? "Requested"
                          : "Add"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </aside>
  );
}

export default ChatSidebar;
