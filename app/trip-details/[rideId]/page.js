'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import Image from 'next/image';

const TripDetails = ({ params }) => {
  const { rideId } = use(params);
  const [ride, setRide] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRideDetails();
  }, []);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/rides/${rideId}`);
      console.log('Fetched ride data:', response.data);
      setRide(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch trip details');
      setLoading(false);
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
        <div className="text-gray-500">No trip details found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Trip Details</h1>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Status: {ride.status}
              </div>
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Fare: ₹{ride.estimatedFare}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* OTP Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold mb-4 text-green-800">Your OTP</h3>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold tracking-wider text-green-700 bg-white px-6 py-3 rounded-lg shadow-sm">
                    {ride.otp}
                  </div>
                  <div className="text-sm text-green-700">
                    Share this OTP with your driver to start the trip
                  </div>
                </div>
              </div>
            </div>

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

            {/* Trip Details */}
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

export default TripDetails; 