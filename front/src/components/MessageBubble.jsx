import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../Store/useAuthStore.js";
import { useChatStore } from "../Store/useChatStore.js";
import { Mic, Check, CheckCheck, Trash2, Play, Pause } from "lucide-react";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "😔"];

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

function MessageBubble({ message, onImageClick }) {
  const authUser = useAuthStore((state) => state.authUser);
  const reactToMessage = useChatStore((state) => state.reactToMessage);
  const deleteMessage = useChatStore((state) => state.deleteMessage);

  const [isSelected, setIsSelected] = useState(false);
  const timerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  if (!message) return null;

  const currentUserId = authUser?._id || authUser?.id;
  const targetMessageId = message?._id || message?.id || message?.messageId;
  const messageSenderId =
    message?.senderId?._id || message?.senderId?.id || message?.senderId;
  const isMe =
    message?.role === "me" || String(messageSenderId) === String(currentUserId);

  const handleMouseDown = (e) => {
    if (e.target.closest("button, audio, video, input, input[type='range']"))
      return;

    timerRef.current = setTimeout(() => {
      setIsSelected(true);
    }, 400);
  };

  const handleMouseUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setIsSelected((prev) => !prev);
  };

  const handleEmojiClick = (e, emoji) => {
    e.stopPropagation();

    if (targetMessageId) {
      reactToMessage(targetMessageId, emoji);
    } else {
      console.error("❌ Message ID is undefined!", message);
    }

    setIsSelected(false);
  };

  const imageSource =
    message.image ||
    message.imageUrl ||
    (typeof message.mediaUrl === "string" &&
    message.mediaUrl.includes("/image/upload/")
      ? message.mediaUrl
      : null);

  const isWebmAudio =
    typeof message.videoUrl === "string" && message.videoUrl.endsWith(".webm");
  const isRead = message.isRead || message.status === "read" || message.seen;
  const audioSource =
    message.audio ||
    message.audioUrl ||
    (isWebmAudio ? message.videoUrl : null) ||
    (typeof message.mediaUrl === "string" &&
    (message.mediaUrl.match(/\.(webm|mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
      message.mediaUrl.includes("chat_records"))
      ? message.mediaUrl
      : null);

  const videoSource =
    !isWebmAudio &&
    (message.video ||
      message.videoUrl ||
      (typeof message.mediaUrl === "string" &&
      message.mediaUrl.match(/\.(mp4|ogg|mov)(\?.*)?$/i)
        ? message.mediaUrl
        : null));
  const rawReactions = Array.isArray(message.reactions)
    ? message.reactions
    : [];

  const groupedReactions = rawReactions.reduce((acc, react) => {
    if (!react || !react.emoji) return acc;

    const existing = acc.find((r) => r.emoji === react.emoji);
    const reactUserId = react.userId || react.user?._id || react.user;
    const isMyReaction = String(reactUserId) === String(currentUserId);

    if (existing) {
      existing.count += 1;
      if (isMyReaction) existing.hasReacted = true;
    } else {
      acc.push({
        emoji: react.emoji,
        count: 1,
        hasReacted: isMyReaction,
      });
    }
    return acc;
  }, []);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .catch((err) => console.log("Audio play error:", err));
      setIsPlaying(true);
    }
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div
      className={`relative flex w-full ${
        isMe ? "justify-end" : "justify-start"
      } my-2.5`}
    >
      {isSelected && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setIsSelected(false)}
        />
      )}

      {/* {isSelected && (
        <div
          className={`absolute -top-16 z-50  flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-gray-900/95 px-3 py-2 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 ${
            isMe ? "right-2" : "left-2"
          }`}
        >
          <div className="flex items-center gap-1 border-b border-white/10 pb-1.5 mb-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={(e) => handleEmojiClick(e, emoji)}
                className="p-1 text-xl transition-transform hover:scale-125 active:scale-90 cursor-pointer select-none"
              >
                {emoji}
              </button>
            ))}
          </div>
                   {" "}
          {isMe && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteMessage(targetMessageId);
                setIsSelected(false);
              }}
              className="flex w-full items-center gap-2 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Delete message</span>
            </button>
          )}
        </div>
      )} */}

      {/* قائمة الخيارات عند الضغط المطول */}
      {isSelected && (
        <div
          className={`absolute -top-12 z-50 flex items-center gap-1 rounded-full border border-white/10 bg-gray-900/95 px-2 py-1 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 ${
            isMe ? "right-2" : "left-2"
          }`}
        >
          {/* صف الإيموجي للتفاعل */}
          <div className="flex items-center gap-0.5">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={(e) => handleEmojiClick(e, emoji)}
                className="p-1 text-base transition-transform hover:scale-125 active:scale-90 cursor-pointer select-none"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* زر الحذف لو الرسالة بتاعتي (يظهر بشكل أيقونة دائرية جنب الإيموجيز بدل ما ياخد مساحة تحتها) */}
          {isMe && (
            <>
              <div className="h-4 w-[1px] bg-white/20 mx-0.5" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMessage(targetMessageId);
                  setIsSelected(false);
                }}
                className="p-1 text-red-400 hover:bg-red-500/20 rounded-full transition cursor-pointer"
                title="Delete message"
              >
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onContextMenu={handleContextMenu}
        className={`relative flex flex-col max-w-[85%] sm:max-w-[75%] min-w-0 transition-all ${
          isSelected ? "z-30 scale-[1.01]" : "z-10"
        }`}
      >
        {groupedReactions.length > 0 && (
          <div
            className={`absolute -bottom-3.5 flex items-center gap-1 rounded-full border border-gray-700 bg-gray-900/90 px-2 py-0.5 shadow-md backdrop-blur-sm z-20 ${
              isMe ? "right-3" : "left-3"
            }`}
          >
            {(Array.isArray(groupedReactions) ? groupedReactions : []).map(
              (reaction, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (targetMessageId) {
                      reactToMessage(targetMessageId, reaction.emoji);
                    }
                  }}
                  className={`flex items-center gap-0.5 text-xs transition-transform hover:scale-110 cursor-pointer ${
                    reaction.hasReacted
                      ? "text-blue-400 font-bold"
                      : "text-gray-300"
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count > 1 && (
                    <span className="text-[10px]">{reaction.count}</span>
                  )}
                </button>
              ),
            )}
          </div>
        )}

        <div
          className={`p-3 rounded-2xl ${
            isMe ? "bg-emerald-800/90 text-white" : "bg-gray-800 text-gray-100"
          }`}
        >
          {message?.text || message?.content ? (
            <p className="text-sm break-words">
              {message?.text || message?.content}
            </p>
          ) : null}

          {imageSource && (
            <img
              src={imageSource}
              alt="attachment"
              className="mt-2 rounded-lg max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition"
              onClick={() => {
                if (onImageClick) onImageClick(imageSource);
              }}
            />
          )}

          {audioSource && (
            <div className="mt-2 flex items-center gap-2 w-full bg-black/10 dark:bg-white/10 px-3.5 py-2.5 rounded-xl backdrop-blur-sm">
              <button
                type="button"
                onClick={togglePlayAudio}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-md hover:scale-105 transition cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4 ml-0.5" />
                )}
              </button>

              <audio
                ref={audioRef}
                src={audioSource}
                preload="metadata"
                onLoadedMetadata={(e) => {
                  setDuration(e.currentTarget.duration);
                }}
                onTimeUpdate={(e) => {
                  setCurrentTime(e.currentTarget.currentTime);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                  if (audioRef.current) audioRef.current.currentTime = 0;
                }}
                className="hidden"
              />

              <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                <div className="flex items-center justify-between w-full gap-1 h-4 relative">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {Array.from({ length: 14 }).map((_, idx) => {
                    const progressPercent = duration
                      ? (currentTime / duration) * 100
                      : 0;
                    const barPercent = (idx / 14) * 100;
                    const isPassed = barPercent <= progressPercent;

                    const heights = [
                      "h-3",
                      "h-5",
                      "h-2",
                      "h-6",
                      "h-4",
                      "h-5",
                      "h-3",
                      "h-6",
                      "h-4",
                      "h-5",
                      "h-2",
                      "h-4",
                      "h-6",
                      "h-3",
                    ];
                    return (
                      <span
                        key={idx}
                        className={`flex-1 min-w-[2px] rounded-full transition-all duration-150 ${heights[idx]} ${
                          isPassed ? "bg-white" : "bg-white/40"
                        }`}
                      ></span>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] opacity-85 w-full px-0.5">
                  <span className="font-medium text-white">
                    {" "}
                    {formatTime(currentTime)}
                  </span>

                  <span className="text-white/70">
                    {duration ? formatTime(duration) : "Voice message"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {videoSource && (
            <video
              src={videoSource}
              controls
              className="mt-2 rounded-lg max-h-60 w-full object-cover"
            />
          )}

          <div
            className={`flex items-center gap-1 mt-1 text-[10px] ${
              isMe ? "justify-end text-blue-200" : "justify-start text-gray-400"
            }`}
          >
            <span>
                           {" "}
              {message?.createdAt
                ? new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
                         {" "}
            </span>

            {isMe &&
              (isRead ? (
                <CheckCheck className="size-3 text-blue-200" />
              ) : (
                <Check className="size-3 text-blue-200" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
