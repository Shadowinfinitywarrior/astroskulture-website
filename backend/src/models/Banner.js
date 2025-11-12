import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  discountPercentage: {
    type: Number,
    default: 0
  },
  displayText: {
    type: String,
    required: true
  },
  backgroundColor: {
    type: String,
    default: '#DC2626' // Default red color
  },
  textColor: {
    type: String,
    default: '#FFFFFF'
  },
  link: String,
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
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

export default mongoose.model('Banner', bannerSchema);