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
      name: String,
      phone: String,
      role: String,
      createdAt: Date,
      profileImage: String,
      totalRides: { type: Number, default: 0 },
      walletBalance: { type: Number, default: 0 },
      preferences: {
        notifications: { type: Boolean, default: true },
        emailUpdates: { type: Boolean, default: true },
        darkMode: { type: Boolean, default: false }
      },
      savedAddresses: [{
        type: { type: String },
        address: String,
        label: String
      }],
      transactions: [{
        type: String,
        amount: Number,
        date: Date,
        status: String
      }],
      messages: [{
        title: String,
        content: String,
        date: Date,
        read: Boolean
      }]
    });

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      // Create a new user if not found
      const newUser = await User.create({
        email: session.user.email,
        name: session.user.name,
        role: 'user',
        createdAt: new Date(),
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`,
        preferences: {
          notifications: true,
          emailUpdates: true,
          darkMode: false
        }
      });
      
      return NextResponse.json({
        name: newUser.name,
        email: newUser.email,
        phone: '',
        role: newUser.role,
        joinDate: newUser.createdAt,
        profileImage: newUser.profileImage,
        totalRides: 0,
        walletBalance: 0,
        preferences: newUser.preferences,
        savedAddresses: [],
        transactions: [],
        messages: []
      });
    }

    return NextResponse.json({
      name: user.name || session.user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      joinDate: user.createdAt || new Date(),
      profileImage: user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
      totalRides: user.totalRides || 0,
      walletBalance: user.walletBalance || 0,
      preferences: user.preferences || {
        notifications: true,
        emailUpdates: true,
        darkMode: false
      },
      savedAddresses: user.savedAddresses || [],
      transactions: user.transactions || [],
      messages: user.messages || []
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 