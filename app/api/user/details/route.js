import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Driver from '@/app/models/Driver';

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  alternatePhone: String,
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required']
  },
  occupation: String,
  role: {
    type: String,
    enum: ['user', 'driver'],
    default: 'user'
  },
  profileImage: {
    type: String // URL to stored image
  },
  isActive: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRides: {
    type: Number,
    default: 0
  },
  completedRides: {
    type: Number,
    default: 0
  },
  cancelledRides: {
    type: Number,
    default: 0
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    paymentMethods: [{
      type: {
        type: String,
        enum: ['card', 'upi', 'wallet', 'cash']
      },
      isDefault: Boolean,
      details: Object
    }]
  },
  documents: {
    idProof: String,
    addressProof: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'blocked'],
    default: 'pending'
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    transactions: [{
      type: {
        type: String,
        enum: ['credit', 'debit']
      },
      amount: Number,
      description: String,
      timestamp: Date
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // Update or create user details
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        ...data,
        email: session.user.email,
        updatedAt: new Date()
      },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    // If user is a driver, create/update driver profile
    if (user.role === 'driver') {
      await Driver.findOneAndUpdate(
        { email: session.user.email },
        {
          email: session.user.email,
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          status: 'pending',
          updatedAt: new Date()
        },
        { 
          new: true,
          upsert: true
        }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('User details update error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update user details' 
    }, { status: 500 });
  }
} 