import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/useChatStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import useAuth from './hooks/useAuth';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

// Public route wrapper (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  if (currentUser) return <Navigate to="/" replace />;
  return children;
};

const AppContent = () => {
  const { checkAuth } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is already logged in on app mount
  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    init();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
            <span className="text-2xl">💬</span>
          </div>
          <div className="flex gap-1.5">
            <span className="dot-1 w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
            <span className="dot-2 w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
            <span className="dot-3 w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(17, 20, 54, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#111436' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#111436' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
