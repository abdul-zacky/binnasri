"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, DollarSign, Wallet, Settings } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/expenses', label: 'Expenses', icon: <DollarSign size={20} /> },
    { href: '/wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { href: '/settings', label: 'Settings', icon: <Settings size={20} /> }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}