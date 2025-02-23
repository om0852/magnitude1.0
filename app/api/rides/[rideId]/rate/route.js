import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Ride from '../../../../models/Ride';
import Driver from '../../../../models/Driver';
import { getServerSession } from 'next-auth';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { rideId } = params;
    const { rating, feedback } = await request.json();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Find the ride
    const ride = await Ride.findOne({ rideId }).lean();
    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    // Check if ride is completed
    if (ride.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only rate completed rides' },
        { status: 400 }
      );
    }

    // Check if ride has already been rated
    if (ride.rating) {
      return NextResponse.json(
        { error: 'Ride has already been rated' },
        { status: 400 }
      );
    }

    // Update ride with rating and feedback
    const updatedRide = await Ride.findOneAndUpdate(
      { rideId },
      { 
        $set: {
          rating,
          feedback: feedback || '',
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedRide) {
      return NextResponse.json(
        { error: 'Failed to update ride rating' },
        { status: 500 }
      );
    }

    // Update driver's average rating
    if (ride.driverId) {
      const driver = await Driver.findById(ride.driverId);
      if (driver) {
        const totalRides = driver.totalRides + 1;
        const currentTotalRating = (driver.rating || 0) * (totalRides - 1);
        const newRating = (currentTotalRating + rating) / totalRides;
        
        await Driver.findByIdAndUpdate(
          ride.driverId,
          {
            $set: {
              rating: newRating,
              totalRides,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rideId: updatedRide.rideId,
        rating: updatedRide.rating,
        feedback: updatedRide.feedback
      }
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
} 