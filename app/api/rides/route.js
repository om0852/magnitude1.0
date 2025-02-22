import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../lib/mongodb';
import User from '../../models/User';
import Ride from '../../models/Ride';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch rides for the user
    const rides = await Ride.find({ 
      user: user._id 
    }).sort({ date: -1 }); // Sort by date descending

    return NextResponse.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 