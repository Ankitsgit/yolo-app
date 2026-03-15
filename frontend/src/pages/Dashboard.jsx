/**
 * Dashboard.jsx — Main application screen
 *
 * Orchestrates all components and manages shared state.
 * Fetches user profile and streak data from backend.
 * Passes userId down to child components as a prop.
 *
 * Layout: stat cards → habit tracker + meal logger → AI chat
 */


import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getUser, getStreak } from '../services/api'
import HabitTracker     from '../components/HabitTracker'
import MealLogger       from '../components/MealLogger'
import AIAssistant      from '../components/AIAssistant'
import DailyPlan        from '../components/DailyPlan'
import ProgramProgress  from '../components/ProgramProgress'
import DayNavigator     from '../components/DayNavigator'

const Dashboard = ({ userId }) => {

  const [user, setUser]               = useState(null)
  const [streak, setStreak]           = useState({ streak: 0, consistency: 0 })
  const [currentDay, setCurrentDay]   = useState(1)
  const [selectedDay, setSelectedDay] = useState(1)
  const [loading, setLoading]         = useState(true)
  const [mealRefreshKey, setMealRefreshKey] = useState(0)

  // 🧠 LEARN: useRef stores the last known date string
  // so we can detect when midnight passes
  const lastDateRef = useRef(new Date().toISOString().split('T')[0])

  /**
   * dateForDay — converts a program day number to a calendar date
   * Day 1 = programStart date, Day 2 = programStart + 1, etc.
   *
   * @param {number} day — program day number 1–14
   * @param {Date}   programStart — user's start date
   * @returns {string} "YYYY-MM-DD"
   */
  // 🧠 LEARN: we need real calendar dates for DB queries
  // program "Day 3" might be calendar date "2025-03-16"
  const dateForDay = useCallback((day, programStart) => {
    const start = new Date(programStart)
    // Add (day - 1) days to start date
    start.setDate(start.getDate() + (day - 1))
    return start.toISOString().split('T')[0]
  }, [])

  /**
   * fetchStats — loads user profile, streak, and current day
   * Called on mount and whenever habits/meals change.
   */
  const fetchStats = useCallback(async () => {
    try {
      const [userData, streakData] = await Promise.all([
        getUser(userId),
        getStreak(userId)
      ])

      setUser(userData.user)
      setStreak(streakData)

      const newCurrentDay = userData.currentDay

      // 🧠 LEARN: only snap selectedDay to today if user hasn't
      // navigated — don't interrupt someone browsing history
      setCurrentDay(prev => {
        if (prev !== newCurrentDay) {
          // Day changed — snap selected back to today
          setSelectedDay(newCurrentDay)
        }
        return newCurrentDay
      })

    } catch (err) {
      console.error('Could not load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initial load
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  /**
   * Midnight auto-advance — checks every 60 seconds if the
   * calendar date has changed. When it has, re-fetch user
   * to get new currentDay and reset selectedDay to today.
   */
  // 🧠 LEARN: setInterval runs a function repeatedly
  // every 60000ms = every 60 seconds
  // clearInterval in cleanup prevents memory leaks
  useEffect(() => {
    const interval = setInterval(() => {
      const todayStr = new Date().toISOString().split('T')[0]

      if (todayStr !== lastDateRef.current) {
        // Date changed — it's a new day!
        console.log('New day detected — advancing program')
        lastDateRef.current = todayStr
        // Re-fetch to get new currentDay from backend
        fetchStats()
      }
    }, 60000)  // check every minute

    // 🧠 LEARN: cleanup function runs when component unmounts
    // prevents the interval running forever in the background
    return () => clearInterval(interval)
  }, [fetchStats])

  // Trigger MealLogger refresh after DailyPlan logs a meal
  const triggerMealRefresh = () => setMealRefreshKey(prev => prev + 1)

  // Derived values
  // 🧠 LEARN: these compute from state — no extra useState needed
  const isToday      = selectedDay === currentDay
  const isPastDay    = selectedDay < currentDay
  const isFutureDay  = selectedDay > currentDay
  const readOnly     = !isToday  // past and future are read-only

  // The actual calendar date for the selected day
  const selectedDate = user
    ? dateForDay(selectedDay, user.programStart)
    : new Date().toISOString().split('T')[0]

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid #1D9E75',
        borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#666', fontSize: 14 }}>Loading your dashboard...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* ── TOP HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#1D9E75', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 20
          }}>🌱</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>YOLO</div>
            <div style={{ fontSize: 12, color: '#999' }}>Your Optimal Life Organisation</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Day mode badge */}
          <div style={{
            fontSize: 12, padding: '5px 12px', borderRadius: 20,
            background: isFutureDay ? '#E6F1FB' : isPastDay ? '#F1EFE8' : '#E1F5EE',
            color: isFutureDay ? '#0C447C' : isPastDay ? '#444441' : '#085041',
            fontWeight: 500, border: '1px solid',
            borderColor: isFutureDay ? '#B5D4F4' : isPastDay ? '#D3D1C7' : '#9FE1CB'
          }}>
            {isFutureDay ? `👀 Day ${selectedDay} preview` :
             isPastDay   ? `📖 Day ${selectedDay} history` :
             `📍 Day ${selectedDay} — today`}
          </div>

          <button
            onClick={() => { localStorage.clear(); window.location.reload() }}
            style={{
              fontSize: 13, padding: '6px 14px', borderRadius: 20,
              border: '1px solid #e5e7eb', background: 'white',
              color: '#888', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.target.style.color = '#E24B4A'}
            onMouseLeave={e => e.target.style.color = '#888'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── WELCOME ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
          {greeting}, {user?.name} 👋
        </h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          {isToday && streak.streak > 0 && `You're on a ${streak.streak}-day streak. Keep it going!`}
          {isToday && streak.streak === 0 && "Let's build your streak today!"}
          {isPastDay  && `Viewing Day ${selectedDay} — ${selectedDate}`}
          {isFutureDay && `Previewing Day ${selectedDay} — ${selectedDate}`}
        </p>
      </div>

      {/* ── DAY NAVIGATOR ── */}
      <DayNavigator
        currentDay={currentDay}
        selectedDay={selectedDay}
        onSelect={setSelectedDay}
      />

      {/* ── PROGRAM PROGRESS — always full 14 days ── */}
      <div style={{ marginBottom: 16 }}>
        <ProgramProgress
          currentDay={currentDay}
          selectedDay={selectedDay}
          consistency={streak.consistency}
          streak={streak.streak}
        />
      </div>

      {/* ── HABITS + DAILY PLAN — side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <HabitTracker
          userId={userId}
          onUpdate={fetchStats}
          date={selectedDate}
          readOnly={readOnly}
        />
        <DailyPlan
          userId={userId}
          currentDay={selectedDay}
          onMealLog={triggerMealRefresh}
          readOnly={readOnly}
        />
      </div>

      {/* ── MEALS + AI — side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <MealLogger
          key={`${mealRefreshKey}-${selectedDate}`}
          userId={userId}
          onUpdate={fetchStats}
          date={selectedDate}
          readOnly={readOnly}
        />
        {/* AI always shows — useful for any day context */}
        <AIAssistant userId={userId} />
      </div>

    </div>
  )
}

export default Dashboard