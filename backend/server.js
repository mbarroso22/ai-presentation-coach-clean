const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");


const presentationRoutes = require("./src/routes/presentations");
const { registerPresentationSockets } = require("./src/sockets/presentationSockets");

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

// CORS – later, set allowed origin to your React URL
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// REST routes
app.use("/api/presentations", presentationRoutes);

// Socket.io wiring
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  registerPresentationSockets(io, socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Simple health route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI Presentation Coach backend running" });
});

app.use(express.static(path.join(__dirname, "../frontend/dist")));

// For any non-API route, send back index.html (SPA routing support)
app.get("*", (req, res) => {
  // Don't override explicit API routes
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found." });
  }
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

server.listen(PORT, "0.0.0.0",() => {
  console.log(`Server listening on port ${PORT}`);
});
