import mongoose from 'mongoose';

const deletedProductSchema = new mongoose.Schema({
  originalProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productData: {
    name: String,
    description: String,
    price: Number,
    discountPrice: Number,
    category: String,
    images: [{
      url: String,
      alt: String
    }],
    slug: String,
    totalStock: Number,
  },
  reason: {
    type: String,
    enum: ['manual_delete', 'system_error', 'archive'],
    default: 'manual_delete'
  },
  deletedBy: {
    type: String,
    default: 'admin'
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  canRestore: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('DeletedProduct', deletedProductSchema);
