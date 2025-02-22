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

    // Ensure MongoDB is connected
    await connectDB();

    const data = await req.json();

    // Update driver status, location, and driverId if provided
    const updateData = {
      isActive: data.isActive,
      lastStatusUpdate: new Date()
    };

    // Only add location and address if they exist
    if (data.lastLocation) {
      updateData.lastLocation = data.lastLocation;
    }
    if (data.lastAddress) {
      updateData.lastAddress = data.lastAddress;
    }

    // Always update driverId when going online
    if (data.isActive && data.driverId) {
      // Validate driver ID format
      if (!/^DRV[A-Z0-9]{6}$/.test(data.driverId)) {
        return NextResponse.json({ 
          error: 'Invalid driver ID format. Must be DRVXXXXXX where X is uppercase letter or number' 
        }, { status: 400 });
      }

      updateData.driverId = data.driverId;
      // Also store in driverIdHistory if going online
      updateData.$push = {
        driverIdHistory: {
          driverId: data.driverId,
          timestamp: new Date(),
          status: 'active'
        }
      };
    }

    const driver = await Driver.findOneAndUpdate(
      { email: session.user.email },
      data.isActive ? { $set: updateData, ...updateData } : { $set: updateData },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        isActive: driver.isActive,
        driverId: driver.driverId
      }
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update status' 
    }, { status: 500 });
  }
} 