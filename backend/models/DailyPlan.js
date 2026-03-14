/**
 * DailyPlan.js — AI-generated meal plan per user per day
 *
 * Generated once per day via POST /api/plan/generate.
 * If plan already exists for that dayNumber, return cached version.
 * This avoids calling Groq API on every page load — saves quota.
 *
 * Each meal sub-document contains foods, calories, protein.
 */

const mongoose = require('mongoose')

// 🧠 LEARN: reusable sub-schema for each meal slot
// We define it once and use it 4 times (breakfast/lunch/dinner/snack)
const mealSlotSchema = new mongoose.Schema({
  foods: {
    type: String,    // "Oats + banana + milk + almonds"
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  // Optional: user replaced this with something else
  isReplaced: {
    type: Boolean,
    default: false
  }
}, { _id: false })  // 🧠 LEARN: _id: false = no _id for sub-documents

const dailyPlanSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Which day of the 14-day program (1–14)
  // 🧠 LEARN: not a date — the program day number
  // So Day 1 plan is always Day 1, regardless of when user started
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 14
  },

  meals: {
    breakfast: mealSlotSchema,
    lunch:     mealSlotSchema,
    dinner:    mealSlotSchema,
    snack:     mealSlotSchema
  },

  // Total macros for the day (sum of all meals)
  totalCalories: { type: Number },
  totalProtein:  { type: Number }

}, { timestamps: true })

/**
 * One plan per user per day — same compound index pattern
 * as HabitLog. Prevents duplicate plans for same day.
 */
dailyPlanSchema.index({ userId: 1, dayNumber: 1 }, { unique: true })

module.exports = mongoose.model('DailyPlan', dailyPlanSchema)