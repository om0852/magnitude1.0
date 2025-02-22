const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Store drivers information
const driversData = new Map();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // Allow frontend to connect
  },
});

// Helper function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Helper function to get available drivers within range
const getAvailableDriversInRange = (userLocation, maxDistance = 15) => {
  return Array.from(driversData.values())
    .filter(driver => {
      if (driver.status !== 'online' || driver.rideStatus.isActive) {
        return false;
      }
      
      if (!driver.location || !driver.location.lat || !driver.location.lng) {
        return false;
      }

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        driver.location.lat,
        driver.location.lng
      );
      
      return distance <= maxDistance;
    })
    .map(driver => ({
      ...driver,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        driver.location.lat,
        driver.location.lng
      ).toFixed(1)
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Helper function to get active drivers
const getActiveDrivers = () => {
  return Array.from(driversData.values()).filter(driver => 
    driver.status === 'online' && driver.rideStatus.isActive
  );
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle driver information update
  socket.on("updateDriverInfo", (driverInfo) => {
    const { name, location, vehicleNumber, status, driverId, contactNumber } = driverInfo;
    
    // Store or update driver information
    driversData.set(socket.id, {
      driverId,
      name,
      contactNumber,
      location,
      vehicleNumber,
      status,
      rideStatus: {
        isActive: false,
        currentRideId: null,
        pickupLocation: null,
        dropLocation: null,
        startTime: null
      },
      lastUpdate: new Date(),
      socketId: socket.id
    });

    console.log("Driver info updated:", driverInfo);
    
    // Broadcast updated drivers list to all connected clients
    io.emit("driversListUpdated", Array.from(driversData.values()));
  });

  // New event to get nearby available drivers
  socket.on("getNearbyDrivers", (userLocation) => {
    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      socket.emit("nearbyDriversError", "Invalid location data");
      return;
    }

    const nearbyDrivers = getAvailableDriversInRange(userLocation);
    socket.emit("nearbyDriversUpdated", nearbyDrivers);
  });

  // Handle status change
  socket.on("updateDriverStatus", (status) => {
    const driverInfo = driversData.get(socket.id);
    if (driverInfo) {
      driverInfo.status = status;
      driverInfo.lastUpdate = new Date();
      driversData.set(socket.id, driverInfo);
      
      // Broadcast updated lists
      io.emit("driversListUpdated", Array.from(driversData.values()));
    }
  });

  // Handle location update
  socket.on("updateLocation", (location) => {
    const driverInfo = driversData.get(socket.id);
    if (driverInfo) {
      driverInfo.location = location;
      driverInfo.lastUpdate = new Date();
      driversData.set(socket.id, driverInfo);
      
      // Broadcast updated lists
      io.emit("driversListUpdated", Array.from(driversData.values()));
    }
  });

  // Handle ride status update
  socket.on("updateRideStatus", (rideInfo) => {
    const driverInfo = driversData.get(socket.id);
    if (driverInfo) {
      driverInfo.rideStatus = {
        isActive: rideInfo.isActive,
        currentRideId: rideInfo.rideId || null,
        pickupLocation: rideInfo.pickupLocation || null,
        dropLocation: rideInfo.dropLocation || null,
        startTime: rideInfo.isActive ? new Date() : null
      };
      driverInfo.lastUpdate = new Date();
      driversData.set(socket.id, driverInfo);
      
      // Broadcast updated lists
      io.emit("driversListUpdated", Array.from(driversData.values()));
      io.emit("activeDriversUpdated", getActiveDrivers());
    }
  });

  // Handle end ride
  socket.on("endRide", (rideId) => {
    const driverInfo = driversData.get(socket.id);
    if (driverInfo && driverInfo.rideStatus.currentRideId === rideId) {
      driverInfo.rideStatus = {
        isActive: false,
        currentRideId: null,
        pickupLocation: null,
        dropLocation: null,
        startTime: null
      };
      driverInfo.lastUpdate = new Date();
      driversData.set(socket.id, driverInfo);
      
      // Broadcast updated lists
      io.emit("driversListUpdated", Array.from(driversData.values()));
      io.emit("activeDriversUpdated", getActiveDrivers());
    }
  });

  socket.on("disconnect", () => {
    // Remove driver data when they disconnect
    driversData.delete(socket.id);
    console.log("User disconnected:", socket.id);
    
    // Broadcast updated lists
    io.emit("driversListUpdated", Array.from(driversData.values()));
    io.emit("activeDriversUpdated", getActiveDrivers());
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
}); 