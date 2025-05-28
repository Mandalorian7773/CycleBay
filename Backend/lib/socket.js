import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5137", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
})


const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);


    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log("User added:", userId, "Socket:", socket.id);
    });


    socket.on("send-message", (data) => {
        const { receiverId, message } = data;
        const receiverSocketId = onlineUsers.get(receiverId);
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive-message", {
                message,
                senderId: data.senderId
            });
        }
    });


    socket.on("typing", (data) => {
        const { receiverId, isTyping } = data;
        const receiverSocketId = onlineUsers.get(receiverId);
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("user-typing", {
                senderId: data.senderId,
                isTyping
            });
        }
    });


    socket.on("message-read", (data) => {
        const { receiverId, messageId } = data;
        const receiverSocketId = onlineUsers.get(receiverId);
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("message-read-confirmation", {
                messageId,
                senderId: data.senderId
            });
        }
    });

    socket.on("disconnect", () => {
       
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                console.log("User disconnected:", userId);
                break;
            }
        }
    });
})

export { app, server, io };


