'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import styled from 'styled-components';
import { FaCar, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import axios from 'axios';
=======
import { getSession, useSession } from 'next-auth/react';
>>>>>>> ef68c8db60fe1ac78f7fee1409c532957a23d777

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

export default function Activity() {
  const { data: session, status } = useSession();
  const router = useRouter();
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState('all');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
=======
  const { data: session } = useSession();
  const [selectedRide, setSelectedRide] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [rides, setRides] = useState({
    upcoming: [],
    current: [],
    past: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
>>>>>>> ef68c8db60fe1ac78f7fee1409c532957a23d777

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchTrips();
  }, [status, router]);

  const fetchTrips = async () => {
    try {
<<<<<<< HEAD
      setLoading(true);
      const response = await axios.get('/api/trips');
      setTrips(response.data.data);
=======
      const response = await fetch('/api/rides');
      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }

      const data = await response.json();
      
      // Categorize rides based on their status and dates
      const now = new Date();
      const categorizedRides = {
        upcoming: data.filter(ride => new Date(ride.date) > now && ride.status !== 'cancelled'),
        current: data.filter(ride => ride.status === 'in_progress'),
        past: data.filter(ride => new Date(ride.date) < now || ride.status === 'completed')
      };

      setRides(categorizedRides);
      setIsLoading(false);
>>>>>>> ef68c8db60fe1ac78f7fee1409c532957a23d777
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const filterTrips = (status) => {
    if (status === 'all') return trips;
    return trips.filter(trip => {
      if (status === 'upcoming') return trip.status === 'pending';
      if (status === 'ongoing') return trip.status === 'in_progress';
      if (status === 'past') return trip.status === 'completed';
      return true;
    });
=======
  useEffect(() => {
    fetchUserRides();
  }, []);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Handle tab change with animation
  const handleTabChange = (tab) => {
    setIsContentVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      setIsContentVisible(true);
    }, 300);
>>>>>>> ef68c8db60fe1ac78f7fee1409c532957a23d777
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

<<<<<<< HEAD
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'upcoming';
      case 'in_progress': return 'ongoing';
      case 'completed': return 'completed';
      default: return '';
    }
  };
=======
  const handleActivityAction = async (id, action) => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) throw new Error('Failed to update activity');
      
      // Refresh activities after successful action
      fetchActivities();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const RideCard = ({ ride, type, index }) => (
    <div 
      onClick={() => handleRideClick(ride)}
      className="bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-indigo-100 group"
      style={{
        animation: `slideIn 0.5s ease-out forwards`,
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700">
            {ride.pickup} to {ride.destination}
          </h3>
          <p className="text-sm text-gray-500">{new Date(ride.date).toLocaleDateString()} - {ride.time}</p>
        </div>
        {ride.status && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            ride.status === "in_progress" 
              ? "bg-blue-50 text-blue-700" 
              : ride.status === "completed"
              ? "bg-green-50 text-green-700"
              : "bg-yellow-50 text-yellow-700"
          }`}>
            {ride.status.replace('_', ' ').charAt(0).toUpperCase() + ride.status.slice(1)}
          </span>
        )}
      </div>
      <div className="space-y-3 text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>From: {ride.pickup}</p>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p>To: {ride.destination}</p>
        </div>
        {ride.driver && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p>Driver: {ride.driver}</p>
          </div>
        )}
        {ride.fare && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Fare: ₹{ride.fare}</p>
          </div>
        )}
      </div>
    </div>
  );
>>>>>>> ef68c8db60fe1ac78f7fee1409c532957a23d777

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <div className="animate-pulse">
            <Header>
              <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </Header>
            {[1, 2, 3].map(i => (
              <TripCard key={i}>
                <div className="h-24 bg-gray-100 rounded mb-4"></div>
              </TripCard>
            ))}
          </div>
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
<<<<<<< HEAD
              </TripDetails>
            </TripCard>
          ))
        )}
      </ContentWrapper>
    </PageContainer>
=======
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 mt-8">
        <h1 className="text-3xl font-bold mb-6">Your Activities</h1>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-white p-6 rounded-lg shadow-md"
            >
              {/* Activity details */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold">
                    {activity.status} - {activity.type}
                  </p>
                  <p className="text-gray-600">
                    From: {activity.pickupLocation}
                  </p>
                  <p className="text-gray-600">
                    To: {activity.dropoffLocation}
                  </p>
                  <p className="text-gray-600">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Action buttons based on status */}
                {activity.status === 'PENDING' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleActivityAction(activity.id, 'cancel')}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleActivityAction(activity.id, 'complete')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
>>>>>>> ef68c8db60fe1ac78f7fee1409c532957a23d777
  );
}