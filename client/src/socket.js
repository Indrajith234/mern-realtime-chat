import { io } from 'socket.io-client';

// Single socket instance pointing to backend
// Vite proxy handles /api — socket connects directly to port 5000
const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: false, // We manually connect after auth
  transports: ['websocket', 'polling'],
});

export default socket;
