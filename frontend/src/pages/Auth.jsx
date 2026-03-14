// /**
//  * Auth.jsx — Combined Login + Register screen
//  *
//  * Single page with two tabs:
//  * - Login tab: email only → finds existing user
//  * - Register tab: full form → creates new user
//  *
//  * On success both tabs save userId to localStorage
//  * and call onComplete() to show Dashboard.
//  *
//  * Props:
//  *   onComplete {function} — called with userId after auth
//  */

// import React, { useState } from 'react'
// import { registerUser, loginUser } from '../services/api'

// const Auth = ({ onComplete }) => {

//   // 🧠 LEARN: activeTab controls which form is visible
//   // 'login' or 'register'
//   const [activeTab, setActiveTab] = useState('login')

//   // Separate state for each form
//   const [loginEmail, setLoginEmail] = useState('')

//   const [registerData, setRegisterData] = useState({
//     name: '',
//     email: '',
//     calorieTarget: 1800,
//     proteinTarget: 120
//   })

//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   // ─────────────────────────────────────────────────────
//   // LOGIN HANDLER
//   // ─────────────────────────────────────────────────────

//   /**
//    * handleLogin — finds user by email in MongoDB
//    * Saves _id + name to localStorage on success
//    */
//   const handleLogin = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const data = await loginUser(loginEmail)

//       // 🧠 LEARN: save both id and name so Dashboard
//       // can greet user by name without extra API call
//       localStorage.setItem('yolo_userId', data.user._id)
//       localStorage.setItem('yolo_userName', data.user.name)

//       // Brief success message before switching screen
//       setSuccess(`Welcome back, ${data.user.name}! 👋`)

//       // 🧠 LEARN: setTimeout delays the navigation by 800ms
//       // so user can see the success message
//       setTimeout(() => onComplete(data.user._id), 800)

//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }
// /**
//  * calculateTargets — auto-computes calorie and protein targets
//  * Uses Mifflin-St Jeor BMR formula (most accurate for general population)
//  *
//  * BMR formula:
//  * Male:   (10 × weight kg) + (6.25 × height cm) − (5 × age) + 5
//  * Female: (10 × weight kg) + (6.25 × height cm) − (5 × age) − 161
//  *
//  * Then multiply by activity multiplier to get TDEE (total daily energy)
//  * Then subtract 500 kcal for weight loss goal
//  */
// // 🧠 LEARN: this is pure math — no React, no API
// // Input numbers → output calorie and protein targets
// const calculateTargets = (data) => {
//   const weight = Number(data.currentWeightKg)
//   const height = Number(data.heightCm)
//   const age    = Number(data.age)

//   if (!weight || !height || !age) return { calorieTarget: 1800, proteinTarget: 120 }

//   // Step 1: BMR
//   const bmr = data.gender === 'female'
//     ? (10 * weight) + (6.25 * height) - (5 * age) - 161
//     : (10 * weight) + (6.25 * height) - (5 * age) + 5

//   // Step 2: Activity multiplier
//   const multipliers = {
//     sedentary: 1.2,
//     light:     1.375,
//     moderate:  1.55,
//     active:    1.725
//   }
//   const tdee = bmr * (multipliers[data.activityLevel] || 1.55)

//   // Step 3: Adjust for goal
//   // 🧠 LEARN: deficit = eat less than you burn = lose weight
//   const goalAdjustment = {
//     lose_weight:     -500,   // 500 kcal deficit → ~0.5kg/week loss
//     maintain_weight:    0,
//     improve_energy:   -200,
//     build_habits:       0
//   }
//   const calorieTarget = Math.round(tdee + (goalAdjustment[data.primaryGoal] || -500))

//   // Protein: 2g per kg of bodyweight for active weight loss
//   const proteinTarget = Math.round(weight * 1.8)

//   return { calorieTarget, proteinTarget }
// }

//   // ─────────────────────────────────────────────────────
//   // REGISTER HANDLER
//   // ─────────────────────────────────────────────────────

//   /**
//    * handleRegister — creates new user in MongoDB
//    */
//   const handleRegister = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const data = await registerUser(registerData)

//       localStorage.setItem('yolo_userId', data.user._id)
//       localStorage.setItem('yolo_userName', data.user.name)

//       setSuccess(`Account created! Welcome, ${data.user.name} 🌱`)
//       setTimeout(() => onComplete(data.user._id), 800)

//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ─────────────────────────────────────────────────────
//   // TAB SWITCH — clear errors when switching
//   // ─────────────────────────────────────────────────────

//   const switchTab = (tab) => {
//     setActiveTab(tab)
//     // 🧠 LEARN: always clear errors when user switches tabs
//     // old error messages from other form confuse users
//     setError('')
//     setSuccess('')
//   }

//   return (
//     <div style={{
//       minHeight: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '2rem',
//       background: 'linear-gradient(135deg, #E1F5EE 0%, #f9fafb 60%, #E6F1FB 100%)'
//     }}>
//       <div style={{ width: '100%', maxWidth: 420 }}>

//         {/* Logo + heading */}
//         <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
//           <div style={{
//             width: 64, height: 64, borderRadius: 20,
//             background: '#1D9E75',
//             display: 'flex', alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: 28, margin: '0 auto 16px',
//             boxShadow: '0 8px 24px rgba(29,158,117,0.25)'
//           }}>
//             🌱
//           </div>
//           <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>
//             YOLO Wellness
//           </h1>
//           <p style={{ color: '#666', fontSize: 14 }}>
//             Your 14-Day Reset journey
//           </p>
//         </div>

//         {/* Card */}
//         <div className="card" style={{ padding: '1.75rem' }}>

//           {/* Tab switcher */}
//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: '1fr 1fr',
//             background: '#f3f4f6',
//             borderRadius: 10,
//             padding: 4,
//             marginBottom: '1.5rem'
//           }}>
//             {['login', 'register'].map(tab => (
//               <button
//                 key={tab}
//                 onClick={() => switchTab(tab)}
//                 style={{
//                   padding: '8px',
//                   borderRadius: 8,
//                   border: 'none',
//                   fontSize: 14,
//                   fontWeight: 500,
//                   cursor: 'pointer',
//                   fontFamily: 'inherit',
//                   // 🧠 LEARN: active tab gets white bg and shadow
//                   // inactive tab is transparent — feels like a toggle
//                   background: activeTab === tab ? 'white' : 'transparent',
//                   color: activeTab === tab ? '#1a1a1a' : '#888',
//                   boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
//                   transition: 'all 0.2s'
//                 }}
//               >
//                 {tab === 'login' ? '👋 Login' : '✨ Register'}
//               </button>
//             ))}
//           </div>

//           {/* Success message */}
//           {success && (
//             <div style={{
//               background: '#E1F5EE', color: '#085041',
//               padding: '10px 14px', borderRadius: 8,
//               fontSize: 13, marginBottom: 16,
//               display: 'flex', alignItems: 'center', gap: 8
//             }}>
//               <span>✅</span> {success}
//             </div>
//           )}

//           {/* Error message */}
//           {error && (
//             <div style={{
//               background: '#FCEBEB', color: '#A32D2D',
//               padding: '10px 14px', borderRadius: 8,
//               fontSize: 13, marginBottom: 16,
//               display: 'flex', alignItems: 'center', gap: 8
//             }}>
//               <span>⚠️</span> {error}
//             </div>
//           )}

//           {/* ── LOGIN FORM ── */}
//           {activeTab === 'login' && (
//             <form onSubmit={handleLogin}>

//               <div style={{ marginBottom: '1.25rem' }}>
//                 <label style={{
//                   fontSize: 13, fontWeight: 500,
//                   display: 'block', marginBottom: 6
//                 }}>
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   value={loginEmail}
//                   onChange={e => setLoginEmail(e.target.value)}
//                   placeholder="rahul@gmail.com"
//                   required
//                   autoFocus
//                 />
//                 <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
//                   Enter the email you registered with
//                 </p>
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-primary"
//                 disabled={loading}
//                 style={{ width: '100%', padding: '12px', fontSize: 15 }}
//               >
//                 {loading ? 'Finding your account...' : 'Continue to Dashboard →'}
//               </button>

//               {/* Switch to register */}
//               <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 16 }}>
//                 New here?{' '}
//                 <span
//                   onClick={() => switchTab('register')}
//                   style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: 500 }}
//                 >
//                   Create your account
//                 </span>
//               </p>

//             </form>
//           )}

//           {/* ── REGISTER FORM ── */}
//           {activeTab === 'register' && (
//             <form onSubmit={handleRegister}>

//               <div style={{ marginBottom: 14 }}>
//                 <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
//                   Your name
//                 </label>
//                 <input
//                   value={registerData.name}
//                   onChange={e => setRegisterData(p => ({ ...p, name: e.target.value }))}
//                   placeholder="e.g. Rahul"
//                   required
//                   autoFocus
//                 />
//               </div>

//               <div style={{ marginBottom: 14 }}>
//                 <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   value={registerData.email}
//                   onChange={e => setRegisterData(p => ({ ...p, email: e.target.value }))}
//                   placeholder="rahul@gmail.com"
//                   required
//                 />
//               </div>

//               {/* Targets row */}
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
//                 <div>
//                   <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
//                     Daily calories
//                   </label>
//                   <input
//                     type="number"
//                     value={registerData.calorieTarget}
//                     onChange={e => setRegisterData(p => ({ ...p, calorieTarget: Number(e.target.value) }))}
//                     min="1000" max="4000"
//                   />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
//                     Protein (g)
//                   </label>
//                   <input
//                     type="number"
//                     value={registerData.proteinTarget}
//                     onChange={e => setRegisterData(p => ({ ...p, proteinTarget: Number(e.target.value) }))}
//                     min="50" max="300"
//                   />
//                 </div>
//               </div>

//               {/* What they get */}
//               <div style={{
//                 background: '#f9fafb', borderRadius: 8,
//                 padding: '12px 14px', marginBottom: 16,
//                 border: '1px solid #e5e7eb'
//               }}>
//                 <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#444' }}>
//                   What you get:
//                 </p>
//                 {[
//                   '✅ Daily habit check-ins',
//                   '🥗 Meal logging with calorie tracking',
//                   '🤖 AI nutrition assistant',
//                   '📊 14-day streak dashboard',
//                 ].map(item => (
//                   <p key={item} style={{ fontSize: 12, color: '#666', marginBottom: 3 }}>
//                     {item}
//                   </p>
//                 ))}
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-primary"
//                 disabled={loading}
//                 style={{ width: '100%', padding: '12px', fontSize: 15 }}
//               >
//                 {loading ? 'Creating your account...' : 'Start my 14-Day Reset 🚀'}
//               </button>

//               {/* Switch to login */}
//               <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 16 }}>
//                 Already have an account?{' '}
//                 <span
//                   onClick={() => switchTab('login')}
//                   style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: 500 }}
//                 >
//                   Login here
//                 </span>
//               </p>

//             </form>
//           )}

//         </div>

//         {/* Footer note */}
//         <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16 }}>
//           Free 14-day program · No credit card required
//         </p>

//       </div>
//     </div>
//   )
// }

// export default Auth

/**
 * Auth.jsx — Combined Login + Register screen
 *
 * Login tab → simple email login
 * Register tab → 3 step onboarding wizard
 *
 * On success both tabs save userId to localStorage
 * and call onComplete() to show Dashboard.
 */

import React, { useState } from 'react'
import { registerUser, loginUser } from '../services/api'

/**
 * calculateTargets — auto-computes calorie and protein targets
 * Uses Mifflin-St Jeor BMR formula
 */

const calculateTargets = (data) => {
  const weight = Number(data.currentWeightKg)
  const height = Number(data.heightCm)
  const age = Number(data.age)

  if (!weight || !height || !age)
    return { calorieTarget: 1800, proteinTarget: 120 }

  const bmr =
    data.gender === 'female'
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  }

  const tdee = bmr * (multipliers[data.activityLevel] || 1.55)

  const goalAdjustment = {
    lose_weight: -500,
    maintain_weight: 0,
    improve_energy: -200,
    build_habits: 0
  }

  const calorieTarget = Math.round(
    tdee + (goalAdjustment[data.primaryGoal] || -500)
  )

  const proteinTarget = Math.round(weight * 1.8)

  return { calorieTarget, proteinTarget }
}

const Auth = ({ onComplete }) => {

  const [activeTab, setActiveTab] = useState('login')

  const [loginEmail, setLoginEmail] = useState('')

  const [step, setStep] = useState(1)

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'male',
    heightCm: '',
    currentWeightKg: '',
    goalWeightKg: '',
    activityLevel: 'moderate',
    dietPreference: 'vegetarian',
    allergies: '',
    primaryGoal: 'lose_weight',
    calorieTarget: 1800,
    proteinTarget: 120
  })

  const updateField = (field, value) =>
    setRegisterData(prev => ({ ...prev, [field]: value }))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {

      const data = await loginUser(loginEmail)

      localStorage.setItem('yolo_userId', data.user._id)
      localStorage.setItem('yolo_userName', data.user.name)

      setSuccess(`Welcome back, ${data.user.name}! 👋`)

      setTimeout(() => onComplete(data.user._id), 800)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {

      const targets = calculateTargets(registerData)

      const payload = {
        ...registerData,
        calorieTarget: targets.calorieTarget,
        proteinTarget: targets.proteinTarget
      }

      const data = await registerUser(payload)

      localStorage.setItem('yolo_userId', data.user._id)
      localStorage.setItem('yolo_userName', data.user.name)

      setSuccess(`Account created! Your daily target: ${targets.calorieTarget} kcal 🌱`)

      setTimeout(() => onComplete(data.user._id), 1000)

    } catch (err) {
      setError(err.message)
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setError('')
    setSuccess('')
    setStep(1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #E1F5EE 0%, #f9fafb 60%, #E6F1FB 100%)'
    }}>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: '#1D9E75',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 16px'
          }}>
            🌱
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700 }}>
            YOLO Wellness
          </h1>

          <p style={{ color: '#666', fontSize: 14 }}>
            Your 14-Day Reset journey
          </p>
        </div>

        {/* CARD */}
        <div className="card" style={{ padding: '1.75rem' }}>

          {/* TAB SWITCH */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#f3f4f6',
            borderRadius: 10,
            padding: 4,
            marginBottom: '1.5rem'
          }}>

            {['login', 'register'].map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                style={{
                  padding: '8px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 14,
                  cursor: 'pointer',
                  background: activeTab === tab ? 'white' : 'transparent'
                }}
              >
                {tab === 'login' ? '👋 Login' : '✨ Register'}
              </button>
            ))}

          </div>

          {success && (
            <div style={{
              background: '#E1F5EE',
              padding: 10,
              borderRadius: 8,
              marginBottom: 12
            }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{
              background: '#FCEBEB',
              padding: 10,
              borderRadius: 8,
              marginBottom: 12
            }}>
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (

            <form onSubmit={handleLogin}>

              <div style={{ marginBottom: 20 }}>
                <label>Email</label>

                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {loading ? 'Finding account...' : 'Continue →'}
              </button>

            </form>
          )}

          {/* REGISTER WIZARD */}
          {activeTab === 'register' && (

            <form onSubmit={handleRegister}>

              {/* PROGRESS */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {[1,2,3].map(s => (
                  <div key={s}
                    style={{
                      flex: 1,
                      height: 4,
                      background: step >= s ? '#1D9E75' : '#e5e7eb'
                    }}
                  />
                ))}
              </div>

              {/* STEP 1 */}
              {step === 1 && (

                <>
                  <input
                    placeholder="Name"
                    value={registerData.name}
                    onChange={e => updateField('name', e.target.value)}
                  />

                  <input
                    placeholder="Email"
                    value={registerData.email}
                    onChange={e => updateField('email', e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Age"
                    value={registerData.age}
                    onChange={e => updateField('age', e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setStep(2)}
                  >
                    Next →
                  </button>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (

                <>
                  <input
                    placeholder="Height (cm)"
                    value={registerData.heightCm}
                    onChange={e => updateField('heightCm', e.target.value)}
                  />

                  <input
                    placeholder="Weight (kg)"
                    value={registerData.currentWeightKg}
                    onChange={e => updateField('currentWeightKg', e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                  >
                    Next →
                  </button>

                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (

                <>
                  <select
                    value={registerData.primaryGoal}
                    onChange={e => updateField('primaryGoal', e.target.value)}
                  >
                    <option value="lose_weight">Lose weight</option>
                    <option value="maintain_weight">Maintain</option>
                  </select>

                  {(() => {

                    const targets = calculateTargets(registerData)

                    return (
                      <div style={{
                        background: '#E1F5EE',
                        padding: 12,
                        borderRadius: 8
                      }}>
                        {targets.calorieTarget} kcal / day
                        <br />
                        {targets.proteinTarget}g protein
                      </div>
                    )

                  })()}

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {loading ? 'Creating...' : 'Start Reset 🚀'}
                  </button>
                </>
              )}

            </form>
          )}

        </div>

      </div>

    </div>
  )
}

export default Auth