/**
 * api.js — Centralized API communication layer
 *
 * All fetch() calls to Express backend live here.
 * Components never write fetch() directly —
 * they import these clean functions instead.
 *
 * How BASE_URL works:
 * - Development: vite.config.js proxy handles /api → localhost:5000
 *   So BASE_URL is empty string '' and we just write /api/...
 * - Production: VITE_API_URL is set to Render backend URL on Vercel
 *
 * This means zero code changes needed between dev and production.
 */

// 🧠 LEARN: import.meta.env is Vite's way of reading .env variables
// It's like process.env in Node.js but for the browser side
// VITE_ prefix is mandatory — Vite strips other variables for security
const BASE_URL = import.meta.env.VITE_API_URL || ''

/**
 * request — Generic fetch wrapper used by all API functions
 *
 * Centralizes error handling so every function
 * doesn't repeat the same try/catch boilerplate.
 *
 * @param {string} endpoint - e.g. '/api/users/register'
 * @param {object} options  - fetch options (method, body etc.)
 * @returns {Promise<object>} parsed JSON response
 * @throws {Error} if response is not ok or network fails
 */
// 🧠 LEARN: async function can use await inside it
// await pauses execution until the Promise resolves
const request = async (endpoint, options = {}) => {
  try {

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        // Tell backend we're sending JSON format
        'Content-Type': 'application/json',
        // Spread any extra headers passed in
        ...options.headers
      },
      ...options
    })

    // 🧠 LEARN: response.json() reads the body and
    // converts JSON text into a JavaScript object
    const data = await response.json()

    // 🧠 LEARN: response.ok is true for 200-299 status codes
    // false for 400, 404, 500 etc.
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong')
    }

    return data

  } catch (error) {
    // Re-throw so calling component can show error to user
    throw error
  }
}


// ─────────────────────────────────────────────────────────────
// USER API CALLS
// ─────────────────────────────────────────────────────────────

/**
 * registerUser — POST /api/users/register
 * Creates new user document in MongoDB
 *
 * @param {object} userData
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {number} userData.calorieTarget
 * @param {number} userData.proteinTarget
 * @returns {object} { success, user: { _id, name, email, ... } }
 */
export const registerUser = (userData) =>
  request('/api/users/register', {
    method: 'POST',
    // 🧠 LEARN: JSON.stringify converts JS object to JSON text
    // { name: "Rahul" } → '{"name":"Rahul"}'
    body: JSON.stringify(userData)
  })


  /**
 * loginUser — POST /api/users/login
 * Finds existing user by email
 *
 * @param {string} email
 * @returns {object} { success, user, currentDay }
 */
// 🧠 LEARN: login just sends email, backend finds the user
// and sends back their full profile including _id
export const loginUser = (email) =>
  request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email })
  })

/**
 * getUser — GET /api/users/:id
 * Fetches profile + calculates current program day
 *
 * @param {string} userId - MongoDB _id
 * @returns {object} { success, user, currentDay }
 */
export const getUser = (userId) =>
  request(`/api/users/${userId}`)


// ─────────────────────────────────────────────────────────────
// HABIT API CALLS
// ─────────────────────────────────────────────────────────────

/**
 * logHabits — POST /api/habits/log
 * Saves or updates today's check-ins (upsert)
 *
 * @param {string} userId
 * @param {string} date   - "YYYY-MM-DD"
 * @param {object} habits - { meals, water, workout, steps, sleep }
 * @returns {object} { success, log }
 */
export const logHabits = (userId, date, habits) =>
  request('/api/habits/log', {
    method: 'POST',
    body: JSON.stringify({ userId, date, habits })
  })

/**
 * getTodayHabits — GET /api/habits/:userId/today
 * Returns today's completion status or all-false defaults
 *
 * @param {string} userId
 * @returns {object} { success, log: { habits, score } }
 */
export const getTodayHabits = (userId) =>
  request(`/api/habits/${userId}/today`)

/**
 * getStreak — GET /api/habits/:userId/streak
 * Calculates consecutive good days + consistency %
 *
 * @param {string} userId
 * @returns {object} { success, streak, consistency }
 */
export const getStreak = (userId) =>
  request(`/api/habits/${userId}/streak`)


// ─────────────────────────────────────────────────────────────
// MEAL API CALLS
// ─────────────────────────────────────────────────────────────

/**
 * logMeal — POST /api/meals/log
 * Saves a single meal entry to MongoDB
 *
 * @param {object} mealData
 * @param {string} mealData.userId
 * @param {string} mealData.date
 * @param {string} mealData.mealName  - 'Breakfast'|'Lunch'|'Dinner'|'Snack'
 * @param {string} mealData.foodDesc
 * @param {number} mealData.calories
 * @param {number} mealData.protein   - optional
 * @returns {object} { success, meal }
 */
export const logMeal = (mealData) =>
  request('/api/meals/log', {
    method: 'POST',
    body: JSON.stringify(mealData)
  })

/**
 * getTodayMeals — GET /api/meals/:userId/today
 * Aggregates all meals today with totals and remaining
 *
 * @param {string} userId
 * @returns {object} { success, meals, totalCalories, totalProtein, calorieTarget, remaining }
 */
export const getTodayMeals = (userId) =>
  request(`/api/meals/${userId}/today`)


// ─────────────────────────────────────────────────────────────
// AI API CALL
// ─────────────────────────────────────────────────────────────

/**
 * sendAIMessage — POST /api/ai/chat
 * Backend fetches user context from DB then calls Gemini.
 * AI response is personalized to user's actual daily data.
 *
 * @param {string} userId  - used by backend to fetch context
 * @param {string} message - user's question
 * @returns {object} { success, reply }
 */
export const sendAIMessage = (userId, message) =>
  request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ userId, message })
  })

  // ─────────────────────────────────────────────────────────────
// PLAN API CALLS
// ─────────────────────────────────────────────────────────────

/**
 * generatePlan — POST /api/plan/generate
 * Creates or retrieves cached meal plan for given day
 */
export const generatePlan = (userId, dayNumber) =>
  request('/api/plan/generate', {
    method: 'POST',
    body: JSON.stringify({ userId, dayNumber })
  })

/**
 * getPlan — GET /api/plan/:userId/:dayNumber
 * Gets existing plan with overrides merged in
 */
export const getPlan = (userId, dayNumber) =>
  request(`/api/plan/${userId}/${dayNumber}`)

/**
 * replaceMeal — POST /api/meal/replace
 * Swaps one meal with AI-generated alternative
 */
export const replaceMeal = (userId, dayNumber, mealType, availableIngredients) =>
  request('/api/meal/replace', {
    method: 'POST',
    body: JSON.stringify({ userId, dayNumber, mealType, availableIngredients })
  })

/**
 * deleteMeal — DELETE /api/meals/:mealId
 * Removes a meal log entry by its MongoDB _id
 */
export const deleteMeal = (mealId) =>
  request(`/api/meals/${mealId}`, { method: 'DELETE' })