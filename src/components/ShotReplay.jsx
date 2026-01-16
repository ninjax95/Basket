import { useState, useEffect, useRef } from 'react'

export default function ShotReplay({ shotMarkers, actionHistory, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [visibleShots, setVisibleShots] = useState([])
  const [currentAction, setCurrentAction] = useState(null)
  const [speed, setSpeed] = useState(1500) // ms between shots
  const intervalRef = useRef(null)

  // Combine shot markers with their timing from action history
  const allShots = [...shotMarkers].sort((a, b) => {
    // Sort by quarter then by timeLeft (descending = chronological)
    if (a.quarter !== b.quarter) return a.quarter - b.quarter
    return b.timeLeft - a.timeLeft
  })

  // Get free throws from action history
  const freeThrows = actionHistory
    .filter(a => a.type === 'ftMade' || a.type === 'ftAttempted')
    .map(a => ({
      id: a.id,
      type: 'ft',
      made: a.type === 'ftMade',
      quarter: a.quarter,
      timeLeft: a.timeLeft,
      label: a.label
    }))
    .sort((a, b) => {
      if (a.quarter !== b.quarter) return a.quarter - b.quarter
      return b.timeLeft - a.timeLeft
    })

  // Merge all events chronologically
  const allEvents = [...allShots.map(s => ({ ...s, eventType: 'shot' })), ...freeThrows.map(f => ({ ...f, eventType: 'ft' }))]
    .sort((a, b) => {
      if (a.quarter !== b.quarter) return a.quarter - b.quarter
      return b.timeLeft - a.timeLeft
    })

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startReplay = () => {
    setIsPlaying(true)
    setCurrentIndex(-1)
    setVisibleShots([])
    setCurrentAction(null)
  }

  const stopReplay = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const resetReplay = () => {
    stopReplay()
    setCurrentIndex(-1)
    setVisibleShots([])
    setCurrentAction(null)
  }

  useEffect(() => {
    if (isPlaying && currentIndex < allEvents.length - 1) {
      intervalRef.current = setTimeout(() => {
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)
        const event = allEvents[nextIndex]
        setCurrentAction(event)

        if (event.eventType === 'shot') {
          setVisibleShots(prev => [...prev, event])
        }
      }, speed)
    } else if (currentIndex >= allEvents.length - 1) {
      setIsPlaying(false)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isPlaying, currentIndex, allEvents.length, speed])

  // Stats summary
  const stats = {
    fg2Made: allShots.filter(s => !s.isThreePointer && s.made).length,
    fg2Total: allShots.filter(s => !s.isThreePointer).length,
    fg3Made: allShots.filter(s => s.isThreePointer && s.made).length,
    fg3Total: allShots.filter(s => s.isThreePointer).length,
    ftMade: freeThrows.filter(f => f.made).length,
    ftTotal: freeThrows.length
  }

  return (
    <div className="replay-overlay" onClick={onClose}>
      <div className="replay-container" onClick={e => e.stopPropagation()}>
        <div className="replay-header">
          <h2>🎬 Replay du match</h2>
          <button className="replay-close" onClick={onClose}>×</button>
        </div>

        <div className="replay-content">
          {/* Court with animated shots */}
          <div className="replay-court-wrapper">
            <svg viewBox="0 0 500 470" className="replay-court">
              {/* Court background - parquet */}
              <defs>
                <pattern id="replay-woodGrain" x="0" y="0" width="40" height="120" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="40" height="120" fill="#c4893b"/>
                  <path d="M0,10 Q10,12 20,10 Q30,8 40,10" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.6"/>
                  <path d="M0,40 Q8,42 20,40 Q32,38 40,40" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.5"/>
                  <path d="M0,70 Q10,73 25,70 Q35,67 40,70" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.6"/>
                  <path d="M0,100 Q9,103 21,100 Q31,97 40,100" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.5"/>
                  <line x1="0" y1="0" x2="40" y2="0" stroke="#8b5a2b" strokeWidth="1" opacity="0.4"/>
                  <line x1="0" y1="60" x2="40" y2="60" stroke="#8b5a2b" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
                <pattern id="replay-woodGrain2" x="20" y="60" width="40" height="120" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="40" height="120" fill="#d4994b"/>
                  <path d="M0,15 Q12,18 22,15 Q32,12 40,15" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
                  <path d="M0,55 Q14,58 26,55 Q38,52 40,55" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
                  <path d="M0,95 Q16,98 28,95 Q38,92 40,95" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
                  <line x1="0" y1="0" x2="40" y2="0" stroke="#8b5a2b" strokeWidth="1" opacity="0.4"/>
                </pattern>
                <pattern id="replay-parquet" x="0" y="0" width="80" height="120" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="40" height="120" fill="url(#replay-woodGrain)"/>
                  <rect x="40" y="0" width="40" height="120" fill="url(#replay-woodGrain2)"/>
                </pattern>
                <linearGradient id="replay-paint" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a4a8f"/>
                  <stop offset="100%" stopColor="#0d3a7a"/>
                </linearGradient>
                <linearGradient id="replay-rim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b35"/>
                  <stop offset="50%" stopColor="#ff4500"/>
                  <stop offset="100%" stopColor="#cc3300"/>
                </linearGradient>
              </defs>

              {/* Court background */}
              <rect x="0" y="0" width="500" height="470" fill="url(#replay-parquet)"/>

              {/* Paint area */}
              <rect x="170" y="0" width="160" height="190" fill="url(#replay-paint)" opacity="0.85"/>
              <rect x="170" y="0" width="160" height="190" fill="none" stroke="#fff" strokeWidth="3"/>

              {/* Free throw lane lines */}
              <line x1="170" y1="70" x2="162" y2="70" stroke="#fff" strokeWidth="2"/>
              <line x1="170" y1="100" x2="162" y2="100" stroke="#fff" strokeWidth="2"/>
              <line x1="170" y1="130" x2="162" y2="130" stroke="#fff" strokeWidth="2"/>
              <line x1="170" y1="160" x2="162" y2="160" stroke="#fff" strokeWidth="2"/>
              <line x1="330" y1="70" x2="338" y2="70" stroke="#fff" strokeWidth="2"/>
              <line x1="330" y1="100" x2="338" y2="100" stroke="#fff" strokeWidth="2"/>
              <line x1="330" y1="130" x2="338" y2="130" stroke="#fff" strokeWidth="2"/>
              <line x1="330" y1="160" x2="338" y2="160" stroke="#fff" strokeWidth="2"/>

              {/* Free throw circle */}
              <circle cx="250" cy="190" r="60" fill="none" stroke="#fff" strokeWidth="3"/>
              <path d="M 190 190 A 60 60 0 0 1 310 190" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="8,8"/>

              {/* Restricted area */}
              <path d="M 210 0 A 40 40 0 0 0 290 0" fill="none" stroke="#fff" strokeWidth="2"/>

              {/* Three-point line - same as CourtMap */}
              {(() => {
                const bx = 250
                const by = 50
                const radius = 238
                const cornerX = 30
                const cornerRightX = 470
                const leftDx = cornerX - bx
                const arcStartY = by + Math.sqrt(radius * radius - leftDx * leftDx)
                const rightDx = cornerRightX - bx
                const arcEndY = by + Math.sqrt(radius * radius - rightDx * rightDx)
                return (
                  <>
                    <line x1={cornerX} y1="0" x2={cornerX} y2={arcStartY} stroke="#fff" strokeWidth="3"/>
                    <line x1={cornerRightX} y1="0" x2={cornerRightX} y2={arcEndY} stroke="#fff" strokeWidth="3"/>
                    <path d={`M ${cornerX} ${arcStartY} A ${radius} ${radius} 0 0 0 ${cornerRightX} ${arcEndY}`} fill="none" stroke="#fff" strokeWidth="3"/>
                  </>
                )
              })()}

              {/* Court border */}
              <rect x="2" y="2" width="496" height="466" fill="none" stroke="#fff" strokeWidth="4"/>

              {/* Backboard */}
              <rect x="220" y="35" width="60" height="5" fill="#fff" rx="1"/>

              {/* Basket/Rim */}
              <circle cx="250" cy="50" r="12" fill="none" stroke="url(#replay-rim)" strokeWidth="4"/>

              {/* Half court line */}
              <line x1="0" y1="468" x2="500" y2="468" stroke="#fff" strokeWidth="4"/>

              {/* Animated shots */}
              {visibleShots.map((shot, index) => (
                <g key={shot.id} className="replay-shot-marker">
                  {/* Pulse effect */}
                  <circle
                    cx={shot.x}
                    cy={shot.y}
                    r="20"
                    fill={shot.made ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}
                    className="shot-pulse"
                  />
                  {/* Shot marker */}
                  <circle
                    cx={shot.x}
                    cy={shot.y}
                    r="12"
                    fill={shot.made ? '#2ecc71' : '#e74c3c'}
                    stroke="#fff"
                    strokeWidth="2"
                    className="shot-appear"
                  />
                  {/* Shot number */}
                  <text
                    x={shot.x}
                    y={shot.y + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {index + 1}
                  </text>
                </g>
              ))}
            </svg>

            {/* Free throw zone indicator */}
            {currentAction?.eventType === 'ft' && (
              <div className={`ft-indicator ${currentAction.made ? 'made' : 'missed'}`}>
                🏀 Lancer Franc {currentAction.made ? 'Réussi!' : 'Raté'}
              </div>
            )}
          </div>

          {/* Current action display */}
          <div className="replay-info">
            {currentAction ? (
              <div className={`current-action ${currentAction.made ? 'made' : 'missed'}`}>
                <div className="action-quarter">Q{currentAction.quarter}</div>
                <div className="action-time-display">{formatTime(currentAction.timeLeft)}</div>
                <div className="action-type">
                  {currentAction.eventType === 'ft'
                    ? `Lancer Franc ${currentAction.made ? '✓' : '✗'}`
                    : `${currentAction.isThreePointer ? '3PTS' : '2PTS'} ${currentAction.made ? '✓' : '✗'}`
                  }
                </div>
              </div>
            ) : (
              <div className="current-action waiting">
                {allEvents.length > 0 ? 'Appuie sur Play pour commencer' : 'Aucun tir enregistré'}
              </div>
            )}

            {/* Progress */}
            <div className="replay-progress">
              <div
                className="progress-bar"
                style={{ width: `${allEvents.length > 0 ? ((currentIndex + 1) / allEvents.length) * 100 : 0}%` }}
              />
            </div>
            <div className="replay-counter">
              {currentIndex + 1} / {allEvents.length} actions
            </div>
          </div>

          {/* Stats summary */}
          <div className="replay-stats">
            <div className="replay-stat">
              <span className="stat-label">2PTS</span>
              <span className="stat-value">{stats.fg2Made}/{stats.fg2Total}</span>
            </div>
            <div className="replay-stat">
              <span className="stat-label">3PTS</span>
              <span className="stat-value">{stats.fg3Made}/{stats.fg3Total}</span>
            </div>
            <div className="replay-stat">
              <span className="stat-label">LF</span>
              <span className="stat-value">{stats.ftMade}/{stats.ftTotal}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="replay-controls">
            <button
              className="replay-btn"
              onClick={resetReplay}
            >
              ⏮ Reset
            </button>
            <button
              className={`replay-btn primary ${isPlaying ? 'playing' : ''}`}
              onClick={isPlaying ? stopReplay : startReplay}
              disabled={allEvents.length === 0}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <div className="speed-control">
              <label>Vitesse:</label>
              <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
                <option value={2500}>Lent</option>
                <option value={1500}>Normal</option>
                <option value={800}>Rapide</option>
                <option value={400}>Très rapide</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
