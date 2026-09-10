import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.groupId; // 👈 مطلوب فقط إذا لم تكن رسالة جروب
      },
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },

    video: {
      type: String,
    },
    
    audio: { type: String },
    isRead: {
      type: Boolean,
      default: false,
    },

    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true },
      },
    ],
  },

  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
