import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  // Auth
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),

  // Rooms
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) =>
    set((state) => {
      const exists = state.rooms.find((r) => r._id === room._id);
      if (exists) return state;
      return { rooms: [room, ...state.rooms] };
    }),
  updateRoomLastMessage: (roomId, message) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r._id === roomId ? { ...r, lastMessage: message } : r
      ),
    })),

  // Active room
  activeRoom: null,
  setActiveRoom: (room) => set({ activeRoom: room, messages: [] }),

  // Messages
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      const exists = state.messages.find((m) => m._id === message._id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    }),

  // Typing
  typingUsers: {}, // { roomId: { userId: userName, ... } }
  setTyping: (roomId, userId, userName) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [roomId]: {
          ...(state.typingUsers[roomId] || {}),
          [userId]: userName,
        },
      },
    })),
  clearTyping: (roomId, userId) =>
    set((state) => {
      const roomTypers = { ...(state.typingUsers[roomId] || {}) };
      delete roomTypers[userId];
      return {
        typingUsers: { ...state.typingUsers, [roomId]: roomTypers },
      };
    }),

  // Online users
  onlineUsers: [],
  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

  // Unread counts
  unreadCounts: {}, // { roomId: count }
  incrementUnread: (roomId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: (state.unreadCounts[roomId] || 0) + 1,
      },
    })),
  clearUnread: (roomId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [roomId]: 0 },
    })),
}));

export default useChatStore;
