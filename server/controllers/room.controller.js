const Room = require("../models/Room");
const User = require("../models/User");

// @desc    Get all rooms for the current user
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate("members", "name avatar isOnline email")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "name" },
      })
      .sort({ updatedAt: -1 })
      .lean();

    console.log(`🏠 Fetched ${rooms.length} rooms for user ${req.user.name}`);
    res.status(200).json({ rooms });
  } catch (error) {
    console.error("Get rooms error:", error.message);
    res.status(500).json({ message: "Server error fetching rooms" });
  }
};

// @desc    Create a room (1-on-1 or group)
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { members, isGroupChat, name } = req.body;

    if (!members || members.length === 0) {
      return res.status(400).json({ message: "Members are required" });
    }

    // Always include the current user
    const allMembers = [...new Set([...members, req.user._id.toString()])];

    if (!isGroupChat) {
      // For 1-on-1 chats, check if a room already exists
      if (allMembers.length !== 2) {
        return res
          .status(400)
          .json({ message: "One-on-one chat requires exactly 2 members" });
      }

      const existingRoom = await Room.findOne({
        isGroupChat: false,
        members: { $all: allMembers, $size: 2 },
      })
        .populate("members", "name avatar isOnline email")
        .populate("lastMessage");

      if (existingRoom) {
        console.log(`♻️ Returning existing 1-on-1 room: ${existingRoom._id}`);
        return res.status(200).json({ room: existingRoom });
      }
    }

    const room = await Room.create({
      name: isGroupChat ? name : "",
      members: allMembers,
      isGroupChat: isGroupChat || false,
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("members", "name avatar isOnline email")
      .populate("lastMessage");

    console.log(
      `✅ New ${isGroupChat ? "group" : "1-on-1"} room created: ${room._id}`
    );
    res.status(201).json({ room: populatedRoom });
  } catch (error) {
    console.error("Create room error:", error.message);
    res.status(500).json({ message: "Server error creating room" });
  }
};

// @desc    Search users by name or email
// @route   GET /api/users/search?q=
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(200).json({ users: [] });
    }

    const regex = new RegExp(q.trim(), "i");

    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      $or: [{ name: regex }, { email: regex }],
    })
      .select("name email avatar isOnline")
      .limit(10)
      .lean();

    console.log(`🔍 Search "${q}" returned ${users.length} users`);
    res.status(200).json({ users });
  } catch (error) {
    console.error("Search users error:", error.message);
    res.status(500).json({ message: "Server error searching users" });
  }
};

module.exports = { getRooms, createRoom, searchUsers };
