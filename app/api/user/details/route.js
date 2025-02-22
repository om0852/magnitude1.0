import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Driver from '@/app/models/Driver';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { authOptions } from '../../auth/[...nextauth]/route';

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
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
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
  },
  profileCompleted: {
    type: Boolean,
    default: false
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

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

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
          }

          const user = await UserModel.findOne({ email: credentials.email });
          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            profileCompleted: user.profileCompleted
          };
        } catch (error) {
          throw new Error(error.message);
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        try {
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
          }

          // Check if user exists
          let dbUser = await UserModel.findOne({ email: user.email });
          
          if (!dbUser) {
            // Create new user with minimal required fields
            dbUser = await UserModel.create({
              name: user.name,
              email: user.email,
              role: 'user',
              profileCompleted: false
            });
          }

          // Add profileCompleted status to the user object
          user.profileCompleted = dbUser.profileCompleted;
          user.role = dbUser.role;
          
          return true;
        } catch (error) {
          console.error('Database Error:', error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      // Add additional user info to session
      if (session?.user) {
        session.user.role = token.role;
        session.user.profileCompleted = token.profileCompleted;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      // Add additional info to token
      if (user) {
        token.role = user.role;
        token.profileCompleted = user.profileCompleted;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      // Customize redirect based on whether profile is completed
      if (url.startsWith(baseUrl)) {
        const session = await getServerSession();
        if (session?.user && !session.user.profileCompleted) {
          return `${baseUrl}/user-details`;
        }
        return url;
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return user details
    return NextResponse.json({
      success: true,
      data: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Update user details logic here
    // Example:
    // await db.user.update({
    //   where: { email: session.user.email },
    //   data: {
    //     ...data
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'User details updated successfully'
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 