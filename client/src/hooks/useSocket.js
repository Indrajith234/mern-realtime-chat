import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../socket';
import {
  addMessage,
  setTyping,
  clearTyping,
  setOnlineUsers,
  updateRoomLastMessage,
  incrementUnread,
  deleteMessageInState,
  updateUserInState,
} from '../store/chatSlice';
import store from '../store/useChatStore';

const useSocket = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const activeRoom = useSelector((state) => state.chat.activeRoom);

  useEffect(() => {
    if (!currentUser) return;

    // ─── new_message ────────────────────────────────────────────────
    const handleNewMessage = (message) => {
      dispatch(addMessage(message));
      dispatch(updateRoomLastMessage({ roomId: message.roomId, message }));

      // If message is NOT in the active room, increment unread
      const currentActiveRoom = store.getState().chat.activeRoom;
      if (!currentActiveRoom || currentActiveRoom._id !== message.roomId) {
        dispatch(incrementUnread(message.roomId));
      }
    };

    // ─── user_typing ─────────────────────────────────────────────────
    const handleUserTyping = ({ userId, userName }) => {
      const currentActiveRoom = store.getState().chat.activeRoom;
      if (currentActiveRoom) {
        dispatch(setTyping({ roomId: currentActiveRoom._id, userId, userName }));
      }
    };

    // ─── stop_typing ─────────────────────────────────────────────────
    const handleStopTyping = ({ userId }) => {
      const currentActiveRoom = store.getState().chat.activeRoom;
      if (currentActiveRoom) {
        dispatch(clearTyping({ roomId: currentActiveRoom._id, userId }));
      }
    };

    // ─── online_users ─────────────────────────────────────────────────
    const handleOnlineUsers = (userIds) => {
      dispatch(setOnlineUsers(userIds));
    };

    // ─── user_disconnected ────────────────────────────────────────────
    const handleUserDisconnected = ({ userId }) => {
      const currentOnlineUsers = store.getState().chat.onlineUsers;
      dispatch(setOnlineUsers(currentOnlineUsers.filter((id) => id !== userId)));
    };

    // ─── message_deleted ─────────────────────────────────────────────
    const handleMessageDeleted = ({ messageId, roomId, lastMessage }) => {
      dispatch(deleteMessageInState({ messageId, roomId, lastMessage }));
    };

    // ─── user_updated ────────────────────────────────────────────────
    const handleUserUpdated = (updatedUser) => {
      dispatch(updateUserInState(updatedUser));
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
  }, [currentUser, dispatch]);

  // Join room socket event when activeRoom changes
  useEffect(() => {
    if (activeRoom?._id) {
      socket.emit('join_room', activeRoom._id);
    }
  }, [activeRoom?._id]);
};

export default useSocket;
