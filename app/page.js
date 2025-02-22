'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  const suggestions = [
    {
      id: 1,
      title: 'Trip',
      icon: '/taxi.png',
      isPromo: false,
    },
    {
      id: 2,
      title: 'Auto',
      icon: '/rickshaw.png',
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
      title: 'Parcel',
      icon: '/parcel.png',
      isPromo: false,
    },
    {
      id: 5,
      title: 'Reserve',
      icon: '/reserve.png',
      isPromo: false,
    },
  ];

  const handleRideSelect = (rideId) => {
    setSelectedRide(selectedRide === rideId ? null : rideId);
  };

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
      <div className="relative min-h-screen pt-16 bg-purple-50">
        {/* Top Bar */}
        <div className="bg-white p-4 shadow-md">
          <div className="max-w-xl mx-auto">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full bg-purple-50 rounded-lg shadow-lg p-4 flex items-center space-x-4 hover:bg-purple-100 transition-all"
            >
              <div className="p-2 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-purple-700">Where to?</span>
            </button>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="mt-4 mx-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
            <div className="max-w-xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-purple-900 font-semibold">Choose Ride</h2>
              </div>
              <div className="grid grid-cols-4 gap-4 md:grid-cols-5">
                {suggestions.map((suggestion) => (
                  <button 
                    key={suggestion.id} 
                    className={`relative rounded-lg p-4 text-center transition duration-300 ${
                      selectedRide === suggestion.id 
                        ? 'bg-purple-100 ring-2 ring-purple-500' 
                        : 'bg-purple-50 hover:bg-purple-100'
                    }`}
                    onClick={() => handleRideSelect(suggestion.id)}
                  >
                    {suggestion.isPromo && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
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
                    <span className="text-purple-900 text-sm font-medium">{suggestion.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Your Next Trip Section */}
        <div className="bg-white mt-4 mx-4 p-6 rounded-lg shadow-lg border border-purple-100 mb-24">
         
            <h2 className="text-xl text-purple-900 font-semibold mb-4">Plan your next trip</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="relative h-48 w-full group overflow-hidden rounded-lg">
                <Image
                  src="/beach.jpg"
                  alt="Beach destination"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold text-lg">Beach Gateway</h3>
                  <p className="text-sm text-purple-100">Perfect for weekend</p>
                </div>
              </button>
              <button className="relative h-48 w-full group overflow-hidden rounded-lg">
                <Image
                  src="/hill-station.jpg"
                  alt="Hill station"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold text-lg">Hill Station</h3>
                  <p className="text-sm text-purple-100">Scenic mountain views</p>
                </div>
              </button>
              <button className="relative h-48 w-full group overflow-hidden rounded-lg">
                <Image
                  src="/city.jpg"
                  alt="City tour"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold text-lg">City Tour</h3>
                  <p className="text-sm text-purple-100">Explore urban life</p>
                </div>
              </button>
              <button className="relative h-48 w-full group overflow-hidden rounded-lg">
                <Image
                  src="/temple.jpg"
                  alt="Temple visit"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold text-lg">Temple Visit</h3>
                  <p className="text-sm text-purple-100">Cultural experience</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Search Panel */}
        {isExpanded && (
          <div className="fixed inset-0 bg-purple-50 z-50">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-purple-100 rounded-full"
                >
                  <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="ml-4 text-xl font-semibold text-purple-900">Where to?</h2>
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
                    className="pl-12 pr-4 py-3 w-full border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
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
                    className="pl-12 pr-4 py-3 w-full border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  />
                </div>
              </div>

              {/* Recent Locations */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-purple-700 mb-4">RECENT LOCATIONS</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Home', address: '123 Home Street', icon: 'home' },
                    { name: 'Work', address: '456 Office Avenue', icon: 'work' },
                    { name: 'Mall', address: '789 Shopping Center', icon: 'location' },
                  ].map((location, index) => (
                    <button key={index} className="w-full flex items-center space-x-4 p-2 hover:bg-purple-100 rounded-lg transition-all">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-purple-900">{location.name}</div>
                        <div className="text-sm text-purple-600">{location.address}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 p-4">
          <div className="max-w-xl mx-auto">
            <button 
              onClick={() => selectedRide && router.push(`/book-ride?type=${selectedRide}`)}
              disabled={!selectedRide}
              className={`w-full py-4 px-6 rounded-lg font-medium transition duration-300 flex items-center justify-center space-x-2 ${
                selectedRide 
                  ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                  : 'bg-purple-200 cursor-not-allowed text-purple-400'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Choose Ride</span>
            </button>
          </div>
        </div>
      </div>
   
  );
}
