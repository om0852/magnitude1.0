import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '../../lib/mongodb';
import Ride from '../../models/Ride';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch all trips for the user
    const trips = await Ride.find({
      userId: session.user.id
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .lean();

    // Format the response
    const formattedTrips = trips.map(trip => ({
      rideId: trip.rideId,
      status: trip.status,
      pickupLocation: trip.pickupLocation,
      dropLocation: trip.dropLocation,
      distance: trip.distance,
      duration: trip.duration,
      estimatedFare: trip.estimatedFare,
      createdAt: trip.createdAt,
      startTime: trip.startTime,
      endTime: trip.endTime,
      rating: trip.rating,
      driverDetails: trip.driverDetails
    }));

    return NextResponse.json({
      success: true,
      data: formattedTrips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch trips' 
    }, { status: 500 });
  }
} 