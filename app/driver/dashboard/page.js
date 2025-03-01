'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCar, FaMoneyBillWave, FaRoute, FaUserClock, FaCog, FaUser, FaStar, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { MdLocationOn, MdTimer } from 'react-icons/md';
import Image from 'next/image';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import RideRequestNotification from '../../components/RideRequestNotification';
import { calculateDistance } from '../../utils/distance';
import axios from 'axios';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  padding: 2rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }
`;

const StatusCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, #4CAF50, #43A047)'
    : 'linear-gradient(135deg, #9f7aea, #805ad5)'};
  color: white;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    pointer-events: none;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  p {
    opacity: 0.9;
    font-size: 0.9rem;
  }
`;

const StatusToggle = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &.online {
    background: #10B981;
    color: white;
  &:hover {
      background: #059669;
    }
  }

  &.offline {
    background: #EF4444;
    color: white;
    &:hover {
      background: #DC2626;
    }
  }
`;

const EarningsCard = styled(Card)`
  background: linear-gradient(135deg, #6b46c1 0%, #4a148c 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    pointer-events: none;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  backdrop-filter: blur(5px);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  p {
    font-size: 0.875rem;
    opacity: 0.9;
  }
`;

const RidesList = styled.div`
  margin-top: 1rem;
`;

const RideItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RideInfo = styled.div`
  flex: 1;
  margin-left: 1rem;

  h4 {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.875rem;
    color: #666;
  }
`;

const RideAmount = styled.div`
  font-weight: 600;
  color: #4CAF50;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: ${props => props.active ? '#9f7aea' : '#e2e8f0'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${props => props.iconBg || '#f3e8ff'};
    color: ${props => props.iconColor || '#9333ea'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .content {
    flex: 1;

    h3 {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .value {
      color: #1f2937;
      font-size: 1.5rem;
      font-weight: 600;
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info {
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }

    p {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #9f7aea;
  }
`;

const CompactStatusCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, #4CAF50, #43A047)'
    : 'linear-gradient(135deg, #9f7aea, #805ad5)'};
  color: white;
  width: fit-content;

  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)'};
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const CompactToggle = styled(StatusToggle)`
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
`;

const LocationCard = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .location-icon {
    color: #3b82f6;
    flex-shrink: 0;
  }

  .location-details {
    flex: 1;

    h4 {
      font-weight: 500;
      color: #1e40af;
      margin: 0 0 0.25rem 0;
    }

    p {
      color: #64748b;
      margin: 0;
      font-size: 0.9rem;
    }
  }
`;

const DashboardContainer = styled.div`
  padding: 2rem;
`;

const RecentRidesCard = styled(Card)`
  grid-column: span 2;

  @media (max-width: 1024px) {
    grid-column: span 1;
  }

  h2 {
    color: #4b5563;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .rides-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

export default function DriverDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [selectedTab, setSelectedTab] = useState('today');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [rides, setRides] = useState({
    completed: 245,
    cancelled: 12,
    todayCompleted: 8,
    rating: 4.8
  });
  const [loading, setLoading] = useState(true);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    totalRides: 0,
    todayRides: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    completionRate: 0,
    averageRating: 0,
    recentRides: []
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchDriverInfo();
  }, [status, router]);

  useEffect(() => {
    if (!driverInfo) return;

    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for new trip requests
    newSocket.on('newTripRequest', (request) => {
      setCurrentRequest(request);
      // You can also add sound notification here
      new Audio('/notification-sound.mp3').play().catch(e => console.log(e));
    });

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [driverInfo]);

  useEffect(() => {
    if (!socket || !driverInfo) return;

    // Update driver info when status changes
    socket.emit('updateDriverInfo', {
      driverId: driverInfo._id,
      name: driverInfo.fullName,
      location: driverInfo.location || { lat: 0, lng: 0 },
      vehicleNumber: driverInfo.vehicleNumber,
      status: isOnline ? 'online' : 'offline',
      contactNumber: driverInfo.phone
    });

    // Listen for ride status updates
    socket.on('rideStatusUpdate', (data) => {
      if (data.status === 'in_progress') {
        // Handle ride in progress
        toast.success('Ride started!');
      } else if (data.status === 'completed') {
        // Handle ride completion
        toast.success('Ride completed!');
      }
    });

    return () => {
      socket.off('rideStatusUpdate');
    };
  }, [isOnline, socket, driverInfo]);

  const fetchDriverInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/driver/profile');
      setDriverInfo(response.data.data);
      setIsOnline(response.data.data.isActive || false);
      setEarnings({
        today: response.data.data.earnings?.today || 0,
        thisWeek: response.data.data.earnings?.thisWeek || 0,
        thisMonth: response.data.data.earnings?.thisMonth || 0,
        total: response.data.data.earnings?.total || 0
      });
      // Generate driver ID if not exists and update it in the database
      const newDriverId = response.data.data.driverId || generateDriverId();
      setDriverId(newDriverId);
      
      // If there was no driver ID, update it in the database
      if (!response.data.data.driverId) {
        await updateDriverStatusInDB(false); // This will save the new driver ID
      }
    } catch (error) {
      console.error('Error fetching driver info:', error);
      toast.error('Failed to load driver information');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const response = await axios.put('/api/driver/status', {
        isActive: !isOnline
      });
      
      if (response.data.success) {
        setIsOnline(!isOnline);
        toast.success(isOnline ? 'You are now offline' : 'You are now online');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAcceptRide = async (rideId) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading('Accepting ride request...');
      console.log("Current Request:", currentRequest);

      // Prepare trip request data with all required fields
      const tripRequestData = {
        requestId: currentRequest.requestId || `REQ${Date.now()}`,
        userId: currentRequest.userId,
        socketId: currentRequest.socketId,
        pickupLocation: {
          lat: parseFloat(currentRequest.pickupLocation.lat),
          lng: parseFloat(currentRequest.pickupLocation.lng),
          address: currentRequest.pickupLocation.address
        },
        dropLocation: {
          lat: parseFloat(currentRequest.dropLocation.lat),
          lng: parseFloat(currentRequest.dropLocation.lng),
          address: currentRequest.dropLocation.address
        },
        distance: currentRequest.distance || '0',
        duration: currentRequest.duration || '0m',
        vehicleType: parseInt(currentRequest.vehicleType) || 1,
        estimatedFare: parseFloat(currentRequest.fare) || 0,
        userDetails: {
          name: currentRequest.name || 'Anonymous',
          phoneNumber: currentRequest.phoneNumber || 'Not provided',
          email: currentRequest.email || 'Not provided',
          gender: currentRequest.gender || 'Not specified'
        }
      };

      console.log("Sending trip request data:", tripRequestData);

      // Update ride status in your database
      const response = await fetch('/api/rides/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rideId,
          tripRequest: tripRequestData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept ride');
      }

      // Emit socket event for ride acceptance
      socket.emit('rideAccepted', {
        rideId,
        driverId: driverInfo._id,
        driverName: driverInfo.fullName,
        vehicleNumber: driverInfo.vehicleNumber,
        contactNumber: driverInfo.phone,
        status: 'in_progress'
      });
console.log("emitted ride accepted")
      // Clear the current request
      setCurrentRequest(null);

      // Show success message
      toast.success('Ride accepted successfully!', {
        id: loadingToast
      });

      // Navigate to the ride details page
      router.push(`/driver/rides/${rideId}`);
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error(error.message || 'Failed to accept ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRide = (rideId) => {
    if (!socket) return;

    // Emit socket event for ride rejection
    socket.emit('rideRejected', {
      rideId,
      driverId: driverInfo._id
    });

    // Clear the current request
    setCurrentRequest(null);
  };

  // Generate or get driver ID
  const generateDriverId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'DRV' + id;
  };

  // Update driver status in MongoDB
  const updateDriverStatusInDB = async (isOnline) => {
    try {
      const response = await fetch('/api/driver/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: isOnline,
          lastLocation: currentLocation,
          lastAddress: currentAddress?.full,
          driverId: driverId
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Failed to update status in database');
    }
  };

  // Function to get address from coordinates using OpenStreetMap
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Magnitude Application'
          }
        }
      );
      const data = await response.json();
      console.log('Nominatim response:', data);
      
      if (data && data.address) {
        setCurrentAddress({
          full: data.display_name,
          area: data.address.suburb || data.address.neighbourhood || data.address.residential,
          city: data.address.city || data.address.town,
          state: data.address.state
        });
      } else {
        console.error('Invalid geocoding response:', data);
        toast.error('Unable to get address details');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      toast.error('Unable to get address details');
    }
  };

  // Add this function to calculate and update distance
  const updateDistanceAndDuration = async (driverLocation, destination) => {
    if (!driverLocation || !destination) return;

    try {
      // Calculate straight-line distance
      const distance = calculateDistance(
        driverLocation.lat,
        driverLocation.lng,
        destination.lat,
        destination.lng
      );

      // Get route details from OSRM
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${destination.lng},${destination.lat}?overview=false`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const routeDistance = (data.routes[0].distance / 1000).toFixed(1); // Convert to km
        const duration = Math.round(data.routes[0].duration / 60); // Convert to minutes
        setCurrentDistance(routeDistance);
        setCurrentDuration(duration);
    } else {
        // Fallback to straight-line distance if route calculation fails
        setCurrentDistance(distance.toFixed(1));
        setCurrentDuration(Math.round(distance * 3)); // Rough estimate
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      // Fallback to straight-line distance
      const distance = calculateDistance(
        driverLocation.lat,
        driverLocation.lng,
        destination.lat,
        destination.lng
      );
      setCurrentDistance(distance.toFixed(1));
      setCurrentDuration(Math.round(distance * 3)); // Rough estimate
    }
  };

  // Modify the location tracking useEffect
  useEffect(() => {
    if (!socket || !driverInfo) return;

    const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          
        // Get address for the new location
          await getAddressFromCoordinates(location.lat, location.lng);
          
        // If there's an active ride, update distance
        if (driverInfo.rideStatus?.isActive && driverInfo.rideStatus?.dropLocation) {
          await updateDistanceAndDuration(location, driverInfo.rideStatus.dropLocation);
        }

        // Emit location update
        socket.emit('driverLocationUpdate', {
          ...location,
          driverId: driverInfo._id,
          timestamp: new Date().toISOString()
        });
        },
        (error) => {
          console.error('Location error:', error);
        toast.error('Unable to get location');
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
  }, [socket, driverInfo]);

  const handleSettingsClick = () => {
    router.push('/driver/settings');
  };

  const handleProfileClick = () => {
    router.push('/driver/profile');
  };

  const mockRides = [
    {
      id: 1,
      pickup: "Central Park",
      dropoff: "Downtown Mall",
      time: "10:30 AM",
      amount: "₹350",
      status: "Completed"
    },
    {
      id: 2,
      pickup: "Airport Terminal 3",
      dropoff: "Hotel Grandeur",
      time: "12:45 PM",
      amount: "₹850",
      status: "Completed"
    },
    {
      id: 3,
      pickup: "Metro Station",
      dropoff: "Tech Park",
      time: "2:15 PM",
      amount: "₹250",
      status: "Completed"
    }
  ];

  // Add LiveStats component in your return statement
  const LiveStats = () => (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-600">Current Distance</h3>
        <p className="text-xl font-semibold text-purple-600">{currentDistance} km</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-600">Estimated Time</h3>
        <p className="text-xl font-semibold text-purple-600">{currentDuration} mins</p>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/driver/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchDashboardData();
  }, []);

  if (status === 'loading') {
    return <PageContainer>Loading...</PageContainer>;
  }

  return (
    <PageContainer>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Header>
        <DriverInfo>
          <div className="avatar">
            <FaUser size={24} color="#666" />
          </div>
          <div className="info">
            <h3>{session?.user?.name || 'Driver Name'}</h3>
            <p>ID: {driverId || 'Loading...'}</p>
            <p>Vehicle: {driverProfile?.vehicleNumber || 'Loading...'}</p>
          </div>
        </DriverInfo>
        <HeaderActions>
          <CompactStatusCard isActive={isOnline}>
            <div className="status-indicator" />
            <p>{isOnline ? 'Online' : 'Offline'}</p>
            <CompactToggle
              isActive={isOnline}
              onClick={handleStatusToggle}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </CompactToggle>
          </CompactStatusCard>
          <IconButton onClick={handleProfileClick}>
            <FaUser size={20} />
          </IconButton>
          <IconButton onClick={handleSettingsClick}>
            <FaCog size={20} />
          </IconButton>
        </HeaderActions>
      </Header>

      {currentLocation && (
        <LocationCard>
          <MdLocationOn size={24} className="location-icon" />
          <div className="location-details">
            <h4>Current Location</h4>
            {currentAddress ? (
              <>
                <p>{currentAddress.area}, {currentAddress.city}</p>
                <p style={{ fontSize: '0.8rem' }}>{currentAddress.full}</p>
              </>
            ) : (
              <p>Getting address...</p>
            )}
          </div>
        </LocationCard>
      )}

      <DashboardGrid>
        <EarningsCard>
          <h2>Earnings Overview</h2>
          <StatGrid>
            <StatItem>
              <h3>₹{earnings.today}</h3>
              <p>Today's Earnings</p>
            </StatItem>
            <StatItem>
              <h3>₹{earnings.thisWeek}</h3>
              <p>This Week</p>
            </StatItem>
            <StatItem>
              <h3>₹{earnings.thisMonth}</h3>
              <p>This Month</p>
            </StatItem>
            <StatItem>
              <h3>₹{earnings.total}</h3>
              <p>Total Earnings</p>
            </StatItem>
          </StatGrid>
        </EarningsCard>

        {driverInfo?.rideStatus?.isActive && <LiveStats />}

        <Card>
          <h2>Performance Stats</h2>
          <Stats>
            <StatCard>
              <FaCar />
              <h3>{rides.completed}</h3>
              <p>Total Rides</p>
            </StatCard>
            <StatCard>
              <FaUserClock />
              <h3>{rides.todayCompleted}</h3>
              <p>Today's Rides</p>
            </StatCard>
            <StatCard>
              <FaMoneyBillWave />
              <h3>{rides.rating}</h3>
              <p>Rating</p>
            </StatCard>
          </Stats>
        </Card>

        <Card>
          <h2>Recent Rides</h2>
          <TabContainer>
            <Tab
              active={selectedTab === 'today'}
              onClick={() => setSelectedTab('today')}
            >
              Today
            </Tab>
            <Tab
              active={selectedTab === 'week'}
              onClick={() => setSelectedTab('week')}
            >
              This Week
            </Tab>
          </TabContainer>
          <RidesList>
            {mockRides.map(ride => (
              <RideItem key={ride.id}>
                <MdLocationOn size={24} color="#9f7aea" />
                <RideInfo>
                  <h4>{ride.pickup} → {ride.dropoff}</h4>
                  <p>
                    <MdTimer style={{ verticalAlign: 'middle' }} /> {ride.time}
                  </p>
                </RideInfo>
                <RideAmount>{ride.amount}</RideAmount>
              </RideItem>
            ))}
          </RidesList>
        </Card>

        <RecentRidesCard>
          <h2>Recent Rides</h2>
          <div className="rides-list">
            {dashboardData.recentRides.map((ride, index) => (
              <RideItem key={index} status={ride.status}>
                <div className="ride-info">
                  <div className="locations">
                    {ride.pickupLocation.address} → {ride.dropLocation.address}
                  </div>
                  <div className="details">
                    <span>₹{ride.fare}</span>
                    <span>•</span>
                    <span>{new Date(ride.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ride-status">
                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                </div>
              </RideItem>
            ))}
          </div>
        </RecentRidesCard>
      </DashboardGrid>

      {/* Ride Request Notification */}
      <RideRequestNotification
        request={currentRequest}
        onAccept={handleAcceptRide}
        onReject={handleRejectRide}
      />
    </PageContainer>
  );
} 