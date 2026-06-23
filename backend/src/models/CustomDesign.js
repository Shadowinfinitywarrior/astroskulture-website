import mongoose from 'mongoose';

const customDesignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  neckStyle: {
    type: String,
    enum: ['With Neck', 'Without Neck'],
    required: true
  },
  sleeveStyle: {
    type: String,
    enum: ['Sleeve', 'Sleeveless'],
    required: true
  },
  otherDetails: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
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

// Index for performance querying user's custom designs sorted by date
customDesignSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('CustomDesign', customDesignSchema);
