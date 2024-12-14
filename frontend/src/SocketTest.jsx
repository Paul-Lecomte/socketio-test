import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FiSend } from "react-icons/fi";
import { Avatar, Button, Typography } from "@material-tailwind/react";

let socket;

const ChatApp = () => {
    const [connected, setConnected] = useState(false);
    const [username, setUsername] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [typingUser, setTypingUser] = useState(""); // Typing indicator
    const messagesEndRef = useRef(null); // For autoscroll

    useEffect(() => {
        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const connectSocket = () => {
        socket = io("http://localhost:4000", {
            transports: ["websocket", "polling"],
            withCredentials: true,
            query: { username },
        });

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        // Update users list
        socket.on("users", (data) => {
            setUsers(
                data.filter((user) => user !== username).map((name, index) => ({
                    id: index,
                    name,
                    avatar: `https://i.pravatar.cc/150?u=${name}`,
                    unread: false, // Add unread message indicator
                }))
            );
        });

        // Handle incoming messages
        socket.on("message", (data) => {
            setMessages((prev) => [...prev, data]);
            if (data.from !== activeUser?.name) {
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.name === data.from ? { ...user, unread: true } : user
                    )
                );
            }
        });

        // Handle typing indicator
        socket.on("typing", (data) => {
            if (data.from !== username) {
                setTypingUser(data.isTyping ? `${data.from} is typing...` : "");
            }
        });
    };

    const sendMessage = () => {
        if (message.trim() && activeUser) {
            const msgData = {
                text: message,
                from: username,
                to: activeUser.name,
                timestamp: new Date().toLocaleTimeString(),
            };
            socket.emit("message", msgData);
            setMessages((prev) => [...prev, { ...msgData, self: true }]);
            setMessage("");
            sendTyping(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);
        sendTyping(value.length > 0);
    };

    const sendTyping = (isTyping) => {
        socket.emit("typing", { from: username, isTyping });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleEnterPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    const handleUserSelect = (user) => {
        setActiveUser(user);
        setUsers((prev) =>
            prev.map((u) => (u.name === user.name ? { ...u, unread: false } : u))
        );
    };

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#E5DDD5]">
                <div className="bg-white shadow-lg rounded-lg p-8 w-96">
                    <Typography variant="h4" className="mb-4 text-center text-[#2c3e50]">
                        Welcome to Chat
                    </Typography>
                    <input
                        placeholder="Enter your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-6"
                    />
                    <Button
                        fullWidth
                        onClick={() => {
                            if (username.trim()) {
                                connectSocket();
                                setIsLoggedIn(true);
                            }
                        }}
                        color="blue"
                        className="rounded-lg text-white bg-blue-500 hover:bg-blue-600"
                    >
                        Join Chat
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F1F1F1]">
            <div className="flex w-full mx-auto bg-white shadow-lg overflow-hidden rounded-lg">
                {/* Sidebar */}
                <aside className="w-1/4 bg-[#F0F0F0] border-r p-4 overflow-y-auto">
                    <div className="text-lg text-[#2c3e50] font-semibold mb-4">Contacts</div>
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-all rounded-md ${
                                activeUser?.id === user.id
                                    ? "bg-[#dde1e7] border-l-4 border-blue-500"
                                    : "hover:bg-[#dfe4ea]"
                            }`}
                            onClick={() => handleUserSelect(user)}
                        >
                            <Avatar src={user.avatar} alt={user.name} size="sm" />
                            <Typography className="text-[#2c3e50] font-medium">
                                {user.name}
                            </Typography>
                            {user.unread && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                    New
                                </span>
                            )}
                        </div>
                    ))}
                </aside>

                {/* Main Chat Section */}
                <main className="flex flex-col flex-1">
                    {activeUser ? (
                        <>
                            {/* Header */}
                            <header className="p-4 bg-[#F7F8F9] flex items-center gap-3 border-b">
                                <Avatar src={activeUser.avatar} alt={activeUser.name} size="md" />
                                <div>
                                    <Typography variant="h6" className="text-[#2c3e50] font-bold">
                                        {activeUser.name}
                                    </Typography>
                                    <Typography variant="caption" className="text-[#7f8c8d]">
                                        {connected ? "Online" : "Offline"}
                                    </Typography>
                                </div>
                            </header>

                            {/* Messages */}
                            <div className="flex-1 p-4 overflow-y-auto bg-[#ecf0f1]">
                                {messages
                                    .filter(
                                        (msg) =>
                                            (msg.from === username && msg.to === activeUser.name) ||
                                            (msg.from === activeUser.name && msg.to === username)
                                    )
                                    .map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`mb-3 p-3 rounded-xl max-w-xs ${
                                                msg.self
                                                    ? "ml-auto bg-blue-500 text-white"
                                                    : "mr-auto bg-white text-[#2c3e50]"
                                            }`}
                                        >
                                            <Typography>{msg.text}</Typography>
                                            <Typography
                                                variant="caption"
                                                className="block mt-1 text-right text-[#7f8c8d]"
                                            >
                                                {msg.timestamp}
                                            </Typography>
                                        </div>
                                    ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {typingUser && (
                                <div className="p-2 text-sm text-[#7f8c8d]">{typingUser}</div>
                            )}

                            {/* Input Field */}
                            <footer className="fixed bottom-0 p-4 bg-[#F7F8F9] flex items-center gap-3 border-t w-full">
                                <input
                                    placeholder="Write a message..."
                                    value={message}
                                    onChange={handleInputChange}
                                    onKeyPress={handleEnterPress}
                                    className="flex-1 p-3 border rounded-full text-[#2c3e50] border-[#bdc3c7] focus:outline-none"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full"
                                >
                                    <FiSend size={20} />
                                </button>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[#7f8c8d]">
                            <Typography>Select a contact to start chatting!</Typography>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ChatApp;