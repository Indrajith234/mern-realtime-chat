import { useState } from 'react';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import useChatStore from '../store/useChatStore';
import socket from '../socket';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { setCurrentUser, clearCurrentUser, currentUser } = useChatStore();

  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/auth/register', {
        name,
        email,
        password,
      });
      setCurrentUser(data.user);
      // Connect socket after auth
      socket.connect();
      socket.emit('user_connected', data.user._id);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      });
      setCurrentUser(data.user);
      // Connect socket after auth
      socket.connect();
      socket.emit('user_connected', data.user._id);
      toast.success(`Welcome back, ${data.user.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/logout');
      socket.disconnect();
      clearCurrentUser();
      toast.success('Logged out successfully');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Logout failed';
      toast.error(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const { data } = await axiosInstance.get('/api/auth/me');
      setCurrentUser(data.user);
      socket.connect();
      socket.emit('user_connected', data.user._id);
      return data.user;
    } catch {
      clearCurrentUser();
      return null;
    }
  };

  return { register, login, logout, checkAuth, loading, currentUser };
};

export default useAuth;
