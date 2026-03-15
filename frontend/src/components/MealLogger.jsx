// /**
//  * MealLogger.jsx — Meal logging and daily nutrition summary
//  *
//  * Shows today's logged meals with calorie totals.
//  * Provides a form to add new meals.
//  * Displays remaining calories vs target prominently.
//  *
//  * Props:
//  *   userId    {string} — MongoDB user _id
//  *   onUpdate  {function} — refresh parent stats
//  */
import React, { useState, useEffect } from 'react'
import { getTodayMeals, logMeal, deleteMeal } from '../services/api'

// const MealLogger = ({ userId, onUpdate }) 
const MealLogger = ({ userId, onUpdate, date, readOnly = false })=> {

  const [meals, setMeals] = useState([])

  const [totals, setTotals] = useState({
    totalCalories: 0,
    remaining: 1800,
    calorieTarget: 1800
  })

  const [showForm, setShowForm] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [warning, setWarning] = useState('')
  const [error, setError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  const [newMeal, setNewMeal] = useState({
    mealName: 'Breakfast',
    foodDesc: '',
    calories: '',
    protein: ''
  })

  // const today = new Date().toISOString().split('T')[0]
  const targetDate = date || new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchMeals()
  }, [userId, targetDate])

  const fetchMeals = async () => {
    try {

      const data = await getTodayMeals(userId, targetDate)

      setMeals(data.meals)

      setTotals({
        totalCalories: data.totalCalories,
        remaining: data.remaining,
        calorieTarget: data.calorieTarget,
        totalProtein: data.totalProtein || 0,
        proteinRemaining: data.proteinRemaining || 0,
        proteinTarget: data.proteinTarget || 120
      })

    } catch (err) {
      console.error('Could not fetch meals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMeal = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError('')
    setWarning('')

    try {

      const data = await logMeal({
        userId,
        date: today,
        mealName: newMeal.mealName,
        foodDesc: newMeal.foodDesc,
        calories: Number(newMeal.calories),
        protein: Number(newMeal.protein) || 0
      })

      if (data.warnings && data.warnings.length > 0) {
        setWarning(data.warnings.join('. '))
      }

      setNewMeal({
        mealName: 'Breakfast',
        foodDesc: '',
        calories: '',
        protein: ''
      })

      setShowForm(false)

      await fetchMeals()

      if (onUpdate) onUpdate()

    } catch (err) {

      setError(err.message)

    } finally {

      setSaving(false)

    }
  }

  /**
   * handleDelete — removes a meal and refreshes totals
   */

  const handleDelete = async (mealId) => {

    setDeletingId(mealId)

    try {

      await deleteMeal(mealId)

      await fetchMeals()

      if (onUpdate) onUpdate()

    } catch (err) {

      console.error('Could not delete meal:', err)

    } finally {

      setDeletingId(null)

    }
  }

  const remainingColor =
    totals.remaining < 200
      ? '#E24B4A'
      : totals.remaining < 500
      ? '#EF9F27'
      : '#1D9E75'

  const isAtLimit = totals.remaining <= 0

  if (loading) {
    return (
      <div className="card">
        <p style={{ color: '#666', fontSize: 14 }}>Loading meals...</p>
      </div>
    )
  }

//   return (
//     <div className="card">
      

//       {/* Header */}

//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         marginBottom: '1rem'
//       }}>

//         <h3 style={{
//           fontSize: 14,
//           fontWeight: 600,
//           textTransform: 'uppercase',
//           color: '#666'
//         }}>
//           Today's meals
//         </h3>

//         <div style={{ textAlign: 'right' }}>
//           <div style={{ fontSize: 20, fontWeight: 600, color: remainingColor }}>
//             {totals.remaining} kcal
//           </div>
//           <div style={{ fontSize: 11, color: '#999' }}>
//             remaining
//           </div>
//         </div>

//       </div>

//       {/* Progress Bar */}

//       <div style={{ marginBottom: 16 }}>

//         <div style={{
//           height: 6,
//           background: '#f0f0f0',
//           borderRadius: 3,
//           overflow: 'hidden'
//         }}>

//           <div style={{
//             height: '100%',
//             width: `${Math.min((totals.totalCalories / totals.calorieTarget) * 100, 100)}%`,
//             background: remainingColor,
//             borderRadius: 3,
//             transition: 'width 0.4s ease'
//           }} />

//         </div>

//       </div>

//       {/* Warning */}

//       {warning && (
//         <div style={{
//           background: '#FAEEDA',
//           color: '#633806',
//           padding: '10px 14px',
//           borderRadius: 8,
//           fontSize: 13,
//           marginBottom: 12
//         }}>
//           ⚠️ {warning}
//         </div>
//       )}

//       {/* Error */}

//       {error && (
//         <div style={{
//           background: '#FCEBEB',
//           color: '#A32D2D',
//           padding: '10px 14px',
//           borderRadius: 8,
//           fontSize: 13,
//           marginBottom: 12
//         }}>
//           🚫 {error}
//         </div>
//       )}

//       {/* Meal List */}

//       {meals.length === 0 ? (

//         <p style={{ fontSize: 13, color: '#999' }}>
//           No meals logged yet today.
//         </p>

//       ) : (

//         meals.map(meal => (

//           <div
//             key={meal._id}
//             style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               padding: '8px 0',
//               borderBottom: '1px solid #f0f0f0',
//               opacity: deletingId === meal._id ? 0.4 : 1,
//               transition: 'opacity 0.2s'
//             }}
//           >

//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize: 13, fontWeight: 500 }}>
//                 {meal.mealName}
//               </div>

//               <div style={{ fontSize: 12, color: '#999' }}>
//                 {meal.foodDesc}
//               </div>
//             </div>

//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 10,
//               flexShrink: 0
//             }}>

//               <div style={{ textAlign: 'right' }}>
//                 <div style={{ fontSize: 13, fontWeight: 500 }}>
//                   {meal.calories} kcal
//                 </div>

//                 {meal.protein > 0 && (
//                   <div style={{ fontSize: 11, color: '#999' }}>
//                     {meal.protein}g protein
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={() => handleDelete(meal._id)}
//                 disabled={deletingId === meal._id}
//                 title="Remove this meal"
//                 style={{
//                   width: 28,
//                   height: 28,
//                   borderRadius: 8,
//                   border: '1px solid #fecaca',
//                   background: 'white',
//                   color: '#E24B4A',
//                   cursor: 'pointer',
//                   fontSize: 14,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//               >
//                 ×
//               </button>

//             </div>

//           </div>

//         ))

//       )}

//       {/* Limit Warning */}

//       {isAtLimit && !showForm && (
//         <div style={{
//           background: '#FCEBEB',
//           color: '#A32D2D',
//           padding: '10px 14px',
//           borderRadius: 8,
//           fontSize: 13,
//           marginTop: 12,
//           textAlign: 'center'
//         }}>
//           🚫 Daily calorie target reached ({totals.calorieTarget} kcal)
//         </div>
//       )}

//       {/* Add Meal Form */}

//       {showForm ? (

//         <form
//           onSubmit={handleAddMeal}
//           style={{
//             marginTop: 16,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 10
//           }}
//         >

//           <select
//             value={newMeal.mealName}
//             onChange={(e) =>
//               setNewMeal(p => ({ ...p, mealName: e.target.value }))
//             }
//           >
//             <option>Breakfast</option>
//             <option>Lunch</option>
//             <option>Dinner</option>
//             <option>Snack</option>
//             <option>Other</option>
//           </select>

//           <input
//             placeholder="What did you eat?"
//             value={newMeal.foodDesc}
//             onChange={(e) =>
//               setNewMeal(p => ({ ...p, foodDesc: e.target.value }))
//             }
//             required
//           />

//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: '1fr 1fr',
//             gap: 10
//           }}>

//             <input
//               type="number"
//               placeholder="Calories"
//               value={newMeal.calories}
//               onChange={(e) =>
//                 setNewMeal(p => ({ ...p, calories: e.target.value }))
//               }
//               required
//             />

//             <input
//               type="number"
//               placeholder="Protein (g)"
//               value={newMeal.protein}
//               onChange={(e) =>
//                 setNewMeal(p => ({ ...p, protein: e.target.value }))
//               }
//             />

//           </div>

//           <div style={{ display: 'flex', gap: 8 }}>

//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={saving}
//               style={{ flex: 1 }}
//             >
//               {saving ? 'Saving...' : 'Log meal'}
//             </button>

//             <button
//               type="button"
//               className="btn btn-outline"
//               onClick={() => setShowForm(false)}
//             >
//               Cancel
//             </button>

//           </div>

//         </form>

//       ) : (

//         !isAtLimit && (
//           <button
//             onClick={() => setShowForm(true)}
//             className="btn btn-outline"
//             style={{ width: '100%', marginTop: 12 }}
//           >
//             + Log a meal
//           </button>
//         )

//       )}

//     </div>
//   )
// }
return (
  <div className="card">

    {/* Read-only banner */}

    {readOnly && (
      <div style={{
        background: '#f3f4f6',
        borderRadius: 8,
        padding: '6px 12px',
        marginBottom: 12,
        fontSize: 12,
        color: '#888',
        textAlign: 'center'
      }}>
        📖 {date < new Date().toISOString().split('T')[0]
          ? 'Past meals — view only'
          : 'Future day — log meals when you get there'}
      </div>
    )}

    {/* Header */}

    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    }}>

      <h3 style={{
        fontSize: 14,
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#666'
      }}>
        Today's meals
      </h3>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: remainingColor }}>
          {totals.remaining} kcal
        </div>
        <div style={{ fontSize: 11, color: '#999' }}>
          remaining
        </div>
      </div>

    </div>

    {/* Progress Bar */}

    <div style={{ marginBottom: 16 }}>

      <div style={{
        height: 6,
        background: '#f0f0f0',
        borderRadius: 3,
        overflow: 'hidden'
      }}>

        <div style={{
          height: '100%',
          width: `${Math.min((totals.totalCalories / totals.calorieTarget) * 100, 100)}%`,
          background: remainingColor,
          borderRadius: 3,
          transition: 'width 0.4s ease'
        }} />

      </div>

    </div>

    {/* Warning */}

    {warning && (
      <div style={{
        background: '#FAEEDA',
        color: '#633806',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 12
      }}>
        ⚠️ {warning}
      </div>
    )}

    {/* Error */}

    {error && (
      <div style={{
        background: '#FCEBEB',
        color: '#A32D2D',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 12
      }}>
        🚫 {error}
      </div>
    )}

    {/* Meal List */}

    {meals.length === 0 ? (

      <p style={{ fontSize: 13, color: '#999' }}>
        No meals logged yet today.
      </p>

    ) : (

      meals.map(meal => (

        <div
          key={meal._id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0',
            opacity: deletingId === meal._id ? 0.4 : 1,
            transition: 'opacity 0.2s'
          }}
        >

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {meal.mealName}
            </div>

            <div style={{ fontSize: 12, color: '#999' }}>
              {meal.foodDesc}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0
          }}>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {meal.calories} kcal
              </div>

              {meal.protein > 0 && (
                <div style={{ fontSize: 11, color: '#999' }}>
                  {meal.protein}g protein
                </div>
              )}
            </div>

            {/* Delete button hidden in readOnly */}

            {!readOnly && (
              <button
                onClick={() => handleDelete(meal._id)}
                disabled={deletingId === meal._id}
                title="Remove this meal"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: '1px solid #fecaca',
                  background: 'white',
                  color: '#E24B4A',
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            )}

          </div>

        </div>

      ))

    )}

    {/* Limit Warning */}

    {isAtLimit && !showForm && (
      <div style={{
        background: '#FCEBEB',
        color: '#A32D2D',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 13,
        marginTop: 12,
        textAlign: 'center'
      }}>
        🚫 Daily calorie target reached ({totals.calorieTarget} kcal)
      </div>
    )}

    {/* Add Meal Form */}

    {showForm ? (

      <form
        onSubmit={handleAddMeal}
        style={{
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >

        <select
          value={newMeal.mealName}
          onChange={(e) =>
            setNewMeal(p => ({ ...p, mealName: e.target.value }))
          }
        >
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
          <option>Other</option>
        </select>

        <input
          placeholder="What did you eat?"
          value={newMeal.foodDesc}
          onChange={(e) =>
            setNewMeal(p => ({ ...p, foodDesc: e.target.value }))
          }
          required
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10
        }}>

          <input
            type="number"
            placeholder="Calories"
            value={newMeal.calories}
            onChange={(e) =>
              setNewMeal(p => ({ ...p, calories: e.target.value }))
            }
            required
          />

          <input
            type="number"
            placeholder="Protein (g)"
            value={newMeal.protein}
            onChange={(e) =>
              setNewMeal(p => ({ ...p, protein: e.target.value }))
            }
          />

        </div>

        <div style={{ display: 'flex', gap: 8 }}>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? 'Saving...' : 'Log meal'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>

        </div>

      </form>

    ) : (

      /* Log meal button only for today */

      !readOnly && !isAtLimit && (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-outline"
          style={{ width: '100%', marginTop: 12 }}
        >
          + Log a meal
        </button>
      )

    )}

  </div>
)
}
export default MealLogger