"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, PieChartIcon, WalletIcon } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-lg z-10">
      <div className="flex justify-between px-8 py-3">
        <Link 
          href="/" 
          className={`flex flex-col items-center ${pathname === '/' ? 'text-blue-800' : 'text-gray-500'}`}
        >
          <HomeIcon size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          href="/expenses" 
          className={`flex flex-col items-center ${pathname === '/expenses' ? 'text-blue-800' : 'text-gray-500'}`}
        >
          <PieChartIcon size={24} />
          <span className="text-xs mt-1">Expenses</span>
        </Link>
        
        <Link 
          href="/wallet" 
          className={`flex flex-col items-center ${pathname === '/wallet' ? 'text-blue-800' : 'text-gray-500'}`}
        >
          <WalletIcon size={24} />
          <span className="text-xs mt-1">Wallet</span>
        </Link>
      </div>
    </div>
  );
}