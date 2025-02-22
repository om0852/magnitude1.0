import React from 'react';
import styled from 'styled-components';
import { FaCar, FaMapMarkerAlt, FaTimes, FaCheck } from 'react-icons/fa';

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
`;

const NotificationHeader = styled.div`
  background: linear-gradient(135deg, #9f7aea, #6b46c1);
  color: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const NotificationContent = styled.div`
  padding: 20px;
  color: #000000;

  strong {
    color: #000000;
  }
`;

const LocationInfo = styled.div`
  margin: 10px 0;
  color: #000000;
  
  .location-item {
    display: flex;
    align-items: center;
    margin: 8px 0;
    
    svg {
      margin-right: 10px;
      color: #6b46c1;
    }

    div {
      color: #000000;
      
      strong {
        color: #000000;
      }
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const Button = styled.button`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s ease;

  &.accept {
    background: #10B981;
    color: white;
    &:hover {
      background: #059669;
    }
  }

  &.reject {
    background: #EF4444;
    color: white;
    &:hover {
      background: #DC2626;
    }
  }
`;

const RideRequestNotification = ({ request, onAccept, onReject }) => {
  if (!request) return null;

  return (
    <NotificationContainer>
      <NotificationHeader>
        <h3>New Ride Request</h3>
      </NotificationHeader>
      <NotificationContent>
        <LocationInfo>
          <div className="location-item">
            <FaMapMarkerAlt />
            <div>
              <strong>Pickup:</strong> {request.pickupLocation.address}
            </div>
          </div>
          <div className="location-item">
            <FaMapMarkerAlt />
            <div>
              <strong>Drop:</strong> {request.dropLocation.address}
            </div>
          </div>
          <div className="location-item">
            <FaCar />
            <div>
              <strong>Distance:</strong> {request.distance} km
            </div>
          </div>
        </LocationInfo>
        <ButtonGroup>
          <Button 
            className="accept"
            onClick={() => onAccept(request.rideId)}
          >
            <FaCheck /> Accept
          </Button>
          <Button 
            className="reject"
            onClick={() => onReject(request.rideId)}
          >
            <FaTimes /> Reject
          </Button>
        </ButtonGroup>
      </NotificationContent>
    </NotificationContainer>
  );
};

export default RideRequestNotification; 