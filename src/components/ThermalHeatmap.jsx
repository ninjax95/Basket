export default function ThermalHeatmap({ history, selectedMatchId }) {
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

  // Grid for heatmap calculation
  const gridSize = 40
  const cols = Math.ceil(courtWidth / gridSize)
  const rows = Math.ceil(courtHeight / gridSize)

  // Calculate heat data for each cell
  const getHeatData = () => {
    const grid = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const centerX = col * gridSize + gridSize / 2
        const centerY = row * gridSize + gridSize / 2

        // Find shots within radius of this cell
        const radius = gridSize * 1.5
        const nearbyShots = markers.filter(m => {
          const dx = m.x - centerX
          const dy = m.y - centerY
          return Math.sqrt(dx * dx + dy * dy) <= radius
        })

        if (nearbyShots.length > 0) {
          const made = nearbyShots.filter(m => m.made).length
          const total = nearbyShots.length
          const percentage = made / total

          grid.push({
            x: centerX,
            y: centerY,
            total,
            made,
            percentage,
            intensity: Math.min(total / 5, 1) // Normalize intensity (max at 5 shots)
          })
        }
      }
    }

    return grid
  }

  const heatData = getHeatData()

  // Get color based on percentage (bad = red, good = green)
  const getHeatColor = (percentage) => {
    if (percentage < 0.25) return '#e74c3c'      // Bad - Red
    if (percentage < 0.35) return '#e67e22'      // Poor - Orange
    if (percentage < 0.45) return '#f39c12'      // Below avg - Yellow-orange
    if (percentage < 0.55) return '#f1c40f'      // Average - Yellow
    if (percentage < 0.65) return '#a8d86e'      // Good - Light green
    return '#2ecc71'                              // Great - Green
  }

  // Calculate stats
  const totalShots = markers.length
  const totalMade = markers.filter(m => m.made).length

  if (markers.length === 0) {
    return (
      <div className="chart-container">
        <h3>🎯 Zones de réussite</h3>
        <div className="chart-empty">
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>🎯 Zones de réussite</h3>

      <div className="heatmap-wrapper">
        <svg viewBox={`0 0 ${courtWidth} ${courtHeight}`} className="heatmap-svg">
          <defs>
            {/* Radial gradients for each heat point - sharper edges */}
            {heatData.map((point, i) => (
              <radialGradient key={`grad-${i}`} id={`heatGrad-${i}`}>
                <stop offset="0%" stopColor={getHeatColor(point.percentage)} stopOpacity={0.9 * point.intensity} />
                <stop offset="40%" stopColor={getHeatColor(point.percentage)} stopOpacity={0.7 * point.intensity} />
                <stop offset="70%" stopColor={getHeatColor(point.percentage)} stopOpacity={0.3 * point.intensity} />
                <stop offset="100%" stopColor={getHeatColor(point.percentage)} stopOpacity="0" />
              </radialGradient>
            ))}

            <linearGradient id="thermalPaintGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a4a8f" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#0d3a7a" stopOpacity="0.3"/>
            </linearGradient>
          </defs>

          {/* Dark court background */}
          <rect x="0" y="0" width={courtWidth} height={courtHeight} fill="#1a1a2e" />

          {/* Heat circles (drawn first, under court lines) */}
          {heatData.map((point, i) => (
            <circle
              key={`heat-${i}`}
              cx={point.x}
              cy={point.y}
              r={gridSize * 1.2}
              fill={`url(#heatGrad-${i})`}
            />
          ))}

          {/* Paint/Key area */}
          <rect x="170" y="0" width="160" height="190" fill="url(#thermalPaintGradient)"/>
          <rect x="170" y="0" width="160" height="190" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>

          {/* Free throw circle */}
          <circle cx="250" cy="190" r="60" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>

          {/* Restricted area */}
          <path d="M 210 0 A 40 40 0 0 0 290 0" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>

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
                <line x1={cornerX} y1="0" x2={cornerX} y2={arcStartY} stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
                <line x1={cornerRightX} y1="0" x2={cornerRightX} y2={arcEndY} stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
                <path
                  d={`M ${cornerX} ${arcStartY} A ${radius} ${radius} 0 0 0 ${cornerRightX} ${arcEndY}`}
                  fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"
                />
              </>
            )
          })()}

          {/* Court border */}
          <rect x="2" y="2" width={courtWidth - 4} height={courtHeight - 4} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>

          {/* Basket/Rim */}
          <circle cx="250" cy="50" r="12" fill="none" stroke="#ff6b35" strokeWidth="3"/>

          {/* Center line */}
          <line x1="0" y1={courtHeight - 2} x2={courtWidth} y2={courtHeight - 2} stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
        </svg>
      </div>

      {/* Stats */}
      <div className="heatmap-stats">
        <div className="heatmap-stat">
          <span className="heatmap-stat-value">{totalMade}/{totalShots}</span>
          <span className="heatmap-stat-label">Total ({totalShots > 0 ? Math.round(totalMade/totalShots*100) : 0}%)</span>
        </div>
      </div>

      {/* Thermal legend */}
      <div className="thermal-legend">
        <span className="thermal-cold">Raté</span>
        <div className="thermal-gradient red-green"></div>
        <span className="thermal-hot">Réussi</span>
      </div>
    </div>
  )
}
