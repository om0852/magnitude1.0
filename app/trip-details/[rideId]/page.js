'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaCar, FaUser, FaPhone, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaRoute } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import io from 'socket.io-client';
import { useRef } from 'react';

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
    distance: '0',
    duration: '0',
    fare: '0'
  });
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const mapRef = useRef(null);

  // Function to calculate route between two points
  const calculateRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      const distance = (route.distance / 1000).toFixed(1); // Convert to km
      const duration = Math.round(route.duration / 60); // Convert to minutes

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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('User location:', location);
          setUserLocation(location);
          
          if (trip?.dropLocation?.coordinates) {
            const destination = {
              lat: parseFloat(trip.dropLocation.coordinates[0]),
              lng: parseFloat(trip.dropLocation.coordinates[1])
            };
            console.log('Destination:', destination);
            calculateRoute(location, destination);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
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

  // Update trip coordinates
  const updateTripCoordinates = async (trip) => {
    console.log(trip)
    if (trip?.pickupLocation?.address && trip?.dropLocation?.address) {
      console.log(trip.pickupLocation.address, trip.dropLocation.address)
      try {
        const pickup = await getCoordinates(trip.pickupLocation.address);
        const dropoff = await getCoordinates(trip.dropLocation.address);

        if (pickup && dropoff) {
          setFromCoords(pickup);
          setToCoords(dropoff);
          setShowMap(true);

          // Calculate route between pickup and dropoff
          const routeData = await calculateRoute(
            { lat: pickup[0], lng: pickup[1] },
            { lat: dropoff[0], lng: dropoff[1] }
          );

          if (routeData) {
            setRoutePoints(routeData.coordinates);
            setLiveStats(prev => ({
              ...prev,
              distance: routeData.distance,
              duration: routeData.duration
            }));
          }
        }
      } catch (error) {
        console.error('Error updating coordinates:', error);
        setError('Could not load trip route');
      }
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for driver location updates
    newSocket.on('driverLocationUpdate', (data) => {
      if (data.rideId === rideId) {
        setDriverLocation({
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp
        });

        // If we have both driver location and destination, update route
        if (toCoords) {
          calculateRoute(
            { lat: data.lat, lng: data.lng },
            { lat: toCoords[0], lng: toCoords[1] }
          ).then(routeData => {
            if (routeData) {
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

  // Fetch trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/rides/${rideId}`);
        setTrip(response.data.data);
        console.log(response.data.data)
        await updateTripCoordinates(response.data.data); // Update coordinates after fetching trip details
        getCurrentLocation(); // Get user location after fetching trip details
      } catch (err) {
        setError('Failed to load trip details');
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
          <LiveStats>
            <div className="stat">
              <h4>Distance Remaining</h4>
              <p>{liveStats.distance} km</p>
            </div>
            <div className="stat">
              <h4>Estimated Time</h4>
              <p>{liveStats.duration} mins</p>
            </div>
            <div className="stat">
              <h4>Estimated Fare</h4>
              <p>₹{liveStats.fare}</p>
            </div>
          </LiveStats>

          <MapWrapper>
            {showMap && (
              <TripMap
                driverLocation={driverLocation}
                fromCoords={fromCoords}
                toCoords={toCoords}
                routePoints={routePoints}
                trip={trip}
              />
            )}
          </MapWrapper>
        </Section>

        <Section>
          <h2>Driver Information</h2>
          <DriverInfo>
            <div className="avatar">
              {trip.driverPhoto ? (
                <Image
                  src={trip.driverPhoto}
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
              <p>⭐ {trip.driverDetails.rating || '4.5'} Rating</p>
              <p><FaRoute /> {trip.driverDetails.totalRides || '0'} Rides Completed</p>
            </div>
          </DriverInfo>
        </Section>

        <Section>
          <h2>Trip Information</h2>
          <LocationInfo>
            <div className="location-item">
              <FaMapMarkerAlt className="icon" size={20} />
              <div className="text">
                <h4>Pickup Location</h4>
                <p>{trip.pickupLocation.address}</p>
              </div>
            </div>
            <div className="location-item">
              <FaMapMarkerAlt className="icon" size={20} />
              <div className="text">
                <h4>Drop Location</h4>
                <p>{trip.dropLocation.address}</p>
              </div>
            </div>
          </LocationInfo>
        </Section>

        <Section>
          <h2>Trip Stats</h2>
          <TripStats>
            <div className="stat-item">
              <h4>Distance</h4>
              <p>{trip.distance} km</p>
            </div>
            <div className="stat-item">
              <h4>Duration</h4>
              <p>{trip.duration}</p>
            </div>
            <div className="stat-item">
              <h4>Fare</h4>
              <p>₹{trip.estimatedFare}</p>
            </div>
          </TripStats>
        </Section>
      </TripCard>
    </PageContainer>
  );
} 