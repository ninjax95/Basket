import { useState } from 'react'

export default function CourtMap({ onShotRecorded, quarter, timeLeft, shotMarkers, setShotMarkers, actionHistory, onShowReplay, onShowHistory }) {
  const [pendingShot, setPendingShot] = useState(null)
  const [showMarkerMenu, setShowMarkerMenu] = useState(false)

  // Court dimensions (half court, proportional)
  const courtWidth = 500
  const courtHeight = 470

  // Basket position (center of the baseline)
  const basketX = courtWidth / 2
  const basketY = 55

  // Three-point line distance (in our scale)
  const threePointRadius = 190

  const isThreePointer = (x, y) => {
    // Use same geometry as the drawn 3-point line
    const bx = 250  // Basket X
    const by = 50   // Basket Y
    const threePointRadius = 238
    const cornerLeftX = 30
    const cornerRightX = 470

    // Calculate arc Y at the corner positions
    const leftDx = cornerLeftX - bx
    const arcYAtCorner = by + Math.sqrt(threePointRadius * threePointRadius - leftDx * leftDx)

    // If in corner zone (before the arc starts)
    if (y < arcYAtCorner) {
      return x < cornerLeftX || x > cornerRightX
    }

    // Otherwise check distance from basket
    const dx = x - bx
    const dy = y - by
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance > threePointRadius
  }

  const handleCourtClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * courtWidth
    const y = ((e.clientY - rect.top) / rect.height) * courtHeight

    const isThree = isThreePointer(x, y)

    setPendingShot({
      x,
      y,
      isThree,
      type: isThree ? '3pts' : '2pts'
    })
  }

  const confirmShot = (made) => {
    if (!pendingShot) return

    setShotMarkers(prev => [...prev, {
      ...pendingShot,
      made,
      quarter,
      timeLeft: timeLeft || 0,
      id: Date.now()
    }])

    onShotRecorded(pendingShot.isThree, made)
    setPendingShot(null)
  }

  const cancelShot = () => {
    setPendingShot(null)
  }

  const clearMarkersForQuarter = (q) => {
    setShotMarkers(prev => prev.filter(m => m.quarter !== q))
    setShowMarkerMenu(false)
  }

  const clearAllMarkers = () => {
    setShotMarkers([])
    setShowMarkerMenu(false)
  }

  const undoLastMarker = () => {
    setShotMarkers(prev => prev.slice(0, -1))
  }

  // Get markers for current quarter
  const currentQuarterMarkers = shotMarkers.filter(m => m.quarter === quarter)
  const otherQuarterMarkers = shotMarkers.filter(m => m.quarter !== quarter)

  // Stats by quarter
  const getQuarterStats = (q) => {
    const qMarkers = shotMarkers.filter(m => m.quarter === q)
    return {
      made2: qMarkers.filter(m => m.made && !m.isThree).length,
      total2: qMarkers.filter(m => !m.isThree).length,
      made3: qMarkers.filter(m => m.made && m.isThree).length,
      total3: qMarkers.filter(m => m.isThree).length
    }
  }

  return (
    <div className="court-container">
      <div className="court-header">
        <h3>🏀 Carte des tirs - Q{quarter}</h3>
        <div className="court-header-buttons">
          {shotMarkers.length > 0 && (
            <button className="undo-btn" onClick={undoLastMarker} title="Annuler le dernier tir">
              ↩
            </button>
          )}
          {shotMarkers.length > 0 && (
            <button
              className={`marker-menu-btn ${showMarkerMenu ? 'active' : ''}`}
              onClick={() => setShowMarkerMenu(!showMarkerMenu)}
            >
              🗑 Gérer
            </button>
          )}
        </div>
      </div>

      {/* Marker management menu */}
      {showMarkerMenu && (
        <div className="marker-menu">
          <div className="marker-menu-header">
            <span>Gestion des marqueurs</span>
            <button className="marker-menu-close" onClick={() => setShowMarkerMenu(false)}>✕</button>
          </div>
          <div className="marker-menu-section">
            <p>Effacer par quart-temps :</p>
            <div className="marker-menu-buttons">
              {[1, 2, 3, 4].map(q => {
                const stats = getQuarterStats(q)
                const total = stats.total2 + stats.total3
                return (
                  <button
                    key={q}
                    className={`marker-quarter-btn ${total === 0 ? 'empty' : ''}`}
                    onClick={() => clearMarkersForQuarter(q)}
                    disabled={total === 0}
                  >
                    <span className="q-label">Q{q}</span>
                    <span className="q-count">{total} tir{total > 1 ? 's' : ''}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="marker-menu-divider"></div>
          <button className="clear-all-btn" onClick={clearAllMarkers}>
            🗑 Effacer tous les marqueurs ({shotMarkers.length})
          </button>
        </div>
      )}

      <div className="court-wrapper">
        <svg
          viewBox={`0 0 ${courtWidth} ${courtHeight}`}
          className="court-svg"
          onClick={handleCourtClick}
        >
          <defs>
            {/* Parquet wood pattern */}
            <pattern id="woodGrain" x="0" y="0" width="40" height="120" patternUnits="userSpaceOnUse">
              {/* Wood plank base */}
              <rect x="0" y="0" width="40" height="120" fill="#c4893b"/>

              {/* Wood grain lines */}
              <path d="M0,10 Q10,12 20,10 Q30,8 40,10" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.6"/>
              <path d="M0,25 Q15,28 25,25 Q35,22 40,25" stroke="#a86a22" strokeWidth="0.3" fill="none" opacity="0.4"/>
              <path d="M0,40 Q8,42 20,40 Q32,38 40,40" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <path d="M0,55 Q12,58 22,55 Q33,52 40,55" stroke="#a86a22" strokeWidth="0.3" fill="none" opacity="0.3"/>
              <path d="M0,70 Q10,73 25,70 Q35,67 40,70" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.6"/>
              <path d="M0,85 Q14,88 24,85 Q34,82 40,85" stroke="#a86a22" strokeWidth="0.3" fill="none" opacity="0.4"/>
              <path d="M0,100 Q9,103 21,100 Q31,97 40,100" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <path d="M0,115 Q11,117 23,115 Q34,113 40,115" stroke="#a86a22" strokeWidth="0.3" fill="none" opacity="0.3"/>

              {/* Plank separators */}
              <line x1="0" y1="0" x2="40" y2="0" stroke="#8b5a2b" strokeWidth="1" opacity="0.4"/>
              <line x1="0" y1="60" x2="40" y2="60" stroke="#8b5a2b" strokeWidth="0.5" opacity="0.3"/>
            </pattern>

            {/* Second parquet pattern (offset) */}
            <pattern id="woodGrain2" x="20" y="60" width="40" height="120" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="120" fill="#d4994b"/>
              <path d="M0,15 Q12,18 22,15 Q32,12 40,15" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <path d="M0,35 Q10,38 24,35 Q36,32 40,35" stroke="#b5792e" strokeWidth="0.3" fill="none" opacity="0.4"/>
              <path d="M0,55 Q14,58 26,55 Q38,52 40,55" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <path d="M0,75 Q8,78 20,75 Q32,72 40,75" stroke="#b5792e" strokeWidth="0.3" fill="none" opacity="0.3"/>
              <path d="M0,95 Q16,98 28,95 Q38,92 40,95" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <line x1="0" y1="0" x2="40" y2="0" stroke="#8b5a2b" strokeWidth="1" opacity="0.4"/>
              <line x1="0" y1="60" x2="40" y2="60" stroke="#8b5a2b" strokeWidth="0.5" opacity="0.3"/>
            </pattern>

            {/* Combined herringbone-like parquet */}
            <pattern id="parquet" x="0" y="0" width="80" height="120" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="120" fill="url(#woodGrain)"/>
              <rect x="40" y="0" width="40" height="120" fill="url(#woodGrain2)"/>
            </pattern>

            {/* Glossy overlay */}
            <linearGradient id="courtShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)"/>
              <stop offset="50%" stopColor="rgba(255,255,255,0)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)"/>
            </linearGradient>

            {/* Paint area gradient */}
            <linearGradient id="paintGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a4a8f"/>
              <stop offset="100%" stopColor="#0d3a7a"/>
            </linearGradient>

            {/* Rim gradient */}
            <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b35"/>
              <stop offset="50%" stopColor="#ff4500"/>
              <stop offset="100%" stopColor="#cc3300"/>
            </linearGradient>

            {/* Shadow filter */}
            <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Court background with parquet */}
          <rect x="0" y="0" width={courtWidth} height={courtHeight} fill="url(#parquet)" />

          {/* Glossy overlay */}
          <rect x="0" y="0" width={courtWidth} height={courtHeight} fill="url(#courtShine)" />

          {/* Paint/Key area with team color */}
          <rect x="170" y="0" width="160" height="190" fill="url(#paintGradient)" opacity="0.85"/>

          {/* Paint area border */}
          <rect x="170" y="0" width="160" height="190"
            fill="none" stroke="#fff" strokeWidth="3" filter="url(#lineShadow)"/>

          {/* Free throw lane lines (hash marks) */}
          <line x1="170" y1="70" x2="162" y2="70" stroke="#fff" strokeWidth="2"/>
          <line x1="170" y1="100" x2="162" y2="100" stroke="#fff" strokeWidth="2"/>
          <line x1="170" y1="130" x2="162" y2="130" stroke="#fff" strokeWidth="2"/>
          <line x1="170" y1="160" x2="162" y2="160" stroke="#fff" strokeWidth="2"/>
          <line x1="330" y1="70" x2="338" y2="70" stroke="#fff" strokeWidth="2"/>
          <line x1="330" y1="100" x2="338" y2="100" stroke="#fff" strokeWidth="2"/>
          <line x1="330" y1="130" x2="338" y2="130" stroke="#fff" strokeWidth="2"/>
          <line x1="330" y1="160" x2="338" y2="160" stroke="#fff" strokeWidth="2"/>

          {/* Free throw circle */}
          <circle cx={basketX} cy="190" r="60"
            fill="none" stroke="#fff" strokeWidth="3" filter="url(#lineShadow)"/>

          {/* Free throw circle dashed part (behind the line) */}
          <path d={`M 190 190 A 60 60 0 0 1 310 190`}
            fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="8,8"/>

          {/* Restricted area arc */}
          <path d={`M 210 0 A 40 40 0 0 0 290 0`}
            fill="none" stroke="#fff" strokeWidth="2"/>

          {/* Three-point line */}
          {(() => {
            // Basket position
            const bx = 250;
            const by = 50;
            // 3-point radius from basket center
            const radius = 238;
            // Corner 3-point X positions
            const cornerX = 30;
            const cornerRightX = 470;

            // Calculate where the arc meets the corner lines
            // Arc equation: (x - bx)² + (y - by)² = radius²
            // At x = cornerX: y = by + sqrt(radius² - (cornerX - bx)²)
            const leftDx = cornerX - bx;
            const arcStartY = by + Math.sqrt(radius * radius - leftDx * leftDx);

            const rightDx = cornerRightX - bx;
            const arcEndY = by + Math.sqrt(radius * radius - rightDx * rightDx);

            return (
              <>
                {/* Left corner line */}
                <line x1={cornerX} y1="2" x2={cornerX} y2={arcStartY}
                  stroke="#fff" strokeWidth="4" filter="url(#lineShadow)"/>
                {/* Right corner line */}
                <line x1={cornerRightX} y1="2" x2={cornerRightX} y2={arcEndY}
                  stroke="#fff" strokeWidth="4" filter="url(#lineShadow)"/>
                {/* Arc - drawn from basket center, curving away from basket */}
                <path
                  d={`M ${cornerX} ${arcStartY} A ${radius} ${radius} 0 0 0 ${cornerRightX} ${arcEndY}`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="4"
                  filter="url(#lineShadow)"
                />
              </>
            );
          })()}

          {/* Court border */}
          <rect x="2" y="2" width={courtWidth - 4} height={courtHeight - 4}
            fill="none" stroke="#fff" strokeWidth="4" />

          {/* Backboard */}
          <rect x="220" y="35" width="60" height="5" fill="#fff" rx="1"/>
          <rect x="220" y="35" width="60" height="5" fill="none" stroke="#333" strokeWidth="1"/>

          {/* Basket/Rim */}
          <circle cx={basketX} cy="50" r="12"
            fill="none" stroke="url(#rimGradient)" strokeWidth="4" />

          {/* Net indication */}
          <ellipse cx={basketX} cy="55" rx="10" ry="15"
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,2"/>

          {/* Center court line */}
          <line x1="0" y1={courtHeight - 2} x2={courtWidth} y2={courtHeight - 2}
            stroke="#fff" strokeWidth="4" />

          {/* Half court arc (partial) */}
          <path d={`M 190 ${courtHeight} A 60 60 0 0 1 310 ${courtHeight}`}
            fill="none" stroke="#fff" strokeWidth="2" opacity="0.5"/>

          {/* Other quarter markers (faded) */}
          {otherQuarterMarkers.map((shot) => (
            <g key={shot.id} opacity="0.3">
              <circle
                cx={shot.x}
                cy={shot.y}
                r="10"
                fill={shot.made ? '#2ecc71' : '#e74c3c'}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={shot.x}
                y={shot.y + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="8"
                fontWeight="bold"
              >
                Q{shot.quarter}
              </text>
            </g>
          ))}

          {/* Current quarter markers */}
          {currentQuarterMarkers.map((shot) => (
            <g key={shot.id}>
              {/* Marker shadow */}
              <circle
                cx={shot.x + 2}
                cy={shot.y + 2}
                r="14"
                fill="rgba(0,0,0,0.3)"
              />
              {/* Marker */}
              <circle
                cx={shot.x}
                cy={shot.y}
                r="14"
                fill={shot.made ? '#2ecc71' : '#e74c3c'}
                stroke="#fff"
                strokeWidth="3"
              />
              <text
                x={shot.x}
                y={shot.y + 5}
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="bold"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                {shot.made ? '✓' : '✗'}
              </text>
            </g>
          ))}

          {/* Pending shot indicator */}
          {pendingShot && (
            <g>
              <circle
                cx={pendingShot.x}
                cy={pendingShot.y}
                r="20"
                fill="rgba(97, 218, 251, 0.3)"
                stroke="#61dafb"
                strokeWidth="3"
                className="pending-marker"
              />
              <circle
                cx={pendingShot.x}
                cy={pendingShot.y}
                r="5"
                fill="#61dafb"
              />
            </g>
          )}
        </svg>

        {/* Shot confirmation modal */}
        {pendingShot && (
          <div className="shot-modal">
            <div className="shot-modal-content">
              <div className="shot-type-badge" data-type={pendingShot.isThree ? '3pts' : '2pts'}>
                {pendingShot.type}
              </div>
              <p>Ce tir est-il réussi ?</p>
              <div className="shot-modal-buttons">
                <button className="shot-btn made" onClick={() => confirmShot(true)}>
                  ✓ Réussi
                </button>
                <button className="shot-btn missed" onClick={() => confirmShot(false)}>
                  ✗ Raté
                </button>
              </div>
              <button className="shot-cancel" onClick={cancelShot}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shot stats summary */}
      <div className="court-stats">
        <div className="court-stat-group">
          <div className="court-stat-label">Q{quarter}</div>
          <div className="court-stat">
            <span className="made-count">
              {currentQuarterMarkers.filter(s => s.made && !s.isThree).length}
            </span>
            /
            <span className="total-count">
              {currentQuarterMarkers.filter(s => !s.isThree).length}
            </span>
            <span className="stat-label">2PTS</span>
          </div>
          <div className="court-stat">
            <span className="made-count">
              {currentQuarterMarkers.filter(s => s.made && s.isThree).length}
            </span>
            /
            <span className="total-count">
              {currentQuarterMarkers.filter(s => s.isThree).length}
            </span>
            <span className="stat-label">3PTS</span>
          </div>
        </div>
        <div className="court-stat-divider"></div>
        <div className="court-stat-group">
          <div className="court-stat-label">Total</div>
          <div className="court-stat">
            <span className="made-count">
              {shotMarkers.filter(s => s.made && !s.isThree).length}
            </span>
            /
            <span className="total-count">
              {shotMarkers.filter(s => !s.isThree).length}
            </span>
            <span className="stat-label">2PTS</span>
          </div>
          <div className="court-stat">
            <span className="made-count">
              {shotMarkers.filter(s => s.made && s.isThree).length}
            </span>
            /
            <span className="total-count">
              {shotMarkers.filter(s => s.isThree).length}
            </span>
            <span className="stat-label">3PTS</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="court-action-buttons">
        {actionHistory && actionHistory.length > 0 && (
          <button className="court-action-btn history" onClick={onShowHistory}>
            📝 Historique ({actionHistory.length})
          </button>
        )}
        {shotMarkers.length > 0 && (
          <button className="court-action-btn replay" onClick={onShowReplay}>
            🎬 Replay
          </button>
        )}
      </div>
    </div>
  )
}
