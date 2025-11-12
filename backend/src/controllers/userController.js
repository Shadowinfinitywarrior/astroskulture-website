import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid user data', 
      error: error.message 
    });
  }
};

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // If this is the first address, set it as default
    const newAddress = {
      ...req.body,
      isDefault: user.addresses.length === 0
    };

    user.addresses.push(newAddress);
    await user.save();

    res.json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid address data', 
      error: error.message 
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const addressIndex = user.addresses.findIndex(addr => 
      addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Address not found' 
      });
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...req.body,
      _id: user.addresses[addressIndex]._id
    };

    await user.save();

    res.json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid address data', 
      error: error.message 
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Import models for cascading deletes
    const Wishlist = (await import('../models/Wishlist.js')).default;
    const Review = (await import('../models/Review.js')).default;
    
    // Delete user's wishlist items
    await Wishlist.deleteMany({ userId });
    
    // Delete user's reviews
    await Review.deleteMany({ userId });
    
    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};