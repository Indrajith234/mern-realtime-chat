const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");

const initSocket = (io) => {
  // Track online users: userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── user_connected ─────────────────────────────────────────────
    socket.on("user_connected", async (userId) => {
      if (!userId) return;

      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        console.log(`✅ User online: ${userId} | Socket: ${socket.id}`);
      } catch (err) {
        console.error("user_connected DB error:", err.message);
      }

      // Broadcast updated online users list to everyone
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // ─── join_room ──────────────────────────────────────────────────
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`🏠 Socket ${socket.id} joined room: ${roomId}`);
    });

    // ─── send_message ────────────────────────────────────────────────
    socket.on("send_message", async ({ roomId, senderId, content, type }) => {
      try {
        if (!roomId || !senderId || !content) return;

        // Save message to DB
        const message = await Message.create({
          senderId,
          roomId,
          content,
          type: type || "text",
          readBy: [senderId],
        });

        // Update room's lastMessage
        await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

        // Populate sender info before emitting
        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "name avatar isOnline")
          .lean();

        console.log(
          `💬 Message sent in room ${roomId} by user ${senderId}: "${content.slice(0, 40)}"`
        );

        // Emit to ALL members in the room (including sender for consistency)
        io.to(roomId).emit("new_message", populatedMessage);
      } catch (err) {
        console.error("send_message error:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ─── user_typing ─────────────────────────────────────────────────
    socket.on("user_typing", ({ roomId, userId, userName }) => {
      console.log(`✏️ ${userName} is typing in room ${roomId}`);
      socket.to(roomId).emit("user_typing", { userId, userName });
    });

    // ─── stop_typing ─────────────────────────────────────────────────
    socket.on("stop_typing", ({ roomId, userId }) => {
      console.log(`🛑 User ${userId} stopped typing in room ${roomId}`);
      socket.to(roomId).emit("stop_typing", { userId });
    });

    // ─── message_read ────────────────────────────────────────────────
    socket.on("message_read", async ({ messageId, userId, roomId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { $addToSet: { readBy: userId } },
          { new: true }
        ).lean();

        if (message) {
          console.log(`👁️ Message ${messageId} read by user ${userId}`);
          // Notify sender about read receipt
          io.to(roomId).emit("read_receipt", {
            messageId,
            userId,
            readBy: message.readBy,
          });
        }
      } catch (err) {
        console.error("message_read error:", err.message);
      }
    });

    // ─── disconnect ──────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      console.log(
        `❌ Socket disconnected: ${socket.id}${userId ? ` (user: ${userId})` : ""}`
      );

      if (userId) {
        onlineUsers.delete(userId);

        try {
          await User.findByIdAndUpdate(userId, { isOnline: false });
          console.log(`📴 User offline: ${userId}`);
        } catch (err) {
          console.error("disconnect DB error:", err.message);
        }

        // Broadcast updated online list
        io.emit("online_users", Array.from(onlineUsers.keys()));
        io.emit("user_disconnected", { userId });
      }
    });
  });
};

module.exports = { initSocket };
