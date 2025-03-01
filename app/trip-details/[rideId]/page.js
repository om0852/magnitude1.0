'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaCar, FaUser, FaPhone, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaRoute, FaStar } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import io from 'socket.io-client';
import { useRef } from 'react';
import { Web3Integration } from '../../components/Web3Integration';
import { toast } from 'react-hot-toast';

// Dynamically import the Map component with no SSR
const TripMap = dynamic(() => import('../../components/TripMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  )
});

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  padding: 2rem;
`;

const TripCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const TripHeader = styled.div`
  background: linear-gradient(135deg, #6D28D9, #4C1D95);
  padding: 2rem;
  color: white;
  text-align: center;

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2rem;
    font-size: 0.875rem;
  }
`;

const OtpSection = styled.div`
  padding: 1.5rem;
  background: #F8F7FF;
  border-bottom: 1px solid #E5E7EB;
  text-align: center;

  h3 {
    color: #4C1D95;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .otp-display {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;

    .digit {
      width: 3rem;
      height: 3.5rem;
      background: white;
      border: 2px solid #6D28D9;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      color: #4C1D95;
    }
  }

  .instruction {
    color: #6B7280;
    font-size: 0.875rem;
  }
`;

const Section = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #f3f4f6;

  h2 {
    font-size: 1.25rem;
    color: #4C1D95;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: #f8f7ff;
  border-radius: 0.75rem;

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6D28D9;
  }

  .details {
    flex: 1;

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    p {
      color: #6b7280;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
`;

const LocationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .location-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f7ff;
    border-radius: 0.75rem;

    .icon {
      color: #6D28D9;
      margin-top: 0.25rem;
    }

    .text {
      flex: 1;

      h4 {
        font-size: 0.875rem;
        font-weight: 600;
        color: #4C1D95;
        margin-bottom: 0.25rem;
      }

      p {
        color: #6b7280;
        font-size: 0.875rem;
      }
    }
  }
`;

const TripStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;

  .stat-item {
    padding: 1rem;
    background: #f8f7ff;
    border-radius: 0.75rem;
    text-align: center;

    h4 {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 1.25rem;
      color: #4C1D95;
      font-weight: 600;
    }
  }
`;

const LiveTrackingInfo = styled.div`
  background: #f8f7ff;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4C1D95;
    font-weight: 500;

    .dot {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.5; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const MapWrapper = styled.div`
  height: 400px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;

  .map-legend {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #4b5563;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .pickup { background: #6D28D9; }
      .dropoff { background: #DC2626; }
      .user { background: #2563EB; }
      .driver { background: #059669; }
    }
  }
`;

const LiveStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  
  .stat {
    background: #f8f7ff;
    padding: 1rem;
    border-radius: 0.75rem;
    text-align: center;
    
    h4 {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: #4C1D95;
      font-weight: 600;
      font-size: 1.125rem;
    }
  }
`;

const PaymentSection = styled.div`
  padding: 2rem;
  background: #f8f7ff;
  border-radius: 1rem;
  margin-top: 1rem;
  text-align: center;

  h3 {
    color: #4C1D95;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  p {
    color: #6B7280;
    margin-bottom: 1.5rem;
  }

  .metamask-button {
    background: linear-gradient(135deg, #F6851B, #E4761B);
    color: white;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(246, 133, 27, 0.2);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    img {
      width: 24px;
      height: 24px;
    }
  }
`;

// Add new styled component for SOS button
const SOSButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #DC2626;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  border: none;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  cursor: pointer;
  z-index: 50;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    background: #B91C1C;
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SOSModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 100;
  width: 90%;
  max-width: 500px;

  h3 {
    color: #DC2626;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .emergency-options {
    display: grid;
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .emergency-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    background: #FEE2E2;
    color: #DC2626;
    border: 1px solid #FECACA;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #FEE2E2;
      transform: translateY(-2px);
    }
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #6B7280;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background: #F3F4F6;
      color: #374151;
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
`;

export default function TripDetails({ params }) {
  const unwrappedParams = use(params);
  const { rideId } = unwrappedParams;
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [liveStats, setLiveStats] = useState({
    distance: trip?.distance || '0',
    duration: trip?.duration || '0',
    fare: trip?.estimatedFare || '0'
  });
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const mapRef = useRef(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [currentDuration, setCurrentDuration] = useState('0');
  const [showSOSModal, setShowSOSModal] = useState(false);

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

  // Function to get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('User location:', location);
          setUserLocation(location);
          
          // If we have driver location and destination, update route
          if (driverLocation && toCoords) {
            const destination = { lat: parseFloat(toCoords[0]), lng: parseFloat(toCoords[1]) };
            console.log('Calculating route to destination:', destination);
            calculateRoute(driverLocation, destination);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  // Function to get coordinates from the Nominatim API
  const getCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Ride90 Application'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  // Function to format duration
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
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

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for driver location updates
    newSocket.on('driverLocationUpdate', (data) => {
      if (data.rideId === rideId) {
        const newDriverLocation = {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          timestamp: data.timestamp
        };
        
        console.log('New driver location:', newDriverLocation);
        setDriverLocation(newDriverLocation);

        // If we have both driver location and destination, update route
        if (toCoords) {
          const destination = { lat: parseFloat(toCoords[0]), lng: parseFloat(toCoords[1]) };
          console.log('Calculating route to destination:', destination);
          
          calculateRoute(newDriverLocation, destination)
            .then(routeData => {
              if (routeData) {
                console.log('Updated route with new driver location:', routeData);
                setRoutePoints(routeData.coordinates);
                setLiveStats(prev => ({
                  ...prev,
                  distance: routeData.distance,
                  duration: routeData.duration
                }));
              }
            });
        }
      }
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [rideId, toCoords]);

  // Add this function to check transaction status
  const checkTransactionStatus = async () => {
    try {
      const response = await axios.get(`/api/transactions/${rideId}`);
      if (response.data.success && response.data.data) {
        setTransactionStatus(response.data.data.status);
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  // Fetch trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching trip details for rideId:', rideId);
        
        const response = await axios.get(`/api/rides/${rideId}`);
        console.log('Raw API Response:', response);
        
        const tripData = response.data.data;
        console.log('Raw Trip Data:', tripData);

        // Validate trip data
        if (!tripData) {
          throw new Error('No trip data received');
        }

        // Validate required fields
        if (!tripData.pickupLocation && !tripData.pickup) {
          // console.error('Missing pickup location data');
        }
        if (!tripData.dropLocation && !tripData.destination) {
          // console.error('Missing drop location data');
        }

        // Format locations if they exist
        const formattedTripData = {
          ...tripData,
          pickup: {
            ...tripData.pickup,
            ...tripData.pickupLocation,
            address: tripData.pickup?.address || tripData.pickupLocation?.address,
            coordinates: tripData.pickup?.coordinates || tripData.pickupLocation?.coordinates,
            landmark: tripData.pickup?.landmark || tripData.pickupLocation?.landmark
          },
          dropoff: {
            ...tripData.destination,
            ...tripData.dropLocation,
            address: tripData.destination?.address || tripData.dropLocation?.address,
            coordinates: tripData.destination?.coordinates || tripData.dropLocation?.coordinates,
            landmark: tripData.destination?.landmark || tripData.dropLocation?.landmark
          },
          // Ensure other required fields are present
          distance: tripData.distance || '0',
          duration: tripData.duration || '0',
          fare: tripData.estimatedFare || tripData.fare || '0',
          status: tripData.status || 'unknown'
        };

        console.log('Formatted Trip Data:', formattedTripData);
        console.log('Pickup Location:', formattedTripData.pickup);
        console.log('Drop Location:', formattedTripData.dropoff);

        setTrip(formattedTripData);
        
        // Initialize live stats with trip data
        setLiveStats({
          distance: formattedTripData.distance || '0',
          duration: formattedTripData.duration || '0',
          fare: formattedTripData.estimatedFare || formattedTripData.fare || '0'
        });
        
        await updateTripCoordinates(formattedTripData);
        getCurrentLocation();
        await checkTransactionStatus();
      } catch (err) {
        console.error('Error fetching trip details:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load trip details. Please check console for more information.');
      } finally {
        setLoading(false);
      }
    };

    if (rideId) {
      fetchTripDetails();
    }
  }, [rideId]);

  // Update location periodically
  useEffect(() => {
    const locationInterval = setInterval(() => {
      getCurrentLocation();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(locationInterval);
  }, [trip]);

  // Add submitRating function
  const submitRating = async () => {
    try {
      const response = await axios.post(`/api/rides/${rideId}/rate`, {
        rating,
        feedback
      });

      if (response.data.success) {
        toast.success('Thank you for your rating!');
        // Update trip data to reflect the new rating
        setTrip(prev => ({
          ...prev,
          rating,
          feedback
        }));
        // Hide the rating UI
        setTransactionStatus('rated');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.error || 'Failed to submit rating. Please try again.');
    }
  };

  // Add function to handle MetaMask payment
  const handleMetaMaskPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast.error('Please install MetaMask to make a payment');
        return;
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create transaction
      const response = await axios.post('/api/transactions/create', {
        rideId,
        amount: trip.estimatedFare || trip.fare,
        paymentMethod: 'ETH'
      });

      if (response.data.success) {
        // Start transaction status polling
        const pollInterval = setInterval(async () => {
          const statusResponse = await axios.get(`/api/transactions/${rideId}`);
          if (statusResponse.data.success) {
            const status = statusResponse.data.data.status;
            setPaymentStatus(status);
            
            if (status === 'completed') {
              clearInterval(pollInterval);
              toast.success('Payment completed successfully!');
            }
          }
        }, 5000);

        toast.success('Payment initiated. Please confirm in MetaMask.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Add handleEmergency function
  const handleEmergency = async (type) => {
    try {
      // Send emergency alert to backend
      await axios.post('/api/emergency/alert', {
        rideId,
        type,
        location: userLocation,
        userId: trip.userId,
        driverId: trip.driverId
      });

      // Show success message
      toast.success('Emergency services have been notified');

      // Close modal
      setShowSOSModal(false);

      // If it's police or ambulance, attempt to call emergency services
      if (type === 'police') {
        window.location.href = 'tel:100';
      } else if (type === 'ambulance') {
        window.location.href = 'tel:102';
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast.error('Failed to send emergency alert. Please try calling emergency services directly.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center text-red-600">{error}</div>
      </PageContainer>
    );
  }

  if (!trip) {
    return (
      <PageContainer>
        <div className="text-center">No trip details found</div>
      </PageContainer>
    );
  }

  const mapCenter = userLocation || 
    (trip?.pickupLocation?.coordinates ? 
      [trip.pickupLocation.coordinates[0], trip.pickupLocation.coordinates[1]] : 
      [20.5937, 78.9629]);

  return (
    <PageContainer>
      <TripCard>
        <TripHeader>
          <h1>Trip Details</h1>
          <div className="status-badge">{trip.status}</div>
        </TripHeader>

        {trip.status === 'in_progress' && trip.otp && (
          <OtpSection>
            <h3>Share OTP with Driver</h3>
            <div className="otp-display">
              {trip.otp.split('').map((digit, index) => (
                <div key={index} className="digit">{digit}</div>
              ))}
            </div>
            <p className="instruction">
              Please share this OTP with your driver to start the ride
            </p>
          </OtpSection>
        )}

        <Section>
          <h2>Live Trip Stats</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="font-medium text-purple-900 mb-1">Distance</p>
              <p className="text-gray-700">{liveStats.distance} km</p>
            </div>
            <div>
              <p className="font-medium text-purple-900 mb-1">Duration</p>
              <p className="text-gray-700">{currentDuration}</p>
            </div>
            <div>
              <p className="font-medium text-purple-900 mb-1">Fare</p>
              <p className="text-gray-700">₹{liveStats.fare}</p>
            </div>
          </div>

          <MapWrapper>
            {showMap && (
              <>
                <TripMap
                  driverLocation={driverLocation}
                  userLocation={userLocation}
                  fromCoords={fromCoords}
                  toCoords={toCoords}
                  routePoints={routePoints}
                  trip={trip}
                />
                <div className="map-legend">
                  <div className="legend-item">
                    <div className="dot pickup"></div>
                    <span>Pickup Point</span>
                  </div>
                  <div className="legend-item">
                    <div className="dot dropoff"></div>
                    <span>Drop Point</span>
                  </div>
                  {userLocation && (
                    <div className="legend-item">
                      <div className="dot user"></div>
                      <span>Your Location</span>
                    </div>
                  )}
                  {driverLocation && (
                    <div className="legend-item">
                      <div className="dot driver"></div>
                      <span>Driver Location</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </MapWrapper>
        </Section>

        <Section>
          <h2>Driver Information</h2>
          {trip.driverDetails ? (
            <DriverInfo>
              <div className="avatar">
                {trip.driverDetails.photo ? (
                  <Image
                    src={trip.driverDetails.photo}
                    alt="Driver"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <FaUser size={24} />
                )}
              </div>
              <div className="details">
                <h3>{trip.driverDetails.name}</h3>
                <p><FaCar /> {trip.driverDetails.vehicleNumber}</p>
                <p><FaPhone /> {trip.driverDetails.contactNumber}</p>
                <p>⭐ {trip.driverDetails.rating} Rating</p>
                <p><FaRoute /> {trip.driverDetails.totalRides} Rides Completed</p>
              </div>
            </DriverInfo>
          ) : (
            <div className="text-gray-500 text-center py-4">
              Driver details not available
            </div>
          )}
        </Section>

        <Section>
          <h2>Trip Information</h2>
          <LocationInfo>
            <div className="location-item">
              <FaMapMarkerAlt className="icon" size={20} />
              <div className="text">
                <h4>Pickup Location</h4>
                <p>
                  {trip.pickup?.address || 
                   trip.pickup?.formatted_address || 
                   trip.pickup?.name ||
                   'Location not available'}
                </p>
                {trip.pickup?.landmark && (
                  <p className="text-sm text-gray-500 mt-1">
                    Landmark: {trip.pickup.landmark}
                  </p>
                )}
              </div>
            </div>
            <div className="location-item">
              <FaMapMarkerAlt className="icon" size={20} />
              <div className="text">
                <h4>Drop Location</h4>
                <p>
                  {trip.dropoff?.address || 
                   trip.dropoff?.formatted_address || 
                   trip.dropoff?.name ||
                   'Location not available'}
                </p>
                {trip.dropoff?.landmark && (
                  <p className="text-sm text-gray-500 mt-1">
                    Landmark: {trip.dropoff.landmark}
                  </p>
                )}
              </div>
            </div>
          </LocationInfo>
        </Section>

        {trip.status === 'completed' && (
          <Section>
            <h2>Payment</h2>
            <PaymentSection>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="text-center">
                  {transactionStatus === 'completed' || paymentStatus === 'completed' ? (
                    <>
                      <h3 className="text-xl font-semibold mb-2 text-green-600">Payment Completed</h3>
                      <p className="text-gray-600 mb-4">Thank you for using our service!</p>
                      
                      {transactionStatus !== 'rated' ? (
                        <>
                          <p className="text-gray-600 mb-4">Please rate your driver.</p>
                          <div className="flex items-center justify-center mb-4">
                            {[...Array(5)].map((_, index) => {
                              const ratingValue = index + 1;
                              return (
                                <button
                                  type="button"
                                  key={ratingValue}
                                  className={`text-3xl mr-2 focus:outline-none transition-colors duration-200 ${
                                    (hover || rating) >= ratingValue
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  onClick={() => setRating(ratingValue)}
                                  onMouseEnter={() => setHover(ratingValue)}
                                  onMouseLeave={() => setHover(null)}
                                >
                                  <FaStar />
                                </button>
                              );
                            })}
                          </div>
                          <textarea
                            className="w-full p-3 border border-gray-300 text-black rounded-lg mb-4"
                            placeholder="Share your experience with the driver (optional)"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows="3"
                          />
                          <button
                            onClick={submitRating}
                            disabled={!rating}
                            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Submit Rating
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <h3 className="text-xl font-semibold mb-2 text-green-600">Rating Submitted</h3>
                          <div className="flex justify-center mb-2">
                            {[...Array(rating)].map((_, index) => (
                              <FaStar key={index} className="text-yellow-400 text-2xl" />
                            ))}
                          </div>
                          {feedback && (
                            <p className="text-gray-600 italic">"{feedback}"</p>
                          )}
                          <p className="text-gray-600 mt-4">Thank you for your feedback!</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <Web3Integration 
                      ride={trip} 
                      onPaymentComplete={() => {
                        setPaymentStatus('completed');
                        checkTransactionStatus();
                      }}
                    />
                  )}
                </div>
              </div>
            </PaymentSection>
          </Section>
        )}
      </TripCard>

      {/* SOS Button */}
      <SOSButton onClick={() => setShowSOSModal(true)}>
        SOS
      </SOSButton>

      {/* SOS Modal */}
      {showSOSModal && (
        <>
          <Overlay onClick={() => setShowSOSModal(false)} />
          <SOSModal>
            <button 
              className="close-button"
              onClick={() => setShowSOSModal(false)}
            >
              ✕
            </button>
            <h3>Emergency Assistance</h3>
            <p className="text-gray-600">
              Select the type of emergency assistance you need:
            </p>
            <div className="emergency-options">
              <button 
                className="emergency-button"
                onClick={() => handleEmergency('police')}
              >
                <span>🚓</span>
                Police - 100
              </button>
              <button 
                className="emergency-button"
                onClick={() => handleEmergency('ambulance')}
              >
                <span>🚑</span>
                Ambulance - 102
              </button>
              <button 
                className="emergency-button"
                onClick={() => handleEmergency('support')}
              >
                <span>👥</span>
                Contact Support
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Your current location will be shared with emergency services.
            </p>
          </SOSModal>
        </>
      )}
    </PageContainer>
  );
} 