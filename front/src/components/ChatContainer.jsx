import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  X,
  Mail,
  Calendar,
  ShieldCheck,
  Ban,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useChatStore } from "../Store/useChatStore.js";
import { useSelectedConversation } from "../hooks/useSelectedConversation.js";
import { formatLastSeen } from "../lib/utils.js";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import useScrollToBottom from "../hooks/useScrollToBottom.js";
import { useAuthStore } from "../Store/useAuthStore.js";
import ImageModal from "./chat/ImageModal"; // استيراد مودال الصور

function getBlockCooldownInfo(blockedAt) {
  if (!blockedAt) return { canUnblock: true, cooldownText: "" };

  const COOLDOWN_HOURS = 24;
  const blockTime = new Date(blockedAt).getTime();
  const currentTime = Date.now();
  const hoursPassed = (currentTime - blockTime) / (1000 * 60 * 60);

  if (hoursPassed >= COOLDOWN_HOURS) {
    return { canUnblock: true, cooldownText: "" };
  }

  const remainingHours = Math.floor(COOLDOWN_HOURS - hoursPassed);
  const remainingMinutes = Math.floor(
    ((COOLDOWN_HOURS - hoursPassed) % 1) * 60,
  );

  const cooldownText =
    remainingHours > 0
      ? `Unblock available in ${remainingHours} hour${remainingHours > 1 ? "s" : ""} and ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`
      : `Unblock available in ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;

  return { canUnblock: false, cooldownText };
}

function ChatContainer() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { activeConversation, activeConversationId, isLargeScreen } =
    useSelectedConversation();

  const storeMessages = useChatStore((state) => state.messages);
  const markMessagesAsRead = useChatStore((state) => state.markMessagesAsRead);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const users = useChatStore((state) => state.users || []);
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );

  const toggleBlockUser = useChatStore((state) => state.toggleBlockUser);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);

  const messagesList = Array.isArray(storeMessages)
    ? storeMessages
    : Array.isArray(activeConversation?.messages)
      ? activeConversation.messages
      : [];

  const lastMessageId =
    messagesList[messagesList.length - 1]?.id ||
    messagesList[messagesList.length - 1]?._id;

  const messagesRef = useScrollToBottom(activeConversationId, lastMessageId);

  // useEffect(() => {
  //   const convId = activeConversationId?._id || activeConversationId;
  //   if (convId) {
  //     markMessagesAsRead(convId);
  //   }
  // }, [activeConversationId, markMessagesAsRead]);

  // useEffect(() => {
  //   const peerId = activeConversation?.peer?._id || selectedUser?._id;

  //   if (peerId) {
  //     markMessagesAsRead(peerId);
  //   }
  // }, [
  //   activeConversationId,
  //   activeConversation?.peer?._id,
  //   selectedUser?._id,
  //   markMessagesAsRead,
  // ]);

  if (!activeConversation) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            WELCOME IN DARK
          </h2>

          <p className="mt-1 text-sm text-muted">
            Choose a conversation to start chatting.
          </p>
        </div>
      </div>
    );
  }

  const peerId = String(
    activeConversation.peer._id || activeConversation.peer.id || "",
  );
  const foundInUsers = users.find((u) => String(u._id || u.id) === peerId);

  const peer = {
    ...activeConversation.peer,
    ...(foundInUsers || {}),
    ...(selectedUser && String(selectedUser._id || selectedUser.id) === peerId
      ? selectedUser
      : {}),
  };

  const rawLastSeen = peer.lastSeen || peer.updatedAt;

  const normalizedOnlineUsers = Array.isArray(onlineUsers)
    ? onlineUsers.map((id) => String(id))
    : [];
  const isOnline = Boolean(peerId && normalizedOnlineUsers.includes(peerId));

  const avatarSrc = peer.avatarUrl || peer.avatar || peer.profilePic;

  const { canUnblock, cooldownText } = peer.isBlocked
    ? getBlockCooldownInfo(peer.blockedAt)
    : { canUnblock: true, cooldownText: "" };

  const statusText = isOnline
    ? "Online"
    : rawLastSeen
      ? formatLastSeen(rawLastSeen)
      : "Offline";

  const joinedDate = peer.createdAt
    ? new Date(peer.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "recently";

  const firstMessageDate =
    messagesList.length > 0 && messagesList[0].createdAt
      ? new Date(messagesList[0].createdAt).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "There are no records";

  return (
    <div className="relative flex h-full w-full min-w-0 flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-3 sm:px-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {!isLargeScreen && (
              <button
                type="button"
                onClick={() => setActiveConversationId(null)}
                className="flex cursor-pointer size-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-foreground"
              >
                <ArrowLeft className="size-5" />
              </button>
            )}

            <div className="relative shrink-0">
              <div className="flex size-9 sm:size-10 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={peer.name}
                    className="size-full object-cover cursor-pointer"
                    onClick={() => setSelectedImage(avatarSrc)}
                  />
                ) : (
                  peer.initials
                )}
              </div>

              {isOnline && (
                <span className="absolute bottom-0 right-0 size-2.5 sm:size-3 rounded-full border-2 border-background bg-green-500" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-foreground">
                {peer.name}
              </h2>

              <p className="truncate text-xs text-muted">{statusText} </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsDetailsOpen((prev) => !prev)}
              className={`flex size-9 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-foreground ${
                isDetailsOpen ? "bg-surface text-foreground" : ""
              }`}
              title="Contact information"
            >
              <MoreHorizontal className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeConversation?.peer?._id) {
                  markMessagesAsRead(activeConversation.peer._id);
                }
                setActiveConversationId(null);
                setIsDetailsOpen(false);
              }}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-red-500/10 hover:text-red-500"
              title="Close the conversation?!"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5"
        >
          {isMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-sm text-muted">Loading messages...</div>
            </div>
          ) : messagesList.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center px-4">
                <div className="mx-auto flex size-14 items-center justify-center overflow-hidden rounded-full bg-surface text-lg font-semibold">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={peer.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    peer.initials
                  )}
                </div>

                <h3 className="mt-3 font-semibold text-foreground">
                  Start the conversation
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Send Message to {peer.name}.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
              {(Array.isArray(messagesList) ? messagesList : []).map(
                (message) => (
                  <div key={message?._id || message?.id} className="relative">
                    <MessageBubble
                      message={message}
                      onImageClick={(imageUrl) => setSelectedImage(imageUrl)}
                    />
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {peer.isBlocked ? (
          <div className="p-3 sm:p-4 border-t border-border flex flex-col items-center justify-center gap-2 bg-red-500/5 text-center">
            <p className="text-xs text-red-500 font-medium">
              I have blocked this contact. You cannot send or receive messages.
            </p>

            <div className="relative group">
              <button
                disabled={!canUnblock}
                onClick={() => toggleBlockUser(activeConversationId)}
                className={`px-4 cursor-pointer py-1.5 rounded-lg text-xs font-semibold transition ${
                  canUnblock
                    ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    : "bg-surface text-muted cursor-not-allowed opacity-60"
                }`}
              >
                Unblock {peer.name}
              </button>

              {!canUnblock && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground border border-border text-[11px] px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50 pointer-events-none">
                  {cooldownText}
                </div>
              )}
            </div>
          </div>
        ) : (
          <MessageInput conversationId={activeConversationId} />
        )}
      </div>
      {isDetailsOpen && (
        <aside className="absolute inset-0 z-50 flex w-full flex-col border-l border-border bg-background p-4 sm:p-5 lg:static lg:w-80 lg:shrink-0 overflow-y-auto transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">
              Contact Info
            </h3>
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-foreground transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center my-6">
            <div className="relative mb-3">
              <div className="flex size-20 sm:size-24 items-center justify-center overflow-hidden rounded-full bg-accent text-2xl font-semibold text-accent-foreground shadow-md cursor-pointer">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={peer.name}
                    className="size-full object-cover"
                    onClick={() => setSelectedImage(avatarSrc)} // تكبير صورة البروفايل الجانبي أيضاً
                  />
                ) : (
                  peer.initials
                )}
              </div>

              {isOnline && (
                <span className="absolute bottom-1 right-1 size-3.5 sm:size-4 rounded-full border-2 border-background bg-green-500" />
              )}
            </div>

            <h4 className="text-base font-bold text-foreground">{peer.name}</h4>

            <span className="text-xs text-muted mt-0.5">{statusText}</span>
          </div>

          <div className="flex flex-col gap-3 text-xs max-w-md mx-auto w-full lg:max-w-none">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50">
              <Mail className="size-4 text-muted shrink-0" />{" "}
              <div className="min-w-0">
                <p className="text-muted text-[10px]">E-mail</p>

                <p className="font-medium text-foreground truncate">
                  {peer.subtitle || peer.email || "UnAvailable!"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50">
              <Clock className="size-4 text-muted shrink-0" />
              <div className="min-w-0">
                <p className="text-muted text-[10px]">Last Seen at</p>

                <p className="font-medium text-foreground truncate">
                  {isOnline
                    ? "Online"
                    : rawLastSeen
                      ? formatLastSeen(rawLastSeen)
                      : "Unknown!!"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50">
              <Calendar className="size-4 text-muted shrink-0" />

              <div className="min-w-0">
                <p className="text-muted text-[10px]">Date of first contact</p> 
                <p className="font-medium text-foreground truncate">
                  {firstMessageDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50">
              <ShieldCheck className="size-4 text-muted shrink-0" />
              <div className="min-w-0">
                <p className="text-muted text-[10px]">Joining date</p>

                <p className="font-medium text-foreground truncate">
                  {joinedDate}
                </p>
              </div>
            </div>

            <div className="relative group mt-3 w-full">
              <button
                disabled={peer.isBlocked && !canUnblock}
                onClick={() => toggleBlockUser(activeConversationId)}
                className={`flex cursor-pointer items-center justify-center gap-2 w-full p-3 rounded-xl font-medium transition ${
                  peer.isBlocked
                    ? !canUnblock
                      ? "bg-surface text-muted cursor-not-allowed opacity-60"
                      : "bg-green-500/10 text-green-600 hover:bg-green-500/20 cursor-pointer"
                    : "bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
                }`}
              >
                {peer.isBlocked ? (
                  <>
                    <CheckCircle className="size-4" />
                    Unblock
                  </>
                ) : (
                  <>
                    <Ban className="size-4" />
                    block
                  </>
                )}
              </button>

              {peer.isBlocked && !canUnblock && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground border border-border text-[11px] px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50 pointer-events-none"></div>
              )}
            </div>
          </div>
        </aside>
      )}

      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default ChatContainer;
