const express = require("express");
const router = express.Router();
const {
  getMessages,
  uploadImage,
  upload,
  deleteMessage,
} = require("../controllers/message.controller");
const { protect } = require("../middleware/authMiddleware");

// GET /api/messages/:roomId — paginated message history
router.get("/:roomId", protect, getMessages);

// POST /api/messages/upload — upload image to Cloudinary
router.post("/upload", protect, upload.single("image"), uploadImage);

// DELETE /api/messages/:messageId — delete message
router.delete("/:messageId", protect, deleteMessage);

module.exports = router;
