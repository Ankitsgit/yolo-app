// habits.js — log daily habits + calculate streaks

const express = require('express')
const router = express.Router()
const HabitLog = require('../models/HabitLog')

// ─────────────────────────────────────────
// POST /api/habits/log
// Save or update today's habit check-ins
// ─────────────────────────────────────────
router.post('/log', async (req, res) => {
  try {
    const { userId, date, habits } = req.body

    // Count how many habits were completed
    const score = Object.values(habits).filter(v => v === true).length

    // findOneAndUpdate = find this document, update it
    // If it doesn't exist yet, create it (upsert: true)
    const log = await HabitLog.findOneAndUpdate(
      { userId, date },           // find by userId AND date
      { habits, score },          // update these fields
      { upsert: true, new: true } // create if not found, return updated doc
    )

    res.json({ success: true, log })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ─────────────────────────────────────────
// GET /api/habits/:userId/today
// Get today's habit log for a user
// ─────────────────────────────────────────
router.get('/:userId/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]  // "2025-03-14"

    const log = await HabitLog.findOne({
      userId: req.params.userId,
      date: today
    })

    // If no log yet today, return all habits as false
    if (!log) {
      return res.json({
        success: true,
        log: {
          habits: { meals: false, water: false, workout: false, steps: false, sleep: false },
          score: 0
        }
      })
    }

    res.json({ success: true, log })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ─────────────────────────────────────────
// GET /api/habits/:userId/streak
// Calculate current streak + consistency %
// ─────────────────────────────────────────
router.get('/:userId/streak', async (req, res) => {
  try {
    // Get all logs for this user, sorted newest first
    const logs = await HabitLog.find({ userId: req.params.userId })
      .sort({ date: -1 })  // -1 = descending (newest first)

    // Calculate streak — consecutive days with score >= 3
    let streak = 0
    let checkDate = new Date()

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date)
      const diff = Math.floor((checkDate - logDate) / (1000 * 60 * 60 * 24))

      // If this log is from expected date AND score >= 3
      if (diff <= 1 && logs[i].score >= 3) {
        streak++
        checkDate = logDate  // move check window back one day
      } else {
        break  // streak broken
      }
    }

    // Calculate consistency % over last 14 days
    const last14 = logs.slice(0, 14)
    const goodDays = last14.filter(l => l.score >= 3).length
    const consistency = last14.length > 0
      ? Math.round((goodDays / last14.length) * 100)
      : 0

    res.json({ success: true, streak, consistency })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router