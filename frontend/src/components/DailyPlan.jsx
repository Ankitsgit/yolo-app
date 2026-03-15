import React, { useState, useEffect } from 'react'
import { generatePlan, replaceMeal, logMeal } from '../services/api'

const MEAL_EMOJIS = {
  breakfast: '🌅',
  lunch:     '☀️',
  dinner:    '🌙',
  snack:     '🍎'
}

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']

const DailyPlan = ({ userId, currentDay, onMealLog, readOnly = false }) => {

  const [plan, setPlan]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // Which meal slot is open for replacement input
  const [replacing, setReplacing]   = useState(null)
  const [ingredients, setIngredients] = useState('')
  const [replaceLoading, setReplaceLoading] = useState(false)
  const [replaceError, setReplaceError]     = useState('')

  // Which meal was just logged — shows tick for 2 seconds
  const [justLogged, setJustLogged] = useState(null)

  useEffect(() => {
    fetchPlan()
    checkAndPrepareNextDay()
  }, [userId, currentDay])

  const fetchPlan = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await generatePlan(userId, currentDay)
      setPlan(data.plan)
    } catch (err) {
      setError('Could not load meal plan. Try refreshing.')
      console.error('Fetch plan error:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkAndPrepareNextDay = async () => {
    const currentHour = new Date().getHours()
    const nextDay = currentDay + 1
    if (currentHour >= 20 && nextDay <= 14) {
      try {
        const { generatePlan: gen } = await import('../services/api')
        await gen(userId, nextDay)
      } catch { /* silent */ }
    }
  }

  /**
   * handleReplace — the fixed replace flow
   *
   * 1. Call backend to generate + save replacement
   * 2. Backend returns replacement data directly
   * 3. Update local plan state immediately — no re-fetch needed
   * 4. User sees new meal instantly
   */
  const handleReplace = async (mealType) => {
    if (!ingredients.trim()) {
      setReplaceError('Please enter what ingredients you have')
      return
    }

    setReplaceLoading(true)
    setReplaceError('')

    try {
      // API call — backend calls Groq and saves to MealOverride
      const data = await replaceMeal(
        userId,
        currentDay,
        mealType,
        ingredients.trim()
      )

      console.log('Replacement received:', data)

      // 🧠 LEARN: update just the one meal slot in local state
      // ...plan spreads existing plan fields
      // meals: { ...plan.meals } spreads all meal slots
      // [mealType]: data.replacement overwrites just this one slot
      setPlan(prev => ({
        ...prev,
        meals: {
          ...prev.meals,
          [mealType]: {
            ...data.replacement,
            isReplaced: true,
            originalFoods: prev.meals[mealType]?.foods || ''
          }
        }
      }))

      // Close the replace input
      setReplacing(null)
      setIngredients('')

    } catch (err) {
      console.error('Replace error:', err)
      setReplaceError(err.message || 'Could not generate replacement. Try again.')
    } finally {
      setReplaceLoading(false)
    }
  }

  /**
   * handleLogMeal — logs the planned meal directly
   * Pre-fills all details from the plan into meal logs
   */
  const handleLogMeal = async (mealType, mealData) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await logMeal({
        userId, date: today,
        mealName: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        foodDesc: mealData.foods,
        calories: mealData.calories,
        protein:  mealData.protein
      })
      setJustLogged(mealType)
      setTimeout(() => setJustLogged(null), 2000)
      if (onMealLog) onMealLog()
    } catch (err) {
      console.error('Log meal error:', err)
    }
  }

  // ── LOADING STATE ──
  if (loading) return (
    <div className="card" style={{ minHeight: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          border: '2px solid #1D9E75', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite', flexShrink: 0
        }} />
        <p style={{ fontSize: 13, color: '#666' }}>
          Generating Day {currentDay} meal plan...
        </p>
      </div>
      {/* Skeleton placeholders */}
      {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(m => (
        <div key={m} style={{
          height: 56, borderRadius: 8, background: '#f3f4f6',
          marginBottom: 8, animation: 'pulse 1.5s ease infinite'
        }} />
      ))}
    </div>
  )

  // ── ERROR STATE ──
  if (error) return (
    <div className="card">
      <p style={{ color: '#E24B4A', fontSize: 13, marginBottom: 10 }}>{error}</p>
      <button className="btn btn-outline" onClick={fetchPlan}>Try again</button>
    </div>
  )

  if (!plan) return null

  const meals = plan.meals || {}

  return (
    <div className="card">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
          Today's plan
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#999' }}>
            {plan.totalCalories} kcal · {plan.totalProtein}g protein
          </span>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 10,
            background: readOnly ? '#F1EFE8' : '#E1F5EE',
            color: readOnly ? '#444441' : '#085041', fontWeight: 500
          }}>
            Day {currentDay}
          </span>
        </div>
      </div>

      {/* Read-only banner */}
      {readOnly && (
        <div style={{
          background: '#f9fafb', borderRadius: 8, padding: '8px 12px',
          marginBottom: 12, fontSize: 12, color: '#888', textAlign: 'center'
        }}>
          📖 View only mode
        </div>
      )}

      {/* Meal list */}
      {MEAL_ORDER.map(mealType => {
        const meal = meals[mealType]
        if (!meal) return null
        const isThisReplacing = replacing === mealType

        return (
          <div key={mealType} style={{
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}>

            {/* Meal header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{MEAL_EMOJIS[mealType]}</span>
                <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                  {mealType}
                </span>
                {/* Replaced badge */}
                {meal.isReplaced && (
                  <span style={{
                    fontSize: 10, padding: '1px 7px', borderRadius: 10,
                    background: '#FAEEDA', color: '#633806', fontWeight: 500
                  }}>
                    replaced ✓
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#555', textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontWeight: 500 }}>{meal.calories} kcal</span>
                <span style={{ color: '#999', marginLeft: 6 }}>{meal.protein}g protein</span>
              </div>
            </div>

            {/* Original meal crossed out if replaced */}
            {meal.isReplaced && meal.originalFoods && (
              <p style={{
                fontSize: 11, color: '#bbb', paddingLeft: 24,
                textDecoration: 'line-through', marginBottom: 2
              }}>
                {meal.originalFoods}
              </p>
            )}

            {/* Meal foods */}
            <p style={{
              fontSize: 13, color: meal.isReplaced ? '#1D9E75' : '#444',
              marginBottom: 10, paddingLeft: 24,
              fontWeight: meal.isReplaced ? 500 : 400
            }}>
              {meal.foods}
            </p>

            {/* Replace input — shown when this meal is being replaced */}
            {isThisReplacing && (
              <div style={{ paddingLeft: 24, marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                  What ingredients do you have available?
                </p>
                <input
                  value={ingredients}
                  onChange={e => {
                    setIngredients(e.target.value)
                    setReplaceError('')
                  }}
                  placeholder="e.g. eggs, bread, milk, banana, oats"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleReplace(mealType)}
                  style={{ marginBottom: 8 }}
                />
                {/* Replace error */}
                {replaceError && (
                  <p style={{
                    fontSize: 12, color: '#E24B4A',
                    marginBottom: 8, display: 'flex', gap: 4
                  }}>
                    ⚠️ {replaceError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleReplace(mealType)}
                    disabled={replaceLoading}
                    style={{ flex: 2, padding: '8px 12px', fontSize: 13 }}
                  >
                    {replaceLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <span style={{
                          width: 12, height: 12, borderRadius: '50%',
                          border: '2px solid white', borderTopColor: 'transparent',
                          animation: 'spin 0.8s linear infinite', display: 'inline-block'
                        }} />
                        Generating...
                      </span>
                    ) : '✨ Get replacement'}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setReplacing(null)
                      setIngredients('')
                      setReplaceError('')
                    }}
                    style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons — only show when not replacing and not read-only */}
            {!isThisReplacing && !readOnly && (
              <div style={{ display: 'flex', gap: 8, paddingLeft: 24 }}>
                {/* Log meal button */}
                <button
                  onClick={() => handleLogMeal(mealType, meal)}
                  style={{
                    fontSize: 12, padding: '5px 14px', borderRadius: 20,
                    border: 'none', fontFamily: 'inherit', fontWeight: 500,
                    background: justLogged === mealType ? '#1D9E75' : '#E1F5EE',
                    color:      justLogged === mealType ? 'white'    : '#085041',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {justLogged === mealType ? '✓ Logged!' : '+ Log meal'}
                </button>

                {/* Replace meal button */}
                <button
                  onClick={() => {
                    setReplacing(mealType)
                    setIngredients('')
                    setReplaceError('')
                  }}
                  style={{
                    fontSize: 12, padding: '5px 14px', borderRadius: 20,
                    border: '1px solid #e5e7eb', background: 'white',
                    color: '#666', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#EF9F27'
                    e.currentTarget.style.color = '#633806'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.color = '#666'
                  }}
                >
                  ↻ Replace meal
                </button>
              </div>
            )}

            {/* Read-only label */}
            {readOnly && (
              <p style={{ fontSize: 11, color: '#bbb', paddingLeft: 24, fontStyle: 'italic' }}>
                View only
              </p>
            )}

          </div>
        )
      })}

      {/* Add skeleton pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

    </div>
  )
}

export default DailyPlan