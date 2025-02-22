'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

// Fix for default marker icons in Leaflet
const sourceIcon = L.icon({
  iconUrl: '/source-marker.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const destinationIcon = L.icon({
  iconUrl: '/destination-marker.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const BookingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const BookingCard = styled.div`
  max-width: 1300px;
  width: 100%;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #4C1D95;
  margin-bottom: 2.5rem;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #6D28D9, #4C1D95);
    border-radius: 2px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #4C1D95;
  margin-left: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem 1.25rem;
  border: 2px solid #E5E7EB;
  border-radius: 1rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  color: #1F2937;
  background: white;
  width: 100%;

  &:focus {
    border-color: #6D28D9;
    box-shadow: 0 0 0 4px rgba(109, 40, 217, 0.1);
  }

  &::placeholder {
    color: #9CA3AF;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%);
  color: white;
  padding: 1rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 400px;
  margin: 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #E5E7EB;
    cursor: not-allowed;
    transform: none;
  }
`;

const LocationIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: #6D28D9;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #EDE9FE;
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
    transition: all 0.2s ease;
  }
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;

  ${Input} {
    ${props => props.$isLoading && `
      padding-right: 3rem;
      background-color: #F9FAFB;
    `}
  }
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 1rem;
  margin-top: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.div`
  padding: 1rem;
  cursor: pointer;
  color: #4B5563;
  transition: all 0.2s ease;

  &:hover {
    background-color: #F3F4F6;
    color: #6D28D9;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #E5E7EB;
  }
`;

const SelectedLocations = styled.div`
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.05) 0%, rgba(76, 29, 149, 0.1) 100%);
  border: 2px solid rgba(109, 40, 217, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const LocationRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  
  &:first-child {
    border-bottom: 1px solid rgba(109, 40, 217, 0.2);
    padding-bottom: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const LocationMarker = styled.div`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: ${props => props.type === 'from' ? '#6D28D9' : '#4C1D95'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const LocationText = styled.div`
  flex: 1;
  
  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6D28D9;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  p {
    font-size: 1rem;
    color: #4C1D95;
    line-height: 1.4;
  }
`;

const MapWrapper = styled.div`
  height: 450px;
  width: 100%;
  margin-top: 2.5rem;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #E5E7EB;
`;

const ErrorMessage = styled.div`
  background: #FEE2E2;
  color: #991B1B;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border: 1px solid #FCA5A5;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const RideDetails = styled.div`
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.05) 0%, rgba(76, 29, 149, 0.1) 100%);
  border: 2px solid rgba(109, 40, 217, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.1);
  backdrop-filter: blur(10px);
`;

const RideDetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, rgba(109, 40, 217, 0.1), rgba(109, 40, 217, 0.2), rgba(109, 40, 217, 0.1));
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  color: #6D28D9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  font-size: 1.5rem;
  color: #4C1D95;
  font-weight: 700;
`;

const PriceBreakdown = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  color: #6D28D9;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  div {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(109, 40, 217, 0.05);
    }
  }
`;

const VehicleOptions = styled.div`
  margin-top: 2rem;
  display: grid;
  gap: 1rem;
`;

const VehicleOption = styled.button`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: ${props => props.$isSelected ? 'rgba(109, 40, 217, 0.1)' : 'white'};
  border: 2px solid ${props => props.$isSelected ? '#6D28D9' : '#E5E7EB'};
  border-radius: 1rem;
  transition: all 0.2s ease;
  width: 100%;
  cursor: pointer;

  &:hover {
    background: rgba(109, 40, 217, 0.05);
    border-color: #6D28D9;
  }
`;

const VehicleIcon = styled.div`
  width: 48px;
  height: 48px;
  margin-right: 1rem;
  position: relative;
`;

const VehicleInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const VehicleTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #4C1D95;
  margin-bottom: 0.25rem;
`;

const VehiclePrice = styled.div`
  font-size: 1rem;
  color: #6D28D9;
`;

const VehiclePriceAmount = styled.span`
  font-weight: 600;
`;

const RouteMap = ({ fromCoords, toCoords, onRouteData }) => {
  const map = useMap();

  useEffect(() => {
    if (fromCoords && toCoords) {
      const bounds = L.latLngBounds([fromCoords, toCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });

      fetch(`https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`)
        .then(response => response.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const routeLine = L.geoJSON(route.geometry, {
              style: {
                color: '#6D28D9',
                weight: 4,
                opacity: 0.7,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: '1, 8'
              },
            });
            routeLine.addTo(map);

            // Calculate and format route details
            const distanceInKm = (route.distance / 1000).toFixed(1);
            
            // Calculate actual travel time considering traffic and stops
            const baseMinutes = Math.round(route.duration / 60);
            const trafficFactor = 1.2; // 20% additional time for traffic
            const stopsFactor = 1.1; // 10% additional time for stops
            const totalMinutes = Math.round(baseMinutes * trafficFactor * stopsFactor);
            
            // Format time in hours and minutes if more than 60 minutes
            let timeDisplay;
            if (totalMinutes > 60) {
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              timeDisplay = `${hours}h ${minutes}m`;
            } else {
              timeDisplay = `${totalMinutes}m`;
            }

            // Calculate price at ₹5 per kilometer
            const baseFare = 50; // Base fare
            const perKmRate = 5; // ₹5 per kilometer
            const estimatedPrice = (baseFare + (distanceInKm * perKmRate)).toFixed(0);

            onRouteData({
              distance: distanceInKm,
              duration: timeDisplay,
              price: estimatedPrice,
              details: {
                baseFare: baseFare,
                perKmCharge: (distanceInKm * perKmRate).toFixed(0)
              }
            });
          }
        })
        .catch(error => {
          console.error('Error fetching route:', error);
        });
    }
  }, [fromCoords, toCoords, map, onRouteData]);

  return null;
};

const suggestions = [
  {
    id: 1,
    title: 'Trip',
    icon: '/taxi.png',
    multiplier: 1.0,
    basePrice: 50,
    perKmRate: 5,
  },
  {
    id: 2,
    title: 'Auto',
    icon: '/rickshaw.png',
    multiplier: 0.8,
    basePrice: 30,
    perKmRate: 4,
  },
  {
    id: 3,
    title: 'Intercity',
    icon: '/suv.png',
    multiplier: 1.5,
    basePrice: 100,
    perKmRate: 8,
  },
  {
    id: 4,
    title: 'Parcel',
    icon: '/parcel.png',
    multiplier: 1.2,
    basePrice: 60,
    perKmRate: 6,
  },
  {
    id: 5,
    title: 'Reserve',
    icon: '/reserve.png',
    multiplier: 1.3,
    basePrice: 80,
    perKmRate: 7,
  },
];

const ConfirmButton = styled(SubmitButton)`
  margin-top: 1rem;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
  }
`;

const BottomDrawer = styled.div`
  position: fixed;
  bottom: ${props => props.show ? '0' : '-100%'};
  left: 0;
  right: 0;
  background: white;
  padding: 2rem;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  transition: bottom 0.3s ease-in-out;
  z-index: 1000;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const ConnectingAnimation = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 2rem 0;

  .ripple {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .ripple div {
    position: absolute;
    border: 4px solid #059669;
    border-radius: 50%;
    animation: ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    opacity: 1;
  }

  .ripple div:nth-child(2) {
    animation-delay: -0.5s;
  }

  @keyframes ripple {
    0% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      top: 0px;
      left: 0px;
      width: 72px;
      height: 72px;
      opacity: 0;
    }
  }

  .car-icon {
    animation: bounce 1s ease infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const CancelButton = styled.button`
  background: #EF4444;
  color: white;
  padding: 1rem;
  border-radius: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  display: block;

  &:hover {
    background: #DC2626;
    transform: translateY(-2px);
  }
`;

const ConnectingText = styled.div`
  text-align: center;
  color: #059669;
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 1rem;

  p {
    color: #6B7280;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
`;

export default function BookRide() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const vehicleType = parseInt(searchParams.get('type') || '1', 10);
  const router = useRouter();
  
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleType);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [searchingForDriver, setSearchingForDriver] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionsRef = useRef(null);
  const toSuggestionsRef = useRef(null);

  // Check authentication status
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Socket connection effect
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('Authenticated session:', session);
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to ride booking system');
      });

      newSocket.on('driverAccepted', (response) => {
        console.log('Driver accepted response:', response);
        handleDriverAccepted(response);
      });

      newSocket.on('tripRejected', (response) => {
        handleTripRejected(response);
      });

      newSocket.on('noDriversAvailable', () => {
        handleNoDriversAvailable();
      });

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [status, session]);

  const handleDriverAccepted = (response) => {
    const { rideId, driverName } = response;
    setMatchedDriver(response);
    setSearchingForDriver(false);
    setIsConnecting(false);
    
    toast.success(`${driverName} has accepted your ride request!`, {
      duration: 5000,
      icon: '🚗'
    });
    
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play();
    } catch (e) {
      console.log('Audio play failed:', e);
    }
    
    setTimeout(() => {
      router.push(`/trip-details/${rideId}`);
    }, 2000);
  };

  const handleTripRejected = (response) => {
    const { message } = response;
    setIsConnecting(false);
    setSearchingForDriver(false);
    toast.error(message || 'Driver rejected the trip request');
  };

  const handleNoDriversAvailable = () => {
    setIsConnecting(false);
    setSearchingForDriver(false);
    toast.error('No drivers available at the moment. Please try again later.');
  };

  // Function to fetch location suggestions
  const fetchSuggestions = async (query, setterFunction) => {
    if (query.length < 3) {
      setterFunction([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Ride90 Application'
          }
        }
      );
      const data = await response.json();
      setterFunction(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setterFunction([]);
    }
  };

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useRef(
    debounce((value, setter) => fetchSuggestions(value, setter), 300)
  ).current;

  // Handle input changes
  const handleFromChange = (e) => {
    const value = e.target.value;
    setFromLocation(value);
    setShowFromSuggestions(true);
    debouncedFetchSuggestions(value, setFromSuggestions);
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setToLocation(value);
    setShowToSuggestions(true);
    debouncedFetchSuggestions(value, setToSuggestions);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion, isFrom) => {
    if (isFrom) {
      setFromLocation(suggestion.display_name);
      setShowFromSuggestions(false);
    } else {
      setToLocation(suggestion.display_name);
      setShowToSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromInputRef.current && !fromInputRef.current.contains(event.target) &&
          fromSuggestionsRef.current && !fromSuggestionsRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toInputRef.current && !toInputRef.current.contains(event.target) &&
          toSuggestionsRef.current && !toSuggestionsRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Using Nominatim API (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Ride90 Application' // Required by Nominatim's usage policy
              }
            }
          );
          
          const data = await response.json();
          
          if (data && data.display_name) {
            // Format the address to be more readable
            const addressParts = data.address;
            const formattedAddress = [
              addressParts.road,
              addressParts.suburb,
              addressParts.city || addressParts.town || addressParts.village,
              addressParts.state,
              addressParts.postcode
            ]
              .filter(Boolean) // Remove undefined/null values
              .join(', ');
            
            setFromLocation(formattedAddress);
          } else {
            setError('Could not find your address. Please enter manually.');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          setError('Failed to get location details. Please enter manually.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Failed to get your location. Please check your permissions.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Function to get coordinates from address
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const fromCoords = await getCoordinates(fromLocation);
      const toCoords = await getCoordinates(toLocation);

      if (fromCoords && toCoords) {
        setFromCoords(fromCoords);
        setToCoords(toCoords);
        setShowMap(true);
      } else {
        setError('Could not find coordinates for the provided locations');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFare = (distance, vehicleType) => {
    const vehicle = suggestions.find(v => v.id === vehicleType);
    if (!vehicle) return null;
    
    const baseFare = vehicle.basePrice;
    const perKmCharge = distance * vehicle.perKmRate;
    const totalFare = Math.round(baseFare + perKmCharge);
    
    // Static driver arrival time (you can make this dynamic later)
    const driverArrival = '5-7 min';
    
    return {
      baseFare,
      perKmCharge: Math.round(perKmCharge),
      total: totalFare,
      driverArrival
    };
  };

  // Update the handleRouteData function
  const handleRouteData = (data) => {
    const fares = suggestions.map(vehicle => ({
      ...vehicle,
      fare: calculateFare(parseFloat(data.distance), vehicle.id)
    }));
    
    setRouteDetails({
      ...data,
      fares
    });
  };

  const handleConfirmTrip = () => {
    if (!session) {
      toast.error('Please sign in to book a ride');
      router.push('/auth/signin');
      return;
    }

    if (!fromCoords || !toCoords || !selectedVehicle) {
      toast.error('Please select pickup, dropoff locations and vehicle type');
      return;
    }

    setIsConfirming(true);
    setIsConnecting(true);

    if (!socket?.connected) {
      toast.error('Connection to server lost. Please try again.');
      setIsConfirming(false);
      setIsConnecting(false);
      return;
    }

    // Get user details from session
    const userDetails = {
      userId: session.user?.id,
      name: session.user?.name,
      email: session.user?.email,
      phoneNumber: session.user?.phone,
      gender: session.user?.gender
    };

    console.log('Sending trip request with user details:', userDetails);

    // Emit trip request with user details
    socket.emit('requestTrip', {
      pickupLocation: {
        lat: fromCoords[0],
        lng: fromCoords[1],
        address: fromLocation
      },
      dropLocation: {
        lat: toCoords[0],
        lng: toCoords[1],
        address: toLocation
      },
      vehicleType: selectedVehicle,
      estimatedFare: routeDetails?.fares.find(v => v.id === selectedVehicle)?.fare?.total || 0,
      distance: routeDetails?.distance || 0,
      duration: routeDetails?.duration || 0,
      ...userDetails
    });

    toast('Searching for nearby drivers...', {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
      },
    });
  };

  const handleCancelTrip = () => {
    setIsConfirming(false);
    setIsConnecting(false); // Reset connecting state when trip is cancelled
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <BookingContainer>
      <BookingCard>
        <Title>Book Your Ride</Title>
        {error && (
          <ErrorMessage>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </ErrorMessage>
        )}
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="from">From</Label>
            <InputWrapper ref={fromInputRef} $isLoading={isLoading}>
              <Input
                id="from"
                type="text"
                value={fromLocation}
                onChange={handleFromChange}
                placeholder={isLoading ? "Getting your location..." : "Enter pickup location"}
                required
                disabled={isLoading}
              />
              <LocationIcon onClick={getCurrentLocation}>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </LocationIcon>
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <SuggestionsContainer ref={fromSuggestionsRef}>
                  {fromSuggestions.map((suggestion) => (
                    <SuggestionItem
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionClick(suggestion, true)}
                    >
                      {suggestion.display_name}
                    </SuggestionItem>
                  ))}
                </SuggestionsContainer>
              )}
            </InputWrapper>
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="to">To</Label>
            <InputWrapper ref={toInputRef}>
              <Input
                id="to"
                type="text"
                value={toLocation}
                onChange={handleToChange}
                placeholder="Enter destination"
                required
              />
              {showToSuggestions && toSuggestions.length > 0 && (
                <SuggestionsContainer ref={toSuggestionsRef}>
                  {toSuggestions.map((suggestion) => (
                    <SuggestionItem
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionClick(suggestion, false)}
                    >
                      {suggestion.display_name}
                    </SuggestionItem>
                  ))}
                </SuggestionsContainer>
              )}
            </InputWrapper>
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Search Available Rides'}
          </SubmitButton>
        </Form>

        {showMap && fromCoords && toCoords && (
          <>
            <SelectedLocations>
              <LocationRow>
                <LocationMarker type="from">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                    <path strokeWidth="2" d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
                  </svg>
                </LocationMarker>
                <LocationText>
                  <h4>Pickup Location</h4>
                  <p>{fromLocation}</p>
                </LocationText>
              </LocationRow>
              <LocationRow>
                <LocationMarker type="to">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  </svg>
                </LocationMarker>
                <LocationText>
                  <h4>Drop Location</h4>
                  <p>{toLocation}</p>
                </LocationText>
              </LocationRow>
            </SelectedLocations>
            {routeDetails && (
              <RideDetails>
                <RideDetailGrid>
                  <DetailItem>
                    <DetailLabel>Distance</DetailLabel>
                    <DetailValue>{routeDetails.distance} km</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Journey Time</DetailLabel>
                    <DetailValue>{routeDetails.duration}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Driver Arrival</DetailLabel>
                    <DetailValue style={{ color: '#059669' }}>
                      {routeDetails.fares.find(v => v.id === selectedVehicle)?.fare.driverArrival}
                    </DetailValue>
                  </DetailItem>
                </RideDetailGrid>
                
                <VehicleOptions>
                  {routeDetails.fares.map((vehicle) => (
                    <VehicleOption
                      key={vehicle.id}
                      $isSelected={selectedVehicle === vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <VehicleIcon>
                        <Image
                          src={vehicle.icon}
                          alt={vehicle.title}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </VehicleIcon>
                      <VehicleInfo>
                        <VehicleTitle>{vehicle.title}</VehicleTitle>
                        <VehiclePrice>
                          Fare: <VehiclePriceAmount>₹{vehicle.fare.total}</VehiclePriceAmount>
                        </VehiclePrice>
                      </VehicleInfo>
                    </VehicleOption>
                  ))}
                </VehicleOptions>

                {selectedVehicle && routeDetails.fares && (
                  <>
                    <PriceBreakdown>
                      <div>Base Fare: ₹{routeDetails.fares.find(v => v.id === selectedVehicle)?.fare.baseFare}</div>
                      <div>Distance Charge: ₹{routeDetails.fares.find(v => v.id === selectedVehicle)?.fare.perKmCharge}</div>
                      <div style={{ fontWeight: 600, color: '#4C1D95', borderTop: '1px solid rgba(109, 40, 217, 0.2)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        Total Fare: ₹{routeDetails.fares.find(v => v.id === selectedVehicle)?.fare.total}
                      </div>
                    </PriceBreakdown>
                    
                    <ConfirmButton 
                      onClick={handleConfirmTrip}
                      disabled={isConfirming}
                    >
                      {isConfirming ? 'Confirming...' : 'Confirm Trip'}
                    </ConfirmButton>
                  </>
                )}
              </RideDetails>
            )}
            <MapWrapper>
              <MapContainer
                center={fromCoords}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={fromCoords} icon={sourceIcon}>
                  <Popup>Pickup Location</Popup>
                </Marker>
                <Marker position={toCoords} icon={destinationIcon}>
                  <Popup>Destination</Popup>
                </Marker>
                <RouteMap 
                  fromCoords={fromCoords} 
                  toCoords={toCoords} 
                  onRouteData={handleRouteData}
                />
              </MapContainer>
            </MapWrapper>
          </>
        )}

        <BottomDrawer show={isConfirming}>
          <ConnectingAnimation>
            <div className="ripple">
              <div></div>
              <div></div>
            </div>
            {matchedDriver ? (
              <div className="matched-driver">
                <Image
                  src={suggestions.find(v => v.id === selectedVehicle)?.icon || '/taxi.png'}
                  alt="Vehicle"
                  width={48}
                  height={48}
                />
                <div className="driver-info">
                  <h3>{matchedDriver.name}</h3>
                  <p>{matchedDriver.vehicleNumber}</p>
                  <p>Distance: {matchedDriver.distance}km away</p>
                </div>
              </div>
            ) : (
              <div className="car-icon">
                <Image
                  src={suggestions.find(v => v.id === selectedVehicle)?.icon || '/taxi.png'}
                  alt="Vehicle"
                  width={48}
                  height={48}
                />
              </div>
            )}
          </ConnectingAnimation>
          
          <ConnectingText>
            {matchedDriver ? (
              <>
                Driver is on the way!
                <p>They will arrive in approximately {matchedDriver.distance * 2} minutes</p>
              </>
            ) : (
              <>
                Connecting you with nearby drivers
                <p>This usually takes 30-60 seconds</p>
                {nearbyDrivers.length > 0 && (
                  <p>{nearbyDrivers.length} drivers found nearby</p>
                )}
              </>
            )}
          </ConnectingText>
          
          <CancelButton onClick={handleCancelTrip}>
            {matchedDriver ? 'Cancel Ride' : 'Cancel'}
          </CancelButton>
        </BottomDrawer>
      </BookingCard>
    </BookingContainer>
  );
} 