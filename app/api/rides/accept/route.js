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
    unique: true
  },
  requestId: {
    type: String,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
  },
  userId: {
    type: String,
  },
  socketId: {
    type: String,
  },
  pickupLocation: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    address: {
      type: String,
    }
  },
  dropLocation: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    address: {
      type: String,
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  distance: {
    type: String,
  },
  duration: {
    type: String,
  },
  vehicleType: {
    type: Number,
  },
  estimatedFare: {
    type: Number,
  },
  userDetails: {
    name: {
      type: String,
      default: 'Anonymous'
    },
    phoneNumber: {
      type: String,
      default: 'Not provided'
    },
    email: {
      type: String,
      default: 'Not provided'
    },
    gender: {
      type: String,
      default: 'Not specified'
    }
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
console.log(tripRequest)
    if (!rideId || !tripRequest) {
      return NextResponse.json({ error: 'Ride ID and trip request details are required' }, { status: 400 });
    }

    // Get driver information
    const driver = await Driver.findOne({ email: session.user.email });
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check if ride already exists
    let ride = await Ride.findOne({ rideId });

    const currentDate = new Date();

    if (ride) {
      // Update existing ride
      ride.driverId = driver._id;
      ride.status = 'in_progress';
      ride.startTime = currentDate;
      await ride.save();
    } else {
      // Create new ride with validated data
      const rideData = {
        rideId,
        requestId: tripRequest.requestId,
        driverId: driver._id,
        userId: tripRequest.userId,
        socketId: tripRequest.socketId,
        pickupLocation: tripRequest.pickupLocation,
        dropLocation: tripRequest.dropLocation,
        status: 'in_progress',
        distance: tripRequest.distance,
        duration: tripRequest.duration,
        vehicleType: tripRequest.vehicleType,
        estimatedFare: tripRequest.estimatedFare,
        userDetails: tripRequest.userDetails,
        startTime: currentDate
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