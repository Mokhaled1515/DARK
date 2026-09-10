// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     clerkId: {
//       type: String,
//       unique: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     fullName: {
//       type: String,
//       required: true,
//     },
//     profilePic: {
//       type: String,
//       default: "",
//     },
//     friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true },
// );

// const User = mongoose.model("User", userSchema);

// export default User;

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     clerkId: {
//       type: String,
//       unique: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     fullName: {
//       type: String,
//       required: true,
//     },
//     profilePic: {
//       type: String,
//       default: "",
//     },
//     friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     // 👈 إضافة حقل المطرودين / المحظورين هنا
//     blockedUsers: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// export default User;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 👈 تعديل حقل الحظر لتخزين تاريخ الحظر مع ID المستخدم
    blockedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        blockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
