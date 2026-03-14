// MealLog.js — stores each meal a user logs

const mongoose = require('mongoose')

const mealLogSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  date: {
    type: String,       // "2025-03-14"
    required: true
  },

  mealName: {
    type: String,       // "Breakfast", "Lunch", "Dinner", "Snack"
    required: true
  },

  foodDesc: {
    type: String,       // "Rice + Dal + Salad"
    required: true
  },

  calories: {
    type: Number,
    required: true
  },

  protein: {
    type: Number,
    default: 0          // grams of protein
  }

}, { timestamps: true })

module.exports = mongoose.model('MealLog', mealLogSchema)