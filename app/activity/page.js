'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ActivityPage() {
  const router = useRouter();
  const [selectedRide, setSelectedRide] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isContentVisible, setIsContentVisible] = useState(true);

  // Handle tab change with animation
  const handleTabChange = (tab) => {
    setIsContentVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      setIsContentVisible(true);
    }, 300);
  };

  // Sample data - in a real app, this would come from an API or database
  const rides = {
    upcoming: [
      { id: 1, title: "Morning Commute", date: "2024-03-25", time: "08:00 AM", pickup: "Home", destination: "Office" },
      { id: 2, title: "Airport Transfer", date: "2024-03-26", time: "02:30 PM", pickup: "Home", destination: "Airport" },
    ],
    current: [
      { id: 3, title: "Shopping Trip", date: "2024-03-24", time: "Now", pickup: "Mall", destination: "Home", status: "In Progress" },
    ],
    past: [
      { id: 4, title: "Evening Return", date: "2024-03-23", time: "06:00 PM", pickup: "Office", destination: "Home", status: "Completed" },
      { id: 5, title: "Weekend Trip", date: "2024-03-22", time: "11:00 AM", pickup: "Home", destination: "Beach", status: "Completed" },
    ],
  };

  const handleRideClick = (ride) => {
    router.push(`/activity/trip/${ride.id}`);
  };

  const RideCard = ({ ride, type, index }) => (
    <div 
      onClick={() => handleRideClick(ride)}
      className="bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-indigo-100 group"
      style={{
        animation: `slideIn 0.5s ease-out forwards`,
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700">{ride.title}</h3>
        {ride.status && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            ride.status === "In Progress" 
              ? "bg-blue-50 text-blue-700" 
              : "bg-green-50 text-green-700"
          }`}>
            {ride.status}
          </span>
        )}
      </div>
      <div className="space-y-3 text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>{ride.date} - {ride.time}</p>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>From: {ride.pickup}</p>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p>To: {ride.destination}</p>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ tab, label }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`px-8 py-4 text-base font-medium rounded-t-xl transition-all duration-300 ${
        activeTab === tab
          ? 'bg-white text-purple-700 shadow-lg border-t-2 border-purple-500 transform -translate-y-1 hover:shadow-xl'
          : 'text-gray-600 hover:text-purple-600 hover:bg-white/10 hover:shadow-md'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .trustworthy-bg {
          background: linear-gradient(135deg, 
            #f3e8ff 0%,    /* Purple 100 */
            #e9d5ff 50%,   /* Purple 200 */
            #ddd6fe 100%   /* Purple 300 */
          );
        }

        .header-bg {
          background: linear-gradient(135deg, 
            #6b21a8 0%,    /* Purple 800 */
            #7e22ce 50%,   /* Purple 700 */
            #9333ea 100%   /* Purple 600 */
          );
        }
      `}</style>

      <div className="min-h-screen trustworthy-bg">
        <div className="header-bg">
          <div className="max-w-6xl mx-auto p-6">
            <div className="py-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <h1 className="text-4xl font-bold text-white tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    RIDE<span className="text-purple-300">-</span><span className="text-purple-200">90</span>
                  </h1>
                </div>
                <span className="px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium border border-white/20 backdrop-blur-sm">
                  Ride Sharing Platform
                </span>
              </div>
              <p className="text-indigo-100 text-lg max-w-2xl">
                Keep Track Of Your Rides..!
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex gap-1 px-6 pt-4">
              <TabButton tab="upcoming" label="Upcoming Rides" />
              <TabButton tab="current" label="Current Rides" />
              <TabButton tab="past" label="Past Rides" />
            </div>

            <div className={`${isContentVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 p-6 bg-gray-50/50`}>
              <div className="space-y-4">
                {rides[activeTab].map((ride, index) => (
                  <RideCard key={ride.id} ride={ride} type={activeTab} index={index} />
                ))}
                {rides[activeTab].length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No rides found in this category
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}