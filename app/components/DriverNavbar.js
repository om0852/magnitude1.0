'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Logo from './Logo';
import styled from 'styled-components';

export default function DriverNavbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LogoWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

  return (
    <nav className="bg-gradient-to-r from-purple-800 to-purple-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/driver/dashboard" className="text-xl font-bold text-white hover:text-purple-200 transition-colors">
              <LogoWrapper>
                            <Logo />
                        </LogoWrapper>
              </Link>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/driver/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-purple-700 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md text-sm font-medium text-purple-900 bg-white hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-purple-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/driver/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 