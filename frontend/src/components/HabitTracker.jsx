/**
 * HabitTracker.jsx — Daily habit check-in component
 *
 * Displays 5 habit items with toggle checkboxes.
 * On each toggle, immediately calls backend to persist state.
 * Shows real-time progress bar and completion count.
 *
 * Props:
 *   userId    {string} — MongoDB user _id
 *   onUpdate  {function} — parent callback to refresh streak
 */

import React, { useState, useEffect } from 'react'
import { getTodayHabits, logHabits } from '../services/api'

// 🧠 LEARN: this array lives OUTSIDE the component
// because it never changes — no need to recreate it on every render
const HABITS = [
  { key: 'meals',   emoji: '🥗', name: 'Log all meals',   target: '3 meals tracked' },
  { key: 'water',   emoji: '💧', name: 'Drink water',     target: '2.5L target' },
  { key: 'workout', emoji: '🏃', name: '30-min workout',  target: 'Cardio or strength' },
  { key: 'steps',   emoji: '🚶', name: 'Step goal',       target: '8,000 steps' },
  { key: 'sleep',   emoji: '😴', name: 'Sleep 7–8 hrs',   target: 'Log bedtime' },
]

const HabitTracker = ({ userId, onUpdate, date, readOnly = false }) => {

  const [habits, setHabits] = useState({
    meals: false, water: false, workout: false, steps: false, sleep: false
  })
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  // Use passed date or today
  // 🧠 LEARN: prop takes priority over calculated today
  const targetDate = date || new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        // Pass date to API — backend filters by this date
        const data = await getTodayHabits(userId, targetDate)
        setHabits(data.log.habits)
      } catch (err) {
        console.error('Could not fetch habits:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHabits()
  }, [userId, targetDate])  // re-fetch when date changes

  const toggleHabit = async (key) => {
    // 🧠 LEARN: bail out immediately if read-only
    // past days and future days cannot be edited
    if (readOnly) return

    const updated = { ...habits, [key]: !habits[key] }
    setHabits(updated)
    setSaving(true)

    try {
      await logHabits(userId, targetDate, updated)
      if (onUpdate) onUpdate()
    } catch (err) {
      setHabits(habits)
      console.error('Could not save habit:', err)
    } finally {
      setSaving(false)
    }
  }
  // Count completed habits for progress bar
  const doneCount = Object.values(habits).filter(Boolean).length
  const progress = (doneCount / HABITS.length) * 100

  if (loading) return (
    <div className="card">
      <p style={{ color: '#666', fontSize: 14 }}>Loading habits...</p>
    </div>
  )

  return (
    <div className="card">

            {/* Read-only banner */}
      {readOnly && (
        <div
          style={{
            background: "#f3f4f6",
            borderRadius: 8,
            padding: "6px 12px",
            marginBottom: 12,
            fontSize: 12,
            color: "#888",
            textAlign: "center"
          }}
        >
          📖 View only — {date ? "Day history" : "upcoming day"}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
          Today's habits
        </h3>
        {saving && (
          <span style={{ fontSize: 12, color: '#1D9E75' }}>Saving...</span>
        )}
      </div>

      {/* Habit list */}
      {HABITS.map(habit => (
        <div
          key={habit.key}
          // onClick={() => toggleHabit(habit.key)}
          onClick={() => !readOnly && toggleHabit(habit.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0',
            borderBottom: '1px solid #f0f0f0',
            // cursor: 'pointer',
            cursor: readOnly ? 'default' : 'pointer',
            opacity: readOnly && !habits[habit.key] ? 0.5 : 1,
            // 🧠 LEARN: transition makes the opacity change smoothly
            transition: 'opacity 0.15s',
          }}
        >
          {/* Emoji icon */}
          <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>
            {habit.emoji}
          </span>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 14, fontWeight: 500,
              // 🧠 LEARN: completed habits get a strikethrough and muted color
              textDecoration: habits[habit.key] ? 'line-through' : 'none',
              color: habits[habit.key] ? '#999' : '#1a1a1a'
            }}>
              {habit.name}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>
              {habit.target}
            </div>
          </div>

          {/* Checkbox */}
          <div style={{
            width: 26, height: 26,
            borderRadius: 8,
            border: habits[habit.key] ? 'none' : '2px solid #d1d5db',
            background: habits[habit.key] ? '#1D9E75' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
          }}>
            {habits[habit.key] && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polyline points="2,7 5.5,11 12,3" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        </div>
      ))}

      {/* Progress bar */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          height: 8, background: '#f0f0f0',
          borderRadius: 4, overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#1D9E75',
            borderRadius: 4,
            // 🧠 LEARN: transition animates the bar filling up smoothly
            transition: 'width 0.4s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 12, color: '#666' }}>{doneCount} / 5 done</span>
          <span style={{ fontSize: 12, color: '#1D9E75', fontWeight: 500 }}>{Math.round(progress)}%</span>
        </div>
      </div>

    </div>
  )
}

export default HabitTracker