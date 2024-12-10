const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5174", // React frontend URL
        methods: ["GET", "POST"],
        credentials: true
    },
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("message", (data) => {
        console.log(`Message received from ${socket.id}: ${data}`);
        io.emit("message", data); // Réemission du message
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));