const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  weight: String,
  notes: String,
  completed: { type: Boolean, default: false }
});

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Push', 'Pull', 'Legs', 'Cardio', 'Core', 'Full Body'],
    default: 'Full Body'
  },
  exercises: [exerciseSchema],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  comment: String,
  duration: Number, // minutes
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workout', workoutSchema);