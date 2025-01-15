import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { Server } from "socket.io";
import path from "path";
import cors from 'cors';
dotenv.config();

const app = express();

try {
  connectDB();
  console.log("database connected");
} catch (error) {
  console.log(error)
}


app.use(cors());
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const __dirname1 = path.resolve();
console.log(process.env.NODE_ENV)
console.log(path.join(__dirname1, "..", "frontend/build"))
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1,"..", "frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1,"..", "frontend", "build", "index.html")); 
  });
} else {
  app.get("/", (req, res) => {
    res.send("Our API is running fine");
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(
  port,
  console.log(`The server started at http://localhost:${port}`.blue.bold.italic)
);


const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket ", socket.id, " Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room._id).emit("typing", room));

  socket.on("stop typing", (room) => socket.in(room._id).emit("stop typing", room));

  socket.on("new message", (newMessageRecieved) => {
    console.log("new message sent");
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");
    socket.to(chat._id).emit("message received", newMessageRecieved);
  });

  socket.off("setup", () => {
    console.log("User  disconnected");
    socket.leave(userData._id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
    socket.leaveAll();
  });
});
