import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    activeRoom: null,
    messages: [],
    typingUsers: {}, // { roomId: { userId: userName } }
    onlineUsers: [],
    unreadCounts: {}, // { roomId: count }
  },
  reducers: {
    // Rooms
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    addRoom: (state, action) => {
      const exists = state.rooms.find((r) => r._id === action.payload._id);
      if (!exists) {
        state.rooms = [action.payload, ...state.rooms];
      }
    },
    updateRoomLastMessage: (state, action) => {
      const { roomId, message } = action.payload;
      state.rooms = state.rooms.map((r) =>
        r._id === roomId ? { ...r, lastMessage: message } : r
      );
    },

    // Active room
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.messages = []; // clear messages on room switch
    },

    // Messages
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const exists = state.messages.find((m) => m._id === action.payload._id);
      if (!exists) {
        state.messages = [...state.messages, action.payload];
      }
    },

    // Typing
    setTyping: (state, action) => {
      const { roomId, userId, userName } = action.payload;
      state.typingUsers = {
        ...state.typingUsers,
        [roomId]: {
          ...(state.typingUsers[roomId] || {}),
          [userId]: userName,
        },
      };
    },
    clearTyping: (state, action) => {
      const { roomId, userId } = action.payload;
      const roomTypers = { ...(state.typingUsers[roomId] || {}) };
      delete roomTypers[userId];
      state.typingUsers = { ...state.typingUsers, [roomId]: roomTypers };
    },

    // Online users
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    // Unread counts
    incrementUnread: (state, action) => {
      const roomId = action.payload;
      state.unreadCounts = {
        ...state.unreadCounts,
        [roomId]: (state.unreadCounts[roomId] || 0) + 1,
      };
    },
    clearUnread: (state, action) => {
      const roomId = action.payload;
      state.unreadCounts = { ...state.unreadCounts, [roomId]: 0 };
    },

    // Delete message
    deleteMessageInState: (state, action) => {
      const { messageId, roomId, lastMessage } = action.payload;
      state.messages = state.messages.filter((m) => m._id !== messageId);
      state.rooms = state.rooms.map((r) =>
        r._id === roomId ? { ...r, lastMessage } : r
      );
    },

    // Update user profile globally across all state
    updateUserInState: (state, action) => {
      const updatedUser = action.payload;

      state.rooms = state.rooms.map((room) => {
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
              senderId:
                typeof senderId === 'object'
                  ? { ...senderId, ...updatedUser }
                  : senderId,
            };
          }
        }

        return { ...room, members: updatedMembers, lastMessage: updatedLastMessage };
      });

      if (state.activeRoom) {
        const updatedMembers = state.activeRoom.members?.map((member) =>
          member._id === updatedUser._id ? { ...member, ...updatedUser } : member
        );
        state.activeRoom = { ...state.activeRoom, members: updatedMembers };
      }

      state.messages = state.messages.map((msg) => {
        const senderId = msg.senderId;
        const senderObjId = typeof senderId === 'object' ? senderId._id : senderId;
        if (senderObjId === updatedUser._id) {
          return {
            ...msg,
            senderId:
              typeof senderId === 'object'
                ? { ...senderId, ...updatedUser }
                : senderId,
          };
        }
        return msg;
      });
    },
  },
});

export const {
  setRooms,
  addRoom,
  updateRoomLastMessage,
  setActiveRoom,
  setMessages,
  addMessage,
  setTyping,
  clearTyping,
  setOnlineUsers,
  incrementUnread,
  clearUnread,
  deleteMessageInState,
  updateUserInState,
} = chatSlice.actions;

export default chatSlice.reducer;
