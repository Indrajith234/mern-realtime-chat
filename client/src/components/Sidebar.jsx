import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useChatStore from '../store/useChatStore';
import UserSearchModal from './UserSearchModal';
import ProfileModal from './ProfileModal';

const Sidebar = () => {
  const { rooms, activeRoom, setActiveRoom, currentUser, onlineUsers, unreadCounts, clearUnread } = useChatStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleRoomClick = (room) => {
    setActiveRoom(room);
    clearUnread(room._id);
  };

  const getRoomDisplay = (room) => {
    if (room.isGroupChat) {
      return {
        name: room.name || 'Group Chat',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name || 'Group')}&background=7c3aed&color=fff&size=48`,
        isOnline: false,
      };
    }
    // 1-on-1: show the other user
    const other = room.members?.find((m) => m._id !== currentUser?._id);
    return {
      name: other?.name || 'Unknown',
      avatar: other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6366f1&color=fff&size=48`,
      isOnline: onlineUsers.includes(other?._id),
      userId: other?._id,
    };
  };

  const getLastMessagePreview = (room) => {
    const lm = room.lastMessage;
    if (!lm) return 'No messages yet';
    if (typeof lm === 'string') return '';
    if (lm.type === 'image') return '📷 Image';
    const senderName = lm.senderId?.name === currentUser?.name ? 'You' : lm.senderId?.name;
    return `${senderName ? senderName + ': ' : ''}${lm.content || ''}`.slice(0, 40);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div
        className={`flex-col h-full glass border-r border-white/08 w-full md:w-[320px] md:min-w-[320px] ${activeRoom ? 'hidden md:flex' : 'flex'}`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/08 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=6366f1&color=fff&size=40`}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="online-dot" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{currentUser?.name}</p>
              <p className="text-emerald-400 text-xs">● Online</p>
            </div>
          </div>
          <button
            onClick={() => setShowProfile(true)}
            id="profile-btn"
            title="Profile Settings"
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/05 text-sm"
          >
            ⚙️
          </button>
        </div>

        {/* Search / New Chat button */}
        <div className="px-4 py-3 border-b border-white/05" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            id="new-chat-btn"
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all duration-200 text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="text-base">🔍</span>
            <span>Find or start a conversation</span>
          </button>
        </div>

        {/* Rooms list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest px-2 mb-2 font-medium">
            Messages
          </p>

          {rooms.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="text-3xl mb-3">💬</p>
              <p className="text-slate-400 text-sm font-medium">No conversations yet</p>
              <p className="text-slate-500 text-xs mt-1">Search for someone to start chatting</p>
            </div>
          )}

          {rooms.map((room) => {
            const display = getRoomDisplay(room);
            const isActive = activeRoom?._id === room._id;
            const unread = unreadCounts[room._id] || 0;

            return (
              <button
                key={room._id}
                id={`room-${room._id}`}
                onClick={() => handleRoomClick(room)}
                className={`sidebar-item w-full text-left ${isActive ? 'active' : ''}`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={display.avatar}
                    alt={display.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {display.isOnline ? (
                    <span className="online-dot" />
                  ) : (
                    <span className="offline-dot" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium truncate">{display.name}</p>
                    <span className="text-slate-500 text-xs flex-shrink-0 ml-1">
                      {formatTime(room.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-slate-400 text-xs truncate">{getLastMessagePreview(room)}</p>
                    {unread > 0 && (
                      <span className="ml-1 flex-shrink-0 min-w-[18px] h-[18px] text-xs rounded-full flex items-center justify-center font-semibold"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', fontSize: '10px', padding: '0 5px' }}>
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showSearch && <UserSearchModal onClose={() => setShowSearch(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Sidebar;
