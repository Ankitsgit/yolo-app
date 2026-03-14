/**
 * DailyPlan.jsx — AI-generated daily meal plan display
 *
 * On mount: calls /api/plan/generate (returns cache or new plan).
 * Shows each meal with Log and Replace buttons.
 * Replace flow: ask for ingredients → call /api/meal/replace → refresh.
 *
 * Props:
 *   userId     {string}
 *   currentDay {number} — program day 1–14
 *   onMealLog  {function} — triggers MealLogger refresh after logging
 */

// import React, { useState, useEffect } from 'react'
// import { generatePlan, replaceMeal, logMeal } from '../services/api'

// const MEAL_EMOJIS = {
//   breakfast: '🌅',
//   lunch: '☀️',
//   dinner: '🌙',
//   snack: '🍎'
// }

// const DailyPlan = ({ userId, currentDay, onMealLog }) => {

//   const [plan, setPlan]         = useState(null)
//   const [loading, setLoading]   = useState(true)
//   const [error, setError]       = useState('')

//   // Which meal is showing replace input
//   const [replacing, setReplacing] = useState(null)  // 'breakfast'|null
//   const [ingredients, setIngredients] = useState('')
//   const [replaceLoading, setReplaceLoading] = useState(false)

//   // Which meal was just logged (to show tick briefly)
//   const [justLogged, setJustLogged] = useState(null)

//   useEffect(() => {
//     fetchPlan()
//   }, [userId, currentDay])

//   const fetchPlan = async () => {
//     try {
//       setLoading(true)
//       const data = await generatePlan(userId, currentDay)
//       setPlan(data.plan)
//     } catch (err) {
//       setError('Could not load meal plan. Try refreshing.')
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   /**
//    * handleReplace — replaces one meal using available ingredients
//    * On success: refetches the plan to show updated version
//    */
//   const handleReplace = async (mealType) => {
//     if (!ingredients.trim()) return
//     setReplaceLoading(true)
//     try {
//       await replaceMeal(userId, currentDay, mealType, ingredients)
//       setReplacing(null)
//       setIngredients('')
//       await fetchPlan()  // refresh to show replacement
//     } catch (err) {
//       setError('Could not generate replacement. Try again.')
//     } finally {
//       setReplaceLoading(false)
//     }
//   }

//   /**
//    * handleLogMeal — logs the planned meal directly from plan
//    * Pre-fills all meal details from the plan into meal logs
//    */
//   const handleLogMeal = async (mealType, mealData) => {
//     try {
//       const today = new Date().toISOString().split('T')[0]
//       await logMeal({
//         userId, date: today,
//         mealName: mealType.charAt(0).toUpperCase() + mealType.slice(1),
//         foodDesc: mealData.foods,
//         calories: mealData.calories,
//         protein: mealData.protein
//       })
//       setJustLogged(mealType)
//       setTimeout(() => setJustLogged(null), 2000)
//       if (onMealLog) onMealLog()
//     } catch (err) {
//       console.error('Could not log meal:', err)
//     }
//   }

//   if (loading) return (
//     <div className="card">
//       <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//         <div style={{
//           width: 20, height: 20, borderRadius: '50%',
//           border: '2px solid #1D9E75',
//           borderTopColor: 'transparent',
//           animation: 'spin 0.8s linear infinite'
//         }} />
//         <p style={{ fontSize: 14, color: '#666' }}>
//           Generating your Day {currentDay} meal plan...
//         </p>
//       </div>
//     </div>
//   )

//   if (error) return (
//     <div className="card">
//       <p style={{ color: '#E24B4A', fontSize: 13 }}>{error}</p>
//       <button className="btn btn-outline" onClick={fetchPlan} style={{ marginTop: 10 }}>
//         Try again
//       </button>
//     </div>
//   )

//   if (!plan) return null

//   const meals = plan.meals || {}

//   return (
//     <div className="card">

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//         <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
//           Today's plan
//         </h3>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           <span style={{ fontSize: 11, color: '#999' }}>
//             {plan.totalCalories} kcal · {plan.totalProtein}g protein
//           </span>
//           <span style={{
//             fontSize: 10, padding: '2px 8px', borderRadius: 10,
//             background: '#E1F5EE', color: '#085041', fontWeight: 500
//           }}>
//             Day {currentDay}
//           </span>
//         </div>
//       </div>

//       {/* Meal cards */}
//       {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
//         const meal = meals[mealType]
//         if (!meal) return null

//         return (
//           <div key={mealType} style={{
//             padding: '12px 0',
//             borderBottom: '1px solid #f0f0f0',
//           }}>

//             {/* Meal header */}
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <span style={{ fontSize: 16 }}>{MEAL_EMOJIS[mealType]}</span>
//                 <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
//                   {mealType}
//                 </span>
//                 {/* Show "replaced" badge if user swapped this meal */}
//                 {meal.isReplaced && (
//                   <span style={{
//                     fontSize: 10, padding: '1px 7px', borderRadius: 10,
//                     background: '#FAEEDA', color: '#633806', fontWeight: 500
//                   }}>
//                     replaced
//                   </span>
//                 )}
//               </div>
//               <div style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>
//                 <span style={{ fontWeight: 500 }}>{meal.calories} kcal</span>
//                 <span style={{ color: '#999', marginLeft: 6 }}>{meal.protein}g protein</span>
//               </div>
//             </div>

//             {/* Foods */}
//             <p style={{ fontSize: 13, color: '#444', marginBottom: 10, paddingLeft: 24 }}>
//               {meal.foods}
//             </p>

//             {/* Replace input (shown when replacing this meal) */}
//             {replacing === mealType && (
//               <div style={{ paddingLeft: 24, marginBottom: 8 }}>
//                 <input
//                   value={ingredients}
//                   onChange={e => setIngredients(e.target.value)}
//                   placeholder="What do you have? e.g. eggs, bread, milk, banana"
//                   autoFocus
//                   style={{ marginBottom: 8 }}
//                 />
//                 <div style={{ display: 'flex', gap: 8 }}>
//                   <button
//                     className="btn btn-primary"
//                     onClick={() => handleReplace(mealType)}
//                     disabled={replaceLoading}
//                     style={{ flex: 2, padding: '8px' }}
//                   >
//                     {replaceLoading ? 'Generating...' : 'Get replacement'}
//                   </button>
//                   <button
//                     className="btn btn-outline"
//                     onClick={() => { setReplacing(null); setIngredients('') }}
//                     style={{ flex: 1, padding: '8px' }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Action buttons */}
//             {replacing !== mealType && (
//               <div style={{ display: 'flex', gap: 8, paddingLeft: 24 }}>
//                 <button
//                   onClick={() => handleLogMeal(mealType, meal)}
//                   style={{
//                     fontSize: 12, padding: '5px 14px',
//                     borderRadius: 20, border: 'none',
//                     background: justLogged === mealType ? '#1D9E75' : '#E1F5EE',
//                     color: justLogged === mealType ? 'white' : '#085041',
//                     cursor: 'pointer', fontFamily: 'inherit',
//                     fontWeight: 500, transition: 'all 0.2s'
//                   }}
//                 >
//                   {justLogged === mealType ? '✓ Logged!' : '+ Log meal'}
//                 </button>
//                 <button
//                   onClick={() => { setReplacing(mealType); setIngredients('') }}
//                   style={{
//                     fontSize: 12, padding: '5px 14px',
//                     borderRadius: 20, border: '1px solid #e5e7eb',
//                     background: 'white', color: '#666',
//                     cursor: 'pointer', fontFamily: 'inherit',
//                     transition: 'all 0.15s'
//                   }}
//                 >
//                   ↻ Replace meal
//                 </button>
//               </div>
//             )}

//           </div>
//         )
//       })}

//     </div>
//   )
// }

// export default DailyPlan

/**
 * DailyPlan.jsx — AI-generated daily meal plan display
 */

import React, { useState, useEffect } from 'react'
import { generatePlan, replaceMeal, logMeal } from '../services/api'

const MEAL_EMOJIS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎'
}

const DailyPlan = ({ userId, currentDay, onMealLog }) => {

  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [replacing, setReplacing] = useState(null)
  const [ingredients, setIngredients] = useState('')
  const [replaceLoading, setReplaceLoading] = useState(false)

  const [justLogged, setJustLogged] = useState(null)

  useEffect(() => {
    fetchPlan()
    checkAndPrepareNextDay()
  }, [userId, currentDay])

  const fetchPlan = async () => {
    try {
      setLoading(true)

      const data = await generatePlan(userId, currentDay)

      setPlan(data.plan)

    } catch (err) {

      setError('Could not load meal plan. Try refreshing.')
      console.error(err)

    } finally {

      setLoading(false)

    }
  }

  /**
   * checkAndPrepareNextDay
   * Pre-generates tomorrow's plan after 8PM
   */

  const checkAndPrepareNextDay = async () => {

    const currentHour = new Date().getHours()
    const nextDay = currentDay + 1

    if (currentHour >= 20 && nextDay <= 14) {

      try {

        await generatePlan(userId, nextDay)

        console.log(`Pre-generated plan for Day ${nextDay}`)

      } catch {

        // Silent fail — background optimization only

      }

    }

  }

  /**
   * handleReplace — replace a meal using ingredients
   */

  const handleReplace = async (mealType) => {

    if (!ingredients.trim()) return

    setReplaceLoading(true)

    try {

      await replaceMeal(userId, currentDay, mealType, ingredients)

      setReplacing(null)
      setIngredients('')

      await fetchPlan()

    } catch (err) {

      setError('Could not generate replacement. Try again.')

    } finally {

      setReplaceLoading(false)

    }

  }

  /**
   * handleLogMeal
   */

  const handleLogMeal = async (mealType, mealData) => {

    try {

      const today = new Date().toISOString().split('T')[0]

      await logMeal({
        userId,
        date: today,
        mealName: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        foodDesc: mealData.foods,
        calories: mealData.calories,
        protein: mealData.protein
      })

      setJustLogged(mealType)

      setTimeout(() => setJustLogged(null), 2000)

      if (onMealLog) onMealLog()

    } catch (err) {

      console.error('Could not log meal:', err)

    }

  }

  if (loading) {
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '2px solid #1D9E75',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <p style={{ fontSize: 14, color: '#666' }}>
            Generating your Day {currentDay} meal plan...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <p style={{ color: '#E24B4A', fontSize: 13 }}>{error}</p>
        <button
          className="btn btn-outline"
          onClick={fetchPlan}
          style={{ marginTop: 10 }}
        >
          Try again
        </button>
      </div>
    )
  }

  if (!plan) return null

  const meals = plan.meals || {}

  return (
    <div className="card">

      {/* Header */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}
      >

        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#666'
          }}
        >
          Today's plan
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          <span style={{ fontSize: 11, color: '#999' }}>
            {plan.totalCalories} kcal · {plan.totalProtein}g protein
          </span>

          <span
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 10,
              background: '#E1F5EE',
              color: '#085041',
              fontWeight: 500
            }}
          >
            Day {currentDay}
          </span>

        </div>

      </div>

      {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {

        const meal = meals[mealType]

        if (!meal) return null

        return (

          <div
            key={mealType}
            style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0'
            }}
          >

            {/* Meal Header */}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

                <span>{MEAL_EMOJIS[mealType]}</span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                >
                  {mealType}
                </span>

                {meal.isReplaced && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: '1px 7px',
                      borderRadius: 10,
                      background: '#FAEEDA',
                      color: '#633806'
                    }}
                  >
                    replaced
                  </span>
                )}

              </div>

              <div style={{ fontSize: 12, color: '#666' }}>
                <strong>{meal.calories} kcal</strong>
                <span style={{ marginLeft: 6 }}>
                  {meal.protein}g protein
                </span>
              </div>

            </div>

            <p
              style={{
                fontSize: 13,
                color: '#444',
                marginBottom: 10,
                paddingLeft: 24
              }}
            >
              {meal.foods}
            </p>

            {replacing === mealType && (

              <div style={{ paddingLeft: 24 }}>

                <input
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  placeholder="What do you have? eggs, bread, milk..."
                />

                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>

                  <button
                    className="btn btn-primary"
                    onClick={() => handleReplace(mealType)}
                    disabled={replaceLoading}
                  >
                    {replaceLoading ? 'Generating...' : 'Get replacement'}
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setReplacing(null)
                      setIngredients('')
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </div>

            )}

            {replacing !== mealType && (

              <div style={{ display: 'flex', gap: 8, paddingLeft: 24 }}>

                <button
                  onClick={() => handleLogMeal(mealType, meal)}
                  style={{
                    fontSize: 12,
                    padding: '5px 14px',
                    borderRadius: 20,
                    border: 'none',
                    background:
                      justLogged === mealType ? '#1D9E75' : '#E1F5EE',
                    color:
                      justLogged === mealType ? 'white' : '#085041',
                    cursor: 'pointer'
                  }}
                >
                  {justLogged === mealType ? '✓ Logged!' : '+ Log meal'}
                </button>

                <button
                  onClick={() => {
                    setReplacing(mealType)
                    setIngredients('')
                  }}
                  style={{
                    fontSize: 12,
                    padding: '5px 14px',
                    borderRadius: 20,
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#666',
                    cursor: 'pointer'
                  }}
                >
                  ↻ Replace meal
                </button>

              </div>

            )}

          </div>

        )

      })}

    </div>
  )

}

export default DailyPlan