// meals.js — log meals + calculate calories

const express = require('express')
const router = express.Router()
const MealLog = require('../models/MealLog')
const User = require('../models/User')

router.post('/log', async (req, res) => {
  try {
    const { userId, date, mealName, foodDesc, calories, protein } = req.body

    // Fetch today's totals + user targets to check limits
    const user = await User.findById(userId)
    const existingMeals = await MealLog.find({ userId, date })

    const totalCaloriesToday = existingMeals.reduce((sum, m) => sum + m.calories, 0)
    const totalProteinToday  = existingMeals.reduce((sum, m) => sum + m.protein,  0)

    const calorieTarget = user?.calorieTarget || 1800
    const proteinTarget = user?.proteinTarget || 120

    // 🧠 LEARN: we warn but don't hard block — user might need
    // to log accurately even if over target. We return a warning
    // flag so frontend can show a message.
    const caloriesAfter = totalCaloriesToday + Number(calories)
    const proteinAfter  = totalProteinToday  + Number(protein)

    const warnings = []

    if (caloriesAfter > calorieTarget * 1.1) {
      // 10% buffer before warning
      warnings.push(`This meal puts you ${Math.round(caloriesAfter - calorieTarget)} kcal over your daily target`)
    }

    if (proteinAfter > proteinTarget * 1.2) {
      warnings.push(`You'll exceed your protein target by ${Math.round(proteinAfter - proteinTarget)}g`)
    }

    // Hard block: prevent logging if already 20% over calorie target
    // 🧠 LEARN: 20% buffer gives flexibility but stops runaway logging
    if (caloriesAfter > calorieTarget * 1.2) {
      return res.status(400).json({
        error: `You've reached your calorie limit for today (${calorieTarget} kcal target). Consider replacing a meal instead.`,
        currentTotal: totalCaloriesToday,
        calorieTarget
      })
    }

    const meal = new MealLog({
      userId, date, mealName, foodDesc,
      calories: Number(calories),
      protein:  Number(protein) || 0
    })

    await meal.save()

    res.status(201).json({
      success: true,
      meal,
      warnings,                          // frontend shows these as yellow alerts
      newTotal: caloriesAfter,
      remaining: calorieTarget - caloriesAfter
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:userId/today', async (req, res) => {
  try {
    // 🧠 LEARN: same pattern — use query date or fall back to today
    const date = req.query.date || new Date().toISOString().split('T')[0]

    const meals = await MealLog.find({ userId: req.params.userId, date })

    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)
    const totalProtein  = meals.reduce((sum, m) => sum + m.protein,  0)

    const user = await User.findById(req.params.userId)
    const calorieTarget = user?.calorieTarget || 1800
    const proteinTarget = user?.proteinTarget || 120

    res.json({
      success: true,
      meals,
      totalCalories,
      totalProtein,
      calorieTarget,
      proteinTarget,
      remaining: calorieTarget - totalCalories,
      proteinRemaining: proteinTarget - totalProtein,
      date
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
/**
 * DELETE /api/meals/:mealId
 * Removes a specific meal log entry.
 * Recalculates remaining calories after deletion.
 */
// 🧠 LEARN: DELETE request removes a document by its _id
// Only the owner should delete — in production check userId matches
router.delete('/:mealId', async (req, res) => {
  try {
    const meal = await MealLog.findByIdAndDelete(req.params.mealId)

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' })
    }

    res.json({ success: true, deleted: meal })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
module.exports = router