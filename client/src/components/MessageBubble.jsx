import React from 'react';
import useChatStore from '../store/useChatStore';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

const MessageBubble = ({ message }) => {
  const { currentUser, onlineUsers } = useChatStore();

  if (!message) return null;

  const isSent = message.senderId?._id === currentUser?._id ||
    message.senderId === currentUser?._id;

  const sender = message.senderId;
  const senderName = typeof sender === 'object' ? sender?.name : 'User';
  const senderAvatar = typeof sender === 'object' ? sender?.avatar : '';

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await axiosInstance.delete(`/api/messages/${message._id}`);
        toast.success("Message deleted");
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete message');
      }
    }
  };

  if (isSent) {
    return (
      <div className="flex justify-end mb-3 animate-fade-in group items-center gap-2">
        {/* Delete action for sender */}
        <button
          onClick={handleDelete}
          className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-white/05 cursor-pointer text-xs self-center"
          title="Delete message"
        >
          🗑️
        </button>

        <div className="max-w-[70%] flex flex-col items-end gap-1">
          {message.type === 'image' ? (
            <div className="rounded-2xl rounded-br-sm overflow-hidden shadow-lg">
              <img
                src={message.content}
                alt="Shared image"
                className="max-w-full sm:max-w-[280px] max-h-[320px] object-cover"
              />
            </div>
          ) : (
            <div className="px-4 py-2.5 rounded-2xl rounded-br-sm msg-sent text-white text-sm leading-relaxed">
              {message.content}
            </div>
          )}
          <span className="text-xs text-slate-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 mb-3 animate-fade-in group">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=6366f1&color=fff&size=32`}
          alt={senderName}
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>

      <div className="max-w-[70%] flex flex-col gap-1">
        <span className="text-xs text-slate-400 px-1">{senderName}</span>

        {message.type === 'image' ? (
          <div className="rounded-2xl rounded-bl-sm overflow-hidden shadow-lg">
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-full sm:max-w-[280px] max-h-[320px] object-cover"
            />
          </div>
        ) : (
          <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm msg-received text-slate-200 text-sm leading-relaxed">
            {message.content}
          </div>
        )}

        <span className="text-xs text-slate-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
