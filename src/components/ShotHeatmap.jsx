export default function ShotHeatmap({ history, selectedMatchId }) {
  // Get all shot markers from history
  const getAllMarkers = () => {
    if (selectedMatchId && selectedMatchId !== 'all') {
      const match = history.find(m => m.id === selectedMatchId)
      return match?.shotMarkers || []
    }
    return history.flatMap(m => m.shotMarkers || [])
  }

  const markers = getAllMarkers()

  // Court dimensions
  const courtWidth = 500
  const courtHeight = 470

  // Calculate overall stats
  const totalShots = markers.length
  const totalMade = markers.filter(m => m.made).length
  const twoPointers = markers.filter(m => !m.isThree)
  const threePointers = markers.filter(m => m.isThree)
  const twoMade = twoPointers.filter(m => m.made).length
  const threeMade = threePointers.filter(m => m.made).length

  if (markers.length === 0) {
    return (
      <div className="chart-container">
        <h3>🎯 Carte des tirs</h3>
        <div className="chart-empty">
          <p>Aucune donnée de tir disponible</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Les positions seront sauvegardées avec les prochains matchs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>🎯 Carte des tirs</h3>

      <div className="heatmap-wrapper">
        <svg viewBox={`0 0 ${courtWidth} ${courtHeight}`} className="heatmap-svg">
          <defs>
            {/* Parquet wood pattern */}
            <pattern id="heatWoodGrain" x="0" y="0" width="40" height="120" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="120" fill="#c4893b"/>
              <path d="M0,10 Q10,12 20,10 Q30,8 40,10" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.6"/>
              <path d="M0,40 Q8,42 20,40 Q32,38 40,40" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <path d="M0,70 Q10,73 25,70 Q35,67 40,70" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.6"/>
              <path d="M0,100 Q9,103 21,100 Q31,97 40,100" stroke="#b5792e" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <line x1="0" y1="0" x2="40" y2="0" stroke="#8b5a2b" strokeWidth="1" opacity="0.4"/>
              <line x1="0" y1="60" x2="40" y2="60" stroke="#8b5a2b" strokeWidth="0.5" opacity="0.3"/>
            </pattern>

            <pattern id="heatWoodGrain2" x="20" y="60" width="40" height="120" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="120" fill="#d4994b"/>
              <path d="M0,15 Q12,18 22,15 Q32,12 40,15" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <path d="M0,55 Q14,58 26,55 Q38,52 40,55" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <path d="M0,95 Q16,98 28,95 Q38,92 40,95" stroke="#c5893b" strokeWidth="0.5" fill="none" opacity="0.5"/>
              <line x1="0" y1="0" x2="40" y2="0" stroke="#8b5a2b" strokeWidth="1" opacity="0.4"/>
            </pattern>

            <pattern id="heatParquet" x="0" y="0" width="80" height="120" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="120" fill="url(#heatWoodGrain)"/>
              <rect x="40" y="0" width="40" height="120" fill="url(#heatWoodGrain2)"/>
            </pattern>

            {/* Glow effects for shots */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <linearGradient id="heatPaintGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a4a8f" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#0d3a7a" stopOpacity="0.7"/>
            </linearGradient>

            <linearGradient id="heatRimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b35"/>
              <stop offset="50%" stopColor="#ff4500"/>
              <stop offset="100%" stopColor="#cc3300"/>
            </linearGradient>
          </defs>

          {/* Court background with parquet */}
          <rect x="0" y="0" width={courtWidth} height={courtHeight} fill="url(#heatParquet)" />

          {/* Paint/Key area */}
          <rect x="170" y="0" width="160" height="190" fill="url(#heatPaintGradient)"/>
          <rect x="170" y="0" width="160" height="190" fill="none" stroke="#fff" strokeWidth="2"/>

          {/* Free throw circle */}
          <circle cx="250" cy="190" r="60" fill="none" stroke="#fff" strokeWidth="2"/>
          <path d="M 190 190 A 60 60 0 0 1 310 190" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="8,8"/>

          {/* Restricted area */}
          <path d="M 210 0 A 40 40 0 0 0 290 0" fill="none" stroke="#fff" strokeWidth="2"/>

          {/* Three-point line */}
          {(() => {
            const bx = 250, by = 50, radius = 238
            const cornerX = 30, cornerRightX = 470
            const leftDx = cornerX - bx
            const arcStartY = by + Math.sqrt(radius * radius - leftDx * leftDx)
            const rightDx = cornerRightX - bx
            const arcEndY = by + Math.sqrt(radius * radius - rightDx * rightDx)

            return (
              <>
                <line x1={cornerX} y1="0" x2={cornerX} y2={arcStartY} stroke="#fff" strokeWidth="2"/>
                <line x1={cornerRightX} y1="0" x2={cornerRightX} y2={arcEndY} stroke="#fff" strokeWidth="2"/>
                <path
                  d={`M ${cornerX} ${arcStartY} A ${radius} ${radius} 0 0 0 ${cornerRightX} ${arcEndY}`}
                  fill="none" stroke="#fff" strokeWidth="2"
                />
              </>
            )
          })()}

          {/* Court border */}
          <rect x="2" y="2" width={courtWidth - 4} height={courtHeight - 4} fill="none" stroke="#fff" strokeWidth="3"/>

          {/* Backboard */}
          <rect x="220" y="35" width="60" height="5" fill="#fff" rx="1"/>

          {/* Basket/Rim */}
          <circle cx="250" cy="50" r="12" fill="none" stroke="url(#heatRimGradient)" strokeWidth="4"/>

          {/* Center line */}
          <line x1="0" y1={courtHeight - 2} x2={courtWidth} y2={courtHeight - 2} stroke="#fff" strokeWidth="3"/>

          {/* Shot markers */}
          {markers.map((shot, i) => (
            <g key={i}>
              {/* Outer glow */}
              <circle
                cx={shot.x}
                cy={shot.y}
                r="12"
                fill={shot.made ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}
              />
              {/* Main marker */}
              <circle
                cx={shot.x}
                cy={shot.y}
                r="8"
                fill={shot.made ? '#2ecc71' : '#e74c3c'}
                stroke="#fff"
                strokeWidth="2"
              />
              {/* Icon */}
              <text
                x={shot.x}
                y={shot.y + 3}
                textAnchor="middle"
                fill="#fff"
                fontSize="8"
                fontWeight="bold"
              >
                {shot.made ? '✓' : '✗'}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Stats summary */}
      <div className="heatmap-stats">
        <div className="heatmap-stat">
          <span className="heatmap-stat-value">{totalMade}/{totalShots}</span>
          <span className="heatmap-stat-label">Total ({totalShots > 0 ? Math.round(totalMade/totalShots*100) : 0}%)</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-value" style={{color: '#3498db'}}>{twoMade}/{twoPointers.length}</span>
          <span className="heatmap-stat-label">2PTS ({twoPointers.length > 0 ? Math.round(twoMade/twoPointers.length*100) : 0}%)</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-value" style={{color: '#9b59b6'}}>{threeMade}/{threePointers.length}</span>
          <span className="heatmap-stat-label">3PTS ({threePointers.length > 0 ? Math.round(threeMade/threePointers.length*100) : 0}%)</span>
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="legend-item">
          <span className="legend-color" style={{background: '#2ecc71'}}></span> Réussi
        </span>
        <span className="legend-item">
          <span className="legend-color" style={{background: '#e74c3c'}}></span> Raté
        </span>
      </div>
    </div>
  )
}
