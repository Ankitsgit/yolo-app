// /**
//  * App.jsx — Root component and routing logic
//  *
//  * Checks localStorage for existing userId on load.
//  * If found: show Dashboard (returning user).
//  * If not found: show Onboarding (new user).
//  *
//  * This replaces a full auth system for the MVP prototype.
//  * In production: verify session token with backend on load.
//  */

// import React, { useState, useEffect } from 'react'
// import Dashboard from './pages/Dashboard'
// import Onboarding from './pages/Onboarding'

// const App = () => {

//   // 🧠 LEARN: null = loading, '' = no user, 'abc123' = logged in
//   const [userId, setUserId] = useState(null)

//   /**
//    * On first load, check if userId exists in localStorage.
//    * This persists the "logged in" state across page refreshes.
//    */
//   // 🧠 LEARN: useEffect with [] runs exactly once when app loads
//   useEffect(() => {
//     const savedId = localStorage.getItem('yolo_userId')
//     // 🧠 LEARN: savedId || '' means "use savedId if it exists,
//     // otherwise use empty string"
//     setUserId(savedId || '')
//   }, [])

//   /**
//    * handleOnboardingComplete — called after registration succeeds
//    * @param {string} newUserId — _id returned from backend
//    */
//   const handleOnboardingComplete = (newUserId) => {
//     setUserId(newUserId)
//   }

//   // Still checking localStorage — show nothing briefly
//   // 🧠 LEARN: returning null renders nothing — prevents flash
//   if (userId === null) return null

//   // New user — show onboarding
//   if (userId === '') {
//     return <Onboarding onComplete={handleOnboardingComplete} />
//   }

//   // Existing user — show dashboard
//   return <Dashboard userId={userId} />
// }

// export default App


/**
 * App.jsx — Root component and auth routing
 *
 * Three states:
 * 1. null    → still reading localStorage (show nothing)
 * 2. ''      → no user found → show Auth screen
 * 3. 'abc..' → user logged in → show Dashboard
 *
 * Auth screen handles both login and register.
 * No need for separate Onboarding.jsx anymore.
 */

import React, { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'

// 🧠 LEARN: you can delete Onboarding.jsx now —
// Auth.jsx replaces it with both login + register tabs

const App = () => {

  // null = checking storage, '' = not logged in, string = logged in
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    // 🧠 LEARN: read localStorage when app first loads
    // This is how we remember the user across page refreshes
    const savedId = localStorage.getItem('yolo_userId')
    setUserId(savedId || '')
  }, [])

  const handleAuthComplete = (newUserId) => {
    setUserId(newUserId)
  }

  // Still reading localStorage — render nothing briefly
  if (userId === null) return null

  // Not logged in → show Auth (login + register)
  if (!userId) {
    return <Auth onComplete={handleAuthComplete} />
  }

  // Logged in → show Dashboard
  return <Dashboard userId={userId} />
}

export default App