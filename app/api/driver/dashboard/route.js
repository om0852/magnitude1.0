import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Get driver ID from the session
    const driverId = session.user.id;

    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch driver's statistics
    const [
      totalRides,
      todayRides,
      totalEarnings,
      todayEarnings,
      recentRides,
      completionRate,
      averageRating
    ] = await Promise.all([
      // Total rides completed
      db.collection('rides').countDocuments({ 
        driverId, 
        status: 'completed' 
      }),
      
      // Today's rides
      db.collection('rides').countDocuments({ 
        driverId, 
        status: 'completed',
        completedAt: { $gte: today }
      }),
      
      // Total earnings
      db.collection('rides').aggregate([
        { 
          $match: { 
            driverId, 
            status: 'completed' 
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$fare' }
          }
        }
      ]).toArray(),
      
      // Today's earnings
      db.collection('rides').aggregate([
        { 
          $match: { 
            driverId, 
            status: 'completed',
            completedAt: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$fare' }
          }
        }
      ]).toArray(),
      
      // Recent rides (last 5)
      db.collection('rides')
        .find({ driverId })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      
      // Completion rate
      db.collection('rides').aggregate([
        {
          $match: { driverId }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            }
          }
        }
      ]).toArray(),
      
      // Average rating
      db.collection('rides').aggregate([
        {
          $match: {
            driverId,
            status: 'completed',
            rating: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' }
          }
        }
      ]).toArray()
    ]);

    // Format the response data
    const dashboardData = {
      totalRides,
      todayRides,
      totalEarnings: totalEarnings[0]?.total || 0,
      todayEarnings: todayEarnings[0]?.total || 0,
      recentRides,
      completionRate: completionRate[0] 
        ? Math.round((completionRate[0].completed / completionRate[0].total) * 100) 
        : 0,
      averageRating: averageRating[0]?.averageRating 
        ? Number(averageRating[0].averageRating.toFixed(1)) 
        : 0
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 