// /**
//  * Dashboard.jsx — Main application screen
//  *
//  * Orchestrates all components and manages shared state.
//  * Fetches user profile and streak data from backend.
//  * Passes userId down to child components as a prop.
//  *
//  * Layout: stat cards → habit tracker + meal logger → AI chat
//  */

// import React, { useState, useEffect, useCallback } from 'react'
// import { getUser, getStreak } from '../services/api'
// import HabitTracker from '../components/HabitTracker'
// import MealLogger from '../components/MealLogger'
// import AIAssistant from '../components/AIAssistant'
// import DailyPlan from '../components/DailyPlan'
// import ProgramProgress from '../components/ProgramProgress'

// const Dashboard = ({ userId }) => {

//   const [user, setUser] = useState(null)
//   const [streak, setStreak] = useState({ streak: 0, consistency: 0 })
//   const [currentDay, setCurrentDay] = useState(1)
//   const [loading, setLoading] = useState(true)

//   /**
//    * fetchStats — loads user profile and streak data.
//    * useCallback memoizes this function so it doesn't
//    * get recreated on every render — safe to pass as prop.
//    */
//   // 🧠 LEARN: useCallback is like useMemo but for functions
//   // It prevents unnecessary re-renders in child components
//   const fetchStats = useCallback(async () => {
//     try {
//       const [userData, streakData] = await Promise.all([
//         getUser(userId),
//         getStreak(userId)
//       ])
//       // 🧠 LEARN: Promise.all runs both requests simultaneously
//       // instead of waiting for one to finish before starting next
//       // Cuts load time roughly in half
//       setUser(userData.user)
//       setCurrentDay(userData.currentDay)
//       setStreak(streakData)
//     } catch (err) {
//       console.error('Could not load dashboard:', err)
//     } finally {
//       setLoading(false)
//     }
//   }, [userId])

//   useEffect(() => {
//     fetchStats()
//   }, [fetchStats])

//   if (loading) return (
//     <div style={{
//       minHeight: '100vh', display: 'flex',
//       alignItems: 'center', justifyContent: 'center'
//     }}>
//       <p style={{ color: '#666' }}>Loading your dashboard...</p>
//     </div>
//   )
// /**
//  * handleLogout — clears localStorage and reloads app
//  * This returns user to the Auth screen.
//  *
//  * In production: also call backend to invalidate session token.
//  */
// // 🧠 LEARN: localStorage.clear() removes ALL stored data
// // window.location.reload() refreshes the page — App.jsx
// // will then see no userId and show Auth screen
// const handleLogout = () => {
//   localStorage.clear()
//   window.location.reload()
// }
//   return (
//     <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>
//         {/* Header */}
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//             <div style={{
//             width: 40, height: 40, borderRadius: 12,
//             background: '#1D9E75', display: 'flex',
//             alignItems: 'center', justifyContent: 'center',
//             fontSize: 20
//             }}>🌱</div>
//             <div>
//             <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>YOLO</div>
//             <div style={{ fontSize: 12, color: '#999' }}>Your Optimal Life Organisation</div>
//             </div>
//         </div>

//         {/* Right side — day badge + logout */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             <div style={{
//             fontSize: 13, color: '#666',
//             background: 'white', padding: '6px 14px',
//             borderRadius: 20, border: '1px solid #e5e7eb'
//             }}>
//             Day <span style={{ color: '#1D9E75', fontWeight: 600 }}>{currentDay}</span> / 14
//             </div>
//             <button
//             onClick={handleLogout}
//             style={{
//                 fontSize: 13, padding: '6px 14px',
//                 borderRadius: 20, border: '1px solid #e5e7eb',
//                 background: 'white', color: '#888',
//                 cursor: 'pointer', fontFamily: 'inherit',
//                 transition: 'all 0.15s'
//             }}
//             onMouseEnter={e => e.target.style.color = '#E24B4A'}
//             onMouseLeave={e => e.target.style.color = '#888'}
//             >
//             Logout
//             </button>
//         </div>
//         </div>
                          

//       {/* Welcome message */}
//       <div style={{ marginBottom: '1.5rem' }}>
//         <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
//           Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name} 👋
//         </h1>
//         <p style={{ color: '#666', fontSize: 14 }}>
//           {streak.streak > 0
//             ? `You're on a ${streak.streak}-day streak. Keep it going!`
//             : "Let's start building your streak today!"}
//         </p>
//       </div>

//       {/* Stat cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
//         {[
//           { label: 'Streak', value: `${streak.streak} 🔥`, sub: 'days in a row' },
//           { label: 'Consistency', value: `${streak.consistency}%`, sub: 'this program' },
//           { label: 'Program day', value: `${currentDay} / 14`, sub: 'days completed' },
//         ].map(stat => (
//           <div key={stat.label} style={{
//             background: 'white', borderRadius: 12,
//             border: '1px solid #e5e7eb', padding: '1rem'
//           }}>
//             <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
//               {stat.label}
//             </div>
//             <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 2 }}>{stat.value}</div>
//             <div style={{ fontSize: 12, color: '#999' }}>{stat.sub}</div>
//           </div>
//         ))}
//       </div>

//       {/* Main content grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
//         <HabitTracker userId={userId} onUpdate={fetchStats} />
//         <MealLogger userId={userId} onUpdate={fetchStats} />
//       </div>

//       {/* AI Assistant — full width */}
//       <AIAssistant userId={userId} />

//     </div>
//   )
// }

// export default Dashboard


/**
 * Dashboard.jsx — Main application screen
 *
 * Orchestrates all components and manages shared state.
 * Fetches user profile and streak data from backend.
 * Passes userId down to child components as a prop.
 *
 * Layout:
 * Header
 * Welcome
 * Habit tracker + Program progress
 * Daily plan
 * Meal logger + AI assistant
 */

// import React, { useState, useEffect, useCallback } from 'react'
// import { getUser, getStreak } from '../services/api'

// import HabitTracker from '../components/HabitTracker'
// import MealLogger from '../components/MealLogger'
// import AIAssistant from '../components/AIAssistant'
// import DailyPlan from '../components/DailyPlan'
// import ProgramProgress from '../components/ProgramProgress'

// const Dashboard = ({ userId }) => {

//   const [user, setUser] = useState(null)
//   const [streak, setStreak] = useState({ streak: 0, consistency: 0 })
//   const [currentDay, setCurrentDay] = useState(1)
//   const [loading, setLoading] = useState(true)
//   const [mealRefreshKey, setMealRefreshKey] = useState(0)

//   const triggerMealRefresh = () => setMealRefreshKey(prev => prev + 1)
//   /**
//    * fetchStats — loads user profile and streak data
//    */

//   const fetchStats = useCallback(async () => {
//     try {

//       const [userData, streakData] = await Promise.all([
//         getUser(userId),
//         getStreak(userId)
//       ])

//       setUser(userData.user)
//       setCurrentDay(userData.currentDay)
//       setStreak(streakData)

//     } catch (err) {
//       console.error('Could not load dashboard:', err)
//     } finally {
//       setLoading(false)
//     }
//   }, [userId])

//   useEffect(() => {
//     fetchStats()
//   }, [fetchStats])

//   if (loading)
//     return (
//       <div
//         style={{
//           minHeight: '100vh',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}
//       >
//         <p style={{ color: '#666' }}>Loading your dashboard...</p>
//       </div>
//     )

//   /**
//    * handleLogout — clears localStorage and reloads app
//    */

//   const handleLogout = () => {
//     localStorage.clear()
//     window.location.reload()
//   }

//   return (
//     <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

//       {/* Header */}
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '1.5rem'
//         }}
//       >
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <div
//             style={{
//               width: 40,
//               height: 40,
//               borderRadius: 12,
//               background: '#1D9E75',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: 20
//             }}
//           >
//             🌱
//           </div>

//           <div>
//             <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>
//               YOLO
//             </div>
//             <div style={{ fontSize: 12, color: '#999' }}>
//               Your Optimal Life Organisation
//             </div>
//           </div>
//         </div>

//         {/* Right side */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div
//             style={{
//               fontSize: 13,
//               color: '#666',
//               background: 'white',
//               padding: '6px 14px',
//               borderRadius: 20,
//               border: '1px solid #e5e7eb'
//             }}
//           >
//             Day <span style={{ color: '#1D9E75', fontWeight: 600 }}>{currentDay}</span> / 14
//           </div>

//           <button
//             onClick={handleLogout}
//             style={{
//               fontSize: 13,
//               padding: '6px 14px',
//               borderRadius: 20,
//               border: '1px solid #e5e7eb',
//               background: 'white',
//               color: '#888',
//               cursor: 'pointer',
//               fontFamily: 'inherit'
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Welcome */}
//       <div style={{ marginBottom: '1.5rem' }}>
//         <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
//           Good{' '}
//           {new Date().getHours() < 12
//             ? 'morning'
//             : new Date().getHours() < 17
//             ? 'afternoon'
//             : 'evening'}
//           , {user?.name} 👋
//         </h1>

//         <p style={{ color: '#666', fontSize: 14 }}>
//           {streak.streak > 0
//             ? `You're on a ${streak.streak}-day streak. Keep it going!`
//             : "Let's start building your streak today!"}
//         </p>
//       </div>

//       {/* Main content — Habit tracker + Program progress */}
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: 16,
//           marginBottom: 16
//         }}
//       >
//         <HabitTracker userId={userId} onUpdate={fetchStats} />

//         <ProgramProgress
//           currentDay={currentDay}
//           consistency={streak.consistency}
//           streak={streak.streak}
//         />
//       </div>

//       {/* Daily meal plan */}
//       <div style={{ marginBottom: 16 }}>
//         <DailyPlan
//           userId={userId}
//           currentDay={currentDay}
//         //   onMealLog={fetchStats}
//         onMealLog={triggerMealRefresh}
//         />
//       </div>

//       {/* Meal logger + AI */}
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: 16
//         }}
//       >
//         <MealLogger key={mealRefreshKey} userId={userId} onUpdate={fetchStats} />

//         <AIAssistant userId={userId} />
//       </div>

//     </div>
//   )
// }

// export default Dashboard

/**
 * Dashboard.jsx — Main application screen
 *
 * Orchestrates all components and manages shared state.
 * Fetches user profile and streak data from backend.
 * Passes userId down to child components as a prop.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { getUser, getStreak } from '../services/api'

import HabitTracker from '../components/HabitTracker'
import MealLogger from '../components/MealLogger'
import AIAssistant from '../components/AIAssistant'
import DailyPlan from '../components/DailyPlan'
import ProgramProgress from '../components/ProgramProgress'

const Dashboard = ({ userId }) => {

  const [user, setUser] = useState(null)
  const [streak, setStreak] = useState({ streak: 0, consistency: 0 })
  const [currentDay, setCurrentDay] = useState(1)
  const [loading, setLoading] = useState(true)

  /**
   * mealRefreshKey — forces MealLogger to re-fetch meals
   * when a meal is logged from DailyPlan.
   *
   * 🧠 LEARN:
   * Changing the React `key` forces a component
   * to fully re-mount → resetting its state + refetching data.
   */
  const [mealRefreshKey, setMealRefreshKey] = useState(0)

  const triggerMealRefresh = () => setMealRefreshKey(prev => prev + 1)

  /**
   * fetchStats — loads user profile and streak data
   */

  const fetchStats = useCallback(async () => {
    try {

      const [userData, streakData] = await Promise.all([
        getUser(userId),
        getStreak(userId)
      ])

      setUser(userData.user)
      setCurrentDay(userData.currentDay)
      setStreak(streakData)

    } catch (err) {
      console.error('Could not load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <p style={{ color: '#666' }}>Loading your dashboard...</p>
      </div>
    )
  }

  /**
   * handleLogout — clears localStorage and reloads app
   */

  const handleLogout = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#1D9E75',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}
          >
            🌱
          </div>

          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              YOLO
            </div>

            <div style={{ fontSize: 12, color: '#999' }}>
              Your Optimal Life Organisation
            </div>
          </div>

        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          <div
            style={{
              fontSize: 13,
              color: '#666',
              background: 'white',
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #e5e7eb'
            }}
          >
            Day{' '}
            <span style={{ color: '#1D9E75', fontWeight: 600 }}>
              {currentDay}
            </span>{' '}
            / 14
          </div>

          <button
            onClick={handleLogout}
            style={{
              fontSize: 13,
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #e5e7eb',
              background: 'white',
              color: '#888',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Logout
          </button>

        </div>
      </div>

      {/* Welcome */}
      <div style={{ marginBottom: '1.5rem' }}>

        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
          Good{' '}
          {new Date().getHours() < 12
            ? 'morning'
            : new Date().getHours() < 17
            ? 'afternoon'
            : 'evening'}
          , {user?.name} 👋
        </h1>

        <p style={{ color: '#666', fontSize: 14 }}>
          {streak.streak > 0
            ? `You're on a ${streak.streak}-day streak. Keep it going!`
            : "Let's start building your streak today!"}
        </p>

      </div>

      {/* Habit tracker + progress */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 16
        }}
      >

        <HabitTracker
          userId={userId}
          onUpdate={fetchStats}
        />

        <ProgramProgress
          currentDay={currentDay}
          consistency={streak.consistency}
          streak={streak.streak}
        />

      </div>

      {/* Daily meal plan */}
      <div style={{ marginBottom: 16 }}>

        <DailyPlan
          userId={userId}
          currentDay={currentDay}
          onMealLog={triggerMealRefresh}
        />

      </div>

      {/* Meal logger + AI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16
        }}
      >

        {/* Re-mounts when mealRefreshKey changes */}
        <MealLogger
          key={mealRefreshKey}
          userId={userId}
          onUpdate={fetchStats}
        />

        <AIAssistant userId={userId} />

      </div>

    </div>
  )
}

export default Dashboard