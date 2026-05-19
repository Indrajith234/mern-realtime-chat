require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const messageRoutes = require("./routes/message.routes");
const roomRoutes = require("./routes/room.routes");
const { initSocket } = require("./socket/socket");

const app = express();
const server = http.createServer(app);

// ─── Socket.io setup ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Middleware ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", roomRoutes); // searchUsers reused via /api/users/search

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// ─── Socket.io events ───────────────────────────────────────────────
initSocket(io);

// ─── Database connection ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/chatapp";
    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log(
      "⚠️  Server running WITHOUT database — set MONGO_URI in .env to connect"
    );
  }
};

// Start server regardless of DB status
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
  await connectDB();
});
