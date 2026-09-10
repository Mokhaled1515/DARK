import express from "express";
import { checkAuth, searchUsers,toggleBlockUser, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const route = express.Router();


route.get("/check",protectRoute, checkAuth);
route.get("/search", protectRoute, searchUsers);
route.post("/block/:id", protectRoute, toggleBlockUser);
route.put("/update-profile", protectRoute, updateProfile);
export default route
