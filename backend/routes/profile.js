const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const user = await User.findById(userObjectId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow password or email updates through this route
    delete updates.password;
    delete updates.email;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findByIdAndUpdate(
      userObjectId,
      { 
        ...updates,
        lastActive: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Profile updated for:', user.username);
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update avatar
router.put('/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: 'Avatar required' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findByIdAndUpdate(
      userObjectId,
      { avatar },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Avatar updated for:', user.username);
    res.json(user);
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const Workout = require('../models/Workout');
    const Post = require('../models/Post');
    const Nutrition = require('../models/Nutrition');

    // Count workouts
    const workoutCount = await Workout.countDocuments({ 
      userId: userObjectId,
      isCompleted: true 
    });

    // Count posts
    const postCount = await Post.countDocuments({ userId: userObjectId });

    // Count days with nutrition logged
    const nutritionDays = await Nutrition.countDocuments({ userId: userObjectId });

    // Get most recent workout
    const lastWorkout = await Workout.findOne({ 
      userId: userObjectId,
      isCompleted: true 
    }).sort({ completedAt: -1 });

    // Calculate days active (days since joined)
    const user = await User.findById(userObjectId);
    const daysActive = user ? Math.floor((Date.now() - user.joinedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    res.json({
      workoutCount,
      postCount,
      nutritionDays,
      daysActive,
      lastWorkoutDate: lastWorkout?.completedAt || null
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;