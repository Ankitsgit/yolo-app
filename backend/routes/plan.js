/**
 * plan.js — Daily meal plan generation and retrieval
 *
 * POST /api/plan/generate
 *   Checks if plan exists for today's day number.
 *   If yes: returns cached plan (saves Groq quota).
 *   If no: generates via AI, saves to MongoDB, returns it.
 *
 * GET /api/plan/:userId/:dayNumber
 *   Retrieves existing plan. Returns 404 if not generated yet.
 */

const express = require('express')
const router = express.Router()
const DailyPlan = require('../models/DailyPlan')
const MealOverride = require('../models/MealOverride')
const User = require('../models/User')
const { generateDayPlan } = require('../services/aiPlanner')

// ─────────────────────────────────────────────────────
// POST /api/plan/generate
// ─────────────────────────────────────────────────────

/**
 * Generate or retrieve today's meal plan.
 * Cache-first: if plan exists, skip AI call entirely.
 * This is important to preserve free tier quota.
 */
// router.post('/generate', async (req, res) => {
//   try {
//     const { userId, dayNumber } = req.body

//     // Step 1: Check cache first
//     // 🧠 LEARN: if we already generated today's plan, just return it
//     // No need to call Groq again — same result, wastes quota
//     const existing = await DailyPlan.findOne({ userId, dayNumber })
//     if (existing) {
//       return res.json({ success: true, plan: existing, cached: true })
//     }

//     // Step 2: Fetch user profile for AI context
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' })
//     }

//     // Step 3: Generate via AI
//     // 🧠 LEARN: this is the expensive operation — calling Groq API
//     // We only reach here if no cached plan exists
//     const generatedPlan = await generateDayPlan(user, dayNumber)

//     // Step 4: Save to MongoDB
//     const plan = new DailyPlan({
//       userId,
//       dayNumber,
//       meals: {
//         breakfast: generatedPlan.breakfast,
//         lunch:     generatedPlan.lunch,
//         dinner:    generatedPlan.dinner,
//         snack:     generatedPlan.snack
//       },
//       totalCalories: generatedPlan.totalCalories,
//       totalProtein:  generatedPlan.totalProtein
//     })

//     await plan.save()

//     res.status(201).json({ success: true, plan, cached: false })

//   } catch (error) {
//     console.error('Plan generation error:', error.message)
//     res.status(500).json({ error: 'Could not generate meal plan', details: error.message })
//   }
// })

router.post('/generate', async (req, res) => {
  try {
    const { userId, dayNumber } = req.body

    // Step 1: Check if plan already exists — return immediately if so
    // 🧠 LEARN: this is "cache-first" pattern — never call AI
    // if we already have the answer stored in database
    const existing = await DailyPlan.findOne({ userId, dayNumber })
    if (existing) {
      return res.json({ success: true, plan: existing, cached: true })
    }

    // Step 2: Fetch user for AI context
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Step 3: Generate via Groq
    const generatedPlan = await generateDayPlan(user, dayNumber)

    // Step 4: Use findOneAndUpdate with upsert instead of new + save
    // 🧠 LEARN: upsert = "update if exists, insert if not"
    // This atomically handles the race condition where two requests
    // try to create the same plan at the same time
    // { new: true } returns the document AFTER the update
    const plan = await DailyPlan.findOneAndUpdate(
      { userId, dayNumber },               // find by these fields
      {
        $setOnInsert: {                    // only set these on INSERT, not update
          userId,
          dayNumber,
          meals: {
            breakfast: generatedPlan.breakfast,
            lunch:     generatedPlan.lunch,
            dinner:    generatedPlan.dinner,
            snack:     generatedPlan.snack
          },
          totalCalories: generatedPlan.totalCalories,
          totalProtein:  generatedPlan.totalProtein
        }
      },
      {
        upsert: true,     // create if doesn't exist
        new: true,        // return the final document
        // 🧠 LEARN: setDefaultsOnInsert applies schema defaults
        // when creating a new document via upsert
        setDefaultsOnInsert: true
      }
    )

    res.status(201).json({ success: true, plan, cached: false })

  } catch (error) {
    console.error('Plan generation error:', error.message)

    // 🧠 LEARN: MongoDB duplicate key error code is 11000
    // If we somehow still hit it, just fetch and return existing
    if (error.code === 11000) {
      const existing = await DailyPlan.findOne({
        userId: req.body.userId,
        dayNumber: req.body.dayNumber
      })
      if (existing) {
        return res.json({ success: true, plan: existing, cached: true })
      }
    }

    res.status(500).json({ error: 'Could not generate meal plan', details: error.message })
  }
})
// ─────────────────────────────────────────────────────
// GET /api/plan/:userId/:dayNumber
// ─────────────────────────────────────────────────────

/**
 * Retrieve existing plan + any overrides.
 * Merges overrides into the plan before returning —
 * frontend always gets the final version to display.
 */
router.get('/:userId/:dayNumber', async (req, res) => {
  try {
    const { userId, dayNumber } = req.params

    const plan = await DailyPlan.findOne({ userId, dayNumber: Number(dayNumber) })

    if (!plan) {
      return res.status(404).json({ error: 'Plan not generated yet' })
    }

    // Fetch any meal overrides for this day
    // 🧠 LEARN: find() returns array — could be multiple overrides
    const overrides = await MealOverride.find({ userId, dayNumber: Number(dayNumber) })

    /**
     * Merge overrides into plan meals.
     * If user replaced lunch, show replacement instead of original.
     * We build a plain object copy so we can modify it safely.
     */
    const mergedMeals = { ...plan.meals.toObject() }

    overrides.forEach(override => {
      mergedMeals[override.mealType] = {
        ...mergedMeals[override.mealType],
        foods: override.replacement.foods,
        calories: override.replacement.calories,
        protein: override.replacement.protein,
        isReplaced: true,
        replacedWith: override.availableIngredients
      }
    })

    res.json({ success: true, plan: { ...plan.toObject(), meals: mergedMeals } })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router