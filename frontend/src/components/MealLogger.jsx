// // /**
// //  * MealLogger.jsx — Meal logging and daily nutrition summary
// //  *
// //  * Shows today's logged meals with calorie totals.
// //  * Provides a form to add new meals.
// //  * Displays remaining calories vs target prominently.
// //  *
// //  * Props:
// //  *   userId    {string} — MongoDB user _id
// //  *   onUpdate  {function} — refresh parent stats
// //  */
// import React, { useState, useEffect } from 'react'
// import { getTodayMeals, logMeal, deleteMeal } from '../services/api'

// // const MealLogger = ({ userId, onUpdate }) 
// const MealLogger = ({ userId, onUpdate, date, readOnly = false })=> {

//   const [meals, setMeals] = useState([])

//   const [totals, setTotals] = useState({
//     totalCalories: 0,
//     remaining: 1800,
//     calorieTarget: 1800
//   })

//   const [showForm, setShowForm] = useState(false)

//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)

//   const [warning, setWarning] = useState('')
//   const [error, setError] = useState('')

//   const [deletingId, setDeletingId] = useState(null)

//   const [newMeal, setNewMeal] = useState({
//     mealName: 'Breakfast',
//     foodDesc: '',
//     calories: '',
//     protein: ''
//   })

//   // const today = new Date().toISOString().split('T')[0]
//   const targetDate = date || new Date().toISOString().split('T')[0]

//   useEffect(() => {
//     fetchMeals()
//   }, [userId, targetDate])

//   const fetchMeals = async () => {
//     try {

//       const data = await getTodayMeals(userId, targetDate)

//       setMeals(data.meals)

//       setTotals({
//         totalCalories: data.totalCalories,
//         remaining: data.remaining,
//         calorieTarget: data.calorieTarget,
//         totalProtein: data.totalProtein || 0,
//         proteinRemaining: data.proteinRemaining || 0,
//         proteinTarget: data.proteinTarget || 120
//       })

//     } catch (err) {
//       console.error('Could not fetch meals:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAddMeal = async (e) => {
//     e.preventDefault()

//     setSaving(true)
//     setError('')
//     setWarning('')

//     try {

//       const data = await logMeal({
//         userId,
//         date: today,
//         mealName: newMeal.mealName,
//         foodDesc: newMeal.foodDesc,
//         calories: Number(newMeal.calories),
//         protein: Number(newMeal.protein) || 0
//       })

//       if (data.warnings && data.warnings.length > 0) {
//         setWarning(data.warnings.join('. '))
//       }

//       setNewMeal({
//         mealName: 'Breakfast',
//         foodDesc: '',
//         calories: '',
//         protein: ''
//       })

//       setShowForm(false)

//       await fetchMeals()

//       if (onUpdate) onUpdate()

//     } catch (err) {

//       setError(err.message)

//     } finally {

//       setSaving(false)

//     }
//   }

//   /**
//    * handleDelete — removes a meal and refreshes totals
//    */

//   const handleDelete = async (mealId) => {

//     setDeletingId(mealId)

//     try {

//       await deleteMeal(mealId)

//       await fetchMeals()

//       if (onUpdate) onUpdate()

//     } catch (err) {

//       console.error('Could not delete meal:', err)

//     } finally {

//       setDeletingId(null)

//     }
//   }

//   const remainingColor =
//     totals.remaining < 200
//       ? '#E24B4A'
//       : totals.remaining < 500
//       ? '#EF9F27'
//       : '#1D9E75'

//   const isAtLimit = totals.remaining <= 0

//   if (loading) {
//     return (
//       <div className="card">
//         <p style={{ color: '#666', fontSize: 14 }}>Loading meals...</p>
//       </div>
//     )
//   }

// //   return (
// //     <div className="card">
      

// //       {/* Header */}

// //       <div style={{
// //         display: 'flex',
// //         justifyContent: 'space-between',
// //         marginBottom: '1rem'
// //       }}>

// //         <h3 style={{
// //           fontSize: 14,
// //           fontWeight: 600,
// //           textTransform: 'uppercase',
// //           color: '#666'
// //         }}>
// //           Today's meals
// //         </h3>

// //         <div style={{ textAlign: 'right' }}>
// //           <div style={{ fontSize: 20, fontWeight: 600, color: remainingColor }}>
// //             {totals.remaining} kcal
// //           </div>
// //           <div style={{ fontSize: 11, color: '#999' }}>
// //             remaining
// //           </div>
// //         </div>

// //       </div>

// //       {/* Progress Bar */}

// //       <div style={{ marginBottom: 16 }}>

// //         <div style={{
// //           height: 6,
// //           background: '#f0f0f0',
// //           borderRadius: 3,
// //           overflow: 'hidden'
// //         }}>

// //           <div style={{
// //             height: '100%',
// //             width: `${Math.min((totals.totalCalories / totals.calorieTarget) * 100, 100)}%`,
// //             background: remainingColor,
// //             borderRadius: 3,
// //             transition: 'width 0.4s ease'
// //           }} />

// //         </div>

// //       </div>

// //       {/* Warning */}

// //       {warning && (
// //         <div style={{
// //           background: '#FAEEDA',
// //           color: '#633806',
// //           padding: '10px 14px',
// //           borderRadius: 8,
// //           fontSize: 13,
// //           marginBottom: 12
// //         }}>
// //           ⚠️ {warning}
// //         </div>
// //       )}

// //       {/* Error */}

// //       {error && (
// //         <div style={{
// //           background: '#FCEBEB',
// //           color: '#A32D2D',
// //           padding: '10px 14px',
// //           borderRadius: 8,
// //           fontSize: 13,
// //           marginBottom: 12
// //         }}>
// //           🚫 {error}
// //         </div>
// //       )}

// //       {/* Meal List */}

// //       {meals.length === 0 ? (

// //         <p style={{ fontSize: 13, color: '#999' }}>
// //           No meals logged yet today.
// //         </p>

// //       ) : (

// //         meals.map(meal => (

// //           <div
// //             key={meal._id}
// //             style={{
// //               display: 'flex',
// //               justifyContent: 'space-between',
// //               alignItems: 'center',
// //               padding: '8px 0',
// //               borderBottom: '1px solid #f0f0f0',
// //               opacity: deletingId === meal._id ? 0.4 : 1,
// //               transition: 'opacity 0.2s'
// //             }}
// //           >

// //             <div style={{ flex: 1 }}>
// //               <div style={{ fontSize: 13, fontWeight: 500 }}>
// //                 {meal.mealName}
// //               </div>

// //               <div style={{ fontSize: 12, color: '#999' }}>
// //                 {meal.foodDesc}
// //               </div>
// //             </div>

// //             <div style={{
// //               display: 'flex',
// //               alignItems: 'center',
// //               gap: 10,
// //               flexShrink: 0
// //             }}>

// //               <div style={{ textAlign: 'right' }}>
// //                 <div style={{ fontSize: 13, fontWeight: 500 }}>
// //                   {meal.calories} kcal
// //                 </div>

// //                 {meal.protein > 0 && (
// //                   <div style={{ fontSize: 11, color: '#999' }}>
// //                     {meal.protein}g protein
// //                   </div>
// //                 )}
// //               </div>

// //               <button
// //                 onClick={() => handleDelete(meal._id)}
// //                 disabled={deletingId === meal._id}
// //                 title="Remove this meal"
// //                 style={{
// //                   width: 28,
// //                   height: 28,
// //                   borderRadius: 8,
// //                   border: '1px solid #fecaca',
// //                   background: 'white',
// //                   color: '#E24B4A',
// //                   cursor: 'pointer',
// //                   fontSize: 14,
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center'
// //                 }}
// //               >
// //                 ×
// //               </button>

// //             </div>

// //           </div>

// //         ))

// //       )}

// //       {/* Limit Warning */}

// //       {isAtLimit && !showForm && (
// //         <div style={{
// //           background: '#FCEBEB',
// //           color: '#A32D2D',
// //           padding: '10px 14px',
// //           borderRadius: 8,
// //           fontSize: 13,
// //           marginTop: 12,
// //           textAlign: 'center'
// //         }}>
// //           🚫 Daily calorie target reached ({totals.calorieTarget} kcal)
// //         </div>
// //       )}

// //       {/* Add Meal Form */}

// //       {showForm ? (

// //         <form
// //           onSubmit={handleAddMeal}
// //           style={{
// //             marginTop: 16,
// //             display: 'flex',
// //             flexDirection: 'column',
// //             gap: 10
// //           }}
// //         >

// //           <select
// //             value={newMeal.mealName}
// //             onChange={(e) =>
// //               setNewMeal(p => ({ ...p, mealName: e.target.value }))
// //             }
// //           >
// //             <option>Breakfast</option>
// //             <option>Lunch</option>
// //             <option>Dinner</option>
// //             <option>Snack</option>
// //             <option>Other</option>
// //           </select>

// //           <input
// //             placeholder="What did you eat?"
// //             value={newMeal.foodDesc}
// //             onChange={(e) =>
// //               setNewMeal(p => ({ ...p, foodDesc: e.target.value }))
// //             }
// //             required
// //           />

// //           <div style={{
// //             display: 'grid',
// //             gridTemplateColumns: '1fr 1fr',
// //             gap: 10
// //           }}>

// //             <input
// //               type="number"
// //               placeholder="Calories"
// //               value={newMeal.calories}
// //               onChange={(e) =>
// //                 setNewMeal(p => ({ ...p, calories: e.target.value }))
// //               }
// //               required
// //             />

// //             <input
// //               type="number"
// //               placeholder="Protein (g)"
// //               value={newMeal.protein}
// //               onChange={(e) =>
// //                 setNewMeal(p => ({ ...p, protein: e.target.value }))
// //               }
// //             />

// //           </div>

// //           <div style={{ display: 'flex', gap: 8 }}>

// //             <button
// //               type="submit"
// //               className="btn btn-primary"
// //               disabled={saving}
// //               style={{ flex: 1 }}
// //             >
// //               {saving ? 'Saving...' : 'Log meal'}
// //             </button>

// //             <button
// //               type="button"
// //               className="btn btn-outline"
// //               onClick={() => setShowForm(false)}
// //             >
// //               Cancel
// //             </button>

// //           </div>

// //         </form>

// //       ) : (

// //         !isAtLimit && (
// //           <button
// //             onClick={() => setShowForm(true)}
// //             className="btn btn-outline"
// //             style={{ width: '100%', marginTop: 12 }}
// //           >
// //             + Log a meal
// //           </button>
// //         )

// //       )}

// //     </div>
// //   )
// // }
// return (
//   <div className="card">

//     {/* Read-only banner */}

//     {readOnly && (
//       <div style={{
//         background: '#f3f4f6',
//         borderRadius: 8,
//         padding: '6px 12px',
//         marginBottom: 12,
//         fontSize: 12,
//         color: '#888',
//         textAlign: 'center'
//       }}>
//         📖 {date < new Date().toISOString().split('T')[0]
//           ? 'Past meals — view only'
//           : 'Future day — log meals when you get there'}
//       </div>
//     )}

//     {/* Header */}

//     <div style={{
//       display: 'flex',
//       justifyContent: 'space-between',
//       marginBottom: '1rem'
//     }}>

//       <h3 style={{
//         fontSize: 14,
//         fontWeight: 600,
//         textTransform: 'uppercase',
//         color: '#666'
//       }}>
//         Today's meals
//       </h3>

//       <div style={{ textAlign: 'right' }}>
//         <div style={{ fontSize: 20, fontWeight: 600, color: remainingColor }}>
//           {totals.remaining} kcal
//         </div>
//         <div style={{ fontSize: 11, color: '#999' }}>
//           remaining
//         </div>
//       </div>

//     </div>

//     {/* Progress Bar */}

//     <div style={{ marginBottom: 16 }}>

//       <div style={{
//         height: 6,
//         background: '#f0f0f0',
//         borderRadius: 3,
//         overflow: 'hidden'
//       }}>

//         <div style={{
//           height: '100%',
//           width: `${Math.min((totals.totalCalories / totals.calorieTarget) * 100, 100)}%`,
//           background: remainingColor,
//           borderRadius: 3,
//           transition: 'width 0.4s ease'
//         }} />

//       </div>

//     </div>

//     {/* Warning */}

//     {warning && (
//       <div style={{
//         background: '#FAEEDA',
//         color: '#633806',
//         padding: '10px 14px',
//         borderRadius: 8,
//         fontSize: 13,
//         marginBottom: 12
//       }}>
//         ⚠️ {warning}
//       </div>
//     )}

//     {/* Error */}

//     {error && (
//       <div style={{
//         background: '#FCEBEB',
//         color: '#A32D2D',
//         padding: '10px 14px',
//         borderRadius: 8,
//         fontSize: 13,
//         marginBottom: 12
//       }}>
//         🚫 {error}
//       </div>
//     )}

//     {/* Meal List */}

//     {meals.length === 0 ? (

//       <p style={{ fontSize: 13, color: '#999' }}>
//         No meals logged yet today.
//       </p>

//     ) : (

//       meals.map(meal => (

//         <div
//           key={meal._id}
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             padding: '8px 0',
//             borderBottom: '1px solid #f0f0f0',
//             opacity: deletingId === meal._id ? 0.4 : 1,
//             transition: 'opacity 0.2s'
//           }}
//         >

//           <div style={{ flex: 1 }}>
//             <div style={{ fontSize: 13, fontWeight: 500 }}>
//               {meal.mealName}
//             </div>

//             <div style={{ fontSize: 12, color: '#999' }}>
//               {meal.foodDesc}
//             </div>
//           </div>

//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 10,
//             flexShrink: 0
//           }}>

//             <div style={{ textAlign: 'right' }}>
//               <div style={{ fontSize: 13, fontWeight: 500 }}>
//                 {meal.calories} kcal
//               </div>

//               {meal.protein > 0 && (
//                 <div style={{ fontSize: 11, color: '#999' }}>
//                   {meal.protein}g protein
//                 </div>
//               )}
//             </div>

//             {/* Delete button hidden in readOnly */}

//             {!readOnly && (
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
//             )}

//           </div>

//         </div>

//       ))

//     )}

//     {/* Limit Warning */}

//     {isAtLimit && !showForm && (
//       <div style={{
//         background: '#FCEBEB',
//         color: '#A32D2D',
//         padding: '10px 14px',
//         borderRadius: 8,
//         fontSize: 13,
//         marginTop: 12,
//         textAlign: 'center'
//       }}>
//         🚫 Daily calorie target reached ({totals.calorieTarget} kcal)
//       </div>
//     )}

//     {/* Add Meal Form */}

//     {showForm ? (

//       <form
//         onSubmit={handleAddMeal}
//         style={{
//           marginTop: 16,
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 10
//         }}
//       >

//         <select
//           value={newMeal.mealName}
//           onChange={(e) =>
//             setNewMeal(p => ({ ...p, mealName: e.target.value }))
//           }
//         >
//           <option>Breakfast</option>
//           <option>Lunch</option>
//           <option>Dinner</option>
//           <option>Snack</option>
//           <option>Other</option>
//         </select>

//         <input
//           placeholder="What did you eat?"
//           value={newMeal.foodDesc}
//           onChange={(e) =>
//             setNewMeal(p => ({ ...p, foodDesc: e.target.value }))
//           }
//           required
//         />

//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: 10
//         }}>

//           <input
//             type="number"
//             placeholder="Calories"
//             value={newMeal.calories}
//             onChange={(e) =>
//               setNewMeal(p => ({ ...p, calories: e.target.value }))
//             }
//             required
//           />

//           <input
//             type="number"
//             placeholder="Protein (g)"
//             value={newMeal.protein}
//             onChange={(e) =>
//               setNewMeal(p => ({ ...p, protein: e.target.value }))
//             }
//           />

//         </div>

//         <div style={{ display: 'flex', gap: 8 }}>

//           <button
//             type="submit"
//             className="btn btn-primary"
//             disabled={saving}
//             style={{ flex: 1 }}
//           >
//             {saving ? 'Saving...' : 'Log meal'}
//           </button>

//           <button
//             type="button"
//             className="btn btn-outline"
//             onClick={() => setShowForm(false)}
//           >
//             Cancel
//           </button>

//         </div>

//       </form>

//     ) : (

//       /* Log meal button only for today */

//       !readOnly && !isAtLimit && (
//         <button
//           onClick={() => setShowForm(true)}
//           className="btn btn-outline"
//           style={{ width: '100%', marginTop: 12 }}
//         >
//           + Log a meal
//         </button>
//       )

//     )}

//   </div>
// )
// }
// export default MealLogger


/**
 * MealLogger.jsx — Redesigned meal logging panel
 * Same API logic. New visual treatment with calorie ring.
 */

import React, { useState, useEffect } from 'react'
import { getTodayMeals, logMeal, deleteMeal } from '../services/api'

const T = {
  green: '#4CAF50', greenDark: '#388E3C', greenLight: '#E8F5E9',
  greenMid: '#81C784', orange: '#FF7043', orangeLight: '#FFF3E0',
  text: '#1A1A2E', textMid: '#4A4A6A', textLight: '#8888AA',
  white: '#FFFFFF', border: '#E8EDE8', bg: '#F4F6F3',
  red: '#EF4444', redLight: '#FFEBEE',
  amber: '#F59E0B', amberLight: '#FFFBEB',
  blue: '#6366F1',
}

// Circular calorie ring SVG
const CalorieRing = ({ consumed, target }) => {
  const pct     = Math.min(consumed / target, 1)
  const radius  = 28
  const circ    = 2 * Math.PI * radius
  const offset  = circ * (1 - pct)
  const color   = pct > 1 ? T.red : pct > 0.85 ? T.amber : T.green

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx="36" cy="36" r={radius} fill="none" stroke={T.bg} strokeWidth="7" />
      <circle
        cx="36" cy="36" r={radius} fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.3s' }}
      />
      <text
        x="36" y="36"
        textAnchor="middle" dominantBaseline="middle"
        style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}
        fontSize="11" fontWeight="800" fill={color} fontFamily="inherit"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}

const MealLogger = ({ userId, onUpdate, date, readOnly = false }) => {
  const [meals, setMeals]     = useState([])
  const [totals, setTotals]   = useState({ totalCalories: 0, remaining: 1800, calorieTarget: 1800, totalProtein: 0, proteinRemaining: 120, proteinTarget: 120 })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError]     = useState('')
  const [warning, setWarning] = useState('')

  const [newMeal, setNewMeal] = useState({ mealName: 'Breakfast', foodDesc: '', calories: '', protein: '' })

  const targetDate = date || new Date().toISOString().split('T')[0]

  const fetchMeals = async () => {
    try {
      const data = await getTodayMeals(userId, targetDate)
      setMeals(data.meals)
      setTotals({
        totalCalories:  data.totalCalories,
        remaining:      data.remaining,
        calorieTarget:  data.calorieTarget,
        totalProtein:   data.totalProtein   || 0,
        proteinRemaining: data.proteinRemaining || 0,
        proteinTarget:  data.proteinTarget  || 120,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMeals() }, [userId, targetDate])

  const handleAddMeal = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setWarning('')
    try {
      const data = await logMeal({
        userId, date: targetDate,
        mealName: newMeal.mealName,
        foodDesc: newMeal.foodDesc,
        calories: Number(newMeal.calories),
        protein:  Number(newMeal.protein) || 0,
      })
      if (data.warnings?.length) setWarning(data.warnings.join('. '))
      setNewMeal({ mealName: 'Breakfast', foodDesc: '', calories: '', protein: '' })
      setShowForm(false)
      await fetchMeals()
      if (onUpdate) onUpdate()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteMeal(id)
      await fetchMeals()
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const isAtLimit = totals.remaining <= 0
  const remainingColor = totals.remaining < 0 ? T.red : totals.remaining < 300 ? T.amber : T.green

  if (loading) return (
    <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: '22px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 48, borderRadius: 10, background: T.bg, marginBottom: 8, animation: 'shimmer 1.5s ease infinite' }} />
      ))}
    </div>
  )

  return (
    <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: '22px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

      {/* Header with calorie ring */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.9px', display: 'block', marginBottom: 8 }}>
            Today's Meals
          </span>
          <div style={{ fontSize: 28, fontWeight: 800, color: remainingColor, letterSpacing: '-0.5px', lineHeight: 1 }}>
            {totals.remaining > 0 ? totals.remaining : Math.abs(totals.remaining)}
            <span style={{ fontSize: 13, fontWeight: 600, color: T.textLight, marginLeft: 4 }}>
              kcal {totals.remaining > 0 ? 'left' : 'over'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.textLight, fontWeight: 500, marginTop: 3 }}>
            {totals.totalProtein}g / {totals.proteinTarget}g protein
          </div>
        </div>
        <CalorieRing consumed={totals.totalCalories} target={totals.calorieTarget} />
      </div>

      {/* Calorie bar */}
      <div style={{ height: 6, background: T.bg, borderRadius: 3, overflow: 'hidden', marginBottom: 6, border: `1px solid ${T.border}` }}>
        <div style={{
          height: '100%',
          width: `${Math.min((totals.totalCalories / totals.calorieTarget) * 100, 100)}%`,
          background: isAtLimit
            ? `linear-gradient(90deg, ${T.red}, #FF7070)`
            : `linear-gradient(90deg, ${T.green}, ${T.greenMid})`,
          borderRadius: 3,
          transition: 'width 0.5s ease, background 0.3s',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: T.textLight, fontWeight: 500 }}>{totals.totalCalories} consumed</span>
        <span style={{ fontSize: 11, color: T.textLight, fontWeight: 500 }}>target: {totals.calorieTarget}</span>
      </div>

      {/* Alerts */}
      {warning && (
        <div style={{ background: T.amberLight, color: '#92400E', padding: '9px 12px', borderRadius: 10, fontSize: 12, marginBottom: 10, display: 'flex', gap: 6 }}>
          ⚠️ {warning}
        </div>
      )}
      {error && (
        <div style={{ background: T.redLight, color: T.red, padding: '9px 12px', borderRadius: 10, fontSize: 12, marginBottom: 10, display: 'flex', gap: 6 }}>
          🚫 {error}
        </div>
      )}
      {isAtLimit && !showForm && (
        <div style={{ background: T.redLight, color: T.red, padding: '9px 12px', borderRadius: 10, fontSize: 12, marginBottom: 10, textAlign: 'center', fontWeight: 600 }}>
          🚫 Daily calorie target reached
        </div>
      )}

      {/* Meal list */}
      {meals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🥣</div>
          <p style={{ fontSize: 13, color: T.textLight, fontWeight: 500 }}>No meals logged yet today</p>
        </div>
      ) : (
        meals.map(meal => (
          <div key={meal._id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12, marginBottom: 6,
            background: T.bg, border: `1px solid ${T.border}`,
            opacity: deletingId === meal._id ? 0.4 : 1,
            transition: 'opacity 0.2s',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{meal.mealName}</div>
              <div style={{ fontSize: 11, color: T.textLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.foodDesc}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{meal.calories} kcal</div>
              {meal.protein > 0 && <div style={{ fontSize: 11, color: T.blue, fontWeight: 600 }}>{meal.protein}g P</div>}
            </div>
            {!readOnly && (
              <button
                onClick={() => handleDelete(meal._id)}
                disabled={!!deletingId}
                style={{
                  width: 26, height: 26, borderRadius: 8,
                  border: `1px solid #FECACA`, background: T.white,
                  color: T.red, cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.redLight}
                onMouseLeave={e => e.currentTarget.style.background = T.white}
              >
                ×
              </button>
            )}
          </div>
        ))
      )}

      {/* Add meal form */}
      {showForm && !readOnly ? (
        <form onSubmit={handleAddMeal} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select
            value={newMeal.mealName}
            onChange={e => setNewMeal(p => ({ ...p, mealName: e.target.value }))}
            style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit', background: T.white, color: T.text, outline: 'none' }}
          >
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snack</option>
            <option>Other</option>
          </select>
          <input
            placeholder="What did you eat? e.g. Rice + Dal + Salad"
            value={newMeal.foodDesc}
            onChange={e => setNewMeal(p => ({ ...p, foodDesc: e.target.value }))}
            required
            style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit', color: T.text, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = T.green}
            onBlur={e => e.target.style.borderColor = T.border}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              type="number" placeholder="Calories"
              value={newMeal.calories}
              onChange={e => setNewMeal(p => ({ ...p, calories: e.target.value }))}
              required min="0"
              style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit', color: T.text, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = T.green}
              onBlur={e => e.target.style.borderColor = T.border}
            />
            <input
              type="number" placeholder="Protein (g)"
              value={newMeal.protein}
              onChange={e => setNewMeal(p => ({ ...p, protein: e.target.value }))}
              min="0"
              style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit', color: T.text, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = T.green}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: saving ? T.bg : `linear-gradient(135deg, ${T.green}, ${T.greenDark})`, color: saving ? T.textLight : 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {saving ? 'Saving...' : 'Log meal'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(''); setWarning('') }} style={{ flex: 1, padding: '11px', borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.white, color: T.textMid, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        </form>
      ) : !readOnly && !isAtLimit ? (
        <button onClick={() => setShowForm(true)} style={{ width: '100%', marginTop: 12, padding: '11px', borderRadius: 12, border: `2px dashed ${T.greenMid}`, background: T.greenLight, color: T.greenDark, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#C8E6C9'}
          onMouseLeave={e => e.currentTarget.style.background = T.greenLight}
        >
          + Log a meal
        </button>
      ) : readOnly ? (
        <div style={{ background: T.bg, borderRadius: 10, padding: '8px 12px', marginTop: 12, fontSize: 12, color: T.textLight, textAlign: 'center' }}>
          📖 {new Date(targetDate) < new Date() ? 'Past meals — view only' : 'Future day — log meals when ready'}
        </div>
      ) : null}

      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}

export default MealLogger