import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import useChatStore from '../store/useChatStore';
import socket from '../socket';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = () => {
  const {
    activeRoom,
    messages,
    setMessages,
    currentUser,
    typingUsers,
    onlineUsers,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load messages when activeRoom changes
  useEffect(() => {
    if (!activeRoom?._id) return;
    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await axiosInstance.get(`/api/messages/${activeRoom._id}`);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Load messages error:', err);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [activeRoom?._id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing events
  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!isTyping && activeRoom?._id) {
      setIsTyping(true);
      socket.emit('user_typing', {
        roomId: activeRoom._id,
        userId: currentUser._id,
        userName: currentUser.name,
      });
    }

    // Clear typing after 2 seconds of inactivity
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', {
        roomId: activeRoom._id,
        userId: currentUser._id,
      });
    }, 2000);
  };

  const sendMessage = async (content, type = 'text') => {
    if (!content.trim() && type === 'text') return;
    if (!activeRoom?._id) return;

    setSending(true);
    // Stop typing indicator
    setIsTyping(false);
    clearTimeout(typingTimeoutRef.current);
    socket.emit('stop_typing', {
      roomId: activeRoom._id,
      userId: currentUser._id,
    });

    try {
      socket.emit('send_message', {
        roomId: activeRoom._id,
        senderId: currentUser._id,
        content: content.trim(),
        type,
      });
      setInput('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await axiosInstance.post('/api/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await sendMessage(data.url, 'image');
      toast.success('Image sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getRoomHeader = () => {
    if (!activeRoom) return { name: '', avatar: '', isOnline: false };
    if (activeRoom.isGroupChat) {
      return {
        name: activeRoom.name || 'Group Chat',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(activeRoom.name || 'Group')}&background=7c3aed&color=fff&size=48`,
        isOnline: false,
        memberCount: activeRoom.members?.length,
      };
    }
    const other = activeRoom.members?.find((m) => m._id !== currentUser?._id);
    return {
      name: other?.name || 'Unknown',
      avatar: other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6366f1&color=fff&size=48`,
      isOnline: onlineUsers.includes(other?._id),
    };
  };

  const roomHeader = getRoomHeader();
  const activeRoomTypers = typingUsers[activeRoom?._id] || {};

  // Empty state
  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Your Messages</h2>
          <p className="text-slate-400 text-sm max-w-xs">
            Select a conversation from the sidebar, or search for someone to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b glass"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="relative">
          <img
            src={roomHeader.avatar}
            alt={roomHeader.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {roomHeader.isOnline && <span className="online-dot" />}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{roomHeader.name}</p>
          <p className={`text-xs ${roomHeader.isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
            {activeRoom.isGroupChat
              ? `${roomHeader.memberCount} members`
              : roomHeader.isOnline
              ? '● Online'
              : '○ Offline'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-2">
              <span className="dot-1 w-3 h-3 rounded-full bg-violet-400 inline-block" />
              <span className="dot-2 w-3 h-3 rounded-full bg-violet-400 inline-block" />
              <span className="dot-3 w-3 h-3 rounded-full bg-violet-400 inline-block" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <p className="text-4xl mb-3">👋</p>
            <p className="text-slate-400 text-sm">
              Say hi to <span className="text-violet-400 font-medium">{roomHeader.name}</span>!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message._id} message={message} />
          ))
        )}

        {/* Typing Indicator */}
        <TypingIndicator typers={activeRoomTypers} />

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-end gap-2 rounded-2xl p-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Image upload */}
          <button
            id="image-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Send image"
            className="p-2 text-slate-400 hover:text-violet-400 transition-colors flex-shrink-0 rounded-lg hover:bg-white/05"
          >
            {uploading ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span className="text-lg">📷</span>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            id="file-input"
          />

          {/* Text input */}
          <textarea
            id="message-input"
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none resize-none text-sm py-1.5 px-1 leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />

          {/* Send button */}
          <button
            id="send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
            style={{
              background: input.trim()
                ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                : 'rgba(255,255,255,0.07)',
              boxShadow: input.trim() ? '0 2px 10px rgba(124,58,237,0.35)' : 'none',
            }}
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
