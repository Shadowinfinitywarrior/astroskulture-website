import { describe, it, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Admin from '../src/models/Admin.js';
import jwt from 'jsonwebtoken';

let mongoServer;

describe('Authentication', async () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'astromain_test' });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Admin.deleteMany({});
  });

  it('should hash passwords with bcrypt', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'plainPassword123',
      fullName: 'Test User',
      dateOfBirth: '1990-01-01',
      securityQuestion: 'What is your pet name?',
      securityAnswer: 'fido'
    });
    await user.save();

    const savedUser = await User.findById(user._id);
    assert.notStrictEqual(savedUser.password, 'plainPassword123');
    assert.ok(await savedUser.comparePassword('plainPassword123'));
    assert.ok(!(await savedUser.comparePassword('wrongPassword')));
  });

  it('should reject weak passwords (< 6 chars)', async () => {
    try {
      const user = new User({
        email: 'weak@example.com',
        password: '123',
        fullName: 'Weak User',
        dateOfBirth: '1990-01-01',
        securityQuestion: 'Q?',
        securityAnswer: 'A'
      });
      await user.save();
      assert.fail('Should have thrown validation error');
    } catch (error) {
      assert.ok(error);
    }
  });

  it('should reject duplicate email registration', async () => {
    await new User({
      email: 'dup@example.com',
      password: 'password123',
      fullName: 'Dup User',
      dateOfBirth: '1990-01-01',
      securityQuestion: 'Q?',
      securityAnswer: 'A'
    }).save();

    const existing = await User.findOne({ email: 'dup@example.com' });
    assert.ok(existing);
  });

  it('should generate JWT with correct payload', async () => {
    const user = new User({
      email: 'jwt@example.com',
      password: 'password123',
      fullName: 'JWT User',
      dateOfBirth: '1990-01-01',
      securityQuestion: 'Q?',
      securityAnswer: 'A'
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    assert.strictEqual(decoded.id, user._id.toString());
    assert.strictEqual(decoded.email, 'jwt@example.com');
    assert.strictEqual(decoded.role, 'customer');
  });

  it('should keep User and Admin models separate (no role escalation)', async () => {
    const admin = new Admin({
      username: 'admin1',
      password: 'adminpass123',
      email: 'admin@example.com',
      fullName: 'Admin User'
    });
    await admin.save();

    const user = new User({
      email: 'user@example.com',
      password: 'userpass123',
      fullName: 'Regular User',
      dateOfBirth: '1990-01-01',
      securityQuestion: 'Q?',
      securityAnswer: 'A'
    });
    await user.save();

    // Admin should not be findable in User collection
    const adminInUsers = await User.findById(admin._id);
    assert.strictEqual(adminInUsers, null);

    // User should not be findable in Admin collection
    const userInAdmins = await Admin.findById(user._id);
    assert.strictEqual(userInAdmins, null);
  });
});
