"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run after initial loading is complete
    if (!loading) {
      if (!user && !pathname.includes('/login')) {
        // If not authenticated and not on login page, redirect to login
        router.push('/login');
      } else if (user && pathname === '/login') {
        // If authenticated and on login page, redirect to dashboard
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If we're on the login page or we're authenticated, render the children
  if (pathname.includes('/login') || user) {
    return <>{children}</>;
  }

  // Otherwise, we're redirecting, show a blank page
  return null;
}