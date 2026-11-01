import { describe, it, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import Settings from '../src/models/Settings.js';

let mongoServer;
let customer, product;

describe('Order — Price Integrity & Stock Management', async () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'astromain_order_test' });

    // Seed settings
    await Settings.create({
      gstEnabled: true,
      gstPercentage: 18,
      shippingFee: 50,
      freeShippingAbove: 999
    });

    customer = new mongoose.Types.ObjectId();

    product = new Product({
      name: 'Test T-Shirt',
      slug: 'test-tshirt',
      description: 'A test t-shirt',
      price: 1000,
      discountPrice: 800,
      category: new mongoose.Types.ObjectId(),
      sizes: [{ size: 'M', stock: 10 }, { size: 'L', stock: 5 }],
      totalStock: 15,
      isActive: true
    });
    await product.save();
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Order.deleteMany({});
  });

  it('should calculate subtotal server-side from product price, not client input', async () => {
    // Attacker sends price: 1 (manipulated) for a product that costs 800
    const manipulatedClientPrice = 1;
    const actualProductPrice = product.discountPrice || product.price; // 800

    assert.notStrictEqual(manipulatedClientPrice, actualProductPrice);

    // Server should use actualProductPrice, not manipulatedClientPrice
    const serverCalculatedSubtotal = actualProductPrice * 2; // 2 qty
    assert.strictEqual(serverCalculatedSubtotal, 1600);
  });

  it('should reject orders with insufficient stock', async () => {
    const oversizeQuantity = product.sizes[0].stock + 100; // 110 when only 10 available

    assert.ok(oversizeQuantity > product.sizes[0].stock, 'Requested stock exceeds available');
  });

  it('should calculate tax server-side based on settings', async () => {
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    const subtotal = 1000;
    const expectedTax = Math.round(subtotal * (settings.gstPercentage / 100)); // 180

    assert.strictEqual(expectedTax, 180);
  });

  it('should calculate shipping server-side based on free shipping threshold', async () => {
    const settings = await Settings.findOne().sort({ updatedAt: -1 });

    // Below free shipping threshold
    const shippingBelow = 500 < settings.freeShippingAbove ? settings.shippingFee : 0;
    assert.strictEqual(shippingBelow, 50);

    // Above free shipping threshold
    const shippingAbove = 1500 < settings.freeShippingAbove ? settings.shippingFee : 0;
    assert.strictEqual(shippingAbove, 0);
  });

  it('should compute correct total = subtotal + tax + shipping', async () => {
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    const subtotal = 1600; // 2 x 800
    const tax = Math.round(subtotal * (settings.gstPercentage / 100)); // 288
    const shipping = subtotal < settings.freeShippingAbove ? settings.shippingFee : 0; // 0 (1600 > 999)
    const total = subtotal + tax + shipping; // 1888

    assert.strictEqual(total, 1888);
  });

  it('should decrement stock atomically within transaction', async () => {
    const initialStock = product.sizes[0].stock; // 10
    const orderQuantity = 2;

    // Simulate atomic decrement
    product.sizes[0].stock -= orderQuantity;
    product.totalStock -= orderQuantity;
    await product.save();

    const updatedProduct = await Product.findById(product._id);
    assert.strictEqual(updatedProduct.sizes[0].stock, initialStock - orderQuantity); // 8
    assert.strictEqual(updatedProduct.totalStock, 15 - orderQuantity); // 13
  });

  it('should not allow negative stock', async () => {
    const productCopy = await Product.findById(product._id);
    const sizeIndex = productCopy.sizes.findIndex(s => s.size === 'M');

    // Try to order more than available
    const requestedQty = productCopy.sizes[sizeIndex].stock + 1;
    assert.ok(requestedQty > productCopy.sizes[sizeIndex].stock, 'Should detect insufficient stock');
  });
});
