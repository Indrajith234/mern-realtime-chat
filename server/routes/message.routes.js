const express = require("express");
const router = express.Router();
const {
  getMessages,
  uploadImage,
  upload,
} = require("../controllers/message.controller");
const { protect } = require("../middleware/authMiddleware");

// GET /api/messages/:roomId — paginated message history
router.get("/:roomId", protect, getMessages);

// POST /api/messages/upload — upload image to Cloudinary
router.post("/upload", protect, upload.single("image"), uploadImage);

module.exports = router;
