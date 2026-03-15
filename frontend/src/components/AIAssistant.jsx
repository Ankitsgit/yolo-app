// /**
//  * AIAssistant.jsx — Gemini-powered nutrition chat
//  *
//  * Maintains conversation history in local state.
//  * Each message sent to backend includes userId so
//  * the backend can attach real DB context before
//  * calling Gemini API.
//  *
//  * Props:
//  *   userId {string} — MongoDB user _id
//  */

// import React, { useState, useRef, useEffect } from 'react'
// import { sendAIMessage } from '../services/api'

// // Quick-prompt suggestions shown above chat input
// // 🧠 LEARN: this is a constant — never changes, so outside component
// const QUICK_PROMPTS = [
//   'What should I eat for dinner?',
//   'Am I on track today?',
//   'High-protein snack under 200 cal?',
//   'How to reduce bloating?',
//   'Motivate me to not quit!',
// ]

// const AIAssistant = ({ userId }) => {

//   const [messages, setMessages] = useState([
//     {
//       role: 'ai',
//       text: "Hi! I'm your YOLO nutrition buddy 🌱 I can see your today's progress. Ask me anything about food, habits, or staying on track!"
//     }
//   ])
//   const [input, setInput] = useState('')
//   const [loading, setLoading] = useState(false)

//   // 🧠 LEARN: useRef gives us a direct reference to a DOM element
//   // We use it to auto-scroll to the latest message
//   const chatEndRef = useRef(null)

//   // Auto-scroll to bottom whenever messages update
//   // 🧠 LEARN: scrollIntoView makes the browser scroll
//   // so that element is visible on screen
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const sendMessage = async (text) => {
//     const messageText = text || input.trim()
//     if (!messageText || loading) return

//     // Add user message to chat immediately
//     // 🧠 LEARN: ...prev spreads existing messages, then adds new one
//     setMessages(prev => [...prev, { role: 'user', text: messageText }])
//     setInput('')
//     setLoading(true)

//     try {
//       const data = await sendAIMessage(userId, messageText)

//       // Add AI response to chat
//       setMessages(prev => [...prev, { role: 'ai', text: data.reply }])

//     } catch (err) {
//       setMessages(prev => [...prev, {
//         role: 'ai',
//         text: 'Sorry, I had trouble connecting. Please try again!'
//       }])
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>

//       {/* Header */}
//       <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', marginBottom: '1rem' }}>
//         AI nutrition assistant
//       </h3>

//       {/* Chat messages */}
//       <div style={{
//         flex: 1, overflowY: 'auto',
//         display: 'flex', flexDirection: 'column',
//         gap: 10, marginBottom: 12,
//         maxHeight: 300, paddingRight: 4
//       }}>
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             style={{
//               display: 'flex',
//               justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
//               gap: 8, alignItems: 'flex-start'
//             }}
//           >
//             {/* AI avatar */}
//             {msg.role === 'ai' && (
//               <div style={{
//                 width: 28, height: 28, borderRadius: 8,
//                 background: '#E1F5EE', display: 'flex',
//                 alignItems: 'center', justifyContent: 'center',
//                 fontSize: 14, flexShrink: 0
//               }}>🌱</div>
//             )}

//             {/* Message bubble */}
//             <div style={{
//               maxWidth: '80%',
//               padding: '9px 13px',
//               borderRadius: msg.role === 'user'
//                 ? '14px 4px 14px 14px'
//                 : '4px 14px 14px 14px',
//               background: msg.role === 'user' ? '#1D9E75' : '#f3f4f6',
//               color: msg.role === 'user' ? 'white' : '#1a1a1a',
//               fontSize: 13, lineHeight: 1.5
//             }}>
//               {msg.text}
//             </div>
//           </div>
//         ))}

//         {/* Typing indicator */}
//         {loading && (
//           <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
//             <div style={{
//               width: 28, height: 28, borderRadius: 8,
//               background: '#E1F5EE', display: 'flex',
//               alignItems: 'center', justifyContent: 'center', fontSize: 14
//             }}>🌱</div>
//             <div style={{
//               padding: '9px 13px', borderRadius: '4px 14px 14px 14px',
//               background: '#f3f4f6', display: 'flex', gap: 4, alignItems: 'center'
//             }}>
//               {/* 🧠 LEARN: these dots use CSS animation defined in index.css */}
//               {[0,1,2].map(i => (
//                 <div key={i} style={{
//                   width: 6, height: 6, borderRadius: '50%',
//                   background: '#999',
//                   animation: `pulse 1.2s infinite ${i * 0.2}s`
//                 }} />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Invisible div at bottom — scroll target */}
//         <div ref={chatEndRef} />
//       </div>

//       {/* Quick prompts */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
//         {QUICK_PROMPTS.map(prompt => (
//           <button
//             key={prompt}
//             onClick={() => sendMessage(prompt)}
//             disabled={loading}
//             style={{
//               fontSize: 11, padding: '4px 10px',
//               borderRadius: 20,
//               border: '1px solid #d1d5db',
//               background: 'white', color: '#666',
//               cursor: 'pointer', fontFamily: 'inherit',
//               transition: 'all 0.15s'
//             }}
//             onMouseEnter={e => {
//               e.target.style.borderColor = '#1D9E75'
//               e.target.style.color = '#1D9E75'
//             }}
//             onMouseLeave={e => {
//               e.target.style.borderColor = '#d1d5db'
//               e.target.style.color = '#666'
//             }}
//           >
//             {prompt}
//           </button>
//         ))}
//       </div>

//       {/* Input row */}
//       <div style={{ display: 'flex', gap: 8 }}>
//         <input
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => e.key === 'Enter' && sendMessage()}
//           placeholder="Ask about nutrition, meals, habits..."
//           style={{ flex: 1 }}
//           disabled={loading}
//         />
//         <button
//           onClick={() => sendMessage()}
//           disabled={loading || !input.trim()}
//           className="btn btn-primary"
//           style={{ padding: '10px 16px', flexShrink: 0 }}
//         >
//           Send
//         </button>
//       </div>

//     </div>
//   )
// }

// export default AIAssistant

/**
 * AIAssistant.jsx — Redesigned AI nutrition chat
 * Same API logic. Premium chat UI with teal AI bubbles.
 */

import React, { useState, useRef, useEffect } from 'react'
import { sendAIMessage } from '../services/api'

const T = {
  green: '#4CAF50', greenDark: '#388E3C', greenLight: '#E8F5E9',
  greenMid: '#81C784', teal: '#0D9488', tealLight: '#F0FDFA',
  tealMid: '#99F6E4', text: '#1A1A2E', textMid: '#4A4A6A',
  textLight: '#8888AA', white: '#FFFFFF', border: '#E8EDE8', bg: '#F4F6F3',
}

const QUICK_PROMPTS = [
  "What should I eat for dinner?",
  "Am I on track today?",
  "High-protein snack under 200 cal?",
  "How to reduce bloating?",
  "Motivate me to not quit!",
]

const AIAssistant = ({ userId }) => {
  const [messages, setMessages] = useState([{
    role: 'ai',
    text: "Hi! I'm your YOLO nutrition buddy 🌱 I can see your today's progress. Ask me anything about food, habits, or staying on track!",
  }])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)
    try {
      const data = await sendAIMessage(userId, msg)
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection issue. Please try again!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: T.white, borderRadius: 20,
      border: `1px solid ${T.border}`,
      padding: '22px 24px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 420,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.9px' }}>
          AI Nutrition Assistant
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: T.tealLight, padding: '4px 10px', borderRadius: 20,
          border: `1px solid ${T.tealMid}`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, animation: 'blink 2s ease infinite' }} />
          <span style={{ fontSize: 11, color: T.teal, fontWeight: 700 }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 10,
        marginBottom: 12, maxHeight: 300, paddingRight: 2,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 8, alignItems: 'flex-end',
          }}>

            {msg.role === 'ai' && (
              <div style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: `linear-gradient(135deg, ${T.tealLight}, ${T.tealMid})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, border: `1px solid ${T.tealMid}`,
              }}>🌱</div>
            )}

            <div style={{
              maxWidth: '78%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user'
                ? '16px 4px 16px 16px'
                : '4px 16px 16px 16px',
              background: msg.role === 'user'
                ? `linear-gradient(135deg, ${T.green}, ${T.greenDark})`
                : T.tealLight,
              color: msg.role === 'user' ? 'white' : T.text,
              fontSize: 13, lineHeight: 1.55, fontWeight: 500,
              border: msg.role === 'ai' ? `1px solid ${T.tealMid}` : 'none',
              boxShadow: msg.role === 'user'
                ? '0 2px 10px rgba(76,175,80,0.25)'
                : '0 1px 4px rgba(0,0,0,0.05)',
              animation: 'fadeUp 0.25s ease',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: T.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: `1px solid ${T.tealMid}`, flexShrink: 0 }}>
              🌱
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: T.tealLight, border: `1px solid ${T.tealMid}`, display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: T.teal,
                  animation: `bounce 1.2s ease infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={loading}
            style={{
              fontSize: 11, padding: '5px 11px', borderRadius: 20,
              border: `1.5px solid ${T.border}`, background: T.bg,
              color: T.textMid, cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 600, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.teal; e.currentTarget.style.color = T.teal; e.currentTarget.style.background = T.tealLight }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid; e.currentTarget.style.background = T.bg }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about nutrition, meals, habits..."
          disabled={loading}
          style={{
            flex: 1, padding: '11px 16px',
            borderRadius: 12, border: `1.5px solid ${T.border}`,
            fontSize: 13, fontFamily: 'inherit', color: T.text,
            background: T.white, outline: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = T.teal}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 44, height: 44, borderRadius: 12, border: 'none',
            background: loading || !input.trim()
              ? T.bg
              : `linear-gradient(135deg, ${T.teal}, #0F766E)`,
            color: loading || !input.trim() ? T.textLight : 'white',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'all 0.15s', flexShrink: 0,
            boxShadow: loading || !input.trim() ? 'none' : '0 4px 12px rgba(13,148,136,0.30)',
          }}
        >
          →
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); opacity:0.4; }
          40% { transform: translateY(-5px); opacity:1; }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50% { opacity:0.3; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default AIAssistant