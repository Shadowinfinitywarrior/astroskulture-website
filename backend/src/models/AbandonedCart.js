import mongoose from 'mongoose';

const abandonedCartSchema = new mongoose.Schema(
  {
    cartId: {
      type: String,
      unique: true,
      index: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    recoveryToken: {
      type: String,
      unique: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    customer: {
      name: { type: String, default: 'Customer' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    shippingAddress: {
      address1: String,
      address2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        size: String,
        color: String,
        image: String,
      },
    ],
    cartTotal: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['abandoned', 'first_reminder_sent', 'second_reminder_sent', 'opened', 'recovered', 'expired'],
      default: 'abandoned',
      index: true,
    },
    firstNotificationScheduledAt: {
      type: Date,
      index: true,
    },
    firstNotificationSentAt: {
      type: Date,
    },
    secondNotificationScheduledAt: {
      type: Date,
      index: true,
    },
    secondNotificationSentAt: {
      type: Date,
    },
    customerOpenedAt: {
      type: Date,
    },
    recoveredAt: {
      type: Date,
    },
    recoveryUrl: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for scheduler queries
abandonedCartSchema.index({ status: 1, firstNotificationScheduledAt: 1 });
abandonedCartSchema.index({ status: 1, secondNotificationScheduledAt: 1 });

const AbandonedCart = mongoose.model('AbandonedCart', abandonedCartSchema);
export default AbandonedCart;
