import React, { useEffect } from 'react';
import axiosInstance from '../lib/axios';
import { useSelector, useDispatch } from 'react-redux';
import { setRooms } from '../store/chatSlice';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import useSocket from '../hooks/useSocket';

const Home = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Register all socket event handlers
  useSocket();

  // Load rooms on mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const { data } = await axiosInstance.get('/api/rooms');
        dispatch(setRooms(data.rooms || []));
      } catch (err) {
        console.error('Failed to load rooms:', err);
      }
    };
    if (currentUser) loadRooms();
  }, [currentUser, dispatch]);

  return (
    <div className="fixed inset-0 flex w-full overflow-hidden">
      {/* Background decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-08"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(100px)' }} />
      </div>

      {/* App layout */}
      <div className="flex w-full h-full relative z-10">
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

export default Home;
