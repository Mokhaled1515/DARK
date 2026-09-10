


import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  sendFriendRequest, 
  getFriends, 
  getPendingRequests, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend 
} from "../controllers/friend.controller.js"; // تأكد من استيراد كل الدوال المطلوبة

const router = express.Router();

router.use(protectRoute);

// 1. GET /api/friends (جلب الأصدقاء)
router.get("/", getFriends);

// 2. GET /api/friends/requests (جلب الطلبات المعلقة)
router.get("/requests", getPendingRequests);

// 3. POST /api/friends/request (إرسال طلب صداقة)
router.post("/request", sendFriendRequest);

// 4. POST /api/friends/accept/:requestId (قبول طلب)
router.post("/accept/:requestId", acceptFriendRequest);

// 5. DELETE /api/friends/reject/:requestId (رفض طلب)
router.delete("/reject/:requestId", rejectFriendRequest);

// 6. DELETE /api/friends/remove/:friendId (حذف صديق)
router.delete("/remove/:friendId", removeFriend);

export default router;