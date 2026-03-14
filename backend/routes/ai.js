/**
 * ai.js — AI nutrition assistant using Groq (Llama 3.3)
 *
 * Groq provides free API access to Llama 3.3-70b model.
 * Before calling Groq, fetches user's real data from MongoDB
 * so every response is personalized — not generic advice.
 *
 * Flow: receive message → fetch user context from DB
 *       → build system prompt → call Groq → return reply
 */

const express = require('express')
const router = express.Router()
const Groq = require('groq-sdk')
const HabitLog = require('../models/HabitLog')
const MealLog = require('../models/MealLog')
const User = require('../models/User')

// 🧠 LEARN: initialize Groq client with API key from .env
// This creates a reusable connection to Groq's servers
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

// ─────────────────────────────────────────────────────────────
// POST /api/ai/chat
// ─────────────────────────────────────────────────────────────

/**
 * Receives user message + userId.
 * Fetches their real daily data from MongoDB.
 * Sends everything to Groq Llama 3.3 with rich context.
 * Returns personalized nutrition/wellness response.
 */
router.post('/chat', async (req, res) => {
  try {
    const { userId, message } = req.body

    // 🧠 LEARN: get today's date as "YYYY-MM-DD" string
    const today = new Date().toISOString().split('T')[0]

    // ── Step 1: Fetch all user data from MongoDB in parallel ──
    // 🧠 LEARN: Promise.all runs all 3 DB queries at the same time
    // instead of one after another — 3x faster
    const [user, todayHabits, todayMeals] = await Promise.all([
      User.findById(userId),
      HabitLog.findOne({ userId, date: today }),
      MealLog.find({ userId, date: today })
    ])

    // ── Step 2: Calculate their numbers ──

    // Add up all calories eaten today
    // 🧠 LEARN: reduce() loops through array and accumulates a value
    // sum starts at 0, adds each meal's calories one by one
    const totalCalories = todayMeals.reduce(
      (sum, meal) => sum + meal.calories, 0
    )

    const totalProtein = todayMeals.reduce(
      (sum, meal) => sum + meal.protein, 0
    )

    const calorieTarget = user?.calorieTarget || 1800
    const remaining = calorieTarget - totalCalories

    // Get list of completed habit names e.g. ["meals", "water"]
    // 🧠 LEARN: Object.entries turns { meals: true, water: false }
    // into [["meals", true], ["water", false]]
    // then we filter for true ones and extract just the names
    const completedHabits = todayHabits
      ? Object.entries(todayHabits.habits)
          .filter(([key, value]) => value === true)
          .map(([key]) => key)
      : []

    const missedHabits = todayHabits
      ? Object.entries(todayHabits.habits)
          .filter(([key, value]) => value === false)
          .map(([key]) => key)
      : ['meals', 'water', 'workout', 'steps', 'sleep']

    // Calculate what day of the program they're on
    const programStart = new Date(user?.programStart || Date.now())
    const diffDays = Math.floor((new Date() - programStart) / (1000 * 60 * 60 * 24))
    const currentDay = Math.min(diffDays + 1, 14)

    // ── Step 3: Build personalized system prompt ──

    /**
     * The system prompt is what makes AI responses personal.
     * Instead of generic "eat healthy" advice, the AI knows:
     * - Exactly who this user is
     * - What they ate today
     * - Which habits they did and missed
     * - How many calories they have left
     * This context is injected into every single request.
     */
    // 🧠 LEARN: template literals (backticks) let us embed
    // variables directly inside strings using ${variable}
    const systemPrompt = `You are a friendly, knowledgeable wellness coach for the YOLO 14-Day Reset program. 
You speak in a warm, encouraging tone — like a supportive friend who knows nutrition.
Keep ALL responses to 3-4 sentences maximum. Be specific and practical, not generic.
Never say "consult a doctor" unless it's a medical emergency.

Current user profile:
- Name: ${user?.name || 'Friend'}
- Goal: ${user?.primaryGoal || 'lose_weight'} 
- Diet: ${user?.dietPreference || 'vegetarian'} 
- Program day: ${currentDay} of 14
- Daily calorie target: ${calorieTarget} kcal
- Daily protein target: ${user?.proteinTarget || 120}g

Today's progress:
- Habits completed: ${completedHabits.length > 0 ? completedHabits.join(', ') : 'none yet'}
- Habits still pending: ${missedHabits.join(', ')}
- Calories consumed: ${totalCalories} kcal
- Protein consumed: ${totalProtein}g
- Protein remaining: ${(user?.proteinTarget || 120) - totalProtein}g 
- Calories remaining: ${remaining} kcal
- Meals logged today: ${todayMeals.length > 0 ? todayMeals.map(m => `${m.mealName} (${m.calories} kcal)`).join(', ') : 'none yet'}

Rules:
- Always reference their actual numbers (remaining calories, habits done etc.)
- Suggest Indian foods when relevant (dal, roti, sabzi, idli, poha etc.)
- If they ask for motivation, be energetic and specific about their progress
- If remaining calories are low (under 300), suggest light options only`

    // ── Step 4: Call Groq API ──

    /**
     * Groq uses OpenAI-compatible format:
     * - system: the instructions/context (not shown to user)
     * - user: the actual message from the user
     * model: llama-3.3-70b is Groq's best free model
     */
    // 🧠 LEARN: this is the actual API call that costs money
    // (but Groq's free tier gives 14,400 requests/day)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,    // 🧠 LEARN: 0 = predictable, 1 = creative
      max_tokens: 300,     // keeps responses short and snappy
    })

    // ── Step 5: Extract reply text ──

    // 🧠 LEARN: optional chaining (?.) safely accesses nested
    // properties — if any level is undefined, returns undefined
    // instead of throwing an error
    const reply = completion.choices[0]?.message?.content
      || "Sorry, I couldn't respond right now. Please try again!"

    res.json({ success: true, reply })

  } catch (error) {
    /**
     * Log full error in server terminal for debugging.
     * Send clean message to frontend — no raw errors exposed.
     */
    console.error('Groq API error:', error.message)
    res.status(500).json({
      error: 'AI assistant is unavailable. Please try again.',
      details: error.message
    })
  }
})

module.exports = router