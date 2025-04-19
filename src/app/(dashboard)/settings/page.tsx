"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { User, Key, Shield, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const addAdminRole = httpsCallable(functions, 'addAdminRole');
      const result = await addAdminRole({ email });
      
      const data = result.data as any;
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(data.message || 'Admin added successfully!');
        setEmail('');
      }
    } catch (err: any) {
      setError('Failed to add admin: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your system settings</p>
      </div>
      
      {/* Account settings section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex items-center mb-4">
          <User className="mr-2 text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Account</h2>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium">{isAdmin ? 'Administrator' : 'User'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin management section - only visible to admins */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Shield className="mr-2 text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Admin Management</h2>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            {message && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleAddAdmin} className="max-w-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add New Admin
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                />
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Security section */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center mb-4">
          <Key className="mr-2 text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Security</h2>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <button 
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}