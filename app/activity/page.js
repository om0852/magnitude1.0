'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaCar, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaStar, FaUser } from 'react-icons/fa';
import axios from 'axios';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 2rem;
    color: #4C1D95;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6B7280;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  background: ${props => props.active ? '#6D28D9' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4B5563'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    background: ${props => props.active ? '#5B21B6' : '#F3F4F6'};
  }
`;

const TripCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  border: 1px solid #E5E7EB;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const TripHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;

  .trip-id {
    font-size: 0.875rem;
    color: #6B7280;
  }

  .trip-status {
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    
    &.upcoming {
      background: #DBEAFE;
      color: #1E40AF;
    }
    
    &.ongoing {
      background: #DEF7EC;
      color: #046C4E;
    }
    
    &.completed {
      background: #E5E7EB;
      color: #374151;
    }
  }
`;

const LocationInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  .location-details {
    flex: 1;

    .location-type {
      font-size: 0.875rem;
      color: #6B7280;
      margin-bottom: 0.25rem;
    }

    .address {
      color: #111827;
      font-weight: 500;
    }
  }
`;

const TripDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #E5E7EB;

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4B5563;

    svg {
      color: #6D28D9;
    }

    .label {
      font-size: 0.875rem;
      color: #6B7280;
    }

    .value {
      font-weight: 600;
      color: #111827;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  color: #6B7280;

  svg {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1rem;
    color: #D1D5DB;
  }

  h3 {
    font-size: 1.25rem;
    color: #374151;
    margin-bottom: 0.5rem;
  }
`;

const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;

  .driver-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6D28D9;
  }

  .driver-details {
    flex: 1;

    .name {
      font-weight: 600;
      color: #111827;
    }

    .vehicle {
      font-size: 0.875rem;
      color: #6B7280;
    }
  }

  .rating {
    text-align: right;
    
    .stars {
      color: #F59E0B;
      font-weight: 600;
    }
    
    .rides {
      font-size: 0.75rem;
      color: #6B7280;
    }
  }
`;

const OtpDisplay = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #F8F7FF;
  border-radius: 0.5rem;
  text-align: center;

  .otp {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4C1D95;
    letter-spacing: 0.5rem;
    margin: 0.5rem 0;
  }

  .label {
    font-size: 0.875rem;
    color: #6B7280;
  }
`;

export default function Activity() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Session status:', status);
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      console.log('User email:', session?.user?.email);
      fetchTrips();
    }
  }, [status, router, session]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching trips...');
      const response = await axios.get('/api/trips');
      console.log('API Response:', response.data);
      if (response.data.success) {
        setTrips(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch trips');
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const filterTrips = (status) => {
    if (status === 'all') return trips;
    return trips.filter(trip => {
      if (status === 'upcoming') return trip.status === 'pending';
      if (status === 'ongoing') return trip.status === 'in_progress';
      if (status === 'past') return trip.status === 'completed';
      return true;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'upcoming';
      case 'in_progress': return 'ongoing';
      case 'completed': return 'completed';
      default: return '';
    }
  };

  const renderDriverInfo = (trip) => {
    if (!trip.driverDetails) return null;

    return (
      <DriverInfo>
        <div className="driver-avatar">
          <FaUser size={24} />
        </div>
        <div className="driver-details">
          <div className="name">{trip.driverDetails.name}</div>
          <div className="vehicle">
            {trip.driverDetails.vehicleModel} • {trip.driverDetails.vehicleNumber}
          </div>
        </div>
        <div className="rating">
          <div className="stars">⭐ {trip.driverDetails.rating.toFixed(1)}</div>
          <div className="rides">{trip.driverDetails.totalRides} rides</div>
        </div>
      </DriverInfo>
    );
  };

  if (error) {
    return (
      <PageContainer>
        <ContentWrapper>
          <Header>
            <h1>Your Trips</h1>
            <p>View and manage all your ride activities</p>
          </Header>
          <EmptyState>
            <FaCar />
            <h3>Error Loading Trips</h3>
            <p>{error}</p>
            <button 
              onClick={fetchTrips}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </EmptyState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  const filteredTrips = filterTrips(activeTab);

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <h1>Your Trips</h1>
          <p>View and manage all your ride activities</p>
        </Header>

        <TabContainer>
          <Tab 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            All Trips
          </Tab>
          <Tab 
            active={activeTab === 'upcoming'} 
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </Tab>
          <Tab 
            active={activeTab === 'ongoing'} 
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing
          </Tab>
          <Tab 
            active={activeTab === 'past'} 
            onClick={() => setActiveTab('past')}
          >
            Past
          </Tab>
        </TabContainer>

        {filteredTrips.length === 0 ? (
          <EmptyState>
            <FaCar />
            <h3>No trips found</h3>
            <p>You haven't taken any trips in this category yet</p>
          </EmptyState>
        ) : (
          filteredTrips.map(trip => (
            <TripCard key={trip.rideId} onClick={() => router.push(`/trip-details/${trip.rideId}`)}>
              <TripHeader>
                <span className="trip-id">Trip ID: {trip.rideId}</span>
                <span className={`trip-status ${getStatusClass(trip.status)}`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
              </TripHeader>

              <LocationInfo>
                <div className="location-details">
                  <div className="location-type">Pickup</div>
                  <div className="address">{trip.pickupLocation.address}</div>
                </div>
                <div className="location-details">
                  <div className="location-type">Drop-off</div>
                  <div className="address">{trip.dropLocation.address}</div>
                </div>
              </LocationInfo>

              <TripDetails>
                <div className="detail-item">
                  <FaClock />
                  <div>
                    <div className="label">Date & Time</div>
                    <div className="value">{formatDate(trip.createdAt)}</div>
                  </div>
                </div>
                <div className="detail-item">
                  <FaMoneyBillWave />
                  <div>
                    <div className="label">Fare</div>
                    <div className="value">₹{trip.estimatedFare}</div>
                  </div>
                </div>
                <div className="detail-item">
                  <FaMapMarkerAlt />
                  <div>
                    <div className="label">Distance</div>
                    <div className="value">{trip.distance} km</div>
                  </div>
                </div>
                {trip.status === 'completed' && trip.rating && (
                  <div className="detail-item">
                    <FaStar />
                    <div>
                      <div className="label">Rating</div>
                      <div className="value">{trip.rating} ⭐</div>
                    </div>
                  </div>
                )}
              </TripDetails>

              {renderDriverInfo(trip)}

              {trip.status === 'in_progress' && trip.otp && (
                <OtpDisplay>
                  <div className="label">Share this OTP with your driver</div>
                  <div className="otp">{trip.otp}</div>
                </OtpDisplay>
              )}
            </TripCard>
          ))
        )}
      </ContentWrapper>
    </PageContainer>
  );
}