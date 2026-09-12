import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Message from "../models/Messege.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Conversation from "../models/Conversation.js";

export async function sendFriendRequest(req, res) {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself." });
    }

    const currentUser = await User.findById(senderId);
    if (currentUser.friends.includes(receiverId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }

    const existingReq = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingReq) {
      return res
        .status(400)
        .json({ message: "A friend request is already pending or exists." });
    }

    const newRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    const populatedRequest = await newRequest.populate(
      "sender",
      "fullName profilePic email",
    );

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", populatedRequest);
    }

    res.status(201).json({
      message: "Friend request sent successfully",
      newRequest: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiver.toString() !== userId.toString()) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    const senderId = request.sender;
    const receiverId = request.receiver;

    await User.findByIdAndUpdate(senderId, {
      $addToSet: {
        friends: receiverId,
      },
    });

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: {
        friends: senderId,
      },
    });

    // 3. Get both users
    const senderUser = await User.findById(senderId).select("-clerkId");

    const receiverUser = await User.findById(receiverId).select("-clerkId");

    // 4. Create conversation if it doesn't already exist
    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        unreadCounts: {
          [senderId.toString()]: 0,
          [receiverId.toString()]: 0,
        },
      });
    }

    const welcomeText = "Hello! I accepted your friend request. Let's chat! 👋";

    await Message.create({
      senderId: receiverId,
      receiverId: senderId,
      text: welcomeText,
    });

    conversation.lastMessage = {
      text: welcomeText,
      sender: receiverId,
    };

    const currentUnread =
      conversation.unreadCounts.get(senderId.toString()) || 0;

    conversation.unreadCounts.set(senderId.toString(), currentUnread + 1);

    await conversation.save();
    // 7. Delete friend request
    await FriendRequest.findByIdAndDelete(requestId);

    const senderSocketId = getReceiverSocketId(senderId.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", {
        friend: receiverUser,
        conversation: {
          ...conversation.toObject(),
          otherUser: receiverUser,
          lastMessage: conversation.lastMessage,
          unreadCount: 1,
        },
        welcomeMsg: welcomeText,
      });
    }

    const receiverSocketId = getReceiverSocketId(receiverId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestAccepted", {
        friend: senderUser,
        conversation: {
          ...conversation.toObject(),
          otherUser: senderUser,
          lastMessage: conversation.lastMessage,
          unreadCount: 0,
        },
        welcomeMsg: welcomeText,
      });
    }

    return res.status(200).json({
      message: "Friend request accepted successfully",
      welcomeMsg: welcomeText,
      friend: senderUser,
      conversation: {
        ...conversation.toObject(),
        otherUser: senderUser,
        lastMessage: conversation.lastMessage,
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function getPendingRequests(req, res) {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "fullName profilePic email");

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getPendingRequests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function rejectFriendRequest(req, res) {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiver.toString() !== userId.toString()) {
      return res.status(404).json({
        message: "Request not found or unauthorized",
      });
    }

    const senderId = request.sender;

    const receiverUser = await User.findById(userId).select(
      "fullName profilePic email",
    );

    await FriendRequest.findByIdAndDelete(requestId);

    const senderSocketId = getReceiverSocketId(senderId.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestRejected", {
        requestId,
        senderId: senderId.toString(),
        rejectedBy: receiverUser,
      });
    }

    return res.status(200).json({
      message: "Friend request rejected successfully",
    });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function cancelFriendRequest(req, res) {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request || request.sender.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ message: "Request not found or unauthorized" });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request cancelled successfully" });
  } catch (error) {
    console.error("Error in cancelFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFriends(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "friends",
      "fullName profilePic email status",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getFriends:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function removeFriend(req, res) {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    const friendSocketId = getReceiverSocketId(friendId);
    if (friendSocketId) {
      io.to(friendSocketId).emit("friendRemoved", { removedBy: userId });
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in removeFriend:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
