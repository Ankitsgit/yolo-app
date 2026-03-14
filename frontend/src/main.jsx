/**
 * main.jsx — Vite + React application entry point
 *
 * Mounts root App component into #root div in index.html.
 * StrictMode highlights potential problems during development —
 * it renders components twice in dev to catch side effects.
 */

// 🧠 LEARN: in Vite, this is main.jsx not index.js
// but it does exactly the same thing — boots up React
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
