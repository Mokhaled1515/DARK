


import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Image, Send, X, Mic, Square, Trash2, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../Store/useChatStore.js";

function MessageInput({ conversationId }) {
  const fileInputRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  // Zustand Store
  const composerText = useChatStore((state) => state.composerText);
  const setComposerText = useChatStore((state) => state.setComposerText);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);

  const sendTypingStatus = useChatStore((state) => state.sendTypingStatus);
  const selectedUser = useChatStore((state) => state.selectedUser);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // 1. إضافة State خاصة بنسبة الرفع (Upload Progress)
  const [uploadProgress, setUploadProgress] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // حساب مكان الزر بدقة عند فتحه لكي يظهر فوقه مباشرة عبر Portal
  const toggleEmojiPicker = () => {
    if (!showEmojiPicker && emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.top - 460,
        left: rect.left,
      });
    }
    setShowEmojiPicker((prev) => !prev);
  };

  // إغلاق نافذة الإيموجي عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData) => {
    setComposerText(composerText + emojiData.emoji);
  };

  const handleInputChange = (e) => {
    setComposerText(e.target.value);
    if (!selectedUser?._id) return;
    sendTypingStatus(selectedUser._id, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(selectedUser._id, false);
    }, 2000);
  };

  const startRecording = async () => {
    try {
      setShowEmojiPicker(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      mediaRecorderRef.current = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : {},
      );
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const type = mediaRecorderRef.current.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("فشل الوصول للميكروفون:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTime < 1) {
        cancelRecording();
        return;
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!conversationId) return;
    setShowEmojiPicker(false);

    if (selectedUser?._id) {
      sendTypingStatus(selectedUser._id, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    if (audioBlob) {
      if (audioBlob.size < 1000) {
        cancelRecording();
        return;
      }
      const audioFile = new File([audioBlob], `voice_${Date.now()}.mp3`, {
        type: "audio/mpeg",
      });

      // محاكاة أو تفعيل الـ Progress للصوتيات أيضاً
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 150);

      await sendMediaMessage({ conversationId, file: audioFile });

      clearInterval(progressInterval);
      setUploadProgress(100);
      cancelRecording();
      return;
    }

    if (composerText.trim()) {
      await sendTextMessage(conversationId);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !conversationId) return;

    try {
      setUploadProgress(0);

      // محاكاة تصاعد النسبة المئوية تدريجياً أثناء الرفع (يمكنك ربطها بـ Axios onUploadProgress لو متاح في الستور)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 10;
        });
      }, 200);

      await sendMediaMessage({
        conversationId,
        file,
        // لو الستور عندك يدعم تمرير callback للـ progress يمكنك استخدامه هكذا:
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error("فشل رفع الملف:", error);
    } finally {
      event.target.value = "";
      // إعادة تعيين النسبة بعد انتهاء الختم بفترة قصيرة
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const clearInput = () => {
    setComposerText("");
    if (selectedUser?._id) sendTypingStatus(selectedUser._id, false);
  };

  return (
    <div className="relative shrink-0 border-t border-border bg-background/80 px-3 py-3 backdrop-blur sm:px-4">
      {showEmojiPicker &&
        createPortal(
          <div
            ref={emojiPickerRef}
            style={{
              position: "fixed",
              top: `${Math.max(10, pickerPosition.top)}px`,
              left: `${pickerPosition.left}px`,
              zIndex: 99999,
            }}
            className="shadow-2xl"
          >
            <EmojiPicker theme="dark" onEmojiClick={handleEmojiClick} />
          </div>,
          document.body,
        )}

      {/* 2. عرض نسبة الرفع بجانب النص المتحرك */}
      {isSendingMedia && (
        <div className="mx-auto mb-2 flex max-w-3xl items-center justify-center gap-2 rounded-xl bg-surface/80 py-2 text-xs text-muted">
          <span className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>
            Uploading and sending the file..{" "}
            {uploadProgress > 0 ? `${uploadProgress}%` : ""}
          </span>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="mx-auto mb-2 flex max-w-3xl items-center gap-3 rounded-2xl border border-border bg-surface p-2 px-3">
          <audio
            src={URL.createObjectURL(audioBlob)}
            controls
            className="h-8 flex-1"
          />
          <button
            type="button"
            onClick={cancelRecording}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-background hover:text-red-500"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-end gap-2"
      >
        <button
          ref={emojiButtonRef}
          type="button"
          onClick={toggleEmojiPicker}
          disabled={isSendingMedia || isRecording}
          className={`flex size-10 cursor-pointer shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 ${
            showEmojiPicker ? "bg-surface text-foreground" : ""
          }`}
        >
          <Smile className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker(false);
            fileInputRef.current?.click();
          }}
          disabled={isSendingMedia || isRecording}
          className="flex cursor-pointer size-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Image className="size-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/webm,audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {isRecording ? (
          <div className="flex h-10 flex-1 items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-4">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-500">
                recording... {formatTime(recordingTime)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={cancelRecording}
                className="px-2 text-xs cursor-pointer text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white"
              >
                <Square className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex min-h-10 flex-1 items-center rounded-2xl border border-border bg-surface">
            <textarea
              value={composerText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowEmojiPicker(false)}
              placeholder="DARK..."
              rows={1}
              disabled={!!audioBlob}
              className="max-h-32 selection:text-emerald-400 selection:bg-emerald-600/20 min-h-10 w-full resize-none bg-transparent px-4 py-2.5 pr-10 text-sm text-foreground outline-none disabled:opacity-50"
            />

            {composerText && (
              <button
                type="button"
                onClick={clearInput}
                className="absolute right-2 cursor-pointer flex size-7 items-center justify-center rounded-full text-muted hover:bg-background hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

        {!composerText.trim() && !audioBlob && !isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={isSendingMedia}
            className="flex hover:bg-pink-700 cursor-pointer size-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic className="size-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={
              (!composerText.trim() && !audioBlob) ||
              isSendingMedia ||
              isRecording
            }
            className="flex cursor-pointer size-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 hover:bg-emerald-800 text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        )}
      </form>
    </div>
  );
}

export default MessageInput;

