import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Ride from '../../../models/Ride';
import Driver from '../../../models/Driver';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { rideId } = await params;

    // Fetch ride with driver details using rideId field instead of _id
    const ride = await Ride.findOne({ rideId }).lean();
    console.log('Ride details:', ride);
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
          photo: driver.photo,
          walletAddress: driver.walletAddress
        };
      }
    }

    // Format the response
    console.log('Ride details:', ride);
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
      { message: 'Failed to fetch ride details' },
      { status: 500 }
    );
  }
} 