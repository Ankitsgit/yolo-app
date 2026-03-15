// /**
//  * Dashboard.jsx — Main application screen
//  *
//  * Orchestrates all components and manages shared state.
//  * Fetches user profile and streak data from backend.
//  * Passes userId down to child components as a prop.
//  *
//  * Layout: stat cards → habit tracker + meal logger → AI chat
//  */


// import React, { useState, useEffect, useCallback, useRef } from 'react'
// import { getUser, getStreak } from '../services/api'
// import HabitTracker     from '../components/HabitTracker'
// import MealLogger       from '../components/MealLogger'
// import AIAssistant      from '../components/AIAssistant'
// import DailyPlan        from '../components/DailyPlan'
// import ProgramProgress  from '../components/ProgramProgress'
// import DayNavigator     from '../components/DayNavigator'

// const Dashboard = ({ userId }) => {

//   const [user, setUser]               = useState(null)
//   const [streak, setStreak]           = useState({ streak: 0, consistency: 0 })
//   const [currentDay, setCurrentDay]   = useState(1)
//   const [selectedDay, setSelectedDay] = useState(1)
//   const [loading, setLoading]         = useState(true)
//   const [mealRefreshKey, setMealRefreshKey] = useState(0)

//   // 🧠 LEARN: useRef stores the last known date string
//   // so we can detect when midnight passes
//   const lastDateRef = useRef(new Date().toISOString().split('T')[0])

//   /**
//    * dateForDay — converts a program day number to a calendar date
//    * Day 1 = programStart date, Day 2 = programStart + 1, etc.
//    *
//    * @param {number} day — program day number 1–14
//    * @param {Date}   programStart — user's start date
//    * @returns {string} "YYYY-MM-DD"
//    */
//   // 🧠 LEARN: we need real calendar dates for DB queries
//   // program "Day 3" might be calendar date "2025-03-16"
//   const dateForDay = useCallback((day, programStart) => {
//     const start = new Date(programStart)
//     // Add (day - 1) days to start date
//     start.setDate(start.getDate() + (day - 1))
//     return start.toISOString().split('T')[0]
//   }, [])

//   /**
//    * fetchStats — loads user profile, streak, and current day
//    * Called on mount and whenever habits/meals change.
//    */
//   const fetchStats = useCallback(async () => {
//     try {
//       const [userData, streakData] = await Promise.all([
//         getUser(userId),
//         getStreak(userId)
//       ])

//       setUser(userData.user)
//       setStreak(streakData)

//       const newCurrentDay = userData.currentDay

//       // 🧠 LEARN: only snap selectedDay to today if user hasn't
//       // navigated — don't interrupt someone browsing history
//       setCurrentDay(prev => {
//         if (prev !== newCurrentDay) {
//           // Day changed — snap selected back to today
//           setSelectedDay(newCurrentDay)
//         }
//         return newCurrentDay
//       })

//     } catch (err) {
//       console.error('Could not load dashboard:', err)
//     } finally {
//       setLoading(false)
//     }
//   }, [userId])

//   // Initial load
//   useEffect(() => {
//     fetchStats()
//   }, [fetchStats])

//   /**
//    * Midnight auto-advance — checks every 60 seconds if the
//    * calendar date has changed. When it has, re-fetch user
//    * to get new currentDay and reset selectedDay to today.
//    */
//   // 🧠 LEARN: setInterval runs a function repeatedly
//   // every 60000ms = every 60 seconds
//   // clearInterval in cleanup prevents memory leaks
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const todayStr = new Date().toISOString().split('T')[0]

//       if (todayStr !== lastDateRef.current) {
//         // Date changed — it's a new day!
//         console.log('New day detected — advancing program')
//         lastDateRef.current = todayStr
//         // Re-fetch to get new currentDay from backend
//         fetchStats()
//       }
//     }, 60000)  // check every minute

//     // 🧠 LEARN: cleanup function runs when component unmounts
//     // prevents the interval running forever in the background
//     return () => clearInterval(interval)
//   }, [fetchStats])

//   // Trigger MealLogger refresh after DailyPlan logs a meal
//   const triggerMealRefresh = () => setMealRefreshKey(prev => prev + 1)

//   // Derived values
//   // 🧠 LEARN: these compute from state — no extra useState needed
//   const isToday      = selectedDay === currentDay
//   const isPastDay    = selectedDay < currentDay
//   const isFutureDay  = selectedDay > currentDay
//   const readOnly     = !isToday  // past and future are read-only

//   // The actual calendar date for the selected day
//   const selectedDate = user
//     ? dateForDay(selectedDay, user.programStart)
//     : new Date().toISOString().split('T')[0]

//   // Greeting based on time of day
//   const hour = new Date().getHours()
//   const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

//   if (loading) return (
//     <div style={{
//       minHeight: '100vh', display: 'flex',
//       alignItems: 'center', justifyContent: 'center',
//       flexDirection: 'column', gap: 12
//     }}>
//       <div style={{
//         width: 32, height: 32, borderRadius: '50%',
//         border: '3px solid #1D9E75',
//         borderTopColor: 'transparent',
//         animation: 'spin 0.8s linear infinite'
//       }} />
//       <p style={{ color: '#666', fontSize: 14 }}>Loading your dashboard...</p>
//     </div>
//   )

//   return (
//     <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem' }}>

//       {/* ── TOP HEADER ── */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <div style={{
//             width: 40, height: 40, borderRadius: 12,
//             background: '#1D9E75', display: 'flex',
//             alignItems: 'center', justifyContent: 'center', fontSize: 20
//           }}>🌱</div>
//           <div>
//             <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>YOLO</div>
//             <div style={{ fontSize: 12, color: '#999' }}>Your Optimal Life Organisation</div>
//           </div>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           {/* Day mode badge */}
//           <div style={{
//             fontSize: 12, padding: '5px 12px', borderRadius: 20,
//             background: isFutureDay ? '#E6F1FB' : isPastDay ? '#F1EFE8' : '#E1F5EE',
//             color: isFutureDay ? '#0C447C' : isPastDay ? '#444441' : '#085041',
//             fontWeight: 500, border: '1px solid',
//             borderColor: isFutureDay ? '#B5D4F4' : isPastDay ? '#D3D1C7' : '#9FE1CB'
//           }}>
//             {isFutureDay ? `👀 Day ${selectedDay} preview` :
//              isPastDay   ? `📖 Day ${selectedDay} history` :
//              `📍 Day ${selectedDay} — today`}
//           </div>

//           <button
//             onClick={() => { localStorage.clear(); window.location.reload() }}
//             style={{
//               fontSize: 13, padding: '6px 14px', borderRadius: 20,
//               border: '1px solid #e5e7eb', background: 'white',
//               color: '#888', cursor: 'pointer', fontFamily: 'inherit',
//               transition: 'all 0.15s'
//             }}
//             onMouseEnter={e => e.target.style.color = '#E24B4A'}
//             onMouseLeave={e => e.target.style.color = '#888'}
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* ── WELCOME ── */}
//       <div style={{ marginBottom: '1.25rem' }}>
//         <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
//           {greeting}, {user?.name} 👋
//         </h1>
//         <p style={{ color: '#666', fontSize: 14 }}>
//           {isToday && streak.streak > 0 && `You're on a ${streak.streak}-day streak. Keep it going!`}
//           {isToday && streak.streak === 0 && "Let's build your streak today!"}
//           {isPastDay  && `Viewing Day ${selectedDay} — ${selectedDate}`}
//           {isFutureDay && `Previewing Day ${selectedDay} — ${selectedDate}`}
//         </p>
//       </div>

//       {/* ── DAY NAVIGATOR ── */}
//       <DayNavigator
//         currentDay={currentDay}
//         selectedDay={selectedDay}
//         onSelect={setSelectedDay}
//       />

//       {/* ── PROGRAM PROGRESS — always full 14 days ── */}
//       <div style={{ marginBottom: 16 }}>
//         <ProgramProgress
//           currentDay={currentDay}
//           selectedDay={selectedDay}
//           consistency={streak.consistency}
//           streak={streak.streak}
//         />
//       </div>

//       {/* ── HABITS + DAILY PLAN — side by side ── */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
//         <HabitTracker
//           userId={userId}
//           onUpdate={fetchStats}
//           date={selectedDate}
//           readOnly={readOnly}
//         />
//         <DailyPlan
//           userId={userId}
//           currentDay={selectedDay}
//           onMealLog={triggerMealRefresh}
//           readOnly={readOnly}
//         />
//       </div>

//       {/* ── MEALS + AI — side by side ── */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <MealLogger
//           key={`${mealRefreshKey}-${selectedDate}`}
//           userId={userId}
//           onUpdate={fetchStats}
//           date={selectedDate}
//           readOnly={readOnly}
//         />
//         {/* AI always shows — useful for any day context */}
//         <AIAssistant userId={userId} />
//       </div>

//     </div>
//   )
// }

// export default Dashboard

/**
 * Dashboard.jsx — Redesigned main screen
 *
 * Visual direction: "Warm Precision" — matches onboarding aesthetic
 * Same fonts (Plus Jakarta Sans), same green (#4CAF50), same card style
 * All existing props, API calls, and logic preserved exactly.
 * Only styles changed.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getUser, getStreak } from '../services/api'
import HabitTracker    from '../components/HabitTracker'
import MealLogger      from '../components/MealLogger'
import AIAssistant     from '../components/AIAssistant'
import DailyPlan       from '../components/DailyPlan'
import ProgramProgress from '../components/ProgramProgress'
import DayNavigator    from '../components/DayNavigator'

// ── Design tokens (matches Onboarding.jsx exactly) ──────────
const T = {
  green:       '#4CAF50',
  greenDark:   '#388E3C',
  greenLight:  '#E8F5E9',
  greenMid:    '#81C784',
  orange:      '#FF7043',
  orangeLight: '#FFF3E0',
  text:        '#1A1A2E',
  textMid:     '#4A4A6A',
  textLight:   '#8888AA',
  bg:          '#F4F6F3',
  white:       '#FFFFFF',
  border:      '#E8EDE8',
  card:        '#FFFFFF',
  shadow:      '0 2px 16px rgba(0,0,0,0.06)',
  shadowHover: '0 8px 32px rgba(0,0,0,0.10)',
}

// ── Shared card wrapper ──────────────────────────────────────
export const Card = ({ children, style = {}, hover = false }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: T.card,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        padding: '22px 24px',
        boxShadow: hovered ? T.shadowHover : T.shadow,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Section label ────────────────────────────────────────────
export const SectionLabel = ({ children, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <span style={{
      fontSize: 11, fontWeight: 700, color: T.textLight,
      textTransform: 'uppercase', letterSpacing: '0.9px',
    }}>
      {children}
    </span>
    {action}
  </div>
)

// ── Stat pill ────────────────────────────────────────────────
const StatPill = ({ label, value, color = T.text, bg = T.greenLight, icon }) => (
  <div style={{
    background: bg, borderRadius: 14,
    padding: '14px 18px', flex: 1,
    border: `1px solid ${T.border}`,
  }}>
    <div style={{ fontSize: 11, color: T.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
      {value} {icon}
    </div>
  </div>
)

// ────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ────────────────────────────────────────────────────────────
const Dashboard = ({ userId }) => {

  const [user, setUser]               = useState(null)
  const [streak, setStreak]           = useState({ streak: 0, consistency: 0 })
  const [currentDay, setCurrentDay]   = useState(1)
  const [selectedDay, setSelectedDay] = useState(1)
  const [loading, setLoading]         = useState(true)
  const [mealRefreshKey, setMealRefreshKey] = useState(0)

  const lastDateRef = useRef(new Date().toISOString().split('T')[0])

  // Convert program day → calendar date string
  const dateForDay = useCallback((day, programStart) => {
    const start = new Date(programStart)
    start.setDate(start.getDate() + (day - 1))
    return start.toISOString().split('T')[0]
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const [userData, streakData] = await Promise.all([
        getUser(userId),
        getStreak(userId),
      ])
      setUser(userData.user)
      setStreak(streakData)
      const newDay = userData.currentDay
      setCurrentDay(prev => {
        if (prev !== newDay) setSelectedDay(newDay)
        return newDay
      })
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchStats() }, [fetchStats])

  // Auto-advance at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0]
      if (today !== lastDateRef.current) {
        lastDateRef.current = today
        fetchStats()
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const triggerMealRefresh = () => setMealRefreshKey(p => p + 1)

  const isToday     = selectedDay === currentDay
  const isPastDay   = selectedDay < currentDay
  const isFutureDay = selectedDay > currentDay
  const readOnly    = !isToday

  const selectedDate = user
    ? dateForDay(selectedDay, user.programStart)
    : new Date().toISOString().split('T')[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const handleLogout = () => { localStorage.clear(); window.location.reload() }

  // ── Loading ─────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `linear-gradient(135deg, ${T.greenLight}, ${T.greenMid})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, animation: 'pulse 1.5s ease-in-out infinite',
      }}>🌱</div>
      <p style={{ color: T.textLight, fontSize: 14, fontWeight: 500 }}>
        Loading your dashboard...
      </p>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.95)} }`}</style>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: T.text,
    }}>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #C8D8C8; border-radius: 2px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: `linear-gradient(135deg, ${T.greenLight}, ${T.greenMid})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 2px 8px rgba(76,175,80,0.25)',
            }}>🌱</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: '-0.4px', lineHeight: 1.1 }}>
                YOLO
              </div>
              <div style={{ fontSize: 10, color: T.textLight, fontWeight: 500, letterSpacing: '0.2px' }}>
                Your Optimal Life Organisation
              </div>
            </div>
          </div>

          {/* Center — day mode badge */}
          <div style={{
            fontSize: 12, padding: '6px 14px', borderRadius: 20,
            fontWeight: 600, border: '1.5px solid',
            background: isFutureDay ? '#EFF6FF' : isPastDay ? '#F9FAF9' : T.greenLight,
            color: isFutureDay ? '#3B82F6' : isPastDay ? T.textMid : T.greenDark,
            borderColor: isFutureDay ? '#BFDBFE' : isPastDay ? T.border : T.greenMid,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>{isFutureDay ? '👀' : isPastDay ? '📖' : '📍'}</span>
            {isFutureDay ? `Day ${selectedDay} preview` :
             isPastDay   ? `Day ${selectedDay} history` :
             `Day ${selectedDay} — today`}
          </div>

          {/* Right — user + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* User avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.green}, ${T.greenDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white',
              boxShadow: '0 2px 8px rgba(76,175,80,0.3)',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                fontSize: 13, padding: '7px 16px', borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.white,
                color: T.textMid, cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 600, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FCA5A5'; e.currentTarget.style.color = '#EF4444' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ───────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 48px' }}>

        {/* ── HERO BANNER ──────────────────────────────── */}
        <div style={{
          borderRadius: 24,
          background: `linear-gradient(135deg, ${T.green} 0%, ${T.greenDark} 100%)`,
          padding: '28px 32px',
          marginBottom: 24,
          position: 'relative', overflow: 'hidden',
          boxShadow: `0 8px 32px rgba(76,175,80,0.30)`,
          animation: 'fadeUp 0.4s ease both',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 120, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: 20, right: 200, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.3px' }}>
                {greeting}
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                {user?.name} 👋
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.80)', margin: 0 }}>
                {isToday && streak.streak > 0
                  ? `You're on a ${streak.streak}-day streak. Don't break it! 🔥`
                  : isToday
                  ? "Let's build your streak today! Start checking habits."
                  : isPastDay
                  ? `Viewing Day ${selectedDay} — ${selectedDate}`
                  : `Previewing Day ${selectedDay} — plan ahead!`}
              </p>
            </div>

            {/* Stats pills */}
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              {[
                { label: 'Streak', value: `${streak.streak} 🔥`, bg: 'rgba(255,255,255,0.18)', color: 'white' },
                { label: 'Consistency', value: `${streak.consistency}%`, bg: 'rgba(255,255,255,0.18)', color: 'white' },
                { label: 'Program', value: `Day ${currentDay}/14`, bg: 'rgba(255,255,255,0.18)', color: 'white' },
              ].map(s => (
                <div key={s.label} style={{
                  background: s.bg, borderRadius: 14,
                  padding: '12px 18px', textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  minWidth: 90,
                }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.70)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: '-0.3px' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DAY NAVIGATOR ────────────────────────────── */}
        <div style={{ marginBottom: 20, animation: 'fadeUp 0.4s ease 0.05s both' }}>
          <DayNavigator
            currentDay={currentDay}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
          />
        </div>

        {/* ── PROGRAM PROGRESS ─────────────────────────── */}
        <div style={{ marginBottom: 20, animation: 'fadeUp 0.4s ease 0.10s both' }}>
          <ProgramProgress
            currentDay={currentDay}
            selectedDay={selectedDay}
            consistency={streak.consistency}
            streak={streak.streak}
          />
        </div>

        {/* ── ROW 1: Habits + Daily Plan ───────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20, marginBottom: 20,
          animation: 'fadeUp 0.4s ease 0.15s both',
        }}>
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

        {/* ── ROW 2: Meal Logger + AI ───────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          animation: 'fadeUp 0.4s ease 0.20s both',
        }}>
          <MealLogger
            key={`${mealRefreshKey}-${selectedDate}`}
            userId={userId}
            onUpdate={fetchStats}
            date={selectedDate}
            readOnly={readOnly}
          />
          <AIAssistant userId={userId} />
        </div>

      </div>
    </div>
  )
}

export default Dashboard