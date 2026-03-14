// ai.js — connects to Gemini and sends personalized responses

const express = require('express')
const router = express.Router()
const HabitLog = require('../models/HabitLog')
const MealLog = require('../models/MealLog')
const User = require('../models/User')

// ─────────────────────────────────────────
// POST /api/ai/chat
// Send user's message to Gemini with full context
// ─────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { userId, message } = req.body
    const today = new Date().toISOString().split('T')[0]

    // Step 1: Fetch user's real data from database
    const user = await User.findById(userId)
    const todayHabits = await HabitLog.findOne({ userId, date: today })
    const todayMeals = await MealLog.find({ userId, date: today })

    // Step 2: Calculate their numbers
    const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0)
    const remaining = (user?.calorieTarget || 1800) - totalCalories
    const doneHabits = todayHabits
      ? Object.entries(todayHabits.habits)
          .filter(([k, v]) => v === true)
          .map(([k]) => k)
      : []

    // Step 3: Build context string — this is what makes AI personalized
    const context = `
      You are a friendly wellness coach for the YOLO 14-Day Reset program.
      Keep responses short (3-4 sentences max), practical and encouraging.

      User profile:
      - Name: ${user?.name || 'User'}
      - Calorie target: ${user?.calorieTarget || 1800} kcal
      - Protein target: ${user?.proteinTarget || 120}g

      Today's progress:
      - Habits completed: ${doneHabits.join(', ') || 'none yet'}
      - Calories consumed: ${totalCalories} kcal
      - Calories remaining: ${remaining} kcal
      - Meals logged: ${todayMeals.map(m => m.mealName).join(', ') || 'none'}
    `

    // Step 4: Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: context }]
          },
          contents: [{
            parts: [{ text: message }]
          }]
        })
      }
    )

    const data = await response.json()

    // Step 5: Extract the text from Gemini's response
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't respond right now. Try again!"

    res.json({ success: true, reply })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router