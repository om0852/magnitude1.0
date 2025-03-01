import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Ride from '../../../../models/Ride';
import Driver from '../../../../models/Driver';
import { getServerSession } from 'next-auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { rideId } = await params;

    if (!rideId) {
      return NextResponse.json(
        { error: 'Ride ID is required' },
        { status: 400 }
      );
    }

    // Fetch ride with driver details using rideId field
    const ride = await Ride.findOne({ rideId }).lean();
    
    if (!ride) {
      return NextResponse.json(
        { message: 'Ride not found' },
        { status: 404 }
      );
    }

    // Fetch driver details if available
    let driverDetails = null;
    if (ride.driverId) {
      const driver = await Driver.findById(ride.driverId).lean();
      if (driver) {
        driverDetails = {
          name: driver.fullName,
          contactNumber: driver.phone,
          vehicleNumber: driver.vehicleNumber,
          vehicleModel: driver.vehicleModel,
          rating: driver.rating || 4.5,
          totalRides: driver.totalRides || 0,
          photo: driver.photo
        };
      }
    }

    // Format the response
    const tripDetails = {
      ...ride,
      driverDetails,
      pickupLocation: {
        address: ride.pickup?.address || 'Unknown pickup location',
        coordinates: ride.pickup?.coordinates
      },
      dropLocation: {
        address: ride.destination?.address || 'Unknown destination',
        coordinates: ride.destination?.coordinates
      },
      distance: ride.distance || '0',
      duration: ride.duration || '0 mins',
      estimatedFare: ride.fare || 0,
      status: ride.status || 'pending',
      createdAt: ride.createdAt,
      startTime: ride.startTime
    };

    return NextResponse.json({
      success: true,
      data: tripDetails
    });

  } catch (error) {
    console.error('Error fetching ride details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ride details' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { rideId } = await params;
    
    if (!rideId) {
      return NextResponse.json(
        { error: 'Ride ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();

    const ride = await Ride.findOneAndUpdate(
      { rideId },
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: ride 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 