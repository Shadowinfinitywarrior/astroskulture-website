import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  gstPercentage: {
    type: Number,
    default: 18,
    min: 0,
    max: 100
  },
  gstEnabled: {
    type: Boolean,
    default: true
  },
  shippingFee: {
    type: Number,
    default: 69,
    min: 0
  },
  shippingEnabled: {
    type: Boolean,
    default: true
  },
  freeShippingAbove: {
    type: Number,
    default: 999,
    min: 0
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

export default mongoose.model('Settings', settingsSchema);
