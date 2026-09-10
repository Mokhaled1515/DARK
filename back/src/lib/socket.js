import express from "express";
import http from "http";
import { Server } from "socket.io";
import User from "../models/User.js"; // 👈 استدعِ model المستخدم
import Message from "../models/Messege.js"; // 👈 1. أضفنا استدعاء الـ Message model هنا عشان المشاكل

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONT_END_URL || "https://DARKii.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userId) {
    socket.disconnect();
    return;
  }

  userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
  });

  // 🟢 تعديل حدث disconnect
  socket.on("disconnect", async () => {
    delete userSocketMap[userId];

    // 1. إرسال قائمة المتصلين الجديدة
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // 2. تسجيل وقت الخروج الحالي
    const lastSeen = new Date();

    // 3. إرسال حدث userOffline بالبيانات المحدثة لحظياً
    io.emit("userOffline", { userId, lastSeen });

    // 4. تحديث الوقت في قاعدة البيانات
    try {
      if (userId) {
        await User.findByIdAndUpdate(userId, { lastSeen });
      }
    } catch (error) {
      console.error("Error updating lastSeen on disconnect:", error);
    }
  });

  // 🟢 حدث قراءة الرسايل وتصفير العداد
  socket.on("markMessagesAsSeen", async ({ conversationId }) => {
    try {
      // 1. تحديث الرسائل في قاعدة البيانات لتصبح مقروءة (isRead: true)
      await Message.updateMany(
        {
          $or: [
            { conversationId: conversationId },
            { sender: conversationId, receiver: userId },
          ],
          isRead: false,
        },
        { $set: { isRead: true } },
      );

      // 2. إعلام الطرف الآخر (المرسل) أن رسائله تمت قراءتها
      socket
        .to(conversationId)
        .emit("messagesSeen", { conversationId, seenBy: userId });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });
});

export { app, server, io };
