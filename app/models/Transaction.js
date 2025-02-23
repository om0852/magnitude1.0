import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  rideId: {
    type: String,
    required: true,
    unique: true
  },
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  gasUsed: {
    type: String
  },
  blockNumber: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for frequently queried fields
TransactionSchema.index({ rideId: 1 });
TransactionSchema.index({ transactionHash: 1 });
TransactionSchema.index({ status: 1 });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export default Transaction; 