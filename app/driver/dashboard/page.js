'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCar, FaMoneyBillWave, FaRoute, FaUserClock, FaCog, FaUser } from 'react-icons/fa';
import { MdLocationOn, MdTimer } from 'react-icons/md';
import Image from 'next/image';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

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
  background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.25);
  }

  &:active {
    transform: translateY(0);
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
  text-align: center;
  
  h3 {
    font-size: 1.5rem;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }

  p {
    color: #718096;
    font-size: 0.875rem;
  }

  svg {
    font-size: 1.5rem;
    color: #9f7aea;
    margin-bottom: 0.5rem;
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

export default function DriverDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('today');
  const [socket, setSocket] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 2500,
    yesterday: 3200,
    thisWeek: 15000,
    thisMonth: 45000
  });
  const [rides, setRides] = useState({
    completed: 245,
    cancelled: 12,
    todayCompleted: 8,
    rating: 4.8
  });

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      toast.success('Connected to dispatch system');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      toast.error('Disconnected from dispatch system');
    });

    newSocket.on('driversListUpdated', (drivers) => {
      console.log('Drivers list updated:', drivers);
      // Handle updated drivers list if needed
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Get and update location
  useEffect(() => {
    let locationWatcher = null;

    if (isActive && socket) {
      // Watch for location changes
      locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          
          // Send location update to socket server
          socket.emit('updateLocation', location);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get location');
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
      }
    };
  }, [isActive, socket]);

  // Update driver status
  useEffect(() => {
    if (socket && session?.user) {
      const driverInfo = {
        name: session.user.name,
        location: currentLocation,
        vehicleNumber: 'YOUR_VEHICLE_NUMBER', // You should get this from your driver profile
        status: isActive ? 'active' : 'inactive'
      };

      socket.emit('updateDriverInfo', driverInfo);
    }
  }, [isActive, currentLocation, session, socket]);

  // Handle status toggle
  const handleStatusToggle = async () => {
    if (!socket) {
      toast.error('Not connected to dispatch system');
      return;
    }

    if (!currentLocation && !isActive) {
      // Request location permission when going online
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } catch (error) {
        console.error('Location error:', error);
        toast.error('Location access is required to go online');
        return;
      }
    }

    const newStatus = !isActive;
    setIsActive(newStatus);
    
    // Update status on socket server
    socket.emit('updateDriverStatus', newStatus ? 'active' : 'inactive');
    
    toast.success(newStatus ? 'You are now online' : 'You are now offline');
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
            <p>ID: DRV{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
          </div>
        </DriverInfo>
        <HeaderActions>
          <CompactStatusCard isActive={isActive}>
            <div className="status-indicator" />
            <p>{isActive ? 'Online' : 'Offline'}</p>
            <CompactToggle
              isActive={isActive}
              onClick={handleStatusToggle}
            >
              {isActive ? 'Go Offline' : 'Go Online'}
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
        <div style={{ margin: '1rem 0', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem' }}>
          <p>Current Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
        </div>
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
              <h3>₹{earnings.yesterday}</h3>
              <p>Yesterday's Earnings</p>
            </StatItem>
            <StatItem>
              <h3>₹{earnings.thisWeek}</h3>
              <p>This Week</p>
            </StatItem>
            <StatItem>
              <h3>₹{earnings.thisMonth}</h3>
              <p>This Month</p>
            </StatItem>
          </StatGrid>
        </EarningsCard>

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
      </DashboardGrid>
    </PageContainer>
  );
} 