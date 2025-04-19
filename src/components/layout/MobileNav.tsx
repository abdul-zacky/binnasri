"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  DollarSign, 
  Wallet, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Create a custom event for toggle communication
export const toggleMobileNav = () => {
  const event = new CustomEvent('toggle-mobile-nav');
  window.dispatchEvent(event);
};

export default function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/expenses', label: 'Expenses (Beta)', icon: <DollarSign size={20} /> },
    { href: '/wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { href: '/settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  // Listen for the custom toggle event
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-mobile-nav', handleToggle);
    
    return () => {
      window.removeEventListener('toggle-mobile-nav', handleToggle);
    };
  }, []);
  
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Mobile Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white z-30 transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Logo */}
          <div className="px-6 pb-6 -mt-4">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">WMS</h1>
            </Link>
            <p className="text-sm text-gray-500 mt-1">Wisma Management System</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className={`mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3 text-gray-500" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}