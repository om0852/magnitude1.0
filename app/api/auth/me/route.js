import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user from database
    const User = mongoose.models.User || mongoose.model('User', {
      email: String,
      role: String
    });

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ 
        email: session.user.email,
        role: 'user' // Default role if not found in database
      });
    }

    return NextResponse.json({
      email: user.email,
      role: user.role || 'user'
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 