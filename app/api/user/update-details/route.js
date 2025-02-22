import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    await connectDB();

    // Update user details
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          ...data,
          profileCompleted: true,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User details updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 