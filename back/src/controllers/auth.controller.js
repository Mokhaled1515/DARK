import User from "../models/User.js";
import { uploadChatMedia } from "../lib/cloudinary.js";
import FriendRequest from "../models/FriendRequest.js";
export async function checkAuth(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// export async function searchUsers(req, res) {
//   try {
//     const { query } = req.query;
//     const currentUserId = req.user._id;

//     if (!query || query.trim() === "") {
//       return res.status(200).json([]);
//     }

//     const users = await User.find({
//       _id: { $ne: currentUserId },
//       $or: [
//         { fullName: { $regex: query, $options: "i" } },
//         { email: { $regex: query, $options: "i" } },
//       ],
//     }).select("fullName profilePic email friends");

//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error in searchUsers:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

export async function searchUsers(req, res) {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        {
          fullName: {
            $regex: query,
            $options: "i",
          },
        },
        {
          email: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    }).select("fullName profilePic email friends");

    const currentUser = await User.findById(currentUserId).select(
      "friends"
    );

    const results = await Promise.all(
      users.map(async (user) => {
        // =========================
        // 1. Are they already friends?
        // =========================

        const areFriends = currentUser.friends.some(
          (friendId) =>
            friendId.toString() === user._id.toString()
        );

        if (areFriends) {
          return {
            ...user.toObject(),
            relationship: "friends",
          };
        }

        // =========================
        // 2. Check friend request
        // =========================

        const request = await FriendRequest.findOne({
          $or: [
            {
              sender: currentUserId,
              receiver: user._id,
            },
            {
              sender: user._id,
              receiver: currentUserId,
            },
          ],
        });

        if (!request) {
          return {
            ...user.toObject(),
            relationship: "none",
          };
        }

        // =========================
        // 3. Request sent by me
        // =========================

        if (
          request.sender.toString() ===
          currentUserId.toString()
        ) {
          return {
            ...user.toObject(),
            relationship: "pending_sent",
            requestId: request._id,
          };
        }

        // =========================
        // 4. Request received by me
        // =========================

        return {
          ...user.toObject(),
          relationship: "pending_received",
          requestId: request._id,
        };
      })
    );

    // =========================
    // Don't show friends in Add
    // =========================

    const filteredResults = results.filter(
      (user) => user.relationship !== "friends"
    );

    return res.status(200).json(filteredResults);

  } catch (error) {
    console.error(
      "Error in searchUsers:",
      error.message
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export const toggleBlockUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const userId = req.user._id;

    if (String(userId) === String(targetUserId)) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const blockedUsers = user.blockedUsers || [];

    const existingBlock = blockedUsers.find(
      (item) => String(item.userId || item) === String(targetUserId),
    );

    const COOLDOWN_HOURS = 24;

    if (existingBlock) {
      const blockTime = existingBlock.blockedAt
        ? new Date(existingBlock.blockedAt).getTime()
        : 0;
      const currentTime = Date.now();
      const hoursPassed = (currentTime - blockTime) / (1000 * 60 * 60);

      if (hoursPassed < COOLDOWN_HOURS) {
        const remainingHours = Math.floor(COOLDOWN_HOURS - hoursPassed);
        const remainingMinutes = Math.floor(
          ((COOLDOWN_HOURS - hoursPassed) % 1) * 60,
        );

        return res.status(400).json({
          message: `You can unblock this user in ${remainingHours}h ${remainingMinutes}m`,
          canUnblock: false,
          remainingHours,
          remainingMinutes,
        });
      }

      await User.findByIdAndUpdate(userId, {
        $pull: { blockedUsers: { userId: targetUserId } },
      });

      await User.findByIdAndUpdate(userId, {
        $pull: { blockedUsers: targetUserId },
      });

      return res.status(200).json({
        message: "User unblocked successfully",
        isBlocked: false,
        targetUserId,
      });
    } else {
      // 🔒 إضافته لقائمة الحظر مع التاريخ الحالي
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          blockedUsers: {
            userId: targetUserId,
            blockedAt: new Date(),
          },
        },
      });

      return res.status(200).json({
        message: "User blocked successfully",
        isBlocked: true,
        targetUserId,
      });
    }
  } catch (error) {
    console.error("Error in toggleBlockUser:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, nickname } = req.body;
    const userId = req.user._id;

    let uploadResponse = null;

    if (profilePic) {
      const buffer = Buffer.from(
        profilePic.replace(/^data:image\/\w+;base64,/, ""),
        "base64",
      );

      uploadResponse = await uploadChatMedia(buffer, "user_profiles");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(nickname && { nickname }),
        ...(uploadResponse && { profilePic: uploadResponse }),
      },
      
      { returnDocument: "after" },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
