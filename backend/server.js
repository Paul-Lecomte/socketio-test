const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5174", // React frontend URL
        methods: ["GET", "POST"],
        credentials: true,
    },
});

let connectedUsers = {}; // Store connected users { socketId: username }

io.on("connection", (socket) => {
    const username = socket.handshake.query.username; // Get username from the client
    if (username) {
        connectedUsers[socket.id] = username;
        console.log(`${username} connected with ID: ${socket.id}`);
        io.emit("users", Object.values(connectedUsers)); // Emit updated user list
    }

    socket.on("message", (data) => {
        const { text, from, to } = data;

        // Find recipient's socket ID by username
        const recipientSocketId = Object.keys(connectedUsers).find(
            (id) => connectedUsers[id] === to
        );

        if (recipientSocketId) {
            // Deliver message to recipient only
            io.to(recipientSocketId).emit("message", data);
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        delete connectedUsers[socket.id];
        io.emit("users", Object.values(connectedUsers)); // Emit updated user list
    });
});

const PORT = 4000;
server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);