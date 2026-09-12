import express from "express";
import http from "http";
import { Server } from "socket.io";
import User from "../models/User.js"; 
import Message from "../models/Messege.js"; 

const app = express();
const server = http.createServer(app);


const allowedOrigins = [
  "https://DARK — Real-Time Chat Application-mo-o1.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

console.log("Allowed origins:", allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      console.log("Incoming origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS rejected:", origin);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: ["GET", "POST"],
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

  socket.on("disconnect", async () => {
    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    const lastSeen = new Date();

    io.emit("userOffline", { userId, lastSeen });

    try {
      if (userId) {
        await User.findByIdAndUpdate(userId, { lastSeen });
      }
    } catch (error) {
      console.error("Error updating lastSeen on disconnect:", error);
    }
  });

  socket.on("markMessagesAsSeen", async ({ conversationId }) => {
    try {
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

      socket
        .to(conversationId)
        .emit("messagesSeen", { conversationId, seenBy: userId });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });
});

export { app, server, io };
