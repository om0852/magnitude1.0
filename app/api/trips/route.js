import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '../../lib/mongodb';
import Ride from '../../models/Ride';
import Driver from '../../models/Driver';

export async function GET() {
  try {
    const session = await getServerSession();
    console.log('Session:', session);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    console.log('Connected to DB');

    // Fetch all rides for the user's email
    const rides = await Ride.find({
      'userDetails.email': session.user.email
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .lean();

    console.log('Found rides:', rides.length);

    // Fetch driver details for each ride
    const ridesWithDrivers = await Promise.all(rides.map(async (ride) => {
      console.log('Processing ride:', ride.rideId);
      let driverDetails = null;
      if (ride.driverId) {
        const driver = await Driver.findById(ride.driverId).lean();
        console.log('Found driver:', driver?.fullName);
        if (driver) {
          driverDetails = {
            name: driver.fullName,
            phone: driver.phone,
            vehicleNumber: driver.vehicleNumber,
            vehicleModel: driver.vehicleModel,
            rating: driver.rating || 4.5,
            totalRides: driver.totalRides || 0
          };
        }
      }

      return {
        rideId: ride.rideId,
        status: ride.status,
        pickupLocation: ride.pickupLocation || {},
        dropLocation: ride.dropLocation || {},
        distance: ride.distance || '0',
        duration: ride.duration || '0',
        estimatedFare: ride.estimatedFare || 0,
        createdAt: ride.createdAt,
        startTime: ride.startTime,
        endTime: ride.endTime,
        rating: ride.rating,
        driverDetails,
        otp: ride.status === 'in_progress' ? ride.otp : undefined
      };
    }));

    console.log('Processed rides:', ridesWithDrivers.length);

    return NextResponse.json({
      success: true,
      data: ridesWithDrivers
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch trips' 
    }, { status: 500 });
  }
} 