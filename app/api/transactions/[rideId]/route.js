import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

// Create Transaction Schema
const transactionSchema = new mongoose.Schema({
  rideId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: String,
  driverId: String,
  transactionHash: String,
  currency: {
    type: String,
    default: 'INR'
  }
});

// Create model if it doesn't exist
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export async function GET(request, { params }) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rideId } =await params;
    
    if (!rideId) {
      return NextResponse.json({ error: 'Ride ID is required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Find the transaction for this ride
    const transaction = await Transaction.findOne({ rideId }).lean();

    if (!transaction) {
      return NextResponse.json({ 
        success: true, 
        data: { status: 'pending' }
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        status: transaction.status,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        timestamp: transaction.timestamp,
        transactionHash: transaction.transactionHash
      }
    });

  } catch (error) {
    console.error('Error checking transaction status:', error);
    return NextResponse.json(
      { error: 'Failed to check transaction status' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rideId } = await params;
    const body = await request.json();

    if (!rideId || !body.amount || !body.paymentMethod) {
      return NextResponse.json({ 
        error: 'Ride ID, amount, and payment method are required' 
      }, { status: 400 });
    }

    await connectDB();

    // Create or update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { rideId },
      {
        ...body,
        timestamp: new Date(),
        userId: session.user.email
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      data: transaction 
    });

  } catch (error) {
    console.error('Error creating/updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
} 