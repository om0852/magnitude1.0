'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaCar, FaUser, FaPhone, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import Image from 'next/image';

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

export default function TripDetails({ params }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = use(params);
  const { rideId } = unwrappedParams;
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await axios.get(`/api/rides/${rideId}`);
        setTrip(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load trip details');
        setLoading(false);
      }
    };

    if (rideId) {
      fetchTripDetails();
    }
  }, [rideId]);

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

  return (
    <PageContainer>
      <TripCard>
        <TripHeader>
          <h1>Trip Details</h1>
          <div className="status-badge">{trip.status}</div>
        </TripHeader>

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