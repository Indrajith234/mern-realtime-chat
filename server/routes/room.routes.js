const express = require("express");
const router = express.Router();
const {
  getRooms,
  createRoom,
  searchUsers,
} = require("../controllers/room.controller");
const { protect } = require("../middleware/authMiddleware");

// Room routes
router.get("/", protect, getRooms);
router.post("/", protect, createRoom);

// User search (mounted under /api/users)
// This file is also used for the users sub-router
router.get("/search", protect, searchUsers);

module.exports = router;
