import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "User";

      const email = clerkUser.emailAddresses[0]?.emailAddress || "";

      user = await User.findOneAndUpdate(
        { clerkId: userId },
        {
          $set: {
            fullName,
            email,
            profilePic: clerkUser.imageUrl || "",
          },
          $setOnInsert: {
            clerkId: userId,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      );
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
