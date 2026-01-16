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
                <pattern id="replay-parquet" width="25" height="50" patternUnits="userSpaceOnUse">
                  <rect width="25" height="50" fill="#c17f59"/>
                  <rect x="0" y="0" width="25" height="25" fill="#d4915f"/>
                  <line x1="0" y1="0" x2="25" y2="0" stroke="#a86d4a" strokeWidth="0.5"/>
                  <line x1="0" y1="25" x2="25" y2="25" stroke="#a86d4a" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect x="0" y="0" width="500" height="470" fill="url(#replay-parquet)" rx="8"/>

              {/* Court lines */}
              <rect x="20" y="20" width="460" height="430" fill="none" stroke="#fff" strokeWidth="3"/>

              {/* Three-point arc */}
              <path d="M 20 160 Q 250 -30 480 160" fill="none" stroke="#fff" strokeWidth="2"/>
              <line x1="20" y1="160" x2="20" y2="20" stroke="#fff" strokeWidth="2"/>
              <line x1="480" y1="160" x2="480" y2="20" stroke="#fff" strokeWidth="2"/>

              {/* Paint/Key */}
              <rect x="145" y="20" width="210" height="190" fill="rgba(255,107,53,0.3)" stroke="#fff" strokeWidth="2"/>

              {/* Free throw circle */}
              <circle cx="250" cy="210" r="60" fill="none" stroke="#fff" strokeWidth="2"/>

              {/* Basket */}
              <circle cx="250" cy="55" r="15" fill="none" stroke="#ff6b35" strokeWidth="4"/>
              <rect x="220" y="35" width="60" height="5" fill="#fff"/>

              {/* Restricted area */}
              <path d="M 210 55 A 40 40 0 0 0 290 55" fill="none" stroke="#fff" strokeWidth="2"/>

              {/* Animated shots */}
              {visibleShots.map((shot, index) => (
                <g key={shot.id} className="replay-shot-marker">
                  {/* Pulse effect */}
                  <circle
                    cx={shot.x * 5}
                    cy={shot.y * 4.7}
                    r="20"
                    fill={shot.made ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}
                    className="shot-pulse"
                  />
                  {/* Shot marker */}
                  <circle
                    cx={shot.x * 5}
                    cy={shot.y * 4.7}
                    r="10"
                    fill={shot.made ? '#2ecc71' : '#e74c3c'}
                    stroke="#fff"
                    strokeWidth="2"
                    className="shot-appear"
                  />
                  {/* Shot number */}
                  <text
                    x={shot.x * 5}
                    y={shot.y * 4.7 + 4}
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
