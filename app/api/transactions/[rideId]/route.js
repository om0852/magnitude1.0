import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import { getServerSession } from 'next-auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { rideId } = params;

    if (!rideId) {
      return NextResponse.json(
        { error: 'Ride ID is required' },
        { status: 400 }
      );
    }

    // Find transaction for the ride
    const transaction = await Transaction.findOne({ rideId }).lean();

    if (!transaction) {
      return NextResponse.json({
        success: true,
        data: { status: 'pending' }
      });
    }

    return NextResponse.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch transaction' 
    }, { status: 500 });
  }
} 