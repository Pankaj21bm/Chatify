import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

const allMessages = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50; // Default to 50 messages
    const offset = parseInt(req.query.offset) || 0;

    const messages = await Message.find({ chat: req.params.chatId })
      .sort({ createdAt: -1 }) // Fetch the latest messages first
      .skip(offset)
      .limit(limit)
      .populate("sender", "name photo email")
      .populate("chat");
    res.json(messages.reverse()); 
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name photo");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name photo email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { allMessages, sendMessage };
