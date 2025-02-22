'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [userRating, setUserRating] = useState({
    overall: 0,
    comfort: 0,
    timeliness: 0,
    driver: 0
  });
  const [tipAmount, setTipAmount] = useState('');
  const [customTip, setCustomTip] = useState('');
  const [isProcessingTip, setIsProcessingTip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Sample data - in a real app, this would come from an API
  const trips = {
    1: { id: 1, title: "Morning Commute", date: "2024-03-25", time: "08:00 AM", pickup: "Home", destination: "Office", rating: 4.5, tips: ["Keep your belongings ready 5 mins before pickup", "Check weather conditions before ride"] },
    2: { id: 2, title: "Airport Transfer", date: "2024-03-26", time: "02:30 PM", pickup: "Home", destination: "Airport", rating: 4.8, tips: ["Book 3 hours prior to flight", "Keep your documents handy"] },
    3: { id: 3, title: "Shopping Trip", date: "2024-03-24", time: "Now", pickup: "Mall", destination: "Home", status: "In Progress", rating: 4.2, tips: ["Ensure all shopping bags are properly secured", "Double check nothing is left behind"] },
    4: { id: 4, title: "Evening Return", date: "2024-03-23", time: "06:00 PM", pickup: "Office", destination: "Home", status: "Completed", rating: 4.7, tips: ["Check office timings", "Book in advance during peak hours"] },
    5: { id: 5, title: "Weekend Trip", date: "2024-03-22", time: "11:00 AM", pickup: "Home", destination: "Beach", status: "Completed", rating: 4.9, tips: ["Carry beach essentials", "Check traffic conditions"] },
  };

  useEffect(() => {
    const tripId = parseInt(params.id);
    setTrip(trips[tripId]);
  }, [params.id]);

  const TabButton = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
        activeTab === tab
          ? 'bg-purple-100 text-purple-700 shadow-sm'
          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const handleRatingSubmit = () => {
    setIsSubmitting(true);
    // Here you would typically make an API call to save the rating
    setTimeout(() => {
      setIsSubmitting(false);
      // Show success message or redirect
      alert('Thank you for your rating!');
    }, 1000);
  };

  const handleStarClick = (rating) => {
    setUserRating(prev => ({
      ...prev,
      overall: rating
    }));
  };

  const handleSliderChange = (category, value) => {
    setUserRating(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleTipSubmit = () => {
    setIsProcessingTip(true);
    // Here you would typically make an API call to process the tip
    setTimeout(() => {
      setIsProcessingTip(false);
      alert('Tip has been processed successfully!');
      setTipAmount('');
      setCustomTip('');
    }, 1000);
  };

  const handleTipSelection = (amount) => {
    setTipAmount(amount);
    setCustomTip('');
  };

  const handleCustomTipChange = (value) => {
    setCustomTip(value);
    setTipAmount('');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Trip Details</h2>
                <div className="bg-purple-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Date</p>
                      <p className="text-gray-900">{trip.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Time</p>
                      <p className="text-gray-900">{trip.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Location Information</h2>
                <div className="bg-purple-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Pickup Location</p>
                      <p className="text-gray-900">{trip.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Destination</p>
                      <p className="text-gray-900">{trip.destination}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Trip Actions</h2>
                <div className="bg-purple-50 rounded-xl p-4 space-y-4">
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 font-medium shadow-sm hover:shadow flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    View Ticket
                  </button>
                  <button className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-300 font-medium border border-purple-200 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Get Help
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h2>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-gray-600">
                    Need to make changes to your trip? Contact our support team for assistance with modifications or cancellations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'tips':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Add a Tip for Your Driver</h2>
                  <p className="text-gray-600 mb-6">Show your appreciation for great service with a tip!</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[50, 100, 150].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleTipSelection(amount)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        tipAmount === amount
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customTip}
                    onChange={(e) => handleCustomTipChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-purple-100/50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span>Tip Amount</span>
                    <span className="font-medium">₹{tipAmount || customTip || '0'}</span>
                  </div>
                </div>

                <button
                  onClick={handleTipSubmit}
                  disabled={isProcessingTip || (!tipAmount && !customTip)}
                  className={`w-full px-4 py-3 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 ${
                    isProcessingTip || (!tipAmount && !customTip)
                      ? 'bg-purple-300 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isProcessingTip ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Send Tip</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      case 'rating':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Rate Your Trip</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleStarClick(star)}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`w-8 h-8 transition-colors duration-200 ${
                              star <= (hoverRating || userRating.overall) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-purple-700">
                      {userRating.overall > 0 ? userRating.overall.toFixed(1) : '--'}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Comfort</span>
                      <span className="text-sm font-medium text-purple-600">{userRating.comfort}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userRating.comfort}
                      onChange={(e) => handleSliderChange('comfort', parseInt(e.target.value))}
                      className="w-full h-2 bg-purple-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Timeliness</span>
                      <span className="text-sm font-medium text-purple-600">{userRating.timeliness}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userRating.timeliness}
                      onChange={(e) => handleSliderChange('timeliness', parseInt(e.target.value))}
                      className="w-full h-2 bg-purple-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Driver</span>
                      <span className="text-sm font-medium text-purple-600">{userRating.driver}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userRating.driver}
                      onChange={(e) => handleSliderChange('driver', parseInt(e.target.value))}
                      className="w-full h-2 bg-purple-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleRatingSubmit}
                    disabled={isSubmitting || userRating.overall === 0}
                    className={`w-full px-4 py-2 text-white rounded-lg font-medium shadow-sm hover:shadow flex items-center justify-center gap-2 ${
                      isSubmitting || userRating.overall === 0
                        ? 'bg-purple-300 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Submit Rating</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
                  <p className="text-gray-600 mb-6">Select a category below to get the assistance you need.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:bg-purple-50 transition-all duration-200 group">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 mb-1">Find Lost Item</h3>
                      <p className="text-sm text-gray-500">Report and track items you left in the vehicle</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:bg-purple-50 transition-all duration-200 group">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 mb-1">Report Safety Issue</h3>
                      <p className="text-sm text-gray-500">Report any safety concerns during your trip</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:bg-purple-50 transition-all duration-200 group">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 mb-1">Provide Driver Feedback</h3>
                      <p className="text-sm text-gray-500">Share specific feedback about your driver</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:bg-purple-50 transition-all duration-200 group">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 mb-1">Get Ride Help</h3>
                      <p className="text-sm text-gray-500">Get assistance with ride-related issues</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:bg-purple-50 transition-all duration-200 group">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 mb-1">View Invoice</h3>
                      <p className="text-sm text-gray-500">Access and download trip invoice</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="bg-purple-100/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      For emergency assistance, please call our 24/7 helpline at <span className="font-medium text-purple-700">1800-123-4567</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!trip) {
    return (
      <div className="min-h-screen trustworthy-bg flex items-center justify-center">
        <div className="text-purple-700 text-xl">Loading trip details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen trustworthy-bg">
      <style jsx global>{`
        .trustworthy-bg {
          background: linear-gradient(135deg, 
            #f3e8ff 0%,    /* Purple 100 */
            #e9d5ff 50%,   /* Purple 200 */
            #ddd6fe 100%   /* Purple 300 */
          );
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
              {trip.status && (
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  trip.status === "In Progress" 
                    ? "bg-blue-50 text-blue-700" 
                    : "bg-green-50 text-green-700"
                }`}>
                  {trip.status}
                </span>
              )}
            </div>
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Rides
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <TabButton 
              tab="details" 
              label="Details"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <TabButton 
              tab="tips" 
              label="Tip"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />
            <TabButton 
              tab="rating" 
              label="Rating"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
            />
            <TabButton 
              tab="help" 
              label="Help"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 