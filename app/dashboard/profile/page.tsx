'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import axios from 'axios';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await axios.put('/api/user/profile', {
        name: formData.name,
        phone: formData.phone,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your personal information and account security</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-white dark:border-dark-card shadow-xl overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition group-hover:scale-110"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="input-field pl-11 bg-gray-50 dark:bg-dark-bg/50 cursor-not-allowed opacity-70"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons.</p>
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            {success && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-success text-sm font-medium"
              >
                Profile updated successfully!
              </motion.p>
            )}
            <div className="flex-1" />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 px-8 py-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Security Placeholder */}
      <div className="card border-danger/20">
        <h3 className="text-lg font-bold text-danger mb-4">Security</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Manage your password and active sessions. For enhanced security, nosotros recommend using 2FA.
        </p>
        <button className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
          Change Password
        </button>
      </div>
    </div>
  );
}
