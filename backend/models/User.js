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
    // ── ADD these fields after proteinTarget ──

    /**
     * Physical stats — used to auto-calculate calorie target
     * using Mifflin-St Jeor BMR formula during onboarding.
     * Optional fields — existing users won't have them (undefined).
     */
    age: {
    type: Number,
    min: 10, max: 100
    },

    gender: {
    type: String,
    enum: ['male', 'female', 'other']
    },

    heightCm: {
    type: Number,   // height in centimetres e.g. 172
    min: 100, max: 250
    },

    currentWeightKg: {
    type: Number,   // e.g. 78
    min: 30, max: 300
    },

    goalWeightKg: {
    type: Number,   // e.g. 70
    min: 30, max: 300
    },

    /**
     * activityLevel maps to BMR multiplier:
     * sedentary = 1.2, light = 1.375, moderate = 1.55, active = 1.725
     */
    activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active'],
    default: 'moderate'
    },


    // Mongoose rejects anything not in this list
    dietPreference: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan'],
    default: 'vegetarian'
    },

    /**
     * Stored as comma-separated string e.g. "dairy, gluten"
     * Simple approach — no need for array for MVP
     */
    allergies: {
    type: String,
    default: 'none'
    },

    primaryGoal: {
    type: String,
    enum: ['lose_weight', 'improve_energy', 'build_habits', 'maintain_weight'],
    default: 'lose_weight'
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