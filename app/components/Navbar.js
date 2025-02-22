'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <div className="w-32 h-8 relative">
                                <div className="flex items-center">
                                    <span className="text-2xl font-bold text-purple-700">Ride</span>
                                    <span className="text-2xl font-bold text-purple-900">90</span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Menu Items */}
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link href="/" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                                Home
                            </Link>
                            <Link href="/service" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                                Service
                            </Link>
                            <Link href="/activity" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                                Activity
                            </Link>
                            <Link href="/account" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                                Account
                            </Link>
                            <Link href="/about" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                                About Us
                            </Link>
                        </div>
                    </div>

                    {/* Login Button */}
                    <div className="hidden md:flex items-center">
                        <button className="bg-purple-700 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-800 transition duration-300">
                            Login
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-700 hover:bg-purple-50 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="text-gray-700 hover:text-purple-700 block px-3 py-2 rounded-md text-base font-medium">
                            Home
                        </Link>
                        <Link href="/service" className="text-gray-700 hover:text-purple-700 block px-3 py-2 rounded-md text-base font-medium">
                            Service
                        </Link>
                        <Link href="/activity" className="text-gray-700 hover:text-purple-700 block px-3 py-2 rounded-md text-base font-medium">
                            Activity
                        </Link>
                        <Link href="/account" className="text-gray-700 hover:text-purple-700 block px-3 py-2 rounded-md text-base font-medium">
                            Account
                        </Link>
                        <Link href="/about" className="text-gray-700 hover:text-purple-700 block px-3 py-2 rounded-md text-base font-medium">
                            About Us
                        </Link>
                        <button className="w-full mt-4 bg-purple-700 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-800 transition duration-300">
                            Login
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar; 