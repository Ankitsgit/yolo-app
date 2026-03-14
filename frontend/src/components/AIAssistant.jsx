/**
 * AIAssistant.jsx — Gemini-powered nutrition chat
 *
 * Maintains conversation history in local state.
 * Each message sent to backend includes userId so
 * the backend can attach real DB context before
 * calling Gemini API.
 *
 * Props:
 *   userId {string} — MongoDB user _id
 */

import React, { useState, useRef, useEffect } from 'react'
import { sendAIMessage } from '../services/api'

// Quick-prompt suggestions shown above chat input
// 🧠 LEARN: this is a constant — never changes, so outside component
const QUICK_PROMPTS = [
  'What should I eat for dinner?',
  'Am I on track today?',
  'High-protein snack under 200 cal?',
  'How to reduce bloating?',
  'Motivate me to not quit!',
]

const AIAssistant = ({ userId }) => {

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hi! I'm your YOLO nutrition buddy 🌱 I can see your today's progress. Ask me anything about food, habits, or staying on track!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  // 🧠 LEARN: useRef gives us a direct reference to a DOM element
  // We use it to auto-scroll to the latest message
  const chatEndRef = useRef(null)

  // Auto-scroll to bottom whenever messages update
  // 🧠 LEARN: scrollIntoView makes the browser scroll
  // so that element is visible on screen
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    // Add user message to chat immediately
    // 🧠 LEARN: ...prev spreads existing messages, then adds new one
    setMessages(prev => [...prev, { role: 'user', text: messageText }])
    setInput('')
    setLoading(true)

    try {
      const data = await sendAIMessage(userId, messageText)

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I had trouble connecting. Please try again!'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>

      {/* Header */}
      <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', marginBottom: '1rem' }}>
        AI nutrition assistant
      </h3>

      {/* Chat messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        gap: 10, marginBottom: 12,
        maxHeight: 300, paddingRight: 4
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 8, alignItems: 'flex-start'
            }}
          >
            {/* AI avatar */}
            {msg.role === 'ai' && (
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: '#E1F5EE', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0
              }}>🌱</div>
            )}

            {/* Message bubble */}
            <div style={{
              maxWidth: '80%',
              padding: '9px 13px',
              borderRadius: msg.role === 'user'
                ? '14px 4px 14px 14px'
                : '4px 14px 14px 14px',
              background: msg.role === 'user' ? '#1D9E75' : '#f3f4f6',
              color: msg.role === 'user' ? 'white' : '#1a1a1a',
              fontSize: 13, lineHeight: 1.5
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#E1F5EE', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 14
            }}>🌱</div>
            <div style={{
              padding: '9px 13px', borderRadius: '4px 14px 14px 14px',
              background: '#f3f4f6', display: 'flex', gap: 4, alignItems: 'center'
            }}>
              {/* 🧠 LEARN: these dots use CSS animation defined in index.css */}
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#999',
                  animation: `pulse 1.2s infinite ${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Invisible div at bottom — scroll target */}
        <div ref={chatEndRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            style={{
              fontSize: 11, padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid #d1d5db',
              background: 'white', color: '#666',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = '#1D9E75'
              e.target.style.color = '#1D9E75'
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = '#d1d5db'
              e.target.style.color = '#666'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about nutrition, meals, habits..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{ padding: '10px 16px', flexShrink: 0 }}
        >
          Send
        </button>
      </div>

    </div>
  )
}

export default AIAssistant