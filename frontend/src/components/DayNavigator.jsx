// /**
//  * DayNavigator.jsx — 14-day navigation bar
//  *
//  * Shows all 14 days as clickable pills.
//  * Highlights today, marks past days, previews future.
//  * Compact horizontal scroll on mobile.
//  *
//  * Props:
//  *   currentDay   {number} — actual today (from DB)
//  *   selectedDay  {number} — currently viewed day
//  *   onSelect     {function} — called with new day number
//  */

// import React, { useRef } from 'react'

// const DayNavigator = ({ currentDay, selectedDay, onSelect }) => {

//   // 🧠 LEARN: useRef on a div gives us the actual DOM element
//   // so we can scroll it programmatically
//   const scrollRef = useRef(null)

//   const days = Array.from({ length: 14 }, (_, i) => i + 1)

//   /**
//    * getDayStatus — returns style variant for each day pill
//    * past: completed days before today
//    * today: actual current day
//    * selected: whichever day user is viewing
//    * future: days not yet reached
//    */
//   const getDayStatus = (day) => {
//     if (day === selectedDay) return 'selected'
//     if (day < currentDay)   return 'past'
//     if (day === currentDay) return 'today'
//     return 'future'
//   }

//   // Style map — each status gets different visual treatment
//   // 🧠 LEARN: object lookup is cleaner than long if/else chains
//   const pillStyles = {
//     selected: {
//       background: '#1D9E75',
//       color: 'white',
//       border: '2px solid #1D9E75',
//       fontWeight: 600
//     },
//     today: {
//       background: '#E1F5EE',
//       color: '#085041',
//       border: '2px solid #1D9E75',
//       fontWeight: 600
//     },
//     past: {
//       background: '#f9fafb',
//       color: '#666',
//       border: '1px solid #e5e7eb',
//       fontWeight: 400
//     },
//     future: {
//       background: 'white',
//       color: '#aaa',
//       border: '1px dashed #e5e7eb',
//       fontWeight: 400
//     }
//   }

//   return (
//     <div style={{
//       background: 'white',
//       borderRadius: 12,
//       border: '1px solid #e5e7eb',
//       padding: '12px 16px',
//       marginBottom: 16
//     }}>

//       {/* Header row */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//         <span style={{ fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//           14-Day Program
//         </span>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           {selectedDay !== currentDay && (
//             // 🧠 LEARN: show "back to today" button only when
//             // user has navigated away from current day
//             <button
//               onClick={() => onSelect(currentDay)}
//               style={{
//                 fontSize: 11, padding: '3px 10px',
//                 borderRadius: 10, border: '1px solid #1D9E75',
//                 background: '#E1F5EE', color: '#085041',
//                 cursor: 'pointer', fontFamily: 'inherit',
//                 fontWeight: 500
//               }}
//             >
//               ← Back to today
//             </button>
//           )}
//           <span style={{ fontSize: 12, color: '#999' }}>
//             {selectedDay < currentDay ? '📖 History' :
//              selectedDay === currentDay ? '📍 Today' :
//              '👀 Preview'}
//           </span>
//         </div>
//       </div>

//       {/* Day pills — horizontal scroll on mobile */}
//       <div
//         ref={scrollRef}
//         style={{
//           display: 'flex',
//           gap: 6,
//           overflowX: 'auto',
//           paddingBottom: 4,
//           // Hide scrollbar visually but keep functional
//           scrollbarWidth: 'none',
//           msOverflowStyle: 'none',
//         }}
//       >
//         {days.map(day => {
//           const status = getDayStatus(day)
//           const style = pillStyles[status]

//           return (
//             <button
//               key={day}
//               onClick={() => onSelect(day)}
//               title={
//                 day < currentDay  ? `Day ${day} — completed` :
//                 day === currentDay ? `Day ${day} — today` :
//                 `Day ${day} — upcoming`
//               }
//               style={{
//                 minWidth: 44, height: 44,
//                 borderRadius: 10,
//                 display: 'flex', flexDirection: 'column',
//                 alignItems: 'center', justifyContent: 'center',
//                 cursor: 'pointer',
//                 fontFamily: 'inherit',
//                 fontSize: 13,
//                 transition: 'all 0.15s',
//                 flexShrink: 0,
//                 ...style
//               }}
//             >
//               <span style={{ fontSize: 13, fontWeight: style.fontWeight }}>
//                 {day}
//               </span>
//               {/* Small indicator dot below number */}
//               <div style={{
//                 width: 4, height: 4, borderRadius: '50%',
//                 marginTop: 2,
//                 background:
//                   day < currentDay  ? '#1D9E75' :
//                   day === currentDay ? '#1D9E75' :
//                   'transparent'
//               }} />
//             </button>
//           )
//         })}
//       </div>

//       {/* Legend */}
//       <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
//         {[
//           { color: '#1D9E75', label: 'Completed' },
//           { color: '#E1F5EE', label: 'Today', border: '#1D9E75' },
//           { color: '#f9fafb', label: 'Past', border: '#e5e7eb' },
//           { color: 'white',   label: 'Future', border: '#e5e7eb', dashed: true },
//         ].map(item => (
//           <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//             <div style={{
//               width: 12, height: 12, borderRadius: 3,
//               background: item.color,
//               border: `1px ${item.dashed ? 'dashed' : 'solid'} ${item.border || item.color}`
//             }} />
//             <span style={{ fontSize: 11, color: '#999' }}>{item.label}</span>
//           </div>
//         ))}
//       </div>

//     </div>
//   )
// }

// export default DayNavigator

/**
 * DayNavigator.jsx — Redesigned 14-day navigation bar
 * Same props and logic. New visual treatment.
 */

import React, { useRef } from 'react'

const T = {
  green: '#4CAF50', greenDark: '#388E3C', greenLight: '#E8F5E9',
  greenMid: '#81C784', orange: '#FF7043', text: '#1A1A2E',
  textMid: '#4A4A6A', textLight: '#8888AA', white: '#FFFFFF',
  border: '#E8EDE8', bg: '#F4F6F3',
}

const DayNavigator = ({ currentDay, selectedDay, onSelect }) => {
  const scrollRef = useRef(null)
  const days = Array.from({ length: 14 }, (_, i) => i + 1)

  const getStatus = (day) => {
    if (day === selectedDay) return 'selected'
    if (day < currentDay)   return 'past'
    if (day === currentDay) return 'today'
    return 'future'
  }

  return (
    <div style={{
      background: T.white,
      borderRadius: 20,
      border: `1px solid ${T.border}`,
      padding: '18px 22px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.9px' }}>
            14-Day Program
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {selectedDay !== currentDay && (
            <button
              onClick={() => onSelect(currentDay)}
              style={{
                fontSize: 12, padding: '5px 12px',
                borderRadius: 8, border: `1.5px solid ${T.green}`,
                background: T.greenLight, color: T.greenDark,
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                transition: 'all 0.15s',
              }}
            >
              ← Today
            </button>
          )}
          <span style={{
            fontSize: 12, fontWeight: 600, color: T.textLight,
            background: T.bg, padding: '4px 10px', borderRadius: 8,
          }}>
            {selectedDay < currentDay ? '📖 History' :
             selectedDay === currentDay ? '📍 Today' : '👀 Preview'}
          </span>
        </div>
      </div>

      {/* Day pills */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 6,
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        {days.map(day => {
          const status = getStatus(day)
          const isSelected  = status === 'selected'
          const isToday     = status === 'today'
          const isPast      = status === 'past'
          const isFuture    = status === 'future'

          return (
            <button
              key={day}
              onClick={() => onSelect(day)}
              title={`Day ${day}${isToday ? ' — today' : isPast ? ' — completed' : ' — upcoming'}`}
              style={{
                minWidth: 46, height: 54,
                borderRadius: 12,
                border: isSelected
                  ? `2px solid ${T.orange}`
                  : isToday
                  ? `2px solid ${T.green}`
                  : `1.5px solid ${isFuture ? T.border : T.border}`,
                background: isSelected
                  ? `linear-gradient(135deg, ${T.orange}, #FF5722)`
                  : isToday
                  ? `linear-gradient(135deg, ${T.green}, ${T.greenDark})`
                  : isPast
                  ? T.greenLight
                  : T.bg,
                color: isSelected || isToday ? 'white' : isPast ? T.greenDark : T.textLight,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: isSelected || isToday ? 800 : isPast ? 700 : 500,
                fontSize: 14,
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                flexShrink: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                opacity: isFuture ? 0.6 : 1,
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 4px 14px rgba(255,112,67,0.35)'
                  : isToday
                  ? '0 4px 14px rgba(76,175,80,0.30)'
                  : 'none',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 'inherit' }}>{day}</span>
              {/* Dot indicator */}
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: isSelected || isToday ? 'rgba(255,255,255,0.8)' :
                            isPast ? T.green : 'transparent',
              }} />
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { bg: `linear-gradient(135deg, ${T.green}, ${T.greenDark})`, label: 'Today', border: T.green },
          { bg: T.greenLight, label: 'Completed', border: T.border },
          { bg: `linear-gradient(135deg, ${T.orange}, #FF5722)`, label: 'Viewing', border: T.orange },
          { bg: T.bg, label: 'Upcoming', border: T.border },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              background: item.bg, border: `1.5px solid ${item.border}`,
            }} />
            <span style={{ fontSize: 11, color: T.textLight, fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default DayNavigator