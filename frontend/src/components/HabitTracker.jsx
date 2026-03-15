// /**
//  * HabitTracker.jsx — Daily habit check-in component
//  *
//  * Displays 5 habit items with toggle checkboxes.
//  * On each toggle, immediately calls backend to persist state.
//  * Shows real-time progress bar and completion count.
//  *
//  * Props:
//  *   userId    {string} — MongoDB user _id
//  *   onUpdate  {function} — parent callback to refresh streak
//  */

// import React, { useState, useEffect } from 'react'
// import { getTodayHabits, logHabits } from '../services/api'

// // 🧠 LEARN: this array lives OUTSIDE the component
// // because it never changes — no need to recreate it on every render
// const HABITS = [
//   { key: 'meals',   emoji: '🥗', name: 'Log all meals',   target: '3 meals tracked' },
//   { key: 'water',   emoji: '💧', name: 'Drink water',     target: '2.5L target' },
//   { key: 'workout', emoji: '🏃', name: '30-min workout',  target: 'Cardio or strength' },
//   { key: 'steps',   emoji: '🚶', name: 'Step goal',       target: '8,000 steps' },
//   { key: 'sleep',   emoji: '😴', name: 'Sleep 7–8 hrs',   target: 'Log bedtime' },
// ]

// const HabitTracker = ({ userId, onUpdate, date, readOnly = false }) => {

//   const [habits, setHabits] = useState({
//     meals: false, water: false, workout: false, steps: false, sleep: false
//   })
//   const [loading, setLoading]   = useState(true)
//   const [saving, setSaving]     = useState(false)

//   // Use passed date or today
//   // 🧠 LEARN: prop takes priority over calculated today
//   const targetDate = date || new Date().toISOString().split('T')[0]

//   useEffect(() => {
//     const fetchHabits = async () => {
//       try {
//         // Pass date to API — backend filters by this date
//         const data = await getTodayHabits(userId, targetDate)
//         setHabits(data.log.habits)
//       } catch (err) {
//         console.error('Could not fetch habits:', err)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchHabits()
//   }, [userId, targetDate])  // re-fetch when date changes

//   const toggleHabit = async (key) => {
//     // 🧠 LEARN: bail out immediately if read-only
//     // past days and future days cannot be edited
//     if (readOnly) return

//     const updated = { ...habits, [key]: !habits[key] }
//     setHabits(updated)
//     setSaving(true)

//     try {
//       await logHabits(userId, targetDate, updated)
//       if (onUpdate) onUpdate()
//     } catch (err) {
//       setHabits(habits)
//       console.error('Could not save habit:', err)
//     } finally {
//       setSaving(false)
//     }
//   }
//   // Count completed habits for progress bar
//   const doneCount = Object.values(habits).filter(Boolean).length
//   const progress = (doneCount / HABITS.length) * 100

//   if (loading) return (
//     <div className="card">
//       <p style={{ color: '#666', fontSize: 14 }}>Loading habits...</p>
//     </div>
//   )

//   return (
//     <div className="card">

//             {/* Read-only banner */}
//       {readOnly && (
//         <div
//           style={{
//             background: "#f3f4f6",
//             borderRadius: 8,
//             padding: "6px 12px",
//             marginBottom: 12,
//             fontSize: 12,
//             color: "#888",
//             textAlign: "center"
//           }}
//         >
//           📖 View only — {date ? "Day history" : "upcoming day"}
//         </div>
//       )}

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//         <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
//           Today's habits
//         </h3>
//         {saving && (
//           <span style={{ fontSize: 12, color: '#1D9E75' }}>Saving...</span>
//         )}
//       </div>

//       {/* Habit list */}
//       {HABITS.map(habit => (
//         <div
//           key={habit.key}
//           // onClick={() => toggleHabit(habit.key)}
//           onClick={() => !readOnly && toggleHabit(habit.key)}
//           style={{
//             display: 'flex', alignItems: 'center', gap: 12,
//             padding: '10px 0',
//             borderBottom: '1px solid #f0f0f0',
//             // cursor: 'pointer',
//             cursor: readOnly ? 'default' : 'pointer',
//             opacity: readOnly && !habits[habit.key] ? 0.5 : 1,
//             // 🧠 LEARN: transition makes the opacity change smoothly
//             transition: 'opacity 0.15s',
//           }}
//         >
//           {/* Emoji icon */}
//           <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>
//             {habit.emoji}
//           </span>

//           {/* Text */}
//           <div style={{ flex: 1 }}>
//             <div style={{
//               fontSize: 14, fontWeight: 500,
//               // 🧠 LEARN: completed habits get a strikethrough and muted color
//               textDecoration: habits[habit.key] ? 'line-through' : 'none',
//               color: habits[habit.key] ? '#999' : '#1a1a1a'
//             }}>
//               {habit.name}
//             </div>
//             <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>
//               {habit.target}
//             </div>
//           </div>

//           {/* Checkbox */}
//           <div style={{
//             width: 26, height: 26,
//             borderRadius: 8,
//             border: habits[habit.key] ? 'none' : '2px solid #d1d5db',
//             background: habits[habit.key] ? '#1D9E75' : 'transparent',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             transition: 'all 0.2s',
//             flexShrink: 0
//           }}>
//             {habits[habit.key] && (
//               <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                 <polyline points="2,7 5.5,11 12,3" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
//               </svg>
//             )}
//           </div>
//         </div>
//       ))}

//       {/* Progress bar */}
//       <div style={{ marginTop: 16 }}>
//         <div style={{
//           height: 8, background: '#f0f0f0',
//           borderRadius: 4, overflow: 'hidden'
//         }}>
//           <div style={{
//             height: '100%',
//             width: `${progress}%`,
//             background: '#1D9E75',
//             borderRadius: 4,
//             // 🧠 LEARN: transition animates the bar filling up smoothly
//             transition: 'width 0.4s ease'
//           }} />
//         </div>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
//           <span style={{ fontSize: 12, color: '#666' }}>{doneCount} / 5 done</span>
//           <span style={{ fontSize: 12, color: '#1D9E75', fontWeight: 500 }}>{Math.round(progress)}%</span>
//         </div>
//       </div>

//     </div>
//   )
// }

// export default HabitTracker

/**
 * HabitTracker.jsx — Redesigned daily habit check-ins
 * Same props and API logic. New visual treatment.
 * Animated checkbox, particle burst on completion, perfect day banner.
 */

import React, { useState, useEffect } from 'react'
import { getTodayHabits, logHabits } from '../services/api'

const T = {
  green: '#4CAF50', greenDark: '#388E3C', greenLight: '#E8F5E9',
  greenMid: '#81C784', orange: '#FF7043', text: '#1A1A2E',
  textMid: '#4A4A6A', textLight: '#8888AA', white: '#FFFFFF',
  border: '#E8EDE8', bg: '#F4F6F3',
}

const HABITS = [
  { key: 'meals',   emoji: '🥗', name: 'Log all meals',  target: '3 meals tracked',   color: '#4CAF50' },
  { key: 'water',   emoji: '💧', name: 'Drink water',    target: '2.5L target',        color: '#2196F3' },
  { key: 'workout', emoji: '🏃', name: '30-min workout', target: 'Cardio or strength', color: '#FF7043' },
  { key: 'steps',   emoji: '🚶', name: 'Step goal',      target: '8,000 steps',        color: '#9C27B0' },
  { key: 'sleep',   emoji: '😴', name: 'Sleep 7–8 hrs',  target: 'Log bedtime',        color: '#607D8B' },
]

const HabitTracker = ({ userId, onUpdate, date, readOnly = false }) => {
  const [habits, setHabits]   = useState({ meals: false, water: false, workout: false, steps: false, sleep: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [justChecked, setJustChecked] = useState(null)
  const [showPerfect, setShowPerfect] = useState(false)

  const targetDate = date || new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTodayHabits(userId, targetDate)
        setHabits(data.log.habits)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [userId, targetDate])

  const toggleHabit = async (key) => {
    if (readOnly || saving) return
    const updated = { ...habits, [key]: !habits[key] }
    setHabits(updated)
    setJustChecked(key)
    setTimeout(() => setJustChecked(null), 600)

    // Check for perfect day
    const doneCount = Object.values(updated).filter(Boolean).length
    if (doneCount === 5) {
      setShowPerfect(true)
      setTimeout(() => setShowPerfect(false), 3000)
    }

    setSaving(true)
    try {
      await logHabits(userId, targetDate, updated)
      if (onUpdate) onUpdate()
    } catch (err) {
      setHabits(habits)
    } finally {
      setSaving(false)
    }
  }

  const doneCount = Object.values(habits).filter(Boolean).length
  const progress  = (doneCount / HABITS.length) * 100

  if (loading) return (
    <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: '22px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ height: 56, borderRadius: 12, background: T.bg, marginBottom: 8, animation: 'shimmer 1.5s ease infinite' }} />
      ))}
    </div>
  )

  return (
    <div style={{
      background: T.white, borderRadius: 20,
      border: `1px solid ${T.border}`,
      padding: '22px 24px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      position: 'relative', overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>

      {/* Perfect day banner */}
      {showPerfect && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: `linear-gradient(135deg, ${T.green}, ${T.greenDark})`,
          padding: '10px', textAlign: 'center',
          fontSize: 13, fontWeight: 700, color: 'white',
          animation: 'slideDown 0.3s ease',
          zIndex: 10,
        }}>
          🎉 Perfect day! All habits completed!
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, marginTop: showPerfect ? 36 : 0, transition: 'margin 0.3s' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.9px' }}>
          Today's Habits
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving && <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Saving...</span>}
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '3px 10px',
            borderRadius: 8, background: doneCount === 5 ? T.green : T.bg,
            color: doneCount === 5 ? 'white' : T.textMid,
            border: `1px solid ${doneCount === 5 ? T.green : T.border}`,
            transition: 'all 0.3s',
          }}>
            {doneCount}/5
          </span>
        </div>
      </div>

      {/* Read-only banner */}
      {readOnly && (
        <div style={{
          background: T.bg, borderRadius: 10, padding: '8px 12px',
          marginBottom: 14, fontSize: 12, color: T.textLight,
          textAlign: 'center', border: `1px solid ${T.border}`,
        }}>
          📖 View only
        </div>
      )}

      {/* Habit rows */}
      {HABITS.map((habit, i) => {
        const done = habits[habit.key]
        const isChecking = justChecked === habit.key

        return (
          <div
            key={habit.key}
            onClick={() => toggleHabit(habit.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 12, marginBottom: 6,
              background: done ? `${habit.color}0D` : T.bg,
              border: `1.5px solid ${done ? `${habit.color}33` : T.border}`,
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              transform: isChecking ? 'scale(0.98)' : 'scale(1)',
            }}
          >
            {/* Emoji box */}
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: done ? `${habit.color}22` : T.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
              border: `1px solid ${done ? `${habit.color}33` : T.border}`,
              transition: 'all 0.2s',
            }}>
              {habit.emoji}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: done ? T.textMid : T.text,
                textDecoration: done ? 'line-through' : 'none',
                transition: 'all 0.2s',
              }}>
                {habit.name}
              </div>
              <div style={{ fontSize: 11, color: T.textLight, fontWeight: 500, marginTop: 1 }}>
                {habit.target}
              </div>
            </div>

            {/* Checkbox */}
            <div style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              border: `2px solid ${done ? habit.color : T.border}`,
              background: done ? habit.color : T.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              transform: isChecking ? 'scale(1.3)' : done ? 'scale(1.05)' : 'scale(1)',
              boxShadow: done ? `0 2px 8px ${habit.color}44` : 'none',
            }}>
              {done && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <polyline points="2,6.5 5,9.5 11,3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        )
      })}

      {/* Progress bar */}
      <div style={{ marginTop: 14 }}>
        <div style={{ height: 8, background: T.bg, borderRadius: 4, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: progress === 100
              ? `linear-gradient(90deg, ${T.green}, ${T.greenDark})`
              : `linear-gradient(90deg, ${T.green}, ${T.greenMid})`,
            borderRadius: 4,
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 12, color: T.textLight, fontWeight: 500 }}>{doneCount} of 5 done</span>
          <span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>{Math.round(progress)}%</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideDown { from{transform:translateY(-100%)} to{transform:translateY(0)} }
      `}</style>
    </div>
  )
}

export default HabitTracker