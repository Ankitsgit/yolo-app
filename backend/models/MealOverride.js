/**
 * MealOverride.js — User-requested meal replacement
 *
 * When user clicks "Replace Meal", they provide available
 * ingredients. AI generates a replacement. This document
 * records what was replaced and what replaced it.
 *
 * The DailyPlan component checks for overrides and shows
 * the replacement instead of the original plan.
 */

const mongoose = require('mongoose')

const mealOverrideSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  dayNumber: {
    type: Number,
    required: true
  },

  // Which meal slot was replaced
  // 🧠 LEARN: enum keeps this clean — only 4 valid values
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },

  // What the user said they have available
  availableIngredients: {
    type: String,   // "eggs, bread, milk, banana"
    required: true
  },

  // The AI-generated replacement
  replacement: {
    foods:    { type: String },
    calories: { type: Number },
    protein:  { type: Number }
  }

}, { timestamps: true })

module.exports = mongoose.model('MealOverride', mealOverrideSchema)