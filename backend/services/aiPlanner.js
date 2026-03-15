/**
 * aiPlanner.js — Groq prompt templates for meal planning
 *
 * Separating AI prompt logic into a service keeps routes clean.
 * Routes handle HTTP, services handle business logic.
 * This file contains two functions:
 * - generateDayPlan(): creates full day meal plan
 * - generateMealReplacement(): swaps one meal with available ingredients
 */

const Groq = require('groq-sdk')

// 🧠 LEARN: we initialize Groq once here and export functions
// that use it — avoids creating multiple clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

/**
 * generateDayPlan — creates a full day meal plan for a user
 *
 * @param {object} user       — full user document from MongoDB
 * @param {number} dayNumber  — current program day (1–14)
 * @returns {object}          — { breakfast, lunch, dinner, snack }
 */
const generateDayPlan = async (user, dayNumber) => {

  /**
   * The prompt structure is critical here.
   * We ask for strict JSON output so we can parse it
   * reliably without regex or guesswork.
   * Groq/Llama is very good at following JSON instructions.
   */
  // 🧠 LEARN: we tell the AI exactly what JSON shape to return
  // This is called "structured output" — much more reliable
  // than asking for plain text and trying to parse it
  const prompt = `You are a certified nutritionist creating a meal plan for a ${user.dietPreference} person.

User profile:
- Age: ${user.age || 25}, Gender: ${user.gender || 'not specified'}
- Current weight: ${user.currentWeightKg || 70}kg, Goal weight: ${user.goalWeightKg || 65}kg
- Daily calorie target: ${user.calorieTarget} kcal
- Daily protein target: ${user.proteinTarget}g
- Activity level: ${user.activityLevel || 'moderate'}
- Diet preference: ${user.dietPreference || 'vegetarian'}
- Allergies/avoid: ${user.allergies || 'none'}
- Primary goal: ${user.primaryGoal || 'lose_weight'}
- Program day: ${dayNumber} of 14

Create a realistic, practical meal plan for Day ${dayNumber}.
Use common Indian foods where possible (dal, roti, sabzi, rice, idli, poha, paneer etc.)
Distribute calories as: breakfast 25%, lunch 35%, dinner 30%, snack 10%

IMPORTANT: Return ONLY valid JSON. No explanation, no markdown, no backticks.
Exactly this structure:

{
  "breakfast": { "foods": "food description here", "calories": 450, "protein": 30 },
  "lunch":     { "foods": "food description here", "calories": 630, "protein": 42 },
  "dinner":    { "foods": "food description here", "calories": 540, "protein": 40 },
  "snack":     { "foods": "food description here", "calories": 180, "protein": 13 }
}`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,    // slightly lower = more consistent JSON
    max_tokens: 500,
  })

  const rawText = completion.choices[0]?.message?.content || ''

  // 🧠 LEARN: JSON.parse converts JSON text into a JS object
  // If AI returns invalid JSON this will throw — we catch it in the route
  // We strip any accidental markdown backticks just in case
  const cleaned = rawText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  const plan = JSON.parse(cleaned)

  // Calculate totals for easy display
  const totalCalories = plan.breakfast.calories + plan.lunch.calories +
                        plan.dinner.calories + plan.snack.calories
  const totalProtein  = plan.breakfast.protein + plan.lunch.protein +
                        plan.dinner.protein + plan.snack.protein

  return { ...plan, totalCalories, totalProtein }
}


/**
 * generateMealReplacement — swaps one meal using available ingredients
 *
 * @param {object} originalMeal      — { foods, calories, protein }
 * @param {string} mealType          — 'breakfast' | 'lunch' etc.
 * @param {string} availableIngredients — "eggs, bread, milk"
 * @param {object} user              — for diet preference context
 * @returns {object}                 — { foods, calories, protein }
 */
// const generateMealReplacement = async (originalMeal, mealType, availableIngredients, user) => {

//   const prompt = `You are a nutritionist helping replace a meal using only available ingredients.

// Original ${mealType}:
// - Foods: ${originalMeal.foods}
// - Calories: ${originalMeal.calories} kcal
// - Protein: ${originalMeal.protein}g

// Available ingredients: ${availableIngredients}
// Diet preference: ${user.dietPreference || 'vegetarian'}
// Allergies: ${user.allergies || 'none'}

// Create a replacement meal using ONLY the available ingredients listed.
// Try to match calories within ±100 kcal and protein within ±10g of the original.

// IMPORTANT: Return ONLY valid JSON. No explanation, no markdown, no backticks.
// Exactly this structure:

// {
//   "foods": "description of meal using available ingredients",
//   "calories": 450,
//   "protein": 28
// }`

//   const completion = await groq.chat.completions.create({
//     model: 'llama-3.3-70b-versatile',
//     messages: [{ role: 'user', content: prompt }],
//     temperature: 0.5,
//     max_tokens: 200,
//   })

//   const rawText = completion.choices[0]?.message?.content || ''
//   const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()

//   return JSON.parse(cleaned)
// }

/**
 * generateMealReplacement — creates a meal using only available ingredients
 *
 * Key improvement: more explicit JSON instructions and
 * validation that returned calories/protein are numbers not strings.
 */
const generateMealReplacement = async (originalMeal, mealType, availableIngredients, user) => {

  const prompt = `You are a nutritionist. Create a ${mealType} meal using ONLY these ingredients: ${availableIngredients}

Requirements:
- Diet type: ${user?.dietPreference || 'vegetarian'}
- Target calories: ${originalMeal.calories} kcal (stay within ±150 kcal)
- Target protein: ${originalMeal.protein}g (stay within ±15g)
- Use only the listed ingredients, nothing else
- Be specific about quantities (e.g. "2 eggs scrambled + 2 slices toast + 1 glass milk")

Original meal for reference: ${originalMeal.foods}

YOU MUST respond with ONLY this exact JSON format, no other text:
{"foods":"meal description here","calories":450,"protein":28}

The calories and protein MUST be plain numbers (no units, no strings).`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    // 🧠 LEARN: lower temperature = more predictable JSON output
    // higher temperature = more creative but riskier for parsing
    temperature: 0.3,
    max_tokens: 150,
  })

  const rawText = completion.choices[0]?.message?.content?.trim() || ''
  console.log('Groq raw replacement response:', rawText)

  // Clean up response — remove any markdown the model added
  // 🧠 LEARN: regex replace handles cases where model wraps
  // response in ```json ... ``` despite being told not to
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .replace(/^[^{]*({.*})[^}]*$/s, '$1')  // extract just the JSON object
    .trim()

  console.log('Cleaned replacement:', cleaned)

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (parseError) {
    console.error('JSON parse failed:', parseError.message, 'Raw:', cleaned)
    // 🧠 LEARN: fallback — if AI returns bad JSON, return a
    // reasonable default so app doesn't crash
    return {
      foods: `${availableIngredients} — prepared simply`,
      calories: originalMeal.calories,
      protein: originalMeal.protein
    }
  }

  // Ensure numbers are actually numbers not strings
  // 🧠 LEARN: Number() converts "450" to 450
  // || originalMeal.calories is fallback if conversion fails
  return {
    foods:    parsed.foods    || `Meal using ${availableIngredients}`,
    calories: Number(parsed.calories) || originalMeal.calories,
    protein:  Number(parsed.protein)  || originalMeal.protein
  }
}
// 🧠 LEARN: export both functions so routes can import them
module.exports = { generateDayPlan, generateMealReplacement }