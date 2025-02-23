import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rideId } = await params;
    const { db } = await connectToDatabase();

    // Find the transaction for this ride
    const transaction = await db.collection('transactions').findOne({ rideId });

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
        timestamp: transaction.timestamp
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