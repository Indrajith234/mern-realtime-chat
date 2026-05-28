import { useState } from 'react';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser, clearCurrentUser } from '../store/authSlice';
import socket from '../socket';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/auth/register', {
        name,
        email,
        password,
      });
      dispatch(setCurrentUser(data.user));
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
      dispatch(setCurrentUser(data.user));
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
      dispatch(clearCurrentUser());
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
      dispatch(setCurrentUser(data.user));
      socket.connect();
      socket.emit('user_connected', data.user._id);
      return data.user;
    } catch {
      dispatch(clearCurrentUser());
      return null;
    }
  };

  return { register, login, logout, checkAuth, loading, currentUser };
};

export default useAuth;
