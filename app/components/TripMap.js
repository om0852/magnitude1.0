'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Function to update map view
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Custom marker icons
const createCustomIcon = (iconUrl, size = [25, 41]) => new L.Icon({
  iconUrl,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: size,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickupIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png');
const dropIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');
const userIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png');
const driverIcon = createCustomIcon('/car-marker.png', [32, 32]); // Custom car icon for driver

export default function TripMap({ driverLocation, userLocation, fromCoords, toCoords, routePoints, trip }) {
  const defaultCenter = [20.5937, 78.9629]; // Default to India's center
  const mapCenter = driverLocation 
    ? [driverLocation.lat, driverLocation.lng] 
    : (fromCoords || defaultCenter);

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Driver Location Marker */}
      {driverLocation && (
        <Marker 
          position={[driverLocation.lat, driverLocation.lng]}
          icon={driverIcon}
        >
          <Popup>
            <div className="font-semibold">Driver's Location</div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date(driverLocation.timestamp).toLocaleTimeString()}
            </div>
          </Popup>
        </Marker>
      )}

      {/* User Location Marker */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        >
          <Popup>
            <div className="font-semibold">Your Location</div>
          </Popup>
        </Marker>
      )}

      {/* Pickup Location Marker */}
      {fromCoords && (
        <Marker 
          position={fromCoords}
          icon={pickupIcon}
        >
          <Popup>
            <div className="font-semibold">Pickup Location</div>
            <div className="text-sm text-gray-600">{trip?.pickup?.address}</div>
          </Popup>
        </Marker>
      )}

      {/* Drop Location Marker */}
      {toCoords && (
        <Marker 
          position={toCoords}
          icon={dropIcon}
        >
          <Popup>
            <div className="font-semibold">Drop Location</div>
            <div className="text-sm text-gray-600">{trip?.dropoff?.address}</div>
          </Popup>
        </Marker>
      )}

      {/* Route Line */}
      {routePoints && routePoints.length > 0 && (
        <Polyline
          positions={routePoints}
          pathOptions={{
            color: '#6D28D9',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
      )}

      {/* Map Updater */}
      {driverLocation && (
        <MapUpdater 
          center={[driverLocation.lat, driverLocation.lng]}
          zoom={13}
        />
      )}
    </MapContainer>
  );
} 