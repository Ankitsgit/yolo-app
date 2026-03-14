// User.js — blueprint for every user in our database

const mongoose = require('mongoose')

// Define the shape of a user document
const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true      // cannot be empty
  },

  email: {
    type: String,
    required: true,
    unique: true        // no two users can have same email
  },

  // Their personalized targets (set during onboarding)
  calorieTarget: {
    type: Number,
    default: 1800       // if not provided, use 1800
  },

  proteinTarget: {
    type: Number,
    default: 120
  },

  programStart: {
    type: Date,
    default: Date.now   // automatically set to today
  },

  // We calculate currentDay from programStart
  // Day 1 = programStart, Day 2 = programStart + 1, etc.

}, { timestamps: true }) // automatically adds createdAt, updatedAt

// Export this model so other files can use it
module.exports = mongoose.model('User', userSchema)