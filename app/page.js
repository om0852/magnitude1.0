'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const suggestions = [
    {
      id: 1,
      title: 'Trip',
      icon: '/taxi.png',
      isPromo: true,
    },
    {
      id: 2,
      title: 'Auto',
      icon: '/electric-car.png',
      isPromo: false,
    },
    {
      id: 3,
      title: 'Intercity',
      icon: '/suv.png',
      isPromo: false,
    },
    {
      id: 4,
      title: 'Reserve',
      icon: '/reserve-icon.svg',
      isPromo: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Map Section - Takes full screen */}
      <div className="fixed inset-0 bg-gray-200">
        <Image
          src="/map-bg.jpg"
          alt="Map"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Content - Floating UI */}
      <div className="relative min-h-screen pt-16">
        {/* Top Bar */}
        <div className="bg-white p-4 shadow-md">
          <div className="max-w-xl mx-auto">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4"
            >
              <div className="p-2 bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-gray-500">Where to?</span>
            </button>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="bg-purple-900 mt-4 p-6">
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-white font-semibold">Suggestions</h2>
              <button className="text-white hover:text-purple-200">See all</button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {suggestions.map((suggestion) => (
                <button key={suggestion.id} className="relative bg-purple-800/50 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-purple-700/50 transition duration-300">
                  {suggestion.isPromo && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        Promo
                      </span>
                    </div>
                  )}
                  <div className="h-24 relative mb-2">
                    <Image
                      src={suggestion.icon}
                      alt={suggestion.title}
                      width={96}
                      height={96}
                      className="object-contain mx-auto"
                    />
                  </div>
                  <span className="text-white text-sm">{suggestion.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white mt-4 mx-4 p-4 rounded-lg shadow-lg">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <button className="flex-shrink-0 flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Home</span>
            </button>
            <button className="flex-shrink-0 flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Work</span>
            </button>
            <button className="flex-shrink-0 flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Saved</span>
            </button>
          </div>
        </div>

        {/* Expanded Search Panel */}
        {isExpanded && (
          <div className="fixed inset-0 bg-white z-50">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="ml-4 text-xl font-semibold">Where to?</h2>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -mt-2">
                    <div className="w-4 h-4 bg-purple-700 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Pickup location"
                    className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -mt-2">
                    <div className="w-4 h-4 bg-purple-900 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    value={dropLocation}
                    onChange={(e) => setDropLocation(e.target.value)}
                    placeholder="Where to?"
                    className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Recent Locations */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">RECENT LOCATIONS</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Home', address: '123 Home Street', icon: 'home' },
                    { name: 'Work', address: '456 Office Avenue', icon: 'work' },
                    { name: 'Mall', address: '789 Shopping Center', icon: 'location' },
                  ].map((location, index) => (
                    <button key={index} className="w-full flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-500">{location.address}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-xl mx-auto">
            <button className="w-full bg-purple-700 text-white py-4 px-6 rounded-lg font-medium hover:bg-purple-800 transition duration-300 flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Choose Ride</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
