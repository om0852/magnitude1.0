'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const RideDetails = ({ params }) => {
  const { rideId } = use(params);
  const [ride, setRide] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    console.log('RideId from params:', rideId);
    fetchRideDetails();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Track and emit driver location
  useEffect(() => {
    if (!socket || !rideId) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const driverLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          rideId: rideId,
          timestamp: new Date().toISOString()
        };

        // Emit driver location update
        socket.emit('driverLocationUpdate', driverLocation);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, rideId]);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/driver/rides/${rideId}`);
      console.log('Fetched ride data:', response.data);
      setRide(response.data.data);
      setIsVerified(response.data.data.status === 'IN_PROGRESS');
      setLoading(false);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch ride details');
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      if (otpInput.length !== 4) {
        setError('Please enter a 4-digit OTP');
        return;
      }

      const response = await axios.post(`/api/driver/rides/${rideId}/verify-otp`, {
        otp: otpInput
      });

      if (response.data.success) {
        setIsVerified(true);
        toast.success('OTP verified successfully!');
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
            {!isVerified && (
              <div className="mb-6 p-6 bg-white/20 backdrop-blur-sm rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Verify Ride OTP</h2>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    maxLength="4"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4-digit OTP"
                    className="w-full px-4 py-2 text-lg font-mono tracking-wider text-purple-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    onClick={handleOtpSubmit}
                    disabled={otpInput.length !== 4}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-sm mt-2 text-white/80">
                  Ask the passenger for the 4-digit OTP to start the ride
                </p>
              </div>
            )}
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