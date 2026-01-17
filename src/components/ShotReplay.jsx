import { useState, useEffect, useRef } from 'react'

export default function ShotReplay({ shotMarkers, actionHistory, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [visibleShots, setVisibleShots] = useState([])
  const [currentAction, setCurrentAction] = useState(null)
  const [speed, setSpeed] = useState(1500) // ms between shots
  const [ballPosition, setBallPosition] = useState(null)
  const [ballPhase, setBallPhase] = useState(null) // 'flying', 'ending', null
  const intervalRef = useRef(null)
  const animationRef = useRef(null)

  // Basket position
  const basketX = 250
  const basketY = 50

  // Generate random miss end position
  const getRandomMissEnd = () => {
    const missType = Math.floor(Math.random() * 4)
    switch (missType) {
      case 0: return { x: basketX - 35 - Math.random() * 30, y: basketY + 30 + Math.random() * 40 }
      case 1: return { x: basketX + 35 + Math.random() * 30, y: basketY + 30 + Math.random() * 40 }
      case 2: return { x: basketX + (Math.random() - 0.5) * 50, y: basketY + 50 + Math.random() * 30 }
      default: return { x: basketX + (Math.random() - 0.5) * 40, y: basketY - 10 }
    }
  }

  // Animate ball from start to end with arc
  const animateBall = (startX, startY, endX, endY, made, onComplete) => {
    const duration = 700
    const startTime = Date.now()

    // Set initial position immediately
    setBallPosition({
      x: startX,
      y: startY,
      scale: 1,
      made,
      rotation: 0,
      opacity: 1
    })
    setBallPhase('flying')

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth arc
      const easeOut = 1 - Math.pow(1 - progress, 3)

      // Calculate current position with arc (parabola)
      const arcHeight = Math.max(60, Math.abs(startY - endY) * 0.4)
      const arcProgress = Math.sin(progress * Math.PI) * arcHeight

      const currentX = startX + (endX - startX) * easeOut
      const currentY = startY + (endY - startY) * easeOut - arcProgress

      // Ball size decreases as it goes toward basket
      const scale = 1 - progress * 0.3

      setBallPosition({
        x: currentX,
        y: currentY,
        scale,
        made,
        rotation: progress * (made ? 360 : 720),
        opacity: 1
      })

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        setBallPhase('ending')

        if (made) {
          // Ball falls through basket
          let fallProgress = 0
          const fallAnimate = () => {
            fallProgress += 0.1
            setBallPosition(prev => ({
              ...prev,
              y: prev.y + fallProgress * 8,
              scale: prev.scale * 0.95,
              opacity: 1 - fallProgress * 0.5
            }))
            if (fallProgress < 1) {
              animationRef.current = requestAnimationFrame(fallAnimate)
            } else {
              setBallPosition(null)
              setBallPhase(null)
              onComplete()
            }
          }
          animationRef.current = requestAnimationFrame(fallAnimate)
        } else {
          // Ball bounces away
          let bounceProgress = 0
          const bounceAnimate = () => {
            bounceProgress += 0.1
            const bounceX = endX + (Math.random() > 0.5 ? 1 : -1) * bounceProgress * 20
            const bounceY = endY + bounceProgress * 30
            setBallPosition(prev => ({
              ...prev,
              x: bounceX,
              y: bounceY,
              scale: prev.scale * 0.9,
              opacity: 1 - bounceProgress * 0.8
            }))
            if (bounceProgress < 1) {
              animationRef.current = requestAnimationFrame(bounceAnimate)
            } else {
              setBallPosition(null)
              setBallPhase(null)
              onComplete()
            }
          }
          animationRef.current = requestAnimationFrame(bounceAnimate)
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

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

  // Get available quarters from events
  const availableQuarters = [...new Set(allEvents.map(e => e.quarter))].sort((a, b) => a - b)

  // Go to specific quarter
  const goToQuarter = (quarterNum) => {
    stopReplay()
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setBallPosition(null)
    setBallPhase(null)

    // Find first event of this quarter
    const quarterStartIndex = allEvents.findIndex(e => e.quarter === quarterNum)

    if (quarterStartIndex === -1) return

    // Show all shots before this quarter
    const shotsBeforeQuarter = allEvents
      .slice(0, quarterStartIndex)
      .filter(e => e.eventType === 'shot')

    setVisibleShots(shotsBeforeQuarter)
    setCurrentIndex(quarterStartIndex - 1)
    setCurrentAction(quarterStartIndex > 0 ? allEvents[quarterStartIndex - 1] : null)
  }

  useEffect(() => {
    if (isPlaying && currentIndex < allEvents.length - 1 && !ballPhase) {
      intervalRef.current = setTimeout(() => {
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)
        const event = allEvents[nextIndex]
        setCurrentAction(event)

        if (event.eventType === 'shot') {
          // Start ball animation
          const missEnd = getRandomMissEnd()
          const endX = event.made ? basketX : missEnd.x
          const endY = event.made ? basketY : missEnd.y

          animateBall(event.x, event.y, endX, endY, event.made, () => {
            setVisibleShots(prev => [...prev, event])
          })
        }
      }, speed)
    } else if (currentIndex >= allEvents.length - 1 && !ballPhase) {
      setIsPlaying(false)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isPlaying, currentIndex, allEvents.length, speed, ballPhase])

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

              {/* Animated ball */}
              {ballPosition && (
                <g style={{ opacity: ballPosition.opacity ?? 1 }}>
                  {/* Ball shadow */}
                  <ellipse
                    cx={ballPosition.x}
                    cy={ballPosition.y + 15}
                    rx={8 * ballPosition.scale}
                    ry={3 * ballPosition.scale}
                    fill="rgba(0,0,0,0.3)"
                  />
                  {/* Basketball */}
                  <g transform={`translate(${ballPosition.x}, ${ballPosition.y}) rotate(${ballPosition.rotation || 0}) scale(${ballPosition.scale})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="14"
                      fill="#f39c12"
                      stroke="#e67e22"
                      strokeWidth="2"
                    />
                    {/* Ball lines */}
                    <path
                      d="M -12 0 Q 0 -10 12 0 M 0 -12 L 0 12 M -12 0 Q 0 10 12 0"
                      stroke="#c0792b"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </g>
                  {/* Trail effect */}
                  {ballPhase === 'flying' && (
                    <>
                      <circle cx={ballPosition.x - 8} cy={ballPosition.y + 5} r={4 * ballPosition.scale} fill="rgba(243, 156, 18, 0.3)" />
                      <circle cx={ballPosition.x - 15} cy={ballPosition.y + 10} r={3 * ballPosition.scale} fill="rgba(243, 156, 18, 0.2)" />
                    </>
                  )}
                </g>
              )}
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

          {/* Quarter navigation */}
          {availableQuarters.length > 0 && (
            <div className="quarter-nav">
              <span className="quarter-nav-label">Aller à :</span>
              {[1, 2, 3, 4].map(q => (
                <button
                  key={q}
                  className={`quarter-btn ${availableQuarters.includes(q) ? '' : 'disabled'} ${currentAction?.quarter === q ? 'active' : ''}`}
                  onClick={() => goToQuarter(q)}
                  disabled={!availableQuarters.includes(q)}
                >
                  Q{q}
                </button>
              ))}
            </div>
          )}

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
