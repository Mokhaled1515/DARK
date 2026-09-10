// import { getAuth, clerkClient } from "@clerk/express";
// import User from "../models/User.js";

// export async function protectRoute(req, res, next) {
//   try {
//     const { userId } = getAuth(req);

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     let user = await User.findOne({ clerkId: userId });

//     // 👈 إذا لم يكن المستخدم موجوداً في MongoDB (مثل بعد عملية المسح)
//     if (!user) {
//       // 1. نجلب بيانات المستخدم الحالية من Clerk
//       const clerkUser = await clerkClient.users.getUser(userId);

//       // 2. ننشئ المستخدم تلقائياً في قاعدة البيانات
//       user = await User.create({
//         clerkId: userId,
//         fullName:
//           `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
//           "User",
//         email: clerkUser.emailAddresses[0]?.emailAddress || "",
//         profilePic: clerkUser.imageUrl || "",
//       });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("Error in protectRoute middleware:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

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

    // Get user from MongoDB
    let user = await User.findOne({ clerkId: userId });

    // If user doesn't exist, create/update safely
    if (!user) {
      // Get user data from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);

      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "User";

      const email = clerkUser.emailAddresses[0]?.emailAddress || "";

      // findOneAndUpdate + upsert prevents duplicate key errors
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
