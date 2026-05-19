# 💬 MERN Chat App

A full-stack real-time chat application built as a portfolio project for full-stack developer roles.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com/atlas)

---

## ✨ Features

- 🔐 **Authentication** — JWT stored in httpOnly cookies (register, login, logout)
- 💬 **Real-time messaging** — Socket.io for instant message delivery
- 🏠 **Room management** — 1-on-1 and group chat rooms
- ✏️ **Typing indicators** — Animated "Name is typing..." with bouncing dots
- 🟢 **Online presence** — Live online/offline status on user avatars
- 🔍 **User search** — Search and start conversations with any user
- 🔔 **Unread badges** — Count of unread messages per room
- 📷 **Image sharing** — Upload and share images via Cloudinary
- 📜 **Message history** — Paginated message loading (50 per page)
- 📖 **Read receipts** — Track which users have read messages

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework & dev tooling |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight state management |
| Axios | HTTP client |
| Socket.io-client | Real-time communication |
| React Router v6 | Client-side routing |
| React Hot Toast | Toast notifications |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| Socket.io | WebSocket server |
| Mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| cookie-parser | httpOnly cookie handling |
| multer + Cloudinary | Image upload handling |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (optional, for image sharing)

### 1. Clone & navigate
```bash
git clone <your-repo-url>
cd chat-app
```

### 2. Set up the backend

```bash
cd server
cp .env.example .env
# Edit .env and fill in your MONGO_URI and JWT_SECRET
npm install
npm start
```

### 3. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

### 4. Open the app

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## ⚙️ Environment Variables

### `server/.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT signing | ✅ Yes |
| `PORT` | Server port (default: 5000) | No |
| `CLIENT_URL` | Frontend URL for CORS | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | For images |
| `CLOUDINARY_API_KEY` | Cloudinary API key | For images |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | For images |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Rooms & Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rooms` | Get user's rooms | Yes |
| POST | `/api/rooms` | Create a room | Yes |
| GET | `/api/users/search?q=` | Search users | Yes |

### Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/messages/:roomId` | Get room messages | Yes |
| POST | `/api/messages/upload` | Upload image | Yes |

---

## ⚡ Socket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `user_connected` | `userId` | Mark user online |
| `join_room` | `roomId` | Join a chat room |
| `send_message` | `{ roomId, senderId, content, type }` | Send a message |
| `user_typing` | `{ roomId, userId, userName }` | Start typing |
| `stop_typing` | `{ roomId, userId }` | Stop typing |
| `message_read` | `{ messageId, userId, roomId }` | Mark as read |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `message` | Broadcast new message |
| `user_typing` | `{ userId, userName }` | Typing notification |
| `stop_typing` | `{ userId }` | Stop typing notification |
| `online_users` | `userId[]` | Updated online user list |
| `user_disconnected` | `{ userId }` | User went offline |
| `read_receipt` | `{ messageId, userId, readBy }` | Read receipt |

---

## 🗂️ Project Structure

```
chat-app/
├── client/                     # React Vite frontend
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Route-level pages
│       ├── store/              # Zustand global state
│       ├── hooks/              # Custom React hooks
│       └── socket.js           # Socket.io client instance
│
└── server/                     # Node.js Express backend
    ├── models/                 # Mongoose schemas
    ├── routes/                 # Express route definitions
    ├── controllers/            # Route handler logic
    ├── middleware/             # Auth middleware
    ├── socket/                 # Socket.io event handlers
    └── index.js                # App entry point
```

---

## 🎨 Design

- **Theme**: Dark glassmorphism with deep navy background
- **Accent**: Violet/indigo gradient (`#7c3aed` → `#6366f1`)
- **Typography**: Inter (Google Fonts)
- **Animations**: Fade-in for messages, bounce for typing dots, slide-up for modals

---

## 📸 Screenshots

Register → Login → Chat in real-time!

---

## 🔮 Future Improvements

- [ ] Push notifications (Web Push API)
- [ ] Message search/filtering
- [ ] Voice messages
- [ ] End-to-end encryption
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle
