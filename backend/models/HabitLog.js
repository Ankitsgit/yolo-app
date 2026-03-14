// HabitLog.js — stores one day of habit check-ins per user

const mongoose = require('mongoose')

const habitLogSchema = new mongoose.Schema({

  // Which user does this belong to?
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // MongoDB ID format
    ref: 'User',                           // links to User model
    required: true
  },

  // Which date is this log for?
  date: {
    type: String,       // stored as "2025-03-14"
    required: true
  },

  // The 5 habits — each is true (done) or false (not done)
  habits: {
    meals:   { type: Boolean, default: false },
    water:   { type: Boolean, default: false },
    workout: { type: Boolean, default: false },
    steps:   { type: Boolean, default: false },
    sleep:   { type: Boolean, default: false }
  },

  // How many habits completed today (0-5)
  score: {
    type: Number,
    default: 0
  }

}, { timestamps: true })

// One user can only have ONE log per date
// This prevents saving duplicate logs for same day
habitLogSchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('HabitLog', habitLogSchema)