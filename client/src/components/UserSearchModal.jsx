import React, { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useChatStore from '../store/useChatStore';

const UserSearchModal = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const { currentUser, addRoom, setActiveRoom } = useChatStore();

  // Debounced search
  const handleSearch = useCallback(async (value) => {
    setQuery(value);
    if (value.trim().length < 1) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await axios.get(`/api/users/search?q=${encodeURIComponent(value)}`, {
        withCredentials: true,
      });
      setResults(data.users || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleStartChat = async (user) => {
    setCreating(true);
    try {
      const { data } = await axios.post(
        '/api/rooms',
        { members: [user._id], isGroupChat: false },
        { withCredentials: true }
      );
      addRoom(data.room);
      setActiveRoom(data.room);
      toast.success(`Chat with ${user.name} opened!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7, 9, 26, 0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-strong rounded-2xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">New Conversation</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            id="close-search-modal"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 py-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              id="user-search-input"
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="px-5 pb-5 max-h-72 overflow-y-auto">
          {searching && (
            <div className="text-center py-6 text-slate-400 text-sm">
              <div className="inline-flex gap-1">
                <span className="dot-1 w-2 h-2 rounded-full bg-violet-400 inline-block" />
                <span className="dot-2 w-2 h-2 rounded-full bg-violet-400 inline-block" />
                <span className="dot-3 w-2 h-2 rounded-full bg-violet-400 inline-block" />
              </div>
              <p className="mt-2">Searching...</p>
            </div>
          )}

          {!searching && results.length === 0 && query.length > 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm">No users found for "{query}"</p>
            </div>
          )}

          {!searching && results.length === 0 && query.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">Search for someone to start chatting</p>
            </div>
          )}

          {results.map((user) => (
            <button
              key={user._id}
              id={`start-chat-${user._id}`}
              onClick={() => handleStartChat(user)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/05 transition-all duration-200 text-left group"
              style={{ background: 'transparent' }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=40`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {user.isOnline && <span className="online-dot" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user.name}</p>
                <p className="text-slate-400 text-xs truncate">{user.email}</p>
              </div>
              <span className="text-violet-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Chat →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
