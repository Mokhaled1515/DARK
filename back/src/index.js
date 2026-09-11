
import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { cnnectDB } from "./lib/db.js";
import job from "./lib/cron.js";
import clerkWebhook from "./webhooks/clerk.webhooks.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.router.js";
import friendRoutes from "./routes/friend.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 3000;

app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      // السماح بأي طلب جاي من Vercel أو localhost أثناء التطور
      const allowedOrigins = [
        "https://dark-mo-o1.vercel.app",
        "http://localhost:5173",
      ];
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);

server.listen(PORT, () => {
  cnnectDB();
  console.log("Server is up and running on PORT", PORT);

});
