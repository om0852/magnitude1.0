import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Driver from '../../../models/Driver';

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

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { userLocation } = await req.json();

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return NextResponse.json({ 
        error: 'User location is required' 
      }, { status: 400 });
    }

    // Find all active drivers
    const drivers = await Driver.find({
      isActive: true,
      lastLocation: { $exists: true },
      'lastLocation.lat': { $exists: true },
      'lastLocation.lng': { $exists: true }
    });

    // Filter drivers within 15km range
    const nearbyDrivers = drivers.filter(driver => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        driver.lastLocation.lat,
        driver.lastLocation.lng
      );
      return distance <= 15; // 15km range
    }).map(driver => ({
      driverId: driver.driverId,
      fullName: driver.fullName,
      vehicleNumber: driver.vehicleNumber,
      location: driver.lastLocation,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        driver.lastLocation.lat,
        driver.lastLocation.lng
      ).toFixed(1)
    }));

    return NextResponse.json({
      success: true,
      data: {
        drivers: nearbyDrivers,
        total: nearbyDrivers.length
      }
    });
  } catch (error) {
    console.error('Error fetching nearby drivers:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch nearby drivers' 
    }, { status: 500 });
  }
} 