import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { PaperAirplaneIcon, CommentIcon, XIcon, ArrowLeftIcon, SmileyIcon, PaperclipIcon } from "@primer/octicons-react";
import EmojiPicker from "emoji-picker-react";
import "./chat.css";

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const loggedInUserId = localStorage.getItem("userId");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (loggedInUserId) {
      socket.emit("joinPersonalRoom", loggedInUserId);

      socket.on("receiveMessage", (message) => {
        // If the message belongs to the currently active conversation, append it
        setActiveConversation((prevActive) => {
          if (prevActive && prevActive._id === message.conversationId) {
            setMessages((prevMessages) => [...prevMessages, message]);
            scrollToBottom();
          }
          return prevActive;
        });
        
        // Refresh conversations to update lastMessage and sorting
        fetchConversations();
      });
    }

    return () => {
      socket.off("receiveMessage");
    };
  }, [loggedInUserId]);

  useEffect(() => {
    if (isOpen && loggedInUserId) {
      fetchConversations();
    }
  }, [isOpen, loggedInUserId]);

  useEffect(() => {
    const handleOpenChat = async (e) => {
      const { targetUserId } = e.detail;
      setIsOpen(true);
      if (!loggedInUserId || !targetUserId) return;
      
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat/conversations`, {
          senderId: loggedInUserId,
          receiverId: targetUserId
        });
        fetchMessages(res.data);
        fetchConversations();
      } catch (err) {
        console.error("Failed to start conversation", err);
      }
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [loggedInUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat/conversations/${loggedInUserId}`);
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  const fetchMessages = async (conversation) => {
    setActiveConversation(conversation);
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat/messages/${conversation._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    // Find the other participant's ID
    const receiver = activeConversation.participants.find(p => p._id !== loggedInUserId);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat/messages`, {
        conversationId: activeConversation._id,
        senderId: loggedInUserId,
        receiverId: receiver._id,
        content: newMessage
      });

      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      scrollToBottom();
      fetchConversations(); // Update side list
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const { fileUrl, fileType } = res.data;
      const receiver = activeConversation.participants.find(p => p._id !== loggedInUserId);

      const msgRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat/messages`, {
        conversationId: activeConversation._id,
        senderId: loggedInUserId,
        receiverId: receiver._id,
        content: "",
        fileUrl,
        fileType
      });

      // The new message is broadcasted via socket, but we can also add it immediately or just let the socket handle it.
      // Usually, the sender receives it via socket if they are in their own personal room, wait the backend emits to receiver.
      // The sender needs to add it manually:
      setMessages((prev) => [...prev, msgRes.data]);
      scrollToBottom();
      fetchConversations();
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to upload file");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== loggedInUserId);
  };

  if (!loggedInUserId) return null;

  return (
    <div className="floating-chat-container">
      <div className={`chat-window ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="chat-header">
          {activeConversation ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setActiveConversation(null)}><ArrowLeftIcon /></button>
              <h3>{getOtherParticipant(activeConversation)?.username}</h3>
            </div>
          ) : (
            <h3>Messages</h3>
          )}
          <button onClick={() => setIsOpen(false)}><XIcon /></button>
        </div>

        {/* Body */}
        <div className="chat-body">
          {!activeConversation ? (
            // Conversation List
            conversations.length > 0 ? (
              conversations.map(conv => {
                const other = getOtherParticipant(conv);
                if (!other) return null;
                return (
                  <div key={conv._id} className="conversation-list-item" onClick={() => fetchMessages(conv)}>
                    <img src={other.profilePicture || "https://thisanimedoesnotexist.ai/results/psi-1.0/seed10000.png"} alt="avatar" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', color: 'white' }}>{other.username}</span>
                      <span style={{ fontSize: '12px', color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        {conv.lastMessage ? conv.lastMessage.content : "Start chatting..."}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#8b949e', marginTop: '20px' }}>
                <p>No messages yet.</p>
                <p style={{ fontSize: '12px' }}>Visit a user's profile to start a conversation!</p>
              </div>
            )
          ) : (
            // Active Chat Messages
            loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
              <>
                {messages.map(msg => (
                  <div key={msg._id} className={`message-bubble ${msg.sender._id === loggedInUserId ? 'message-sent' : 'message-received'}`}>
                    {msg.fileUrl && (
                      <div className="message-file">
                        {msg.fileType === 'image' ? (
                          <img src={msg.fileUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                        ) : (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="document-link">
                            <PaperclipIcon size={16} /> View Document
                          </a>
                        )}
                      </div>
                    )}
                    {msg.content && <div>{msg.content}</div>}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )
          )}
        </div>

        {/* Footer / Input (Only if active conversation) */}
        {activeConversation && (
          <div className="chat-footer-wrapper">
            {showEmojiPicker && (
              <div className="emoji-picker-container">
                <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width="100%" height="300px" />
              </div>
            )}
            <form className="chat-footer" onSubmit={handleSendMessage}>
              <button type="button" className="chat-icon-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <SmileyIcon size={16} />
              </button>
              <button type="button" className="chat-icon-btn" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}>
                <PaperclipIcon size={16} />
              </button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              <input 
                type="text" 
                placeholder={uploadingFile ? "Uploading..." : "Type a message..."} 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={uploadingFile}
              />
              <button type="submit" disabled={uploadingFile || (!newMessage.trim() && !uploadingFile)}><PaperAirplaneIcon size={16} /></button>
            </form>
          </div>
        )}
      </div>

      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        <CommentIcon size={24} />
      </button>
    </div>
  );
};

export default FloatingChat;
