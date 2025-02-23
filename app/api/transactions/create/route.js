import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rideId, amount, paymentMethod } = body;

    if (!rideId || !amount || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if a transaction already exists for this ride
    const existingTransaction = await db.collection('transactions').findOne({ rideId });

    if (existingTransaction) {
      return NextResponse.json({ 
        error: 'Transaction already exists for this ride' 
      }, { status: 400 });
    }

    // Create new transaction
    const transaction = {
      rideId,
      userId: session.user.id,
      amount,
      paymentMethod,
      status: 'pending',
      timestamp: new Date(),
      currency: 'ETH'
    };

    await db.collection('transactions').insertOne(transaction);

    return NextResponse.json({ 
      success: true, 
      data: {
        transactionId: transaction._id,
        status: transaction.status
      }
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 