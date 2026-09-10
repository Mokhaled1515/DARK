// import dotenv from "dotenv";

// import express from "express";
// import fs from "fs";
// import cors from "cors";
// import path from "path";
// import "dotenv/config";
// import { clerkMiddleware } from "@clerk/express";
// import { cnnectDB } from "./lib/db.js";
// import User from "./models/User.js";
// import job from "./lib/cron.js";
// import clerkWebhook from "./webhooks/clerk.webhooks.js";
// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.router.js";
// import friendRoutes from "./routes/friend.route.js";
// import { app, server } from "./lib/socket.js";
// // dotenv.config(); // يجب أن تكون في البداية تماماً

// // import express from "express";

// // const app = express();
// const PORT = process.env.PORT;
// const FRONT_END_URL = process.env.FRONT_END_URL;
// const publicDir = path.join(process.cwd(), "public");

// // app.use(
// //   "/api/webhooks/clerk",
// //   express.raw({ type: "application/json" }),
// //   clerkWebhook,
// // );
// // // app.use(express.json());
// // app.use(express.json({ limit: "10mb" }));
// // app.use(express.urlencoded({ limit: "10mb", extended: true }));

// // app.use(cors({ origin: FRONT_END_URL, credentials: true }));
// // app.use(clerkMiddleware());

// // app.get("/health", (req, res) => {
// //   res.status(200).json({ ok: true });
// // });

// // app.use("/api/auth", authRoutes);
// // app.use("/api/messages", messageRoutes);

// // app.use("/api/friends", friendRoutes);

// // if (fs.existsSync(publicDir)) {
// //   app.use(express.static(publicDir));
// //   app.get("/{*any}", (req, res, next) => {
// //     res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
// //   });
// // }
// // server.listen(PORT || 3000, () => {
// //   cnnectDB();
// //   console.log("Server is up and running on PORT", PORT || 3000);

// //   if (process.env.NODE_ENV === "production") job.start();
// // });

// app.use(
//   "/api/webhooks/clerk",
//   express.raw({ type: "application/json" }),
//   clerkWebhook,
// );

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));

// app.use(cors({ origin: FRONT_END_URL, credentials: true }));
// app.use(clerkMiddleware());

// app.get("/health", (req, res) => {
//   res.status(200).json({ ok: true });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/friends", friendRoutes);

// if (fs.existsSync(publicDir)) {
//   app.use(express.static(publicDir));
//   app.get("/{*any}", (req, res, next) => {
//     res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
//   });
// }

// server.listen(PORT, () => {
//   cnnectDB();
//   console.log("Server is up and running on PORT", PORT);

//   if (process.env.NODE_ENV === "production") job.start();
// });












// import "dotenv/config"; // يُستدعى في أول السطر لضمان تحميل المتغيرات فوراً

// import express from "express";
// import fs from "fs";
// import cors from "cors";
// import path from "path";
// import { clerkMiddleware } from "@clerk/express";
// import { cnnectDB } from "./lib/db.js";
// import User from "./models/User.js";
// import job from "./lib/cron.js";
// import clerkWebhook from "./webhooks/clerk.webhooks.js";
// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.router.js";
// import friendRoutes from "./routes/friend.route.js";
// import userRoutes from "./routes/auth.route.js";
// import { app, server } from "./lib/socket.js";

// const PORT = process.env.PORT || 3000;
// // const FRONT_END_URL = process.env.FRONT_END_URL || "http://localhost:5173";


// // const FRONT_END_URL =
// //   process.env.NODE_ENV === "production"
// //     ? process.env.FRONT_END_URL || "https://DARKii.vercel.app"
// //     : "http://localhost:5173";
// const publicDir = path.join(process.cwd(), "public");

// app.use(
//   "/api/webhooks/clerk",
//   express.raw({ type: "application/json" }),
//   clerkWebhook,
// );

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));

// app.use(
//   cors({
//     // origin: FRONT_END_URL,
//     origin: ["https://DARKii.vercel.app", "http://localhost:5173"],
//     credentials: true,
//   }),
// );

// app.use(clerkMiddleware());

// app.get("/health", (req, res) => {
//   res.status(200).json({ ok: true });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/users", authRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/friends", friendRoutes);
// // app.use("/api/users", userRoutes);
// // تقديم ملفات الفرونت إند Static لو المجلد موجود
// if (fs.existsSync(publicDir)) {
//   app.use(express.static(publicDir));
//   app.get("*", (req, res, next) => {
//     res.sendFile(path.join(publicDir, "index.html"), (err) => {
//       if (err) next(err);
//     });
//   });
// }

// server.listen(PORT, () => {
//   cnnectDB();
//   console.log("Server is up and running on PORT", PORT);

//   if (process.env.NODE_ENV === "production") job.start();
// });







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
    origin: ["https://dark-mo-o1.vercel.app", "http://localhost:5173"],
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

  if (process.env.NODE_ENV === "production") job.start();
});