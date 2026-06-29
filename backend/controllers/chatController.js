const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");
const User = require("../models/userModel");
const { connectClient } = require("./init");
const { ObjectId } = require("mongodb");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getConversations(req, res) {
  const userId = req.params.userId;
  try {
    const conversations = await Conversation.find({
      participants: { $in: [new ObjectId(userId)] }
    })
      .populate("participants", "username profilePicture email")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getMessages(req, res) {
  const conversationId = req.params.conversationId;
  try {
    const messages = await Message.find({ conversationId: new ObjectId(conversationId) })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: 1 });

    // Mark as read could go here if we know the receiving user
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function createConversation(req, res) {
  const { senderId, receiverId } = req.body;

  if (senderId === receiverId) {
    return res.status(400).json({ error: "Cannot create conversation with yourself." });
  }

  try {
    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [new ObjectId(senderId), new ObjectId(receiverId)] }
    }).populate("participants", "username profilePicture email");

    if (!conversation) {
      conversation = new Conversation({
        participants: [new ObjectId(senderId), new ObjectId(receiverId)]
      });
      await conversation.save();
      // Populate participants for the newly created conversation
      conversation = await Conversation.findById(conversation._id).populate("participants", "username profilePicture email");
    }

    res.json(conversation);
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function sendMessage(req, res) {
  const { conversationId, senderId, receiverId, content, fileUrl, fileType } = req.body;

  if (!conversationId || !senderId || !receiverId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const newMessage = new Message({
      conversationId: new ObjectId(conversationId),
      sender: new ObjectId(senderId),
      content: content || "",
      fileUrl,
      fileType
    });

    await newMessage.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });

    const populatedMessage = await Message.findById(newMessage._id).populate("sender", "username profilePicture");

    // Emit the message to the receiver's personal room via Socket.IO
    req.app.get("io").to(receiverId).emit("receiveMessage", populatedMessage);

    res.json(populatedMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { resource_type: "auto" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ error: "Upload failed" });
      }
      res.json({
        fileUrl: result.secure_url,
        fileType: result.resource_type === "image" ? "image" : "document",
      });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
}

module.exports = {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  uploadFile,
};
