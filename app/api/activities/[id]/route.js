import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { action } = await request.json();

    let updatedRide;

    switch (action) {
      case 'cancel':
        updatedRide = await prisma.ride.update({
          where: { id },
          data: { status: 'CANCELLED' }
        });
        break;
      
      case 'complete':
        updatedRide = await prisma.ride.update({
          where: { id },
          data: { status: 'COMPLETED' }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(updatedRide);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
} 