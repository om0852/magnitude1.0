'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-purple-700/90">
          <Image
            src="/hero-bg.jpg"
            alt="City streets"
            fill
            className="object-cover mix-blend-overlay"
            priority
          />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full pb-32">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Ride, Your Way
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Experience seamless transportation with Ride90. Book your ride now and enjoy comfortable, safe, and reliable journeys across the city.
            </p>
            
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Book Your Ride</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="pickup" className="block text-sm font-medium text-gray-700">Pickup Location</label>
                  <input
                    type="text"
                    id="pickup"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Enter pickup location"
                  />
                </div>
                <div>
                  <label htmlFor="drop" className="block text-sm font-medium text-gray-700">Drop Location</label>
                  <input
                    type="text"
                    id="drop"
                    value={dropLocation}
                    onChange={(e) => setDropLocation(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Enter drop location"
                  />
                </div>
                <button className="w-full bg-purple-700 text-white py-3 px-6 rounded-md hover:bg-purple-800 transition duration-300">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Ride90?</h2>
            <p className="text-xl text-gray-600">Experience the best ride-sharing service in town</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center transition duration-300 group-hover:bg-purple-200">
                <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Pickup</h3>
              <p className="text-gray-600">Get picked up within minutes of booking your ride</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center transition duration-300 group-hover:bg-purple-200">
                <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Rates</h3>
              <p className="text-gray-600">Competitive prices with no hidden charges</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center transition duration-300 group-hover:bg-purple-200">
                <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe Rides</h3>
              <p className="text-gray-600">Verified drivers and secure ride tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download App Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Download Our App</h2>
              <p className="text-xl text-gray-600 mb-8">
                Get the full Ride90 experience by downloading our mobile app. Available for both iOS and Android devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800 transition duration-300">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.112 0H6.888C3.088 0 0 3.088 0 6.888v10.224C0 20.912 3.088 24 6.888 24h10.224C20.912 24 24 20.912 24 17.112V6.888C24 3.088 20.912 0 17.112 0zM12 18.75c-3.728 0-6.75-3.022-6.75-6.75S8.272 5.25 12 5.25 18.75 8.272 18.75 12s-3.022 6.75-6.75 6.75z"/>
                  </svg>
                  App Store
                </button>
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800 transition duration-300">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.018 13.298l-3.919 2.25-3.515-3.493 3.543-3.521 3.891 2.26c.217.125.35.354.35.603s-.133.478-.35.603zM1.337.924a.8.8 0 00-.337.662v20.828c0 .276.135.535.359.662l9.891-9.891L1.337.924zM12.75 13.252l3.045 3.024 3.521-2.027-3.04-3.008-3.526 2.011zM12.159 12.664L2.297 22.515a.801.801 0 00.402.11.802.802 0 00.401-.11L12.92 17.5l-3.516-3.493 2.755-2.343z"/>
                  </svg>
                  Play Store
                </button>
              </div>
            </div>
            <div className="relative h-[400px]">
              <Image
                src="/app-preview.jpg"
                alt="Ride90 App Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
