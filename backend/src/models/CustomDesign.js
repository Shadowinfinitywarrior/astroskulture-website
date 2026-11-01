import mongoose from 'mongoose';

const customDesignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Front and Back views for customer uploads
  frontImageUrl: {
    type: String,
    default: ''
  },
  backImageUrl: {
    type: String,
    default: ''
  },
  // Legacy / primary fallback image URL
  imageUrl: {
    type: String,
    default: ''
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
    enum: ['Oversized', 'Normal', 'oversized', 'normal', 'With Neck', 'Without Neck'],
    required: true
  },
  sleeveStyle: {
    type: String,
    enum: ['Full Sleeve', 'Half Sleeve', 'full sleeve', 'half sleeve', 'Sleeve', 'Sleeveless'],
    required: true
  },
  otherDetails: {
    type: String,
    default: ''
  },
  whatsappNumber: {
    type: String,
    default: ''
  },
  // Completed design deliveries by Admin (Front and Back views)
  completedFrontDesignUrl: {
    type: String,
    default: ''
  },
  completedBackDesignUrl: {
    type: String,
    default: ''
  },
  // Legacy completed design fallback
  completedDesignUrl: {
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
