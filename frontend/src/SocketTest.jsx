import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { FiSend } from "react-icons/fi";

let socket;

const SocketTest = () => {
    const [connected, setConnected] = useState(false);
    const [username, setUsername] = useState(""); // Store logged-in username
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]); // Store chat messages
    const [users, setUsers] = useState([]); // Users list will be dynamically populated
    const [activeUser, setActiveUser] = useState(null); // Active chat user

    const connectSocket = () => {
        socket = io("http://localhost:4000", {
            transports: ["websocket", "polling"],
            withCredentials: true,
            query: { username }, // Send username to server
        });

        socket.on("connect", () => {
            setConnected(true);
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        socket.on("users", (data) => {
            setUsers(data.filter(user => user !== username).map((name, index) => ({
                id: index,
                name,
                avatar: "https://via.placeholder.com/40", // Default stock image
            })));
        });

        socket.on("message", (data) => {
            // Only add the message if it's not from the sender (to avoid duplication)
            if (data.from !== username || data.to !== activeUser?.name) {
                setMessages((prev) => [...prev, data]); // Append received message
            }
        });
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setConnected(false);
        }
    };

    const sendMessage = () => {
        if (message.trim() && activeUser) {
            const msgData = {
                text: message,
                from: username,
                to: activeUser.name,
                timestamp: new Date().toLocaleTimeString(),
            };

            // Emit message to the server
            socket.emit("message", msgData);

            // Only append the message for the sender (self) and not duplicate
            setMessages((prev) => [...prev, { ...msgData, self: true }]);
            setMessage(""); // Clear the input field
        }
    };

    useEffect(() => {
        return () => {
            if (socket) socket.disconnect(); // Cleanup on component unmount
        };
    }, []);

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-800">
                <div className="bg-gray-900 p-6 rounded-lg shadow-md w-1/3">
                    <h1 className="text-2xl font-semibold text-white mb-4">Login</h1>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => {
                            if (username.trim()) {
                                connectSocket();
                                setIsLoggedIn(true);
                            }
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-800">
            {/* Chat Layout */}
            <div className="flex bg-gray-900 shadow-lg rounded-lg w-full h-4/5 overflow-hidden">
                {/* Sidebar */}
                <div className="w-1/4 bg-gray-800 border-r border-gray-700 overflow-y-auto">
                    {/* Sidebar Header */}
                    <div className="p-4 bg-gray-700 flex items-center justify-between">
                        <h1 className="text-lg font-semibold text-white">Chats</h1>
                    </div>

                    {/* User List */}
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className={`flex items-center p-3 hover:bg-gray-700 cursor-pointer transition-all ${
                                activeUser?.id === user.id ? "bg-gray-700" : ""
                            }`}
                            onClick={() => setActiveUser(user)}
                        >
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-12 h-12 rounded-full mr-3"
                                onError={(e) => e.target.src = "https://via.placeholder.com/40"} // Fallback image
                            />
                            <div>
                                <p className="font-medium text-white">{user.name}</p>
                                <p className="text-sm text-gray-400">Last message...</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="flex flex-col w-3/4 h-full">
                    {activeUser ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center bg-gray-700 border-b border-gray-600 p-4">
                                <img
                                    src={activeUser.avatar}
                                    alt="Active Chat"
                                    className="w-10 h-10 rounded-full mr-3"
                                    onError={(e) => e.target.src = "https://via.placeholder.com/40"} // Fallback image
                                />
                                <div>
                                    <h1 className="text-lg font-bold text-white">{activeUser.name}</h1>
                                    <p className="text-sm text-gray-400">{connected ? "Online" : "Offline"}</p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-grow overflow-y-auto p-4 bg-gray-800">
                                {messages
                                    .filter((msg) =>
                                        (msg.from === username && msg.to === activeUser.name) ||
                                        (msg.from === activeUser.name && msg.to === username)
                                    )
                                    .map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`mb-3 p-3 rounded-lg shadow max-w-xs ${
                                                msg.self
                                                    ? "ml-auto bg-green-500 text-white"
                                                    : "mr-auto bg-gray-700 text-white"
                                            }`}
                                        >
                                            <p>{msg.text}</p>
                                            <span className="block text-xs mt-1 text-right text-gray-300">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    ))}
                            </div>

                            {/* Input Area */}
                            {connected && (
                                <div className="flex items-center p-4 bg-gray-700 border-t border-gray-600">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message"
                                        className="flex-grow border border-gray-600 bg-gray-700 text-white rounded-full px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <FiSend size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a user to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocketTest;