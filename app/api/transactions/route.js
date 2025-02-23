import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import Transaction from '../../models/Transaction';
import { getServerSession } from 'next-auth';

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // Validate required fields
    const requiredFields = ['rideId', 'fromAddress', 'toAddress', 'amount', 'transactionHash'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Create new transaction
    const transaction = new Transaction(data);
    await transaction.save();

    return NextResponse.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error storing transaction:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to store transaction' 
    }, { status: 500 });
  }
} 