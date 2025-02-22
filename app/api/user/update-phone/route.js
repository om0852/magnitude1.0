import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await req.json();
    console.log('Received request to update phone number:', phoneNumber);

    // Enhanced phone number validation
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Remove any non-numeric characters and check length
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (cleanPhoneNumber.length < 10) {
      return NextResponse.json(
        { error: 'Phone number must be at least 10 digits' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('Connected to database');
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.error('User not found:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the phone number
    const oldPhoneNumber = user.phoneNumber;
    user.phoneNumber = cleanPhoneNumber;
    await user.save();
    
    console.log('Phone number updated in database:', {
      user: user.email,
      oldNumber: oldPhoneNumber,
      newNumber: cleanPhoneNumber
    });

    return NextResponse.json({ 
      message: 'Phone number updated successfully',
      phoneNumber: user.phoneNumber 
    });
  } catch (error) {
    console.error('Error updating phone number:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
} 