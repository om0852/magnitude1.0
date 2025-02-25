import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Ride from '../../../../../models/Ride';
import { getServerSession } from 'next-auth';
import Driver from '../../../../../models/Driver';

export async function POST(request, { params }) {
  try {
    // Get session and verify authentication
    const session = await getServerSession();
    console.log('Session:', session?.user?.email);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();
    
    // Get rideId from params and OTP from request body
    const { rideId } = await params;
    const body = await request.json();
    const providedOtp = body.otp?.toString().trim();

    console.log('Verification attempt:', { 
      rideId, 
      providedOtp,
      driverEmail: session.user.email 
    });

    // Validate inputs
    if (!rideId || !providedOtp) {
      console.log('Missing required fields:', { rideId, providedOtp });
      return NextResponse.json(
        { error: 'Ride ID and OTP are required' },
        { status: 400 }
      );
    }

    // Find the driver
    const driver = await Driver.findOne({ email: session.user.email });
    if (!driver) {
      console.log('Driver not found:', session.user.email);
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    // Find the ride
    const ride = await Ride.findOne({ 
      rideId,
      driverId: driver._id 
    });
console.log(ride)
    console.log('Found ride:', ride ? {
      rideId: ride.rideId,
      status: ride.status,
      storedOtp: ride.otp,
      driverId: ride.driverId,
      userEmail: ride.userEmail
    } : 'No ride found');

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found or not assigned to this driver' },
        { status: 404 }
      );
    }
console.log(ride.status)
    // Check if ride is in the correct status
 
    // Verify OTP
    const storedOtp = ride.otp?.toString().trim();
    console.log('OTP comparison:', {
      providedOtp,
      storedOtp,
      match: providedOtp === storedOtp
    });
console.log(providedOtp,storedOtp)
    if (providedOtp !== storedOtp) {
      return NextResponse.json(
        { error: 'Invalid OTP provided' },
        { status: 400 }
      );
    }

    // Update ride status to in_progress
    const updateTime = new Date();
    ride.status = 'accepted';
    ride.startTime = updateTime;
    await ride.save();

    console.log('Ride updated successfully:', {
      rideId: ride.rideId,
      newStatus: ride.status,
      startTime: updateTime
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        rideId: ride.rideId,
        status: ride.status,
        startTime: ride.startTime,
        driverDetails: {
          name: driver.fullName,
          vehicleNumber: driver.vehicleNumber
        }
      }
    });

  } catch (error) {
    console.error('OTP verification error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
} 