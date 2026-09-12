import express from "express";
import {
  getConversationForSidebar,
  getMessages,
  getUsersForSidebar,
  SendMessage,
  markMessagesAsRead,
  toggleReaction,
  deleteMessage,
} from "../controllers/message.controller.js";
import { searchUsers } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
const router = express.Router();
router.use(protectRoute);
router.get("/search", searchUsers);
router.get("/users", getUsersForSidebar);
router.get("/conversations", getConversationForSidebar);
router.put("/read/:id", markMessagesAsRead);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("file"), SendMessage);
router.put("/reaction/:messageId", toggleReaction);
router.delete("/:messageId", deleteMessage);
export default router;
