'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';

const RideDetails = ({ params }) => {
  const { rideId } = use(params);
  const [ride, setRide] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('RideId from params:', rideId);
    fetchRideDetails();
  }, []);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/driver/rides/${rideId}`);
      console.log('Fetched ride data:', response.data);
      setRide(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch ride details');
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      if (otpInput.length !== 4) {
        setError('Please enter a 4-digit OTP');
        return;
      }

      const response = await axios.post(`/api/driver/rides/${rideId}/verify-otp`, {
        otp: otpInput
      });

      if (response.data.success) {
        fetchRideDetails();
        setOtpInput('');
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-red-500 text-center p-6 bg-white rounded-xl shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-500">No ride details found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Ride Details</h1>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Status: {ride.status}
              </div>
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Fare: ₹{ride.estimatedFare}
              </div>
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Distance: {ride.distance} km
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Driver Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-900">Driver Details</h2>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-purple-900 mb-1">Name</p>
                    <p className="text-gray-700">{ride.driverDetails?.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900 mb-1">Phone</p>
                    <p className="text-gray-700">{ride.driverDetails?.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900 mb-1">Vehicle</p>
                    <p className="text-gray-700">{ride.driverDetails?.vehicleModel} ({ride.driverDetails?.vehicleNumber})</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900 mb-1">Rating</p>
                    <p className="text-gray-700">⭐ {ride.driverDetails?.rating.toFixed(1)} ({ride.driverDetails?.totalRides} rides)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-900">Passenger Details</h2>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-purple-900 mb-1">Name</p>
                    <p className="text-gray-700">{ride.userDetails?.name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900 mb-1">Phone</p>
                    <p className="text-gray-700">{ride.userDetails?.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900 mb-1">Email</p>
                    <p className="text-gray-700">{ride.userDetails?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900 mb-1">Gender</p>
                    <p className="text-gray-700">{ride.userDetails?.gender || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-900">Trip Details</h2>
              <div className="space-y-6">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <div className="mb-6">
                    <p className="font-medium text-purple-900 mb-2">Pickup Location</p>
                    <p className="text-gray-700">{ride.pickupLocation?.address}</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900 mb-2">Drop-off Location</p>
                    <p className="text-gray-700">{ride.dropLocation?.address}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-100">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium text-purple-900 mb-1">Distance</p>
                        <p className="text-gray-700">{ride.distance} km</p>
                      </div>
                      <div>
                        <p className="font-medium text-purple-900 mb-1">Duration</p>
                        <p className="text-gray-700">{ride.duration}</p>
                      </div>
                      <div>
                        <p className="font-medium text-purple-900 mb-1">Fare</p>
                        <p className="text-gray-700">₹{ride.estimatedFare}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Verification Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                <h3 className="text-xl font-semibold mb-4 text-purple-900">Verify Passenger OTP</h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    maxLength="4"
                    className="border border-purple-200 p-3 rounded-lg w-36 text-center text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter OTP"
                  />
                  <button
                    onClick={verifyOTP}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Verify
                  </button>
                </div>
                {error && <p className="text-red-500 mt-3">{error}</p>}
              </div>
            </div>

            {/* Timestamps */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>Started: {new Date(ride.startTime).toLocaleString()}</p>
              <p>Created: {new Date(ride.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetails; 