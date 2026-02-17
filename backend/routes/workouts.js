const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');

// Get all workouts for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const workouts = await Workout.find({ userId })
      .sort({ completedAt: -1 })
      .limit(20);
    
    res.json({ workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single workout by ID
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json(workout);
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new workout
router.post('/', async (req, res) => {
  try {
    const workout = new Workout(req.body);
    await workout.save();
    
    console.log('Workout created:', workout._id);
    res.status(201).json(workout);
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update workout (for logging progress during workout)
router.put('/:id', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json(workout);
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete workout with rating
router.post('/:id/complete', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { 
        rating, 
        comment,
        completedAt: new Date(),
        isCompleted: true
      },
      { new: true }
    );
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    console.log('Workout completed:', workout._id);
    res.json(workout);
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete workout
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json({ message: 'Workout deleted', id: req.params.id });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;