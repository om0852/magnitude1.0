import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
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

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { role } = await req.json();

    if (!['user', 'driver'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update user's role in the User collection
    const User = mongoose.models.User || mongoose.model('User', {
      email: String,
      role: String,
      updatedAt: Date
    });

    await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        role,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Role updated to ${role}` 
    });
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update role' 
    }, { status: 500 });
  }
} 