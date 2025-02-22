import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Ride from '../../../../../models/Ride';

export async function POST(request, context) {
  try {
    await connectDB();
    const { rideId } = context.params;

    const ride = await Ride.findOne({ rideId });

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    // Only allow completing rides that are in 'accepted' status
    if (ride.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Can only complete rides that are in accepted status' },
        { status: 400 }
      );
    }

    // Update ride status to completed
    ride.status = 'completed';
    ride.endTime = new Date();
    await ride.save();

    return NextResponse.json({
      success: true,
      message: 'Trip completed successfully',
      data: {
        rideId: ride.rideId,
        status: ride.status,
        endTime: ride.endTime
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 