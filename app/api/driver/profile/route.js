import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import Driver from '../../../models/Driver';
import mongoose from 'mongoose';

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

export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'drivingLicense',
      'vehicleNumber',
      'vehicleModel',
      'walletAddress',
      'address',
      'emergencyContact'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Update or create driver profile with all fields
    const driver = await Driver.findOneAndUpdate(
      { email: session.user.email },
      {
        ...data,
        email: session.user.email,
        updatedAt: new Date(),
        // Ensure these fields are properly set
        status: data.status || 'pending',
        isActive: data.isActive || false,
        documents: {
          drivingLicenseImage: data.documents?.drivingLicenseImage,
          vehicleRegistration: data.documents?.vehicleRegistration,
          insurance: data.documents?.insurance,
          backgroundCheck: data.documents?.backgroundCheck
        },
        earnings: {
          total: data.earnings?.total || 0,
          thisMonth: data.earnings?.thisMonth || 0,
          thisWeek: data.earnings?.thisWeek || 0,
          today: data.earnings?.today || 0
        }
      },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    // Also update the user's role in the User collection if not already set
    const User = mongoose.models.User || mongoose.model('User', {
      email: String,
      role: String,
      updatedAt: Date
    });

    await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        role: 'driver',
        updatedAt: new Date()
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: driver });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update profile' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const driver = await Driver.findOne({ email: session.user.email });
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: driver });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch profile' 
    }, { status: 500 });
  }
} 