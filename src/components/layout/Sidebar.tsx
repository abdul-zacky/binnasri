"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  DollarSign,
  Wallet,
  Settings,
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut, isAdmin } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/expenses', label: 'Expenses (Beta)', icon: <DollarSign size={20} /> },
    { href: '/wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { href: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">Bin Nasri</h1>
        </Link>
        <p className="text-sm text-gray-500 mt-1">Wisma Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
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
          onClick={() => signOut()}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={20} className="mr-3 text-gray-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}