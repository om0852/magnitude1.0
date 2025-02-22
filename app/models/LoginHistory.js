import mongoose from 'mongoose';

const LoginHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  }
});

export default mongoose.models.LoginHistory || mongoose.model('LoginHistory', LoginHistorySchema); 