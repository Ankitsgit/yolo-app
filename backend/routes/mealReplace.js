const express = require('express')
const router = express.Router()
const MealOverride = require('../models/MealOverride')
const DailyPlan    = require('../models/DailyPlan')
const User         = require('../models/User')
const { generateMealReplacement } = require('../services/aiPlanner')

router.post('/replace', async (req, res) => {
  try {
    const { userId, dayNumber, mealType, availableIngredients } = req.body

    // Validate inputs
    if (!userId || !dayNumber || !mealType || !availableIngredients) {
      return res.status(400).json({
        error: 'Missing required fields: userId, dayNumber, mealType, availableIngredients'
      })
    }

    // 🧠 LEARN: .lean() for plain objects — easier to work with
    const plan = await DailyPlan
      .findOne({ userId, dayNumber: Number(dayNumber) })
      .lean()

    if (!plan) {
      return res.status(404).json({
        error: 'No plan found. Please generate your daily plan first.'
      })
    }

    const originalMeal = plan.meals[mealType]
    if (!originalMeal) {
      return res.status(400).json({ error: `Invalid meal type: ${mealType}` })
    }

    const user = await User.findById(userId).lean()

    console.log(`Generating replacement for ${mealType}:`, {
      original: originalMeal.foods,
      ingredients: availableIngredients
    })

    // Call Groq to generate replacement
    const replacement = await generateMealReplacement(
      originalMeal,
      mealType,
      availableIngredients,
      user
    )

    console.log('Replacement generated:', replacement)

    // Save override — upsert so re-replacing works
    // 🧠 LEARN: upsert = update if exists, create if not
    // So replacing the same meal twice works correctly
    const override = await MealOverride.findOneAndUpdate(
      { userId, dayNumber: Number(dayNumber), mealType },
      {
        availableIngredients,
        replacement: {
          foods:    replacement.foods,
          calories: replacement.calories,
          protein:  replacement.protein
        }
      },
      { upsert: true, new: true }
    )

    // Return the replacement directly — frontend doesn't need to re-fetch
    res.json({
      success: true,
      mealType,
      replacement: {
        foods:      replacement.foods,
        calories:   replacement.calories,
        protein:    replacement.protein,
        isReplaced: true,
        originalFoods: originalMeal.foods
      }
    })

  } catch (error) {
    console.error('Meal replace error:', error.message)
    res.status(500).json({
      error: 'Could not generate replacement meal',
      details: error.message
    })
  }
})

module.exports = router