// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ CORS (important for Flutter Web + Mobile)
app.use(cors());
app.use(express.json());

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // later we will restrict this
    methods: ["GET", "POST"],
  },
});

// ===== SOCKET EVENTS =====
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Receive message from any client
  socket.on("message", (data) => {
    console.log("📩 Message received:", data);

    // Broadcast to ALL clients
    io.emit("message", {
      sender: data.sender,
      text: data.text,
      chatId: data.chatId,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.send("🚀 Mini Chat Server is running");
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

