const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Store drivers information
const driversData = new Map();

// Store trip requests
const tripRequests = new Map();

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

// Helper function to find the best driver for a trip
const findBestDriver = (tripRequest) => {
  console.log("Finding driver for trip request:", tripRequest);
  console.log("Available drivers:", Array.from(driversData.values()));

  const availableDrivers = Array.from(driversData.values()).filter(driver => {
    const isAvailable = driver.status === 'online' && !driver.rideStatus.isActive;
    console.log(`Driver ${driver.driverId} availability:`, {
      status: driver.status,
      isActive: driver.rideStatus.isActive,
      isAvailable
    });
    return isAvailable;
  });

  if (availableDrivers.length === 0) {
    console.log("No available drivers found");
    return null;
  }

  // Sort drivers by distance to pickup location
  const driversWithDistance = availableDrivers.map(driver => {
    const distance = calculateDistance(
      tripRequest.pickupLocation.lat,
      tripRequest.pickupLocation.lng,
      driver.location.lat,
      driver.location.lng
    );
    console.log(`Driver ${driver.driverId} distance:`, distance);
    return {
      ...driver,
      distance
    };
  }).sort((a, b) => a.distance - b.distance);

  console.log("Sorted drivers by distance:", driversWithDistance);
  return driversWithDistance[0];
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

  // Handle trip requests from users
  socket.on("requestTrip", (tripRequest) => {
    console.log("Received trip request:", tripRequest);
    
    // Validate required fields
    if (!tripRequest.pickupLocation || !tripRequest.dropLocation) {
      socket.emit("tripRequestError", "Missing pickup or drop location");
      return;
    }

    // Log and validate user details
    console.log("Incoming user details:", {
      userId: tripRequest.userId,
      phoneNumber: tripRequest.phoneNumber,
      email: tripRequest.email,
      gender: tripRequest.gender,
      name: tripRequest.name
    });

    // Extract user details with defaults and validation
    const userDetails = {
      userId: tripRequest.userId || socket.id,
      phoneNumber: tripRequest.phoneNumber || 'Not provided',
      email: tripRequest.email || 'Not provided',
      gender: tripRequest.gender || 'Not specified',
      name: tripRequest.name || 'Anonymous',
      socketId: socket.id
    };

    // Validate email format if provided
    if (userDetails.email !== 'Not provided' && !userDetails.email.includes('@')) {
      socket.emit("tripRequestError", "Invalid email format");
      return;
    }

    console.log("Processed user details:", userDetails);

    // Store the trip request with user details
    const fullTripRequest = {
      ...tripRequest,
      userDetails, // Store as nested userDetails object
      status: 'pending',
      timestamp: new Date(),
      requestId: `REQ${Date.now()}${Math.random().toString(36).substr(2, 4)}`
    };

    console.log("Created full trip request:", fullTripRequest);

    // Generate a unique ride ID
    const rideId = `RIDE${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
    
    // Create the ride request with all user details
    const rideRequest = {
      rideId,
      ...userDetails,
      pickupLocation: tripRequest.pickupLocation,
      dropLocation: tripRequest.dropLocation,
      distance: calculateDistance(
        tripRequest.pickupLocation.lat,
        tripRequest.pickupLocation.lng,
        tripRequest.dropLocation.lat,
        tripRequest.dropLocation.lng
      ).toFixed(1),
      status: 'pending',
      timestamp: new Date(),
      fare: tripRequest.fare || 0,
      paymentMethod: tripRequest.paymentMethod || 'cash',
      userDetails // Include the userDetails object in ride request
    };

    console.log("Created ride request with user details:", rideRequest);

    // Store the updated trip request with rideId
    tripRequests.set(socket.id, {
      ...fullTripRequest,
      rideId: rideId
    });

    // Find the best available driver
    const bestDriver = findBestDriver(tripRequest);
    console.log("Best driver found:", bestDriver);

    if (!bestDriver) {
      console.log("No drivers available");
      socket.emit("noDriversAvailable");
      tripRequests.delete(socket.id);
      return;
    }

    // Send the ride request to the selected driver
    const driverSocket = io.sockets.sockets.get(bestDriver.socketId);
    if (driverSocket) {
      console.log("Sending trip request to driver:", bestDriver.driverId);
      console.log("Ride request data sent to driver:", rideRequest);
      driverSocket.emit("newTripRequest", rideRequest);
      
      // Set a timeout for driver response
      setTimeout(() => {
        const request = tripRequests.get(socket.id);
        if (request && request.status === 'pending') {
          console.log("Driver response timeout, finding new driver");
          driverSocket.emit("tripRequestCancelled", { rideId });
          handleDriverNoResponse(socket, fullTripRequest);
        }
      }, 30000);
    } else {
      console.log("Driver socket not found");
      socket.emit("noDriversAvailable");
      tripRequests.delete(socket.id);
    }
  });

  // Handle driver's response to ride request
  socket.on("rideAccepted", (response) => {
    console.log("Ride accepted by driver:", response);
    const { rideId, driverId, driverName, vehicleNumber, contactNumber } = response;
    
    console.log("Current tripRequests:", Array.from(tripRequests.entries()));
    console.log("Looking for rideId:", rideId);
    
    // Find the user who requested the ride
    const userSocketEntry = Array.from(tripRequests.entries())
      .find(([_, request]) => request.rideId === rideId);

    console.log("Found userSocketEntry:", userSocketEntry);

    if (userSocketEntry && Array.isArray(userSocketEntry)) {
      const [userId, request] = userSocketEntry;
      const user = io.sockets.sockets.get(userSocketEntry[1].userDetails.socketId);
      
      if (user) {
        console.log("Notifying user about accepted ride");
        
        // Get driver's current data
        const driverData = driversData.get(socket.id);
        
        // Notify the user that a driver accepted with full driver details
        user.emit("driverAccepted", {
          rideId,
          driverName,
          vehicleNumber,
          contactNumber,
          driverId,
          driverRating: driverData?.rating || 0,
          driverPhoto: driverData?.profilePhoto || null,
          message: `${driverName} has accepted your ride request!`,
          // Include additional trip details
          tripDetails: {
            pickupLocation: request.pickupLocation,
            dropLocation: request.dropLocation,
            distance: request.distance,
            fare: request.fare,
            status: 'accepted'
          }
        });

        // Update the trip request status and add driver details
        request.status = 'accepted';
        request.driverId = driverId;
        request.driverDetails = {
          name: driverName,
          vehicleNumber,
          contactNumber,
          driverId
        };
        tripRequests.set(userId, request);
        
        console.log("Updated trip request with driver details:", request);

        // Broadcast to all connected clients that this driver is now busy
        io.emit("driversListUpdated", Array.from(driversData.values()));
      } else {
        console.log("User socket not found");
      }
    } else {
      console.log("Trip request not found");
    }
  });

  socket.on("rideRejected", (response) => {
    const { rideId, driverId, reason } = response;
    
    // Find the user who requested the ride
    const userSocket = Array.from(tripRequests.entries())
      .find(([_, request]) => request.rideId === rideId);

    if (userSocket) {
      const [userId, request] = userSocket;
      const user = io.sockets.sockets.get(request.socketId);
      
      if (user) {
        // Notify user about rejection
        user.emit("tripRejected", {
          rideId,
          message: reason || "Driver is unable to accept your ride at this time.",
          status: 'rejected'
        });

        // Update request status
        request.status = 'rejected';
        tripRequests.set(userId, request);
        
        // Try to find another driver
        handleDriverNoResponse(user, request);
      }
    }
  });

  // Helper function to handle when a driver doesn't respond or rejects
  const handleDriverNoResponse = (userSocket, tripRequest) => {
    // Find another available driver
    const nextDriver = findBestDriver(tripRequest);

    if (nextDriver) {
      // Generate a new ride ID
      const newRideId = `RIDE${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
      
      const rideRequest = {
        rideId: newRideId,
        userId: tripRequest.userId,
        phoneNumber: tripRequest.phoneNumber,
        email: tripRequest.email,
        gender: tripRequest.gender,
        pickupLocation: tripRequest.pickupLocation,
        dropLocation: tripRequest.dropLocation,
        distance: calculateDistance(
          tripRequest.pickupLocation.lat,
          tripRequest.pickupLocation.lng,
          tripRequest.dropLocation.lat,
          tripRequest.dropLocation.lng
        ).toFixed(1),
        status: 'pending',
        timestamp: new Date()
      };

      // Send request to the next driver
      const driverSocket = io.sockets.sockets.get(nextDriver.socketId);
      if (driverSocket) {
        driverSocket.emit("newTripRequest", rideRequest);
        
        // Set another timeout for the new driver
        setTimeout(() => {
          const request = tripRequests.get(userSocket.id);
          if (request && request.status === 'pending') {
            driverSocket.emit("tripRequestCancelled", { rideId: newRideId });
            handleDriverNoResponse(userSocket, tripRequest);
          }
        }, 30000);
      } else {
        userSocket.emit("noDriversAvailable");
        tripRequests.delete(userSocket.id);
      }
    } else {
      userSocket.emit("noDriversAvailable");
      tripRequests.delete(userSocket.id);
    }
  };

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
}); 88