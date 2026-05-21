import React, { useState, useRef } from 'react';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import useChatStore from '../store/useChatStore';

const ProfileModal = ({ onClose }) => {
  const { currentUser, setCurrentUser } = useChatStore();
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Display Name is required');
      return;
    }

    setUpdating(true);
    const formData = new FormData();
    formData.append('name', name.trim());
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const { data } = await axiosInstance.put('/api/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCurrentUser(data.user);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(7, 9, 26, 0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-strong rounded-2xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            id="close-profile-modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=6366f1&color=fff&size=128`}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-white/10 group-hover:border-violet-500 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-xs font-medium">Change Photo</span>
              </div>
              <div className="absolute bottom-0 right-0 bg-violet-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0c0f2e]">
                <span className="text-white text-sm">📷</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-slate-500 text-xs mt-1">Allowed: JPG, PNG (Max 5MB)</p>
          </div>

          {/* Email (Read only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              disabled
              value={currentUser?.email || ''}
              className="input-field cursor-not-allowed opacity-60"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              className="input-field"
              maxLength={30}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-2 border-t border-white/05 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="btn-primary flex items-center justify-center gap-2 min-w-[120px]"
            >
              {updating ? (
                <>
                  <span className="dot-1 w-1.5 h-1.5 rounded-full bg-white inline-block animate-bounce" />
                  <span className="dot-2 w-1.5 h-1.5 rounded-full bg-white inline-block animate-bounce [animation-delay:0.2s]" />
                  <span className="dot-3 w-1.5 h-1.5 rounded-full bg-white inline-block animate-bounce [animation-delay:0.4s]" />
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
