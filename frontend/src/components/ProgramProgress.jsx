/**
 * ProgramProgress.jsx — 14-day program completion tracker
 *
 * Shows visual progress bar + day dots for all 14 days.
 * A day counts as "completed" if habit score >= 3.
 * Data comes from HabitLog collection via streak endpoint.
 *
 * Props:
 *   currentDay  {number} — which day they're on
 *   consistency {number} — % from streak endpoint
 *   streak      {number} — current streak count
 */

import React from 'react'

// const ProgramProgress = ({ currentDay,selectedDay,  consistency, streak }) => {

  // 🧠 LEARN: Array.from creates array from a length
  // Array.from({ length: 14 }, (_, i) => i + 1)
  // creates [1, 2, 3, ..., 14]
//   const days = Array.from({ length: 14 }, (_, i) => i + 1)

//   const progressPct = Math.round((currentDay / 14) * 100)

//   // Color for each day dot based on status
//   // 🧠 LEARN: function returning different colors based on condition
//   const getDotColor = (day) => {
//     if (day < currentDay)  return '#1D9E75'   // completed
//     if (day === currentDay) return '#9FE1CB'   // today
//     return '#e5e7eb'                            // future
//   }

//   return (
//     <div className="card">

//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//         <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
//           Program progress
//         </h3>
//         <span style={{ fontSize: 22, fontWeight: 600, color: '#1D9E75' }}>
//           {progressPct}%
//         </span>
//       </div>

//       {/* Main progress bar */}
//       <div style={{ height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
//         <div style={{
//           height: '100%',
//           width: `${progressPct}%`,
//           background: 'linear-gradient(90deg, #1D9E75, #9FE1CB)',
//           borderRadius: 5,
//           transition: 'width 0.6s ease'
//         }} />
//       </div>

//       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
//         <span style={{ fontSize: 12, color: '#666' }}>Day {currentDay} of 14</span>
//         <span style={{ fontSize: 12, color: '#666' }}>{14 - currentDay} days left</span>
//       </div>

//       {/* 14 day dots */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 4 }}>
//         {days.map(day => (
//           <div
//             key={day}
//             title={`Day ${day}`}
//             style={{
//               height: 24, borderRadius: 4,
//               background: getDotColor(day),
//               border: day === currentDay ? '2px solid #1D9E75' : 'none',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 9, color: day < currentDay ? 'white' : 'transparent',
//               transition: 'all 0.2s'
//             }}
//           >
//             {day < currentDay ? '✓' : ''}
//           </div>
//         ))}
//       </div>

//       {/* Stats row */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
//         <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
//           <div style={{ fontSize: 20, fontWeight: 600 }}>{streak} 🔥</div>
//           <div style={{ fontSize: 11, color: '#999' }}>day streak</div>
//         </div>
//         <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
//           <div style={{ fontSize: 20, fontWeight: 600 }}>{consistency}%</div>
//           <div style={{ fontSize: 11, color: '#999' }}>consistency</div>
//         </div>
//       </div>

//     </div>
//   )
// }

// export default ProgramProgress

// Update props
const ProgramProgress = ({ currentDay, selectedDay, consistency, streak }) => {

  const days = Array.from({ length: 14 }, (_, i) => i + 1)
  const progressPct = Math.round((currentDay / 14) * 100)

  // 🧠 LEARN: three-way color logic
  // selected (viewing) = amber ring
  // completed past today = green
  // today = light green
  // future = gray
  const getDotStyle = (day) => {
    const isSelected  = day === selectedDay
    const isCompleted = day < currentDay
    const isToday     = day === currentDay
    const isFuture    = day > currentDay

    return {
      height: 24,
      borderRadius: 4,
      background:
        isCompleted ? '#1D9E75' :
        isToday     ? '#9FE1CB' :
        '#e5e7eb',
      // Selected day gets an amber ring regardless of status
      border: isSelected
        ? '2px solid #EF9F27'
        : isToday ? '2px solid #1D9E75'
        : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9,
      color: isCompleted ? 'white' : 'transparent',
      transition: 'all 0.2s',
      cursor: 'default',
      opacity: isFuture ? 0.5 : 1
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
          Program progress
        </h3>
        <span style={{ fontSize: 22, fontWeight: 600, color: '#1D9E75' }}>
          {progressPct}%
        </span>
      </div>

      <div style={{ height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: 'linear-gradient(90deg, #1D9E75, #9FE1CB)',
          borderRadius: 5, transition: 'width 0.6s ease'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#666' }}>Day {currentDay} of 14</span>
        <span style={{ fontSize: 12, color: '#666' }}>{14 - currentDay} days remaining</span>
      </div>

      {/* 14 day dots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 4 }}>
        {days.map(day => (
          <div key={day} title={`Day ${day}`} style={getDotStyle(day)}>
            {day < currentDay ? '✓' : ''}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        {[
          { color: '#1D9E75', label: 'Done' },
          { color: '#9FE1CB', border: '#1D9E75', label: 'Today' },
          { color: '#e5e7eb', border: '#EF9F27', label: 'Viewing' },
          { color: '#e5e7eb', label: 'Upcoming' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 2,
              background: item.color,
              border: `1.5px solid ${item.border || item.color}`
            }} />
            <span style={{ fontSize: 11, color: '#999' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{streak} 🔥</div>
          <div style={{ fontSize: 11, color: '#999' }}>day streak</div>
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{consistency}%</div>
          <div style={{ fontSize: 11, color: '#999' }}>consistency</div>
        </div>
      </div>
    </div>
  )
}
export default ProgramProgress