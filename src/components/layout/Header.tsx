"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { toggleMobileNav } from './MobileNav'; // Import the toggle function

export default function Header() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Mobile menu button - now uses the toggleMobileNav function */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={toggleMobileNav}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex-1 md:ml-8">
          <h1 className="text-lg font-semibold text-gray-800 md:hidden">Bin Nasri</h1>
        </div>
        
        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {user?.displayName?.[0] || user?.email?.[0] || 'A'}
              </div>
              <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                {user?.displayName || user?.email || 'Admin'}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.displayName || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link href="/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                {/* <button
                  onClick={() => {
                    signOut();
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}