import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import Ride from '../../../models/Ride';
import Driver from '../../../models/Driver';

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { rideId } = params;
    
    // Get the ride details
    const ride = await Ride.findOne({ rideId });
    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    // Get driver details
    const driver = await Driver.findById(ride.driverId);
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Combine the data
    const rideData = {
      ...ride.toObject(),
      driverDetails: {
        name: driver.fullName,
        phone: driver.phone,
        vehicleNumber: driver.vehicleNumber,
        vehicleModel: driver.vehicleModel,
        rating: driver.rating || 0,
        totalRides: driver.totalRides || 0
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: rideData 
    });
  } catch (error) {
    console.error('Error fetching ride details:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch ride details' 
    }, { status: 500 });
  }
} 