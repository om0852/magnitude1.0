'use client';

import { useState, useEffect, use, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { Web3Integration } from '../../../components/Web3Integration';
import dynamic from 'next/dynamic';

// Dynamically import the Map component with no SSR
const TripMap = dynamic(() => import('../../../components/TripMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  )
});

const RideDetails = ({ params }) => {
  const { rideId } = use(params);
  const [ride, setRide] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [currentDuration, setCurrentDuration] = useState('0');
  
  // Map related states
  const [userLocation, setUserLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const mapRef = useRef(null);
  const [liveStats, setLiveStats] = useState({
    distance: '0',
    duration: '0',
    fare: '0'
  });

  // Add formatDuration function
  const formatDuration = (minutes) => {
    if (!minutes) return '0 mins';
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Function to calculate duration
  const calculateDuration = () => {
    if (!ride?.startTime) return '0';
    
    const start = new Date(ride.startTime);
    const end = ride.endTime ? new Date(ride.endTime) : new Date();
    const durationInMinutes = Math.floor((end - start) / (1000 * 60));
    
    if (durationInMinutes < 60) {
      return `${durationInMinutes} mins`;
    } else {
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  // Update duration every minute for ongoing rides
  useEffect(() => {
    if (ride && ride.startTime && !ride.endTime) {
      const interval = setInterval(() => {
        setCurrentDuration(calculateDuration());
      }, 60000); // Update every minute

      setCurrentDuration(calculateDuration()); // Initial calculation
      
      return () => clearInterval(interval);
    } else if (ride?.startTime && ride?.endTime) {
      setCurrentDuration(calculateDuration()); // Set final duration for completed rides
    }
  }, [ride]);

  // Add function to check transaction status
  const checkTransactionStatus = async () => {
    try {
      const response = await axios.get(`/api/transactions/${rideId}`);
      if (response.data.success && response.data.data) {
        setTransactionStatus(response.data.data.status);
        
        // If transaction is completed, update UI accordingly
        if (response.data.data.status === 'completed') {
          toast.success('Payment completed successfully!');
          // You might want to update ride status or perform other actions here
        }
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      // Don't show error toast for initial pending status
      if (error.response?.status !== 404) {
        toast.error('Failed to check payment status');
      }
      // Set status to pending if there's an error
      setTransactionStatus('pending');
    }
  };

  useEffect(() => {
    console.log('RideId from params:', rideId);
    fetchRideDetails();
    checkTransactionStatus(); // Initial check

    // Set up interval to check payment status
    const interval = setInterval(checkTransactionStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
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
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        
        setDriverLocation(location);
        setLastUpdateTime(new Date().toISOString());

        // Emit driver location update
        socket.emit('driverLocationUpdate', {
          ...location,
          rideId: rideId
        });
        
        // If we have destination coordinates, update route
        if (toCoords) {
          const destination = { lat: parseFloat(toCoords[0]), lng: parseFloat(toCoords[1]) };
          calculateRoute(location, destination)
            .then(routeData => {
              if (routeData) {
                setRoutePoints(routeData.coordinates);
                setLiveStats(prev => ({
                  ...prev,
                  distance: routeData.distance,
                  duration: routeData.duration
                }));
                setCurrentDuration(formatDuration(routeData.duration));
              }
            });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location. Please enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, rideId, toCoords]);

  // Update coordinates when ride data is fetched
  useEffect(() => {
    if (ride) {
      updateTripCoordinates(ride);
    }
  }, [ride]);

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
        toast.success('OTP verified successfully! Ride started.');
        fetchRideDetails();
        setOtpInput('');
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      toast.error(err.response?.data?.error || 'Failed to verify OTP');
      setError('Failed to verify OTP');
    }
  };

  const handleCompleteRide = async () => {
    try {
      const response = await axios.put(`/api/driver/rides/${rideId}`, {
        status: 'completed',
        endTime: new Date()
      });

      if (response.data.success) {
        toast.success('Ride completed successfully!');
        fetchRideDetails();
      }
    } catch (err) {
      toast.error('Failed to complete ride');
      console.error('Error completing ride:', err);
    }
  };

  // Function to calculate route between two points
  const calculateRoute = async (start, end) => {
    try {
      // Ensure coordinates are in the correct format (lng,lat)
      console.log('Calculating route with coordinates:', start, end);
      
      // Swap lat/lng if needed to match OSRM's expected format
      const startCoord = `${start.lng},${start.lat}`;
      const endCoord = `${end.lng},${end.lat}`;
      
      const url = `https://router.project-osrm.org/route/v1/driving/${startCoord};${endCoord}?overview=full&geometries=geojson`;
      console.log('OSRM URL:', url);

      const response = await fetch(url);
      const data = await response.json();
      console.log('OSRM Response:', data);

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      const distance = (route.distance / 1000).toFixed(1); // Convert to km
      const duration = Math.round(route.duration / 60); // Convert to minutes

      console.log('Calculated route:', { distance, duration, coordinates: coordinates.length });
      return {
        coordinates,
        distance,
        duration
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      return null;
    }
  };

  // Update trip coordinates
  const updateTripCoordinates = async (trip) => {
    try {
      console.log('Updating coordinates for trip:', trip);

      // Get pickup coordinates with fallbacks
      let pickup = null;
      if (trip?.pickup?.lat && trip?.pickup?.lng) {
        pickup = [trip.pickup.lat, trip.pickup.lng];
      } else if (trip?.pickup?.coordinates) {
        pickup = trip.pickup.coordinates;
      } else if (trip?.pickupLocation?.lat && trip?.pickupLocation?.lng) {
        pickup = [trip.pickupLocation.lat, trip.pickupLocation.lng];
      } else if (trip?.pickupLocation?.coordinates) {
        pickup = trip.pickupLocation.coordinates;
      }

      // Get dropoff coordinates with fallbacks
      let dropoff = null;
      if (trip?.dropoff?.lat && trip?.dropoff?.lng) {
        dropoff = [trip.dropoff.lat, trip.dropoff.lng];
      } else if (trip?.dropoff?.coordinates) {
        dropoff = trip.dropoff.coordinates;
      } else if (trip?.destination?.lat && trip?.destination?.lng) {
        dropoff = [trip.destination.lat, trip.destination.lng];
      } else if (trip?.destination?.coordinates) {
        dropoff = trip.destination.coordinates;
      }

      console.log('Extracted coordinates:', { pickup, dropoff });

      // Validate coordinates
      const isValidCoordinate = (coord) => {
        const isValid = Array.isArray(coord) && 
               coord.length === 2 && 
               !isNaN(parseFloat(coord[0])) && 
               !isNaN(parseFloat(coord[1])) &&
               parseFloat(coord[0]) >= -90 && 
               parseFloat(coord[0]) <= 90 && 
               parseFloat(coord[1]) >= -180 && 
               parseFloat(coord[1]) <= 180;
        
        if (!isValid) {
          console.error('Invalid coordinate format:', coord);
        }
        return isValid;
      };

      if (!isValidCoordinate(pickup)) {
        console.error('Invalid pickup coordinates:', pickup);
        return;
      }

      if (!isValidCoordinate(dropoff)) {
        console.error('Invalid dropoff coordinates:', dropoff);
        return;
      }

      // Ensure coordinates are in the correct format
      const startPoint = { 
        lat: parseFloat(pickup[0]), 
        lng: parseFloat(pickup[1])
      };
      const endPoint = { 
        lat: parseFloat(dropoff[0]), 
        lng: parseFloat(dropoff[1])
      };

      console.log('Formatted coordinates for route calculation:', { startPoint, endPoint });

      setFromCoords(pickup);
      setToCoords(dropoff);
      setShowMap(true);

      // Calculate route between pickup and dropoff
      const routeData = await calculateRoute(startPoint, endPoint);

      if (routeData) {
        console.log('Route calculation successful:', routeData);
        setRoutePoints(routeData.coordinates);
        setLiveStats(prev => ({
          ...prev,
          distance: trip.distance || routeData.distance || '0',
          duration: routeData.duration || '0'
        }));
        // Update current duration with the calculated value
        setCurrentDuration(formatDuration(routeData.duration));
      } else {
        console.error('Failed to calculate route between points');
      }
    } catch (error) {
      console.error('Error in updateTripCoordinates:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setError('Could not load trip route. Please check console for more information.');
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
            {/* Add Payment Status Badge */}
            <div className="flex items-center space-x-3 mb-4">
              <div className={`px-4 py-1.5 rounded-full text-sm backdrop-blur-sm ${
                transactionStatus === 'completed' 
                  ? 'bg-green-500/20 text-green-100' 
                  : 'bg-yellow-500/20 text-yellow-100'
              }`}>
                Payment: {transactionStatus === 'completed' ? 'Done' : 'Pending'}
              </div>
            </div>
            {ride.status === 'in_progress' && (
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
            {ride.status === 'accepted' && (
              <div className="mb-6 p-6 bg-white/20 backdrop-blur-sm rounded-xl">
                <button
                  onClick={handleCompleteRide}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 font-semibold"
                >
                  Complete Ride
                </button>
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
                    <p className="text-gray-700">{ride.driverDetails?.contactNumber}</p>
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
                        <p className="text-gray-700">{currentDuration}</p>
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

            {/* Payment Status Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-900">Payment Status</h2>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-900 mb-2">Status</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      transactionStatus === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transactionStatus === 'completed' ? 'Done' : 'Pending'}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900 mb-2">Amount</p>
                    <p className="text-gray-700">₹{ride.estimatedFare}</p>
                  </div>
                </div>
                {transactionStatus === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-purple-100">
                    <div className="flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Payment completed
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add Web3 Integration */}
           

            {/* Live Map Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-900">Live Trip Tracking</h2>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="font-medium text-purple-900 mb-1">Distance</p>
                      <p className="text-gray-700">{liveStats.distance} km</p>
                    </div>
                    {/* <div>
                      <p className="font-medium text-purple-900 mb-1">Duration</p>
                      <p className="text-gray-700">{currentDuration}</p>
                    </div>
                    <div>
                      <p className="font-medium text-purple-900 mb-1">Fare</p>
                      <p className="text-gray-700">₹{liveStats.fare}</p>
                    </div> */}
                  </div>
                  <div className="h-[400px] relative rounded-xl overflow-hidden">
                    {showMap && (
                      <>
                        <TripMap
                          driverLocation={driverLocation}
                          userLocation={userLocation}
                          fromCoords={fromCoords}
                          toCoords={toCoords}
                          routePoints={routePoints}
                          trip={ride}
                        />
                        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
                          <div className="space-y-2 text-sm text-gray-800">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-violet-600"></div>
                              <span>Pickup Point</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-600"></div>
                              <span>Drop Point</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-600"></div>
                              <span>Your Location</span>
                            </div>
                          </div>
                        </div>
                        {driverLocation && (
                          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
                            <div className="text-sm text-gray-800">
                              <div className="font-medium mb-1">Current Location</div>
                              <div>Lat: {driverLocation.lat.toFixed(6)}</div>
                              <div>Lng: {driverLocation.lng.toFixed(6)}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {lastUpdateTime && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                    </p>
                  )}
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