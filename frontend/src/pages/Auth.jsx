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