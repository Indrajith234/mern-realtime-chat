const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, updateProfile } = require("../controllers/auth.controller");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../controllers/message.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("avatar"), updateProfile);

module.exports = router;
