/**
 * mealReplace.js — AI-powered meal replacement
 *
 * POST /api/meal/replace
 *   User provides available ingredients.
 *   AI generates a replacement matching original macros.
 *   Saves to MealOverride collection.
 */

const express = require('express')
const router = express.Router()
const MealOverride = require('../models/MealOverride')
const DailyPlan = require('../models/DailyPlan')
const User = require('../models/User')
const { generateMealReplacement } = require('../services/aiPlanner')

router.post('/replace', async (req, res) => {
  try {
    const { userId, dayNumber, mealType, availableIngredients } = req.body

    // Fetch original plan to get the meal being replaced
    // 🧠 LEARN: we need original calories/protein to match them
    const plan = await DailyPlan.findOne({ userId, dayNumber })
    if (!plan) {
      return res.status(404).json({ error: 'No plan found for this day. Generate plan first.' })
    }

    const originalMeal = plan.meals[mealType]
    if (!originalMeal) {
      return res.status(400).json({ error: `Invalid meal type: ${mealType}` })
    }

    const user = await User.findById(userId)

    // Generate replacement via AI
    const replacement = await generateMealReplacement(
      originalMeal,
      mealType,
      availableIngredients,
      user
    )

    /**
     * findOneAndUpdate with upsert:
     * If override already exists for this meal, update it.
     * If not, create it. Prevents duplicate overrides.
     */
    // 🧠 LEARN: same upsert pattern as HabitLog —
    // one override per user per day per meal type
    const override = await MealOverride.findOneAndUpdate(
      { userId, dayNumber, mealType },
      { availableIngredients, replacement },
      { upsert: true, new: true }
    )

    res.json({ success: true, override, replacement })

  } catch (error) {
    console.error('Meal replace error:', error.message)
    res.status(500).json({ error: 'Could not generate replacement', details: error.message })
  }
})

module.exports = router