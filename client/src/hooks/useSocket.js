import { useEffect } from 'react';
import socket from '../socket';
import useChatStore from '../store/useChatStore';

const useSocket = () => {
  const {
    currentUser,
    activeRoom,
    addMessage,
    setTyping,
    clearTyping,
    setOnlineUsers,
    updateRoomLastMessage,
    incrementUnread,
  } = useChatStore();

  useEffect(() => {
    if (!currentUser) return;

    // ─── new_message ────────────────────────────────────────────────
    const handleNewMessage = (message) => {
      const state = useChatStore.getState();
      addMessage(message);

      // Update room's last message preview
      updateRoomLastMessage(message.roomId, message);

      // If this message is NOT in the active room, increment unread
      if (!state.activeRoom || state.activeRoom._id !== message.roomId) {
        incrementUnread(message.roomId);
      }
    };

    // ─── user_typing ─────────────────────────────────────────────────
    const handleUserTyping = ({ userId, userName }) => {
      const state = useChatStore.getState();
      if (state.activeRoom) {
        setTyping(state.activeRoom._id, userId, userName);
      }
    };

    // ─── stop_typing ─────────────────────────────────────────────────
    const handleStopTyping = ({ userId }) => {
      const state = useChatStore.getState();
      if (state.activeRoom) {
        clearTyping(state.activeRoom._id, userId);
      }
    };

    // ─── online_users ─────────────────────────────────────────────────
    const handleOnlineUsers = (userIds) => {
      setOnlineUsers(userIds);
    };

    // ─── user_disconnected ────────────────────────────────────────────
    const handleUserDisconnected = ({ userId }) => {
      const state = useChatStore.getState();
      setOnlineUsers(state.onlineUsers.filter((id) => id !== userId));
    };

    // ─── message_deleted ─────────────────────────────────────────────
    const handleMessageDeleted = ({ messageId, roomId, lastMessage }) => {
      const { deleteMessageInState } = useChatStore.getState();
      deleteMessageInState(messageId, roomId, lastMessage);
    };

    // ─── user_updated ────────────────────────────────────────────────
    const handleUserUpdated = (updatedUser) => {
      const { updateUserInState } = useChatStore.getState();
      updateUserInState(updatedUser);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('online_users', handleOnlineUsers);
    socket.on('user_disconnected', handleUserDisconnected);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('user_updated', handleUserUpdated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('online_users', handleOnlineUsers);
      socket.off('user_disconnected', handleUserDisconnected);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('user_updated', handleUserUpdated);
    };
  }, [currentUser]);

  // Join room socket event when activeRoom changes
  useEffect(() => {
    if (activeRoom?._id) {
      socket.emit('join_room', activeRoom._id);
    }
  }, [activeRoom?._id]);
};

export default useSocket;
