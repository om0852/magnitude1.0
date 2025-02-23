'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DriverNavbar from '../components/DriverNavbar';

export default function DriverLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Redirect to home if user is not a driver
    if (status === 'authenticated' && session?.user?.role !== 'driver') {
      router.push('/');
      return;
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Only render the layout if user is authenticated and is a driver
  if (status === 'authenticated' && session?.user?.role === 'driver') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DriverNavbar />
        <main className="py-4">
          {children}
        </main>
      </div>
    );
  }

  // Return null while redirecting
  return null;
} 