import User from "../models/User.js";
import Message from "../models/Messege.js";
import Group from "../models/Group.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadChatMedia } from "../lib/cloudinary.js";
// import cloudinary from "../lib/cloudinary.js"; // تأكد من مسار الملف الصحيح حسب مشروعك
// import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
// import { uploadChatMedia } from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Conversation from "../models/Conversation.js";

export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const userWithFriends = await User.findById(loggedInUserId).populate(
      "friends",
      "-clerkId",
    );

    res.status(200).json(userWithFriends?.friends || []);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// export async function getConversationForSidebar(req, res) {
//   try {
//     const loggedInUserId = req.user._id;
//     const conversation = await Message.aggregate([
//       {
//         $match: {
//           $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
//           groupId: { $exists: false },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             $cond: [
//               { $eq: ["$senderId", loggedInUserId] },
//               "$receiverId",
//               "$senderId",
//             ],
//           },
//           lastMessageAt: { $max: "$createdAt" },
//         },
//       },
//       { $sort: { lastMessageAt: -1 } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $replaceRoot: { newRoot: { $first: "$user" } } },
//       { $project: { clerkId: 0 } },
//     ]);

//     res.status(200).json(conversation);
//   } catch (error) {
//     console.error("Error in getConversationForSidebar:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

export async function getConversationForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    // جلب المحادثات الخاصة بالمستخدم الحالي من جدول Conversation
    const conversations = await Conversation.find({
      participants: loggedInUserId,
    })
      .populate({
        path: "participants",
        select: "-clerkId",
      })
      .sort({ updatedAt: -1 });

    // تنسيق البيانات لتناسب الـ Sidebar (استخراج الطرف الآخر والعداد الخاص بك)
    const formattedConversations = conversations
      .map((conv) => {
        // إيجاد الطرف الآخر في المحادثة
        const otherUser = conv.participants.find(
          (p) => p._id.toString() !== loggedInUserId.toString(),
        );

        if (!otherUser) return null;

        // جلب العداد الخاص بك من الـ Map
        const unreadCount =
          conv.unreadCounts?.get(loggedInUserId.toString()) || 0;

        return {
          ...otherUser.toObject(),
          unreadCount,
          lastMessage: conv.lastMessage?.text || "",
          conversationId: conv._id,
        };
      })
      .filter(Boolean);

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Error in getConversationForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: targetId } = req.params;
    const myId = req.user._id;

    const isGroup = await Group.exists({ _id: targetId });

    let messages;
    if (isGroup) {
      messages = await Message.find({ groupId: targetId })
        .populate("senderId", "fullName profilePic")
        .sort({ createdAt: 1 });
    } else {
      messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: targetId },
          { senderId: targetId, receiverId: myId },
        ],
      }).sort({ createdAt: 1 });
    }

    // 👈 تحويل الرسائل لتشمل imageUrl و audioUrl
    const formattedMessages = messages.map((msg) => ({
      ...msg.toObject(),
      imageUrl: msg.image || null,
      videoUrl: msg.video || null,
      audioUrl: msg.audio || null,
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function SendMessage(req, res) {
  try {
    const { text, groupId, audio: base64Audio, image: base64Image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const receiver = await User.findById(receiverId);
    if (
      receiver.blockedUsers.includes(senderId) ||
      req.user.blockedUsers.includes(receiverId)
    ) {
      return res
        .status(403)
        .json({ message: "Cannot send message to this user" });
    }
    let imageUrl = base64Image || null;
    let videoUrl = null;
    let audioUrl = base64Audio || null;

    if (req.file) {
      const url = await uploadChatMedia(req.file.buffer, "chat_records");
      // console.log("☁️ Cloudinary Upload Success URL:", url);
      const mime = (req.file.mimetype || "").toLowerCase();
      const originalName = (req.file.originalname || "").toLowerCase();

      const isAudioFile =
 
        originalName.startsWith("voice_") ||
        mime.startsWith("audio/") ||
        mime === "video/webm" || // 👈 إضافة صيغة تسجيلات المتصفح webm
        url.endsWith(".webm") ||
        originalName.endsWith(".wav") ||
        originalName.endsWith(".mp3") ||
        originalName.endsWith(".ogg") ||
        originalName.endsWith(".m4a");

      if (isAudioFile) {
        audioUrl = url;
      } else if (mime.startsWith("video/")) {
        videoUrl = url;
      } else {
        imageUrl = url;
      }
    }

    const newMessageData = {
      senderId,
      text: text || "",
      image: imageUrl,
      video: videoUrl,
      audio: audioUrl,
    };

    if (groupId) {
      newMessageData.groupId = groupId;
    } else if (receiverId) {
      newMessageData.receiverId = receiverId;
    }

    const newMessage = await Message.create(newMessageData);

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        unreadCounts: {},
      });
    }

    const currentCount =
      conversation.unreadCounts.get(receiverId.toString()) || 0;
    conversation.unreadCounts.set(receiverId.toString(), currentCount + 1);

    conversation.lastMessage = {
      text: text || (imageUrl ? "Image" : videoUrl ? "Video" : "Audio"),
      sender: senderId,
    };

    await conversation.save();

    // بعد await conversation.save(); مباشرة:

    // const receiverSocketId = getReceiverSocketId(receiverId);
    // if (receiverSocketId) {
    //   // بنبعث الرسالة الجديدة ومعاها الـ unreadCounts المحدثة لو حابب
    //   io.to(receiverSocketId).emit("newMessage", {
    //     message: newMessage, // أو الـ message اللي انبعثت
    //     conversationId: conversation._id,
    //     unreadCounts: Object.fromEntries(conversation.unreadCounts),
    //   });
    // }

    const responsePayload = {
      ...newMessage.toObject(),
      imageUrl: newMessage.image || null,
      videoUrl: newMessage.video || null,
      audioUrl: newMessage.audio || null,
    };

    if (groupId) {
      io.to(groupId).emit("newGroupMessage", responsePayload);
    } else if (receiverId) {
      // 👈 حساب عدد الرسائل غير المقروءة الموجهة للـ receiver من هذا الـ sender
      const unreadCount = await Message.countDocuments({
        senderId,
        receiverId,
        isRead: false,
      });

      const receiverSocketId = getReceiverSocketId(receiverId);
      // if (receiverSocketId) {
      //   // نرسل الرسالة وبداخلها الـ unreadCount المحدث
      //   io.to(receiverSocketId).emit("newMessage", {
      //     ...responsePayload,
      //     unreadCount,
      //   });
      // }
      if (receiverSocketId) {
  io.to(receiverSocketId).emit("newMessage", {
    ...responsePayload,
    conversationId: conversation._id,
    unreadCount,
  });
}
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    console.error("Error in SendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function markMessagesAsRead(req, res) {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    // 1. تحديث الرسائل القديمة إلى isRead: true
    await Message.updateMany(
      { senderId: senderId, receiverId: myId, isRead: false },
      { $set: { isRead: true } },
    );

    // 2. تصفير العداد في مستند المحادثة للمستخدم الحالي
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, myId] },
    });

    if (conversation) {
      conversation.unreadCounts.set(myId.toString(), 0);
      await conversation.save();

      // 3. إشعار الطرف الآخر عبر السوكيت إن رسائله تمت قراءتها (اختياري لتحديث العلامات)
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", {
          conversationId: conversation._id,
          seenBy: myId,
        });
      }
    }

    res.status(200).json({ message: "Messages marked as read successfully" });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params; // 👈 تعديل الاسم ليطابق الـ Route (:messageId)
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // الفحص إذا كان المستخدم أضاف رياكشن سابقاً
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString(),
    );

    if (existingReactionIndex > -1) {
      // لو ضغط على نفس الإيموجي بيلغيه، لو إيموجي تاني بيتعدل
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // إرسال رياكشن جديد
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // إرسال التحديث عبر Socket.io للطرف الآخر
    const receiverId =
      message.senderId.toString() === userId.toString()
        ? message.receiverId
        : message.senderId;

    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageReactionUpdated", {
          messageId: message._id,
          reactions: message.reactions,
        });
      }
    }

    // إرجاع الرسالة محدثة للفرونت إند
    res.status(200).json(message);
  } catch (error) {
    console.error("Error in toggleReaction controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id; // جاي من الـ protectRoute middleware

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // الفحص إذا كان المستخدم أضاف رياكشن سابقاً
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString(),
    );

    if (existingReactionIndex > -1) {
      // لو ضغط على نفس الإيموجي بيلغيه، لو إيموجي تاني بيتعدل
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // إرسال رياكشن جديد
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // 👈 إرسال الحدث عبر Socket.io للطرف الآخر لحظياً
    const receiverSocketId = getReceiverSocketId(
      message.senderId.toString() === userId.toString()
        ? message.receiverId
        : message.senderId,
    );
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReactionUpdated", {
        messageId: message._id,
        reactions: message.reactions,
      });
    }

    // إرجاع الرسالة بعد التحديث للفرونت إند
    res.status(200).json(message);
  } catch (error) {
    console.log("Error in reactToMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this message" });
    }

    const mediaUrl = message.image || message.video || message.audio;
    if (mediaUrl) {
      try {
        const parts = mediaUrl.split("/");
        const filenameWithExtension = parts[parts.length - 1];
        const publicId = `${parts[parts.length - 2]}/${filenameWithExtension.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Error deleting media from cloudinary:", err);
      }
    }

    await Message.findByIdAndDelete(messageId);

    // 👈 إرسال كائن يحتوي على معرف الرسالة للطرف الآخر
    const receiverId = message.receiverId;
    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", { _id: messageId });
      }
    }

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


