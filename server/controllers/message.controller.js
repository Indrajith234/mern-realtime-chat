const Message = require("../models/Message");
const Room = require("../models/Room");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure Cloudinary (only if credentials present)
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer — store in memory buffer for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// @desc    Get paginated messages for a room
// @route   GET /api/messages/:roomId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "name avatar isOnline")
      .lean();

    // Return in chronological order
    const chronological = messages.reverse();

    const total = await Message.countDocuments({ roomId });

    console.log(
      `📜 Fetched ${chronological.length} messages for room ${roomId}`
    );

    res.status(200).json({
      messages: chronological,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// @desc    Upload an image to Cloudinary
// @route   POST /api/messages/upload
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY
    ) {
      return res.status(503).json({
        message:
          "Image uploads not configured. Please set Cloudinary environment variables.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "mern-chat", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    console.log(`🖼️ Image uploaded to Cloudinary: ${result.secure_url}`);
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Image upload error:", error.message);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify ownership
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this message" });
    }

    const roomId = message.roomId;

    // Delete message from database
    await Message.findByIdAndDelete(messageId);
    console.log(`🗑️ Message ${messageId} deleted from DB`);

    // Check if it was the room's lastMessage
    const room = await Room.findById(roomId);
    let populatedLastMessage = null;

    if (room && room.lastMessage && room.lastMessage.toString() === messageId) {
      // Find the new latest message in the room
      const lastMessage = await Message.findOne({ roomId })
        .sort({ createdAt: -1 });

      if (lastMessage) {
        room.lastMessage = lastMessage._id;
        await room.save();

        // Populate new last message
        populatedLastMessage = await Message.findById(lastMessage._id)
          .populate("senderId", "name avatar isOnline")
          .lean();
      } else {
        room.lastMessage = null;
        await room.save();
      }
    }

    // Broadcast the delete event to all clients in the room via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(roomId.toString()).emit("message_deleted", {
        messageId,
        roomId,
        lastMessage: populatedLastMessage,
      });
    }

    res.status(200).json({
      message: "Message deleted successfully",
      messageId,
      roomId,
      lastMessage: populatedLastMessage,
    });
  } catch (error) {
    console.error("Delete message error:", error.message);
    res.status(500).json({ message: "Server error deleting message" });
  }
};

module.exports = { getMessages, uploadImage, upload, deleteMessage };
