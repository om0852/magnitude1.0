import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true // Define unique index here only, not in the field definition
  },
  driverId: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return /^DRV[A-Z0-9]{6}$/.test(v);
      },
      message: props => `${props.value} is not a valid driver ID! Format should be DRVXXXXXX where X is uppercase letter or number`
    }
  },
  driverIdHistory: [{
    driverId: String,
    timestamp: Date,
    status: {
      type: String,
      enum: ['active', 'inactive']
    }
  }],
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  drivingLicense: {
    type: String,
    required: [true, 'Driving license is required']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required']
  },
  vehicleModel: {
    type: String,
    required: [true, 'Vehicle model is required']
  },
  walletAddress: String,
  address: String,
  isActive: {
    type: Boolean,
    default: false
  },
  lastLocation: {
    lat: Number,
    lng: Number
  },
  lastAddress: String,
  lastStatusUpdate: Date,
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'blocked'],
    default: 'pending'
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

// Handle model compilation for Next.js hot reloading
const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);

export default Driver; 