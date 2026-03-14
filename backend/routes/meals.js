// meals.js — log meals + calculate calories

const express = require('express')
const router = express.Router()
const MealLog = require('../models/MealLog')
const User = require('../models/User')

// ─────────────────────────────────────────
// POST /api/meals/log
// Save a new meal entry
// ─────────────────────────────────────────
router.post('/log', async (req, res) => {
  try {
    const { userId, date, mealName, foodDesc, calories, protein } = req.body

    const meal = new MealLog({
      userId,
      date,
      mealName,
      foodDesc,
      calories,
      protein: protein || 0
    })

    await meal.save()
    res.status(201).json({ success: true, meal })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ─────────────────────────────────────────
// GET /api/meals/:userId/today
// Get all meals today + total calories + remaining
// ─────────────────────────────────────────
router.get('/:userId/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Get all meals logged today
    const meals = await MealLog.find({
      userId: req.params.userId,
      date: today
    })

    // Add up all calories
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0)

    // Get user's calorie target
    const user = await User.findById(req.params.userId)
    const calorieTarget = user ? user.calorieTarget : 1800
    const remaining = calorieTarget - totalCalories

    res.json({
      success: true,
      meals,
      totalCalories,
      totalProtein,
      calorieTarget,
      remaining
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router