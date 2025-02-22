import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  driverId: {

    type: String,

    unique: true,

    sparse: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  drivingLicense: {
    type: String,
    required: [true, 'Driving license number is required'],
    unique: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true
  },
  vehicleModel: {
    type: String,
    required: [true, 'Vehicle model is required']
  },
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    unique: true
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
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required']
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required']
    }
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
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    thisMonth: {
      type: Number,
      default: 0
    },
    thisWeek: {
      type: Number,
      default: 0
    },
    today: {
      type: Number,
      default: 0
    }
  },
  documents: {
    drivingLicenseImage: {
      type: String,
      required: [true, 'Driving license image is required']
    },
    vehicleRegistration: {
      type: String,
      required: [true, 'Vehicle registration document is required']
    },
    insurance: {
      type: String,
      required: [true, 'Insurance document is required']
    },
    backgroundCheck: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  vehicleDetails: {
    type: {
      type: String,
      enum: ['car', 'bike', 'auto'],
      required: [true, 'Vehicle type is required']
    },
    make: String,
    model: String,
    year: Number,
    color: String,
    seatingCapacity: Number
  },
  bankDetails: {
    accountNumber: {
      type: String,
      required: [true, 'Bank account number is required']
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required']
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required']
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required']
    }
  },
  availability: {
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String,
      endTime: String,
      isAvailable: Boolean
    }],
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  preferences: {
    maxDistance: {
      type: Number,
      default: 30 // in kilometers
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
    autoAcceptRides: {
      type: Boolean,
      default: false
    }
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
driverSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for frequently queried fields
driverSchema.index({ email: 1 });
driverSchema.index({ phone: 1 });
driverSchema.index({ drivingLicense: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ isActive: 1 });
driverSchema.index({ 'availability.currentLocation': '2dsphere' });

const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);

export default Driver;