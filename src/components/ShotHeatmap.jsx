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

  // Define zones for heatmap
  const zones = [
    // Paint area
    { id: 'paint', name: 'Raquette', path: 'M170,0 L330,0 L330,190 L170,190 Z', isThree: false },
    // Mid-range zones
    { id: 'mid-left', name: 'Mid gauche', path: 'M30,0 L170,0 L170,190 L30,190 Z', isThree: false },
    { id: 'mid-right', name: 'Mid droite', path: 'M330,0 L470,0 L470,190 L330,190 Z', isThree: false },
    { id: 'mid-top', name: 'Mid haut', path: 'M170,190 L330,190 L330,280 L170,280 Z', isThree: false },
    // Corner 3s
    { id: 'corner-left', name: 'Corner gauche', path: 'M0,0 L30,0 L30,200 L0,200 Z', isThree: true },
    { id: 'corner-right', name: 'Corner droite', path: 'M470,0 L500,0 L500,200 L470,200 Z', isThree: true },
    // Wing 3s
    { id: 'wing-left', name: 'Aile gauche', path: 'M0,200 L30,200 L100,400 L0,400 Z', isThree: true },
    { id: 'wing-right', name: 'Aile droite', path: 'M470,200 L500,200 L500,400 L400,400 Z', isThree: true },
    // Top of key 3
    { id: 'top-key', name: 'Top 3pts', path: 'M100,280 L400,280 L400,470 L100,470 Z', isThree: true },
  ]

  // Calculate zone stats
  const getZoneStats = (zoneId) => {
    const zoneMarkers = markers.filter(m => {
      const zone = getZoneForShot(m.x, m.y)
      return zone === zoneId
    })
    const made = zoneMarkers.filter(m => m.made).length
    const total = zoneMarkers.length
    return { made, total, percentage: total > 0 ? Math.round((made / total) * 100) : 0 }
  }

  // Determine which zone a shot belongs to
  const getZoneForShot = (x, y) => {
    // Paint
    if (x >= 170 && x <= 330 && y <= 190) return 'paint'
    // Mid-range
    if (x >= 30 && x < 170 && y <= 190) return 'mid-left'
    if (x > 330 && x <= 470 && y <= 190) return 'mid-right'
    if (x >= 170 && x <= 330 && y > 190 && y <= 280) return 'mid-top'
    // Corner 3s
    if (x < 30 && y <= 200) return 'corner-left'
    if (x > 470 && y <= 200) return 'corner-right'
    // Wing 3s
    if (x < 100 && y > 200) return 'wing-left'
    if (x > 400 && y > 200) return 'wing-right'
    // Top of key 3
    return 'top-key'
  }

  // Get color based on percentage
  const getHeatColor = (percentage, total) => {
    if (total === 0) return 'rgba(255, 255, 255, 0.1)'

    // Color gradient from red (0%) to yellow (50%) to green (100%)
    if (percentage < 33) {
      return `rgba(231, 76, 60, ${0.3 + (total * 0.05)})`  // Red
    } else if (percentage < 50) {
      return `rgba(243, 156, 18, ${0.3 + (total * 0.05)})`  // Orange
    } else if (percentage < 66) {
      return `rgba(241, 196, 15, ${0.3 + (total * 0.05)})`  // Yellow
    } else {
      return `rgba(46, 204, 113, ${0.3 + (total * 0.05)})`  // Green
    }
  }

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
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Les positions de tirs seront sauvegardées avec les prochains matchs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>🎯 Carte des tirs ({totalShots} tirs)</h3>

      <div className="heatmap-wrapper">
        <svg viewBox={`0 0 ${courtWidth} ${courtHeight}`} className="heatmap-svg">
          <defs>
            <linearGradient id="heatCourtShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.05)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>

          {/* Court background */}
          <rect x="0" y="0" width={courtWidth} height={courtHeight} fill="#1a1a2e" />

          {/* Heatmap zones */}
          {zones.map(zone => {
            const stats = getZoneStats(zone.id)
            return (
              <g key={zone.id}>
                <path
                  d={zone.path}
                  fill={getHeatColor(stats.percentage, stats.total)}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                {stats.total > 0 && (
                  <text
                    x={getZoneCenterX(zone.id)}
                    y={getZoneCenterY(zone.id)}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {stats.percentage}%
                  </text>
                )}
                {stats.total > 0 && (
                  <text
                    x={getZoneCenterX(zone.id)}
                    y={getZoneCenterY(zone.id) + 16}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="10"
                  >
                    {stats.made}/{stats.total}
                  </text>
                )}
              </g>
            )
          })}

          {/* Court lines overlay */}
          {/* Paint area */}
          <rect x="170" y="0" width="160" height="190"
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>

          {/* Free throw circle */}
          <circle cx="250" cy="190" r="60"
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>

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
                <line x1={cornerX} y1="0" x2={cornerX} y2={arcStartY}
                  stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                <line x1={cornerRightX} y1="0" x2={cornerRightX} y2={arcEndY}
                  stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                <path
                  d={`M ${cornerX} ${arcStartY} A ${radius} ${radius} 0 0 0 ${cornerRightX} ${arcEndY}`}
                  fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"
                />
              </>
            )
          })()}

          {/* Court border */}
          <rect x="2" y="2" width={courtWidth - 4} height={courtHeight - 4}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

          {/* Basket */}
          <circle cx="250" cy="50" r="12"
            fill="none" stroke="#ff6b35" strokeWidth="3" />

          {/* Shot markers (small dots) */}
          {markers.map((shot, i) => (
            <circle
              key={i}
              cx={shot.x}
              cy={shot.y}
              r="4"
              fill={shot.made ? '#2ecc71' : '#e74c3c'}
              opacity="0.6"
            />
          ))}
        </svg>
      </div>

      {/* Summary stats */}
      <div className="heatmap-stats">
        <div className="heatmap-stat">
          <span className="heatmap-stat-value">{totalMade}/{totalShots}</span>
          <span className="heatmap-stat-label">Total ({totalShots > 0 ? Math.round(totalMade/totalShots*100) : 0}%)</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-value">{twoMade}/{twoPointers.length}</span>
          <span className="heatmap-stat-label">2PTS ({twoPointers.length > 0 ? Math.round(twoMade/twoPointers.length*100) : 0}%)</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-value">{threeMade}/{threePointers.length}</span>
          <span className="heatmap-stat-label">3PTS ({threePointers.length > 0 ? Math.round(threeMade/threePointers.length*100) : 0}%)</span>
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="legend-item"><span className="legend-color" style={{background: '#e74c3c'}}></span> &lt;33%</span>
        <span className="legend-item"><span className="legend-color" style={{background: '#f39c12'}}></span> 33-50%</span>
        <span className="legend-item"><span className="legend-color" style={{background: '#f1c40f'}}></span> 50-66%</span>
        <span className="legend-item"><span className="legend-color" style={{background: '#2ecc71'}}></span> &gt;66%</span>
      </div>
    </div>
  )
}

// Helper functions for zone centers
function getZoneCenterX(zoneId) {
  const centers = {
    'paint': 250,
    'mid-left': 100,
    'mid-right': 400,
    'mid-top': 250,
    'corner-left': 15,
    'corner-right': 485,
    'wing-left': 50,
    'wing-right': 450,
    'top-key': 250
  }
  return centers[zoneId] || 250
}

function getZoneCenterY(zoneId) {
  const centers = {
    'paint': 95,
    'mid-left': 95,
    'mid-right': 95,
    'mid-top': 235,
    'corner-left': 100,
    'corner-right': 100,
    'wing-left': 300,
    'wing-right': 300,
    'top-key': 375
  }
  return centers[zoneId] || 235
}
