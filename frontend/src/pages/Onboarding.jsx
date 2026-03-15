/**
 * Onboarding.jsx — Complete 4-screen onboarding flow
 *
 * Screen 1: Welcome / splash
 * Screen 2: Health goals selector
 * Screen 3: Personal info (age, activity, diet, allergies, meal schedule)
 * Screen 4: All set / summary + go to dashboard
 *
 * Matches the 4 screenshot designs exactly.
 * Connects to existing registerUser API on completion.
 * Calls onComplete(userId) to hand off to Dashboard.
 *
 * Props:
 *   onComplete {function} — called with userId after registration
 *   onLogin    {function} — called when user clicks "Log in"
 */

import React, { useState, useEffect, useRef } from 'react'
import { registerUser } from '../services/api'

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────

const T = {
  green:      '#4CAF50',
  greenDark:  '#388E3C',
  greenLight: '#E8F5E9',
  greenMid:   '#81C784',
  orange:     '#FF7043',
  orangeLight:'#FFF3E0',
  yellow:     '#FFD600',
  blue:       '#2196F3',
  blueLight:  '#E3F2FD',
  purple:     '#9C27B0',
  purpleLight:'#F3E5F5',
  red:        '#F44336',
  redLight:   '#FFEBEE',
  teal:       '#009688',
  tealLight:  '#E0F2F1',
  text:       '#1A1A2E',
  textMid:    '#4A4A6A',
  textLight:  '#8888AA',
  bg:         '#FAFAF8',
  white:      '#FFFFFF',
  border:     '#E8E8F0',
  card:       '#FFFFFF',
}

// ─────────────────────────────────────────────────────────────
// BMR CALCULATOR (Mifflin-St Jeor)
// ─────────────────────────────────────────────────────────────

/**
 * calculateTargets — auto-computes calorie + protein targets
 * 🧠 LEARN: BMR = Basal Metabolic Rate = calories at complete rest
 * TDEE = Total Daily Energy Expenditure = BMR × activity multiplier
 */
const calculateTargets = (data) => {
  const weight = Number(data.currentWeightKg) || 70
  const height = Number(data.heightCm) || 170
  const age    = Number(data.ageRange === '18-25' ? 22 : data.ageRange === '26-35' ? 30 : data.ageRange === '36-45' ? 40 : 50)
  const gender = data.gender || 'male'

  const bmr = gender === 'female'
    ? (10 * weight) + (6.25 * height) - (5 * age) - 161
    : (10 * weight) + (6.25 * height) - (5 * age) + 5

  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }
  const tdee = bmr * (multipliers[data.activityLevel] || 1.375)

  const goalAdjust = {
    lose_weight: -500, build_muscle: 250,
    improve_energy: -200, manage_sugar: -300,
    eat_healthier: -200, general_wellness: 0
  }

  const calorieTarget = Math.round(tdee + (goalAdjust[data.primaryGoals?.[0]] || -300))
  const proteinTarget = Math.round(weight * 1.8)

  return { calorieTarget: Math.max(1200, calorieTarget), proteinTarget }
}

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────

const ProgressDots = ({ total, current }) => (
  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        height: 6,
        width: i === current ? 24 : 6,
        borderRadius: 3,
        background: i === current ? T.green : i < current ? T.greenMid : T.border,
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    ))}
  </div>
)

const Btn = ({ children, onClick, disabled, variant = 'primary', style = {} }) => {
  const [pressed, setPressed] = useState(false)
  const base = {
    width: '100%', padding: '16px 24px',
    borderRadius: 14, border: 'none',
    fontSize: 16, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
    transform: pressed ? 'scale(0.97)' : 'scale(1)',
    opacity: disabled ? 0.5 : 1,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    letterSpacing: '-0.2px',
    ...style
  }
  const variants = {
    primary: { background: `linear-gradient(135deg, ${T.orange} 0%, #FF5722 100%)`, color: T.white, boxShadow: pressed ? 'none' : '0 4px 20px rgba(255,112,67,0.35)' },
    green:   { background: `linear-gradient(135deg, ${T.green} 0%, ${T.greenDark} 100%)`, color: T.white, boxShadow: pressed ? 'none' : '0 4px 20px rgba(76,175,80,0.35)' },
    outline: { background: T.white, color: T.green, border: `2px solid ${T.green}`, boxShadow: 'none' },
    ghost:   { background: 'transparent', color: T.textLight, boxShadow: 'none', padding: '10px 24px' },
  }
  return (
    <button
      style={{ ...base, ...variants[variant] }}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {children}
    </button>
  )
}

// Animated entrance wrapper
const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.2,0.64,1)`,
      ...style
    }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — WELCOME
// ─────────────────────────────────────────────────────────────

const WelcomeScreen = ({ onNext, onLogin }) => {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: T.bg, position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(76,175,80,0.08)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 120, left: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,112,67,0.07)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: 100, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(33,150,243,0.06)', zIndex: 0 }} />

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <ProgressDots total={4} current={0} />
        <button onClick={onLogin} style={{ background: 'none', border: 'none', color: T.textLight, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
          Skip
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 28px 32px', position: 'relative', zIndex: 1 }}>

        {/* App icon */}
        <FadeIn delay={100}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `linear-gradient(135deg, ${T.greenLight} 0%, ${T.greenMid} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 12,
            boxShadow: '0 8px 24px rgba(76,175,80,0.25)',
          }}>
            🌱
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px', textAlign: 'center', letterSpacing: '-0.5px' }}>
            YOLO Health
          </h1>
          <p style={{ fontSize: 14, color: T.textLight, margin: '0 0 24px', textAlign: 'center' }}>
            Your journey to better health starts here
          </p>
        </FadeIn>
    
        {/* <FadeIn delay={300} style={{ width: '100%' }}>
          <div style={{
            width: '100%', height: 220,
            borderRadius: 24,
            background: `linear-gradient(160deg, ${T.greenLight} 0%, #FFF8E1 50%, #FCE4EC 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28, overflow: 'hidden', position: 'relative',
          }}> */}
            {/* Illustrated people — CSS art version */}
            {/* <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: '16px 8px 0' }}>
              {[
                { bg: '#FFCCBC', size: 52, emoji: '🧘‍♀️', offset: 0 },
                { bg: '#C8E6C9', size: 60, emoji: '🏃‍♂️', offset: -8 },
                { bg: '#BBDEFB', size: 56, emoji: '🥗', offset: 4 },
                { bg: '#F8BBD9', size: 48, emoji: '💪', offset: -4 },
                { bg: '#FFF9C4', size: 54, emoji: '🧗‍♀️', offset: 0 },
              ].map((p, i) => (
                <div key={i} style={{
                  width: p.size, height: p.size + 20,
                  borderRadius: '50% 50% 40% 40%',
                  background: p.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: p.size * 0.42,
                  marginBottom: p.offset,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  animation: `bob${i} 2.${i}s ease-in-out infinite`,
                }} />
              ))}
            </div> */}
            {/* Floating elements */}
            {/* <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 18, animation: 'float 3s ease-in-out infinite' }}>🍎</div>
            <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 16, animation: 'float 3.5s ease-in-out infinite 0.5s' }}>⭐</div>
            <div style={{ position: 'absolute', bottom: 16, left: 24, fontSize: 14, animation: 'float 2.8s ease-in-out infinite 1s' }}>💧</div>
          </div>
        </FadeIn> */}
    
      {/* Hero image */}
        <FadeIn delay={300} style={{ width: '100%' }}>
        <img
            src="/hero.png"
            alt="YOLO Health — your wellness journey"
            style={{
            width: '100%',
            height: 220,
            objectFit: 'cover',
            borderRadius: 24,
            marginBottom: 28,
            display: 'block',
            }}
        />
        </FadeIn>
        <FadeIn delay={450} style={{ width: '100%', textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: '0 0 8px', letterSpacing: '-0.5px', lineHeight: 1.25 }}>
            Welcome to your{' '}
            <span style={{ color: T.green, position: 'relative' }}>
              healthy
              <span style={{ position: 'absolute', bottom: -3, left: 0, right: 0, height: 3, background: T.greenLight, borderRadius: 2 }} />
            </span>
            {' '}adventure! 🎉
          </h2>
          <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.6, margin: 0 }}>
            Track habits, plan meals, and get AI-powered support to make healthy living fun and sustainable.
          </p>
        </FadeIn>

        <FadeIn delay={550} style={{ width: '100%' }}>
          <Btn onClick={onNext} variant="primary">
            Let's Get Started! 🚀
          </Btn>
          <p style={{ textAlign: 'center', fontSize: 13, color: T.textLight, marginTop: 14 }}>
            Already have an account?{' '}
            <span onClick={onLogin} style={{ color: T.green, fontWeight: 600, cursor: 'pointer' }}>
              Log in
            </span>
          </p>
        </FadeIn>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — HEALTH GOALS
// ─────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'lose_weight',      emoji: '🎯', label: 'Lose Weight',       desc: 'Shed pounds in a healthy way',        color: T.orange,  bg: T.orangeLight },
  { id: 'build_muscle',     emoji: '💪', label: 'Build Muscle',      desc: 'Gain strength and muscle mass',        color: T.blue,    bg: T.blueLight },
  { id: 'improve_energy',   emoji: '⚡', label: 'Improve Energy',    desc: 'Feel more vibrant daily',              color: T.yellow,  bg: '#FFFDE7' },
  { id: 'manage_sugar',     emoji: '🩸', label: 'Manage Sugar',      desc: 'Better blood sugar control',           color: T.red,     bg: T.redLight },
  { id: 'eat_healthier',    emoji: '🥗', label: 'Eat Healthier',     desc: 'Nourish your body better',             color: T.teal,    bg: T.tealLight },
  { id: 'general_wellness', emoji: '🌟', label: 'General Wellness',  desc: 'Overall lifestyle improvement',        color: T.purple,  bg: T.purpleLight },
]

const PACES = [
  { id: 'slow',     label: '🐢 Slow & Steady' },
  { id: 'moderate', label: '🚶 Moderate' },
  { id: 'fast',     label: '🏃 Fast Track' },
]

const GoalsScreen = ({ data, setData, onNext, onBack }) => {
  const toggleGoal = (id) => {
    const current = data.primaryGoals || []
    setData(prev => ({
      ...prev,
      primaryGoals: current.includes(id)
        ? current.filter(g => g !== id)
        : [...current, id]
    }))
  }

  const canContinue = (data.primaryGoals || []).length > 0

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.textMid, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back
        </button>
        <ProgressDots total={4} current={1} />
        <button style={{ background: 'none', border: 'none', color: T.textLight, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          Skip
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px 24px 32px', overflowY: 'auto' }}>

        <FadeIn delay={0}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            What are your health goals? 🎯
          </h2>
          <p style={{ fontSize: 14, color: T.textLight, margin: '0 0 24px' }}>
            Select all that apply — you can always change these later
          </p>
        </FadeIn>

        {/* Goals grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {GOALS.map((goal, i) => {
            const selected = (data.primaryGoals || []).includes(goal.id)
            return (
              <FadeIn key={goal.id} delay={i * 60}>
                <div
                  onClick={() => toggleGoal(goal.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: `2px solid ${selected ? goal.color : T.border}`,
                    background: selected ? goal.bg : T.white,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: selected ? 'scale(1.01)' : 'scale(1)',
                    boxShadow: selected ? `0 4px 16px ${goal.color}22` : 'none',
                  }}
                >
                  {/* Icon box */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: selected ? goal.color : '#F5F5F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                    transition: 'all 0.2s',
                  }}>
                    {goal.emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: selected ? goal.color : T.text, marginBottom: 2 }}>
                      {goal.label}
                    </div>
                    <div style={{ fontSize: 12, color: T.textLight }}>
                      {goal.desc}
                    </div>
                  </div>

                  {/* Checkmark */}
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    border: `2px solid ${selected ? goal.color : T.border}`,
                    background: selected ? goal.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: selected ? 'scale(1.1)' : 'scale(1)',
                    flexShrink: 0,
                  }}>
                    {selected && <span style={{ color: 'white', fontSize: 12, fontWeight: 800 }}>✓</span>}
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>

        {/* Weekly pace */}
        <FadeIn delay={400}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>
            Weekly pace (optional)
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {PACES.map(pace => {
              const selected = data.pace === pace.id
              return (
                <div
                  key={pace.id}
                  onClick={() => setData(prev => ({ ...prev, pace: pace.id }))}
                  style={{
                    flex: 1, padding: '10px 6px',
                    borderRadius: 12,
                    border: `2px solid ${selected ? T.green : T.border}`,
                    background: selected ? T.greenLight : T.white,
                    textAlign: 'center',
                    fontSize: 12, fontWeight: 600,
                    color: selected ? T.greenDark : T.textMid,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {pace.label}
                </div>
              )
            })}
          </div>
        </FadeIn>

        <div style={{ marginTop: 28 }}>
          <Btn onClick={onNext} variant="green" disabled={!canContinue}>
            Continue →
          </Btn>
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3 — PERSONAL INFO
// ─────────────────────────────────────────────────────────────

const AGE_RANGES   = ['18-25', '26-35', '36-45', '46+']
// const GENDERS      = ['Male', 'Female']
const GENDERS = ['male', 'female']
const WEIGHT_OPTS  = ['< 60', '60-80', '80-100', '100+']
const ACTIVITIES   = [
  { id: 'sedentary', emoji: '🪑', label: 'Sedentary',        desc: 'Little to no exercise' },
  { id: 'light',     emoji: '🚶', label: 'Lightly Active',   desc: 'Light exercise 1-3 days/week' },
  { id: 'moderate',  emoji: '🏃', label: 'Moderately Active',desc: 'Moderate exercise 3-5 days/week' },
  { id: 'active',    emoji: '💪', label: 'Very Active',      desc: 'Hard exercise 6-7 days/week' },
]
const DIETS = ['None', 'Vegetarian', 'Vegan', 'Keto', 'Kosher', 'Other']
const MEAL_SCHEDULES = [
  { id: '3_main',   label: '3 Main Meals',     desc: 'Frequent smaller portions' },
  { id: '5_small',  label: '5 Small Meals',    desc: 'Frequent smaller portions' },
  { id: 'intermit', label: 'Intermittent Fasting', desc: '16:8 restricted eating' },
]

const PersonalInfoScreen = ({ data, setData, onNext, onBack }) => {

  const SectionTitle = ({ children }) => (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '20px 0 10px' }}>
      {children}
    </h3>
  )

  const ChipGrid = ({ options, value, onChange, cols = 4 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
      {options.map(opt => {
        const val = typeof opt === 'object' ? opt.id : opt
        const label = typeof opt === 'object' ? opt.label : opt
        const selected = value === val
        return (
          <div key={val} onClick={() => onChange(val)} style={{
            padding: '10px 6px', borderRadius: 10, textAlign: 'center',
            border: `2px solid ${selected ? T.green : T.border}`,
            background: selected ? T.greenLight : T.white,
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: selected ? T.greenDark : T.textMid,
            transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
            transform: selected ? 'scale(1.04)' : 'scale(1)',
          }}>
            {label}
          </div>
        )
      })}
    </div>
  )

  const canContinue = data.ageRange && data.activityLevel

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.textMid, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          ← Back
        </button>
        <ProgressDots total={4} current={2} />
        <button style={{ background: 'none', border: 'none', color: T.textLight, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          Skip
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px 24px 32px', overflowY: 'auto' }}>

        <FadeIn>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            Tell us about yourself
          </h2>
          <p style={{ fontSize: 14, color: T.textLight, margin: '0 0 4px' }}>
            This helps us personalize your nutrition plan
          </p>
        </FadeIn>

        {/* Basic Info */}
        <FadeIn delay={80}>
          <SectionTitle>🧍 Basic Information</SectionTitle>
          <p style={{ fontSize: 12, color: T.textLight, marginBottom: 8 }}>Age Range</p>
          <ChipGrid options={AGE_RANGES} value={data.ageRange} onChange={v => setData(p => ({ ...p, ageRange: v }))} cols={4} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
            <div>
              <p style={{ fontSize: 12, color: T.textLight, marginBottom: 8 }}>Gender</p>
              <ChipGrid options={GENDERS} value={data.gender} onChange={v => setData(p => ({ ...p, gender: v.toLowerCase() }))} cols={2} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: T.textLight, marginBottom: 8 }}>Weight (kg)</p>
              <ChipGrid options={WEIGHT_OPTS} value={data.weightRange} onChange={v => setData(p => ({
                ...p, weightRange: v,
                currentWeightKg: v === '< 60' ? 55 : v === '60-80' ? 70 : v === '80-100' ? 90 : 110
              }))} cols={2} />
            </div>
          </div>
        </FadeIn>

        {/* Activity */}
        <FadeIn delay={160}>
          <SectionTitle>🏃 Activity Level</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ACTIVITIES.map(act => {
              const selected = data.activityLevel === act.id
              return (
                <div key={act.id} onClick={() => setData(p => ({ ...p, activityLevel: act.id }))} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  border: `2px solid ${selected ? T.green : T.border}`,
                  background: selected ? T.greenLight : T.white,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 20 }}>{act.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: selected ? T.greenDark : T.text }}>{act.label}</div>
                    <div style={{ fontSize: 12, color: T.textLight }}>{act.desc}</div>
                  </div>
                  {selected && <span style={{ color: T.green, fontSize: 16, fontWeight: 800 }}>✓</span>}
                </div>
              )
            })}
          </div>
        </FadeIn>

        {/* Diet */}
        <FadeIn delay={240}>
          <SectionTitle>🥗 Dietary Preferences</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {DIETS.map(diet => {
              const selected = data.dietPreference === diet.toLowerCase()
              return (
                <div key={diet} onClick={() => setData(p => ({ ...p, dietPreference: diet === 'None' ? 'non-vegetarian' : diet.toLowerCase() }))} style={{
                  padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                  border: `2px solid ${selected ? T.green : T.border}`,
                  background: selected ? T.greenLight : T.white,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: selected ? T.greenDark : T.textMid,
                  transition: 'all 0.2s',
                }}>
                  {diet}
                </div>
              )
            })}
          </div>
        </FadeIn>

        {/* Allergies */}
        <FadeIn delay={300}>
          <SectionTitle>⚠️ Allergies (optional)</SectionTitle>
          <input
            value={data.allergies || ''}
            onChange={e => setData(p => ({ ...p, allergies: e.target.value }))}
            placeholder="List any food allergies or intolerances..."
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: 12, border: `1.5px solid ${T.border}`,
              fontSize: 14, fontFamily: 'inherit', color: T.text,
              background: T.white, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = T.green}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </FadeIn>

        {/* Meal schedule */}
        <FadeIn delay={360}>
          <SectionTitle>🍽️ Preferred Meal Schedule</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MEAL_SCHEDULES.map(ms => {
              const selected = data.mealSchedule === ms.id
              return (
                <div key={ms.id} onClick={() => setData(p => ({ ...p, mealSchedule: ms.id }))} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 12,
                  border: `2px solid ${selected ? T.green : T.border}`,
                  background: selected ? T.greenLight : T.white,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: selected ? T.greenDark : T.text }}>{ms.label}</div>
                    <div style={{ fontSize: 12, color: T.textLight }}>{ms.desc}</div>
                  </div>
                  {selected && <span style={{ color: T.green, fontSize: 16 }}>✓</span>}
                </div>
              )
            })}
          </div>
        </FadeIn>

        {/* Notifications */}
        <FadeIn delay={420}>
          <div style={{
            margin: '20px 0 4px', padding: '14px 16px',
            borderRadius: 14, background: `linear-gradient(135deg, ${T.greenLight}, #FFF8E1)`,
            border: `1px solid ${T.greenMid}`, textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: T.greenDark, fontWeight: 600, marginBottom: 10 }}>
              🔔 Stay on track with reminders
            </p>
            <p style={{ fontSize: 12, color: T.textMid, marginBottom: 12 }}>
              Get gentle nudges for meals, water, sleep, and habit tracking
            </p>
            <Btn variant="green" onClick={() => {}} style={{ padding: '12px 24px' }}>
              Enable Notifications
            </Btn>
          </div>
        </FadeIn>

        <div style={{ marginTop: 20 }}>
          <Btn onClick={onNext} variant="primary" disabled={!canContinue}>
            Continue →
          </Btn>
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4 — ALL SET
// ─────────────────────────────────────────────────────────────

const AllSetScreen = ({ data, onComplete, onBack }) => {

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [dots, setDots]       = useState(0)
  const targets = calculateTargets(data)

  // Animated dots for loading text
  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setDots(d => (d + 1) % 4), 400)
    return () => clearInterval(t)
  }, [loading])

  const goalLabels = {
    lose_weight: 'Lose weight', build_muscle: 'Build muscle',
    improve_energy: 'Improve energy', manage_sugar: 'Manage sugar',
    eat_healthier: 'Eat healthier', general_wellness: 'General wellness'
  }

  const handleGo = async () => {
    setLoading(true)
    setError('')
    try {
      // Build complete user payload
      const payload = {
        name:             data.name || 'Friend',
        email:            data.email || `user_${Date.now()}@yolo.app`,
        age:              data.ageRange === '18-25' ? 22 : data.ageRange === '26-35' ? 30 : data.ageRange === '36-45' ? 40 : 50,
        gender:           data.gender || 'male',
        heightCm:         data.heightCm || 170,
        currentWeightKg:  data.currentWeightKg || 70,
        goalWeightKg:     data.goalWeightKg || 65,
        activityLevel:    data.activityLevel || 'moderate',
        dietPreference:   data.dietPreference || 'non-vegetarian',
        allergies:        data.allergies || 'none',
        primaryGoal:      (data.primaryGoals || ['lose_weight'])[0],
        calorieTarget:    targets.calorieTarget,
        proteinTarget:    targets.proteinTarget,
      }

      const result = await registerUser(payload)
      localStorage.setItem('yolo_userId',   result.user._id)
      localStorage.setItem('yolo_userName', result.user.name)
      onComplete(result.user._id)

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const selectedGoals = (data.primaryGoals || []).slice(0, 3)
  const activityMap = { sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Very Active' }
  const mealMap = { '3_main': '3 Meals', '5_small': '5 Meals', intermit: 'IF Diet' }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>

      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.textMid, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          ← Back
        </button>
        <ProgressDots total={4} current={3} />
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, padding: '20px 24px 32px', overflowY: 'auto' }}>

        {/* Checkmark hero */}
        <FadeIn style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `linear-gradient(135deg, ${T.green}, ${T.greenDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 32px ${T.green}44`,
            fontSize: 36,
            animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            ✅
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            You're all set! 🎉
          </h2>
          <p style={{ fontSize: 14, color: T.textLight }}>
            Your personalized nutrition journey is ready to begin
          </p>
        </FadeIn>

        {/* Goals summary */}
        <FadeIn delay={120}>
          <div style={{
            background: T.white, borderRadius: 16,
            border: `1px solid ${T.border}`,
            padding: '16px 18px', marginBottom: 14,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
              Your Goals
            </h3>
            {selectedGoals.map((g, i) => (
              <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < selectedGoals.length - 1 ? 8 : 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: T.green, fontSize: 12, fontWeight: 800 }}>✓</span>
                </div>
                <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{goalLabels[g] || g}</span>
              </div>
            ))}
            {selectedGoals.length === 0 && (
              <p style={{ fontSize: 13, color: T.textLight }}>General wellness & healthy habits</p>
            )}
          </div>
        </FadeIn>

        {/* Profile chips */}
        <FadeIn delay={200}>
          <div style={{
            background: T.white, borderRadius: 16,
            border: `1px solid ${T.border}`,
            padding: '16px 18px', marginBottom: 14,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
              Your Profile
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                data.ageRange || '26-35',
                data.dietPreference ? data.dietPreference.charAt(0).toUpperCase() + data.dietPreference.slice(1) : 'Vegetarian',
                activityMap[data.activityLevel] || 'Moderate',
                mealMap[data.mealSchedule] || '3 Meals',
              ].map((chip, i) => (
                <span key={i} style={{
                  padding: '6px 14px', borderRadius: 20,
                  background: T.greenLight, color: T.greenDark,
                  fontSize: 13, fontWeight: 600,
                  border: `1px solid ${T.greenMid}`,
                }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* First week steps */}
        <FadeIn delay={280}>
          <div style={{
            background: T.white, borderRadius: 16,
            border: `1px solid ${T.border}`,
            padding: '16px 18px', marginBottom: 14,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
              Your First Week
            </h3>
            {[
              { emoji: '⚙️', text: 'Set up your food preferences' },
              { emoji: '🥗', text: 'Start logging your meals' },
              { emoji: '✅', text: 'Track 5 habits to establish goals' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
                <span style={{ fontSize: 16 }}>{item.emoji}</span>
                <span style={{ fontSize: 14, color: T.textMid }}>{item.text}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Motivation banner */}
        <FadeIn delay={360}>
          <div style={{
            borderRadius: 16, padding: '16px 18px', marginBottom: 14,
            background: `linear-gradient(135deg, ${T.green} 0%, ${T.greenDark} 100%)`,
            boxShadow: `0 8px 24px ${T.green}44`,
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: T.white, marginBottom: 6 }}>
              🦅 You've Got This!
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
              Small steps lead to big changes. We're here to support you every step.
            </p>
          </div>
        </FadeIn>

        {/* What's coming next */}
        <FadeIn delay={440}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textMid, marginBottom: 12 }}>
            What's Coming Next
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
            {[
              { emoji: '🥗', label: 'Meal Tracking' },
              { emoji: '📊', label: 'Progress Charts' },
              { emoji: '🤖', label: 'Smart Reminders' },
              { emoji: '🏆', label: 'Achievements' },
            ].map(item => (
              <div key={item.label} style={{
                background: T.white, borderRadius: 12,
                border: `1px solid ${T.border}`,
                padding: '12px 6px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{item.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.textLight, lineHeight: 1.3 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Error */}
        {error && (
          <div style={{
            background: T.redLight, color: T.red,
            padding: '10px 14px', borderRadius: 10,
            fontSize: 13, marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        <FadeIn delay={520}>
          <Btn onClick={handleGo} variant="green" disabled={loading}>
            {loading
              ? `Setting up your plan${'.'.repeat(dots)}`
              : "Go to Dashboard 🚀"}
          </Btn>
          <p style={{ textAlign: 'center', fontSize: 12, color: T.textLight, marginTop: 12 }}>
            Ready to start your healthy journey 🌱
          </p>
        </FadeIn>

      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL COLLECTION MODAL
// Shown before Screen 4 to collect name + email
// ─────────────────────────────────────────────────────────────

const EmailModal = ({ data, setData, onNext, onBack }) => {
  const canContinue = data.name?.trim() && data.email?.trim()

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.textMid, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          ← Back
        </button>
        <ProgressDots total={4} current={2} />
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 28px' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 8, letterSpacing: '-0.5px' }}>
              One last thing!
            </h2>
            <p style={{ fontSize: 14, color: T.textLight }}>
              Save your progress with your name and email
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.textMid, display: 'block', marginBottom: 6 }}>
              Your name
            </label>
            <input
              value={data.name || ''}
              onChange={e => setData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Rahul Sharma"
              autoFocus
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 12, border: `1.5px solid ${T.border}`,
                fontSize: 15, fontFamily: 'inherit', color: T.text,
                background: T.white, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = T.green}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.textMid, display: 'block', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={data.email || ''}
              onChange={e => setData(p => ({ ...p, email: e.target.value }))}
              placeholder="rahul@gmail.com"
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 12, border: `1.5px solid ${T.border}`,
                fontSize: 15, fontFamily: 'inherit', color: T.text,
                background: T.white, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = T.green}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <Btn onClick={onNext} variant="green" disabled={!canContinue}>
            See my personalized plan →
          </Btn>
        </FadeIn>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN ONBOARDING CONTROLLER
// ─────────────────────────────────────────────────────────────

/**
 * Onboarding — root component managing all 5 steps
 *
 * Step flow:
 * 0 → Welcome
 * 1 → Goals
 * 2 → Personal info
 * 3 → Email collection
 * 4 → All set
 */
const Onboarding = ({ onComplete, onLogin }) => {

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back

  // All collected data lives here
  const [data, setData] = useState({
    primaryGoals:  [],
    pace:          'moderate',
    ageRange:      '',
    gender:        'male',
    weightRange:   '',
    currentWeightKg: 70,
    goalWeightKg:  65,
    heightCm:      170,
    activityLevel: '',
    dietPreference:'non-vegetarian',
    allergies:     '',
    mealSchedule:  '3_main',
    name:          '',
    email:         '',
  })

  const goNext = () => {
    setDirection(1)
    setStep(s => s + 1)
    // Scroll to top when moving between screens
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setDirection(-1)
    setStep(s => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Render current step
  const screens = [
    <WelcomeScreen     key={0} onNext={goNext} onLogin={onLogin} />,
    <GoalsScreen       key={1} data={data} setData={setData} onNext={goNext} onBack={goBack} />,
    <PersonalInfoScreen key={2} data={data} setData={setData} onNext={goNext} onBack={goBack} />,
    <EmailModal        key={3} data={data} setData={setData} onNext={goNext} onBack={goBack} />,
    <AllSetScreen      key={4} data={data} onComplete={onComplete} onBack={goBack} />,
  ]

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto',
      minHeight: '100vh',
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Screen with slide transition */}
      <div
        key={step}
        style={{
          animation: `slideIn${direction > 0 ? 'Right' : 'Left'} 0.32s cubic-bezier(0.4,0,0.2,1) both`,
        }}
      >
        {screens[step]}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-40px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        * { box-sizing: border-box; }
        input { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 2px; }
      `}</style>

    </div>
  )
}

export default Onboarding