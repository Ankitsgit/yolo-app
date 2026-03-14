// users.js — handles user registration and profile

const express = require('express')
const router = express.Router()   // mini express app just for user routes
const User = require('../models/User')

// ─────────────────────────────────────────
// POST /api/users/register
// Creates a new user in the database
// ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    // req.body contains data sent from frontend
    const { name, email, calorieTarget, proteinTarget } = req.body

    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Create new user document
    const user = new User({
      name,
      email,
      calorieTarget: calorieTarget || 1800,
      proteinTarget: proteinTarget || 120
    })

    // Save to MongoDB
    await user.save()

    // Send back the created user
    res.status(201).json({
      success: true,
      user: user
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ─────────────────────────────────────────
// GET /api/users/:id
// Get a user's profile + calculate current day
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    // req.params.id is the :id from the URL
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Calculate which day of the 14-day program they're on
    const start = new Date(user.programStart)
    const today = new Date()
    const diffTime = today - start
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const currentDay = Math.min(diffDays + 1, 14)  // max day is 14

    res.json({
      success: true,
      user: user,
      currentDay: currentDay
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router