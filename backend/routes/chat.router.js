const express = require("express");
const multer = require("multer");
const chatController = require("../controllers/chatController");

const upload = multer({ storage: multer.memoryStorage() });

const chatRouter = express.Router();

chatRouter.get("/chat/conversations/:userId", chatController.getConversations);
chatRouter.get("/chat/messages/:conversationId", chatController.getMessages);
chatRouter.post("/chat/conversations", chatController.createConversation);
chatRouter.post("/chat/messages", chatController.sendMessage);
chatRouter.post("/chat/upload", upload.single("file"), chatController.uploadFile);

module.exports = chatRouter;
