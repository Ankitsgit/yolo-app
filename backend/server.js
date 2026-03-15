
/**
 * server.js — YOLO Wellness App Backend Entry Point
 *
 * Initializes Express server, connects to MongoDB Atlas,
 * registers all API route handlers, and starts listening
 * for incoming requests on the configured port.
 *
 * Architecture: REST API serving JSON to React frontend.
 * All routes prefixed with /api/ for clear separation.
 */

const express = require('express')
require('dotenv').config()

/**
 * cors = Cross-Origin Resource Sharing
 * Without this, React at localhost:3000 cannot talk to
 * Express at localhost:5000 — browsers block it for security
 */
const cors = require('cors')

// Our custom DB connection function
const connectDB = require('./config/db')

// Route handlers — each file handles one feature area
const userRoutes = require('./routes/users')
const habitRoutes = require('./routes/habits')
const mealRoutes = require('./routes/meals')
const aiRoutes = require('./routes/ai')
const planRoutes = require('./routes/plan')
const mealReplaceRoutes = require('./routes/mealReplace')


// APP INITIALIZATION
const app = express()


const PORT = process.env.PORT || 5000



// MIDDLEWARE


/**
 * Middleware runs on EVERY request before it hits routes.
 * Think of it as security checks at a building entrance —
 * everyone goes through them regardless of where they're going.
 */
// app.use(cors())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://yolo-app-six.vercel.app/',    // ← paste your actual Vercel URL here
    /\.vercel\.app$/
  ],
  credentials: true
}))

/**
 * express.json() automatically parses incoming JSON bodies.
 * Without this, req.body would be undefined.
 * Frontend sends: { "habit": "workout", "done": true }
 * After this middleware, we can read: req.body.habit
 */
app.use(express.json())


// ─────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────

/**
 * app.use('/api/users', userRoutes) means:
 * Any request starting with /api/users gets handled
 * by the userRoutes file. The file then handles the rest.
 *
 * Example: POST /api/users/register
 * → hits this line → goes to routes/users.js → finds /register
 */
app.use('/api/users', userRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/meals', mealRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/plan', planRoutes)
app.use('/api/meal', mealReplaceRoutes)
/**
 * Health check route — useful to verify the server is alive.
 * Deployment platforms (Render) ping this to check status.
 */
app.get('/', (req, res) => {
  res.json({
    message: 'YOLO Wellness API is running',
    version: '1.0.0',
    status: 'healthy'
  })
})

// DATABASE CONNECTION + SERVER START


/**
 * We connect to MongoDB FIRST, then start the server.
 * This guarantees no API requests are handled before
 * the database is ready — prevents data loss errors.
 *
 * connectDB() is async, so we use .then() to chain actions.
 */
connectDB().then(() => {
  // Add this check right after require('dotenv').config()
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Check environment variables.')
    process.exit(1)
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is not set. Check environment variables.')
    process.exit(1)
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 API ready at http://localhost:${PORT}/api`)
  })
})