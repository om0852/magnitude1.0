import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

// Create Ride Schema
const rideSchema = new mongoose.Schema({
  rideId: {
    type: String,
    required: true,
    unique: true
  },
  requestId: String,
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  user: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  socketId: String,
  otp: {
    type: String,
    required: true
  },
  pickup: {
    type: Object,
    required: true
  },
  destination: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  distance: String,
  duration: String,
  vehicleType: Number,
  fare: Number,
  userDetails: {
    name: String,
    phoneNumber: String,
    email: String,
    gender: String
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  time: {
    type: String,
    required: true,
    default: new Date().toLocaleTimeString()
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Ride = mongoose.models.Ride || mongoose.model('Ride', rideSchema);

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { rideId, tripRequest } = await req.json();

    console.log('Trip Request:', tripRequest);

    if (!rideId || !tripRequest) {
      return NextResponse.json({ error: 'Ride ID and trip request details are required' }, { status: 400 });
    }

    // Get driver information
    const driver = await Driver.findOne({ email: session.user.email });
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Check if ride already exists
    let ride = await Ride.findOne({ rideId });

    const currentDate = new Date();

    if (ride) {
      // Update existing ride
      ride.driverId = driver._id;
      ride.status = 'in_progress';
      ride.startTime = currentDate;
      ride.otp = otp;
      ride.userEmail = tripRequest.userDetails.email;
      await ride.save();
    } else {
      // Create new ride with validated data
      const rideData = {
        rideId,
        requestId: tripRequest.requestId,
        driverId: driver._id,
        user: tripRequest.userId,
        userEmail: tripRequest.userDetails.email,
        socketId: tripRequest.socketId,
        pickup: tripRequest.pickupLocation,
        destination: tripRequest.dropLocation,
        status: 'in_progress',
        distance: tripRequest.distance,
        duration: tripRequest.duration,
        vehicleType: tripRequest.vehicleType,
        fare: tripRequest.estimatedFare,
        userDetails: tripRequest.userDetails,
        date: currentDate,
        time: currentDate.toLocaleTimeString(),
        startTime: currentDate,
        otp: otp
      };

      console.log("Creating ride with data:", rideData);

      try {
        ride = new Ride(rideData);
        await ride.save();
        console.log("Ride saved successfully:", ride);
      } catch (validationError) {
        console.error("Validation error details:", validationError);
        throw validationError;
      }
    }

    // Update driver's status to indicate they're on a ride
    await Driver.findByIdAndUpdate(driver._id, {
      'rideStatus.isActive': true,
      'rideStatus.currentRideId': rideId
    });

    return NextResponse.json({ 
      success: true, 
      data: ride 
    });
  } catch (error) {
    console.error('Error accepting ride:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to accept ride' 
    }, { status: 500 });
  }
} 