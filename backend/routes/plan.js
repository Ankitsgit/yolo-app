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


router.post('/generate', async (req, res) => {
  try {
    const { userId, dayNumber } = req.body

    // Step 1: Check if plan already exists — return immediately if so
    // 🧠 LEARN: this is "cache-first" pattern — never call AI
    // if we already have the answer stored in database
    const existing = await DailyPlan.findOne({ userId, dayNumber }).lean()
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

router.get('/:userId/:dayNumber', async (req, res) => {
  try {
    const { userId, dayNumber } = req.params

    // 🧠 LEARN: .lean() returns plain JS object instead of
    // Mongoose document — much easier to modify and spread
    const plan = await DailyPlan
      .findOne({ userId, dayNumber: Number(dayNumber) })
      .lean()

    if (!plan) {
      return res.status(404).json({ error: 'Plan not generated yet' })
    }

    // Fetch overrides for this day
    const overrides = await MealOverride
      .find({ userId, dayNumber: Number(dayNumber) })
      .lean()

    // 🧠 LEARN: start with a copy of meals from DB
    // then overwrite specific meal slots where overrides exist
    const mergedMeals = { ...plan.meals }

    overrides.forEach(override => {
      // Replace the meal slot with AI-generated replacement
      mergedMeals[override.mealType] = {
        foods:    override.replacement.foods,
        calories: override.replacement.calories,
        protein:  override.replacement.protein,
        isReplaced: true,
        originalFoods: plan.meals[override.mealType]?.foods || ''
      }
    })

    res.json({
      success: true,
      plan: { ...plan, meals: mergedMeals }
    })

  } catch (error) {
    console.error('Get plan error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router