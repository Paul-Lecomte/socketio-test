import React, { useState } from "react";
import { io } from "socket.io-client";

let socket; // Déclaration pour réutilisation

const SocketTest = () => {
    const [connected, setConnected] = useState(false); // État de connexion
    const [message, setMessage] = useState("");

    const connectSocket = () => {
        socket = io("http://localhost:4000", {
            transports: ["websocket", "polling"], // Assurez la compatibilité
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("Connected to server:", socket.id);
            setConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            setConnected(false);
        });

        socket.on("message", (data) => {
            console.log("Message received:", data);
        });
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setConnected(false);
            console.log("Disconnected from server manually");
        }
    };

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit("message", message); // Envoi du message
            console.log("Message sent:", message);
            setMessage("");
        }
    };

    return (
        <div className="p-4">
            <div className="flex gap-4 mb-4">
                <button
                    onClick={connectSocket}
                    disabled={connected}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Login
                </button>
                <button
                    onClick={disconnectSocket}
                    disabled={!connected}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>
            {connected && (
                <div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message"
                        className="border px-2 py-1 mr-2"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Send Message
                    </button>
                </div>
            )}
        </div>
    );
};

export default SocketTest;