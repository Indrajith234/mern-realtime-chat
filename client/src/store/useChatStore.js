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

  // Delete message from state
  deleteMessageInState: (messageId, roomId, lastMessage) =>
    set((state) => {
      const updatedMessages = state.messages.filter((m) => m._id !== messageId);
      const updatedRooms = state.rooms.map((r) =>
        r._id === roomId ? { ...r, lastMessage } : r
      );
      return {
        messages: updatedMessages,
        rooms: updatedRooms,
      };
    }),

  // Update user profile globally in state
  updateUserInState: (updatedUser) =>
    set((state) => {
      const isSelf = state.currentUser?._id === updatedUser._id;
      const currentUser = isSelf ? { ...state.currentUser, ...updatedUser } : state.currentUser;

      const updatedRooms = state.rooms.map((room) => {
        const updatedMembers = room.members?.map((member) =>
          member._id === updatedUser._id ? { ...member, ...updatedUser } : member
        );
        
        let updatedLastMessage = room.lastMessage;
        if (room.lastMessage && typeof room.lastMessage !== 'string') {
          const senderId = room.lastMessage.senderId;
          const senderObjId = typeof senderId === 'object' ? senderId._id : senderId;
          if (senderObjId === updatedUser._id) {
            updatedLastMessage = {
              ...room.lastMessage,
              senderId: typeof senderId === 'object' ? { ...senderId, ...updatedUser } : senderId
            };
          }
        }

        return {
          ...room,
          members: updatedMembers,
          lastMessage: updatedLastMessage,
        };
      });

      let updatedActiveRoom = state.activeRoom;
      if (state.activeRoom) {
        const updatedMembers = state.activeRoom.members?.map((member) =>
          member._id === updatedUser._id ? { ...member, ...updatedUser } : member
        );
        updatedActiveRoom = {
          ...state.activeRoom,
          members: updatedMembers,
        };
      }

      const updatedMessages = state.messages.map((msg) => {
        const senderId = msg.senderId;
        const senderObjId = typeof senderId === 'object' ? senderId._id : senderId;
        if (senderObjId === updatedUser._id) {
          return {
            ...msg,
            senderId: typeof senderId === 'object' ? { ...senderId, ...updatedUser } : senderId,
          };
        }
        return msg;
      });

      return {
        currentUser,
        rooms: updatedRooms,
        activeRoom: updatedActiveRoom,
        messages: updatedMessages,
      };
    }),
}));

export default useChatStore;
