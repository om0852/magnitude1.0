import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import LoginHistory from '../../../models/LoginHistory';

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

    // Fetch last 10 login attempts
    const loginHistory = await LoginHistory.find({ user: user._id })
      .sort({ timestamp: -1 })
      .limit(10);

    return NextResponse.json(loginHistory);
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 