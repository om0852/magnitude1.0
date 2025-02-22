import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Ride from '../../../../../models/Ride';

export async function POST(request, context) {
  try {
    await connectDB();
    const { rideId } = context.params;
    const { otp } = await request.json();

    const ride = await Ride.findOne({ rideId });

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    // Verify OTP
    if (ride.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Update ride status
    ride.status = 'in_progress';  // Changed from 'IN_PROGRESS' to 'in_progress'
    await ride.save();

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        rideId: ride.rideId,
        status: ride.status
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