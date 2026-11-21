import { useState, useRef, useEffect } from 'react'
import ShotReplay from './ShotReplay'

const EDIT_FIELDS = [
  ['fg2Made', '2PTS réussis'], ['fg2Attempted', '2PTS tentés'],
  ['fg3Made', '3PTS réussis'], ['fg3Attempted', '3PTS tentés'],
  ['ftMade', 'LF réussis'], ['ftAttempted', 'LF tentés'],
  ['offRebounds', 'Rebonds off.'], ['defRebounds', 'Rebonds déf.'],
  ['assists', 'Passes déc.'], ['steals', 'Interceptions'],
  ['blocks', 'Contres'], ['fouls', 'Fautes'],
  ['turnovers', 'Pertes de balle']
]

// Stats par quart-temps : mêmes clés que match.quarterStats, sauf fg "réussis/tentés" scindé en deux
const QUARTER_FIELDS = [
  ['points', 'PTS'], ['fgMade', 'Tirs réussis'], ['fgAtt', 'Tirs tentés'],
  ['rebounds', 'REB'], ['assists', 'PD'], ['steals', 'INT'],
  ['blocks', 'CTR'], ['fouls', 'FTE'], ['turnovers', 'PDB']
]

// Tirs réussis / tentés d'un quart-temps. Avant la 1.10, fg valait « réussis/ratés » (sans fgAttempted)
const quarterFg = (q) => {
  if (q.fgAttempted !== undefined) return { made: q.fgMade || 0, att: q.fgAttempted || 0 }
  const [a, b] = String(q.fg || '0/0').split('/').map(n => parseInt(n, 10) || 0)
  return { made: a, att: a + b }
}

const quarterToValues = (q) => {
  const fg = quarterFg(q)
  const values = { fgMade: String(fg.made), fgAtt: String(fg.att) }
  QUARTER_FIELDS.forEach(([key]) => { if (!(key in values)) values[key] = String(q[key] ?? 0) })
  return values
}

// Totaux du match auxquels la somme des quart-temps doit correspondre
const quarterTotals = (v) => {
  const n = (key) => parseInt(v[key], 10) || 0
  return {
    points: n('fg2Made') * 2 + n('fg3Made') * 3 + n('ftMade'),
    fgMade: n('fg2Made') + n('fg3Made'),
    fgAtt: n('fg2Attempted') + n('fg3Attempted'),
    fg2Made: n('fg2Made'), fg2Att: n('fg2Attempted'), fg3Made: n('fg3Made'), fg3Att: n('fg3Attempted'),
    ftMade: n('ftMade'), ftAtt: n('ftAttempted'),
    rebounds: n('offRebounds') + n('defRebounds'),
    assists: n('assists'), steals: n('steals'), blocks: n('blocks'),
    fouls: n('fouls'), turnovers: n('turnovers')
  }
}

// Carte des tirs : mêmes coordonnées que CourtMap (500 × 470)
const shotIsThree = (s) => !!(s.isThree ?? s.isThreePointer ?? s.type === '3pts')

// Même géométrie que la ligne à 3 points de CourtMap
const isThreeZone = (x, y) => {
  const cornerY = 50 + Math.sqrt(238 * 238 - 220 * 220)
  if (y < cornerY) return x < 30 || x > 470
  return Math.hypot(x - 250, y - 50) > 238
}

// Position d'un toucher dans le repère du terrain
const courtPoint = (el, clientX, clientY) => {
  const rect = el.getBoundingClientRect()
  return { x: ((clientX - rect.left) / rect.width) * 500, y: ((clientY - rect.top) / rect.height) * 470 }
}

// Index du tir (hors LF) le plus proche du point, ou null au-delà de 22 unités
const nearestShot = (shots, x, y) => {
  let nearest = null
  shots.forEach((s, i) => {
    if (s.isFreeThrow) return
    const d = Math.hypot(s.x - x, s.y - y)
    if (d <= 22 && (nearest === null || d < nearest.d)) nearest = { i, d }
  })
  return nearest ? nearest.i : null
}

// Décompte des marqueurs de la carte (2PTS / 3PTS hors lancers francs, LF à part)
const shotCounts = (shots) => {
  const field = shots.filter(s => !s.isFreeThrow)
  return {
    count: field.length,
    made2: field.filter(s => !shotIsThree(s) && s.made).length,
    total2: field.filter(s => !shotIsThree(s)).length,
    made3: field.filter(s => shotIsThree(s) && s.made).length,
    total3: field.filter(s => shotIsThree(s)).length,
    madeFT: shots.filter(s => s.isFreeThrow && s.made).length,
    totalFT: shots.filter(s => s.isFreeThrow).length
  }
}

// Séries recalculées depuis la carte, même règle que getStreaks (useStats) : un raté remet à zéro.
// Ordre : par quart-temps, puis ordre d'enregistrement (un tir ajouté après coup arrive en fin de son quart-temps)
const shotStreaks = (shots) => {
  let current = 0, bestStreak = 0, points = 0, bestPointsStreak = 0
  const ordered = [...shots].sort((a, b) => (a.quarter || 0) - (b.quarter || 0))
  for (const s of ordered) {
    if (s.made) {
      current++
      points += s.isFreeThrow ? 1 : shotIsThree(s) ? 3 : 2
      bestStreak = Math.max(bestStreak, current)
      bestPointsStreak = Math.max(bestPointsStreak, points)
    } else {
      current = 0
      points = 0
    }
  }
  return { bestStreak, bestPointsStreak }
}

export default function MatchHistory({
  history,
  averages,
  recentAverages3,
  recentAverages5,
  records,
  goals,
  onDelete,
  onEditOpponent,
  onEditScore,
  onEditStats,
  onAddPhoto,
  onShare,
  onExportPDF
}) {
  const [selectedMatchId, setSelectedMatchId] = useState('all') // 'all' or match id
  const [compareMatchId, setCompareMatchId] = useState(null)
  const [showReplay, setShowReplay] = useState(false)
  const [editMatch, setEditMatch] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [editPM, setEditPM] = useState('0')
  const [editQuarters, setEditQuarters] = useState([])
  const [editShots, setEditShots] = useState([])
  const [selectedShot, setSelectedShot] = useState(null) // index dans editShots

  const openEditStats = (match) => {
    const values = {}
    EDIT_FIELDS.forEach(([key]) => { values[key] = String(match.stats?.[key] ?? 0) })
    setEditValues(values)
    setEditPM(String(match.plusMinus || 0))
    setEditQuarters((match.quarterStats || []).map(quarterToValues))
    setEditShots(match.shotMarkers || [])
    setSelectedShot(null)
    setEditMatch(match)
  }

  const setQuarterValue = (index, key, value) => {
    setEditQuarters(prev => prev.map((q, i) => i === index ? { ...q, [key]: value } : q))
  }

  // Remplit PTS et tirs réussis/tentés de chaque quart-temps d'après les marqueurs de la carte (LF = 1 pt, hors tirs)
  const recalcQuarters = () => {
    setEditQuarters(prev => prev.map((q, i) => {
      const shots = editShots.filter(s => s.quarter === editMatch.quarterStats[i].quarter)
      const field = shots.filter(s => !s.isFreeThrow)
      const points = shots.reduce((sum, s) => sum + (!s.made ? 0 : s.isFreeThrow ? 1 : shotIsThree(s) ? 3 : 2), 0)
      return { ...q, points: String(points), fgMade: String(field.filter(s => s.made).length), fgAtt: String(field.length) }
    }))
  }

  // Remplit les totaux 2PTS, 3PTS et LF (réussis/tentés) d'après les marqueurs de la carte
  const recalcTotals = () => {
    const c = shotCounts(editShots)
    setEditValues(v => ({
      ...v,
      fg2Made: String(c.made2), fg2Attempted: String(c.total2),
      fg3Made: String(c.made3), fg3Attempted: String(c.total3),
      ftMade: String(c.madeFT), ftAttempted: String(c.totalFT)
    }))
  }

  const editTotals = quarterTotals(editValues)
  const editShotCounts = shotCounts(editShots)
  const shotsChanged = !!editMatch && JSON.stringify(editShots) !== JSON.stringify(editMatch.shotMarkers || [])
  const editStreaks = shotStreaks(editShots)

  const courtRef = useRef(null)
  const dragRef = useRef(null) // tir saisi au dernier appui : { index, dx, dy, startX, startY, active, moving }
  const shotsRef = useRef(editShots)
  shotsRef.current = editShots

  // Un doigt posé sur un tir ne doit pas faire défiler la fenêtre (écouteur non passif, impossible via onTouchStart)
  useEffect(() => {
    const el = courtRef.current
    if (!el) return
    const onTouchStart = (ev) => {
      const { x, y } = courtPoint(el, ev.touches[0].clientX, ev.touches[0].clientY)
      if (nearestShot(shotsRef.current, x, y) !== null) ev.preventDefault()
    }
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    return () => el.removeEventListener('touchstart', onTouchStart)
  }, [editMatch])

  // Appui sur un tir : sélection, puis déplacement si le doigt glisse
  const handleCourtDown = (e) => {
    const { x, y } = courtPoint(e.currentTarget, e.clientX, e.clientY)
    const index = nearestShot(editShots, x, y)
    if (index === null) { dragRef.current = null; return }
    setSelectedShot(index)
    dragRef.current = { index, dx: editShots[index].x - x, dy: editShots[index].y - y, startX: x, startY: y, active: true, moving: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleCourtMove = (e) => {
    const d = dragRef.current
    if (!d || !d.active) return
    const { x, y } = courtPoint(e.currentTarget, e.clientX, e.clientY)
    if (!d.moving && Math.hypot(x - d.startX, y - d.startY) < 6) return
    d.moving = true
    const nx = Math.min(500, Math.max(0, x + d.dx))
    const ny = Math.min(470, Math.max(0, y + d.dy))
    setEditShots(prev => prev.map((s, i) => {
      if (i !== d.index) return s
      // Le type suit la zone seulement quand le tir franchit la ligne à 3 points
      const three = isThreeZone(nx, ny)
      const crossed = isThreeZone(s.x, s.y) !== three
      return { ...s, x: nx, y: ny, ...(crossed ? { isThree: three, type: three ? '3pts' : '2pts' } : {}) }
    }))
  }

  const handleCourtUp = () => {
    if (dragRef.current) dragRef.current.active = false
  }

  // Toucher le terrain vide ajoute un tir (un appui sur un tir est géré par handleCourtDown)
  const handleCourtTap = (e) => {
    if (dragRef.current) { dragRef.current = null; return }
    const { x, y } = courtPoint(e.currentTarget, e.clientX, e.clientY)
    const isThree = isThreeZone(x, y)
    const quarter = selectedShot !== null ? editShots[selectedShot].quarter : 1
    setSelectedShot(editShots.length)
    setEditShots(prev => [...prev, { id: Date.now(), x, y, isThree, type: isThree ? '3pts' : '2pts', made: true, quarter, timeLeft: 0 }])
  }

  // Même marqueur que pendant un match : posé sur la ligne des lancers francs
  const addFreeThrow = () => {
    const quarter = selectedShot !== null ? editShots[selectedShot].quarter : 1
    setSelectedShot(editShots.length)
    setEditShots(prev => [...prev, {
      id: Date.now(),
      x: 250 + (Math.random() - 0.5) * 20,
      y: 190 + (Math.random() - 0.5) * 10,
      made: true,
      isThreePointer: false,
      isFreeThrow: true,
      quarter
    }])
  }

  const updateShot = (patch) => {
    setEditShots(prev => prev.map((s, i) => i === selectedShot ? { ...s, ...patch } : s))
  }

  const deleteShot = () => {
    setEditShots(prev => prev.filter((_, i) => i !== selectedShot))
    setSelectedShot(null)
  }

  const saveEditStats = () => {
    const stats = {}
    for (const [key, label] of EDIT_FIELDS) {
      const n = parseInt(editValues[key], 10)
      if (isNaN(n) || n < 0) { alert(`Valeur invalide : ${label}`); return }
      stats[key] = n
    }
    for (const [made, att, label] of [['fg2Made', 'fg2Attempted', '2PTS'], ['fg3Made', 'fg3Attempted', '3PTS'], ['ftMade', 'ftAttempted', 'LF']]) {
      if (stats[made] > stats[att]) { alert(`${label} : plus de réussis que de tentés`); return }
    }
    const plusMinus = parseInt(editPM, 10)
    if (isNaN(plusMinus)) { alert('Valeur invalide : +/-'); return }

    const oldQuarters = editMatch.quarterStats || []
    const quarters = []
    for (let i = 0; i < editQuarters.length; i++) {
      const q = {}
      for (const [key, label] of QUARTER_FIELDS) {
        const n = parseInt(editQuarters[i][key], 10)
        if (isNaN(n) || n < 0) { alert(`Valeur invalide : Q${oldQuarters[i].quarter} ${label}`); return }
        q[key] = n
      }
      if (q.fgMade > q.fgAtt) { alert(`Q${oldQuarters[i].quarter} : plus de tirs réussis que de tentés`); return }
      quarters.push(q)
    }

    const changes = EDIT_FIELDS
      .filter(([key]) => stats[key] !== (editMatch.stats?.[key] ?? 0))
      .map(([key, label]) => `${label} : ${editMatch.stats?.[key] ?? 0} → ${stats[key]}`)
    if (plusMinus !== (editMatch.plusMinus || 0)) changes.push(`+/- : ${editMatch.plusMinus || 0} → ${plusMinus}`)
    quarters.forEach((q, i) => {
      const before = quarterToValues(oldQuarters[i])
      QUARTER_FIELDS.forEach(([key, label]) => {
        if (String(q[key]) !== before[key]) changes.push(`Q${oldQuarters[i].quarter} ${label} : ${before[key]} → ${q[key]}`)
      })
    })
    if (shotsChanged) {
      const b = shotCounts(editMatch.shotMarkers || [])
      const a = editShotCounts
      const parts = [['2PTS', 'made2', 'total2'], ['3PTS', 'made3', 'total3'], ['LF', 'madeFT', 'totalFT']]
        .filter(([, m, t]) => b[m] !== a[m] || b[t] !== a[t])
        .map(([label, m, t]) => `${label} ${b[m]}/${b[t]} → ${a[m]}/${a[t]}`)
      changes.push(parts.length === 0 ? 'Carte des tirs : tirs modifiés' : `Carte des tirs : ${parts.join(', ')}`)
      const old = editMatch.streaks || {}
      if ((old.bestStreak || 0) !== editStreaks.bestStreak || (old.bestPointsStreak || 0) !== editStreaks.bestPointsStreak) {
        changes.push(`Meilleure série : ${old.bestStreak || 0} tirs / ${old.bestPointsStreak || 0} pts → ${editStreaks.bestStreak} tirs / ${editStreaks.bestPointsStreak} pts`)
      }
    }
    if (changes.length === 0) { setEditMatch(null); return }

    const totals = quarterTotals(stats)
    const gaps = quarters.length === 0 ? [] : QUARTER_FIELDS
      .map(([key, label]) => [label, quarters.reduce((sum, q) => sum + q[key], 0), totals[key]])
      .filter(([, sum, total]) => sum !== total)
      .map(([label, sum, total]) => `${label} : ${sum} par quart-temps, ${total} au total`)
    let warning = gaps.length > 0 ? `\n\n⚠️ Quart-temps différents des totaux :\n${gaps.join('\n')}` : ''
    const shotGaps = editShots.length === 0 ? [] : [
      ['2PTS', editShotCounts.made2, editShotCounts.total2, stats.fg2Made, stats.fg2Attempted],
      ['3PTS', editShotCounts.made3, editShotCounts.total3, stats.fg3Made, stats.fg3Attempted],
      ['LF', editShotCounts.madeFT, editShotCounts.totalFT, stats.ftMade, stats.ftAttempted]
    ].filter(([, m, t, sm, st]) => m !== sm || t !== st)
      .map(([label, m, t, sm, st]) => `${label} : ${m}/${t} sur la carte, ${sm}/${st} au total`)
    if (shotGaps.length > 0) warning += `\n\n⚠️ Carte des tirs différente des totaux :\n${shotGaps.join('\n')}`

    if (confirm(`Modifier ce match ?\n\n${changes.join('\n')}${warning}`)) {
      const extra = { plusMinus }
      if (quarters.length > 0) {
        extra.quarterStats = quarters.map(({ fgMade, fgAtt, ...rest }, i) => ({ ...oldQuarters[i], ...rest, fgMade, fgAttempted: fgAtt, fg: `${fgMade}/${fgAtt}` }))
      }
      if (shotsChanged) {
        extra.shotMarkers = editShots
        extra.streaks = { ...editMatch.streaks, ...editStreaks }
      }
      onEditStats(editMatch.id, stats, extra)
      setEditMatch(null)
    }
  }

  // Trend indicator: compare recent average vs global average
  const getTrend = (stat, recent, global) => {
    const r = parseFloat(recent[stat])
    const g = parseFloat(global[stat])
    if (g === 0) return r > 0 ? '↑' : ''
    const diff = ((r - g) / g) * 100
    if (diff > 10) return '↑'
    if (diff < -10) return '↓'
    return '→'
  }

  const formatMinutes = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate totals across all matches
  const getTotals = () => {
    if (history.length === 0) return null

    const totals = history.reduce((acc, match) => ({
      points: acc.points + match.summary.points,
      rebounds: acc.rebounds + match.summary.rebounds,
      assists: acc.assists + match.summary.assists,
      steals: acc.steals + match.summary.steals,
      blocks: acc.blocks + match.summary.blocks,
      fouls: acc.fouls + match.summary.fouls,
      turnovers: acc.turnovers + match.summary.turnovers,
      fg2Made: acc.fg2Made + (match.stats?.fg2Made || 0),
      fg2Attempted: acc.fg2Attempted + (match.stats?.fg2Attempted || 0),
      fg3Made: acc.fg3Made + (match.stats?.fg3Made || 0),
      fg3Attempted: acc.fg3Attempted + (match.stats?.fg3Attempted || 0),
      ftMade: acc.ftMade + (match.stats?.ftMade || 0),
      ftAttempted: acc.ftAttempted + (match.stats?.ftAttempted || 0),
      plusMinus: acc.plusMinus + (match.plusMinus || 0),
      gameScoreSum: acc.gameScoreSum + (match.efficiency?.gameScore || 0),
      gameScoreCount: acc.gameScoreCount + (match.efficiency?.gameScore !== undefined ? 1 : 0),
      perSum: acc.perSum + (match.efficiency?.per || 0),
      perCount: acc.perCount + (match.efficiency?.per !== undefined ? 1 : 0),
      usageRateSum: acc.usageRateSum + (match.efficiency?.usageRate || 0),
      usageRateCount: acc.usageRateCount + (match.efficiency?.usageRate !== undefined ? 1 : 0),
    }), {
      points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0, turnovers: 0,
      fg2Made: 0, fg2Attempted: 0, fg3Made: 0, fg3Attempted: 0, ftMade: 0, ftAttempted: 0,
      plusMinus: 0, gameScoreSum: 0, gameScoreCount: 0, perSum: 0, perCount: 0, usageRateSum: 0, usageRateCount: 0
    })

    // Calculate True Shooting % for all shots combined
    const fga = totals.fg2Attempted + totals.fg3Attempted
    const tsa = fga + 0.44 * totals.ftAttempted
    const trueShootingPct = tsa > 0 ? Math.round(totals.points / (2 * tsa) * 100) : 0

    // Average Game Score
    const avgGameScore = totals.gameScoreCount > 0
      ? (totals.gameScoreSum / totals.gameScoreCount).toFixed(1)
      : null

    // Average PER
    const avgPer = totals.perCount > 0
      ? (totals.perSum / totals.perCount).toFixed(1)
      : null

    // Average Usage Rate
    const avgUsageRate = totals.usageRateCount > 0
      ? Math.round(totals.usageRateSum / totals.usageRateCount)
      : null

    return {
      ...totals,
      trueShootingPct,
      avgGameScore,
      avgPer,
      avgUsageRate
    }
  }

  const totals = getTotals()
  const selectedMatch = selectedMatchId === 'all' ? null : history.find(m => m.id === selectedMatchId)
  const compareMatch = compareMatchId ? history.find(m => m.id === compareMatchId) : null

  // Check if a match contains any records
  const getMatchRecords = (match) => {
    if (!records) return []
    const matchRecords = []
    if (records.points.value === match.summary.points && match.summary.points > 0) {
      matchRecords.push('PTS')
    }
    if (records.rebounds.value === match.summary.rebounds && match.summary.rebounds > 0) {
      matchRecords.push('REB')
    }
    if (records.assists.value === match.summary.assists && match.summary.assists > 0) {
      matchRecords.push('AST')
    }
    if (records.steals.value === match.summary.steals && match.summary.steals > 0) {
      matchRecords.push('STL')
    }
    if (records.blocks.value === match.summary.blocks && match.summary.blocks > 0) {
      matchRecords.push('BLK')
    }
    if (match.plusMinus !== undefined && records.plusMinus.value === match.plusMinus && match.plusMinus !== 0) {
      matchRecords.push('+/-')
    }
    return matchRecords
  }

  // Get stats to display based on selection
  const displayStats = selectedMatch ? {
    ...selectedMatch.summary,
    ...selectedMatch.stats,
    matchCount: 1,
    plusMinus: selectedMatch.plusMinus,
    trueShootingPct: selectedMatch.efficiency?.trueShootingPct,
    gameScore: selectedMatch.efficiency?.gameScore,
    per: selectedMatch.efficiency?.per,
    usageRate: selectedMatch.efficiency?.usageRate
  } : totals ? {
    ...totals,
    matchCount: history.length,
    gameScore: totals.avgGameScore,
    per: totals.avgPer,
    usageRate: totals.avgUsageRate
  } : null

  return (
    <div className="history-page">
      {/* Filter Section */}
      {history.length > 0 && (
        <div className="history-filter">
          <label>Afficher :</label>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="match-select"
          >
            <option value="all">📊 Tous les matchs (Total)</option>
            {[...history].reverse().map((match, index) => (
              <option key={match.id} value={match.id}>
                {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {match.opponent ? ` vs ${match.opponent}` : ` - Match ${history.length - index}`}
                {' '}({match.summary.points} pts)
              </option>
            ))}
          </select>
          {selectedMatch && history.length >= 2 && (
            <div className="compare-section">
              <label>Comparer avec :</label>
              <select
                value={compareMatchId || ''}
                onChange={(e) => setCompareMatchId(e.target.value ? Number(e.target.value) : null)}
                className="match-select"
              >
                <option value="">-- Aucun --</option>
                {[...history].reverse().filter(m => m.id !== selectedMatchId).map((match, index) => (
                  <option key={match.id} value={match.id}>
                    {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    {match.opponent ? ` vs ${match.opponent}` : ` - Match`}
                    {' '}({match.summary.points} pts)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Comparison View */}
      {selectedMatch && compareMatch && (
        <div className="compare-view">
          <h3>⚔️ Comparaison</h3>
          <div className="compare-header">
            <span className="compare-team">{selectedMatch.opponent || 'Match 1'}<br/>{new Date(selectedMatch.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
            <span className="compare-vs">VS</span>
            <span className="compare-team">{compareMatch.opponent || 'Match 2'}<br/>{new Date(compareMatch.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          </div>
          {[
            { label: 'Points', key: 'points' },
            { label: 'Rebonds', key: 'rebounds' },
            { label: 'Passes D.', key: 'assists' },
            { label: 'Interc.', key: 'steals' },
            { label: 'Contres', key: 'blocks' },
            { label: 'Pertes', key: 'turnovers', inverse: true },
            { label: 'Fautes', key: 'fouls', inverse: true },
            { label: 'FG%', key: 'fgPercentage' },
            { label: 'FT%', key: 'ftPercentage' },
          ].map(({ label, key, inverse }) => {
            const v1 = selectedMatch.summary[key] ?? 0
            const v2 = compareMatch.summary[key] ?? 0
            const better = inverse ? (v1 < v2 ? 'left' : v1 > v2 ? 'right' : 'equal') : (v1 > v2 ? 'left' : v1 < v2 ? 'right' : 'equal')
            return (
              <div key={key} className="compare-row">
                <span className={`compare-val ${better === 'left' ? 'better' : ''}`}>{v1}</span>
                <span className="compare-label">{label}</span>
                <span className={`compare-val ${better === 'right' ? 'better' : ''}`}>{v2}</span>
              </div>
            )
          })}
          {selectedMatch.efficiency && compareMatch.efficiency && (
            <>
              {[
                { label: 'TS%', k: 'trueShootingPct' },
                { label: 'GmSc', k: 'gameScore' },
                { label: 'PER', k: 'per' },
              ].map(({ label, k }) => {
                const v1 = selectedMatch.efficiency[k] ?? 0
                const v2 = compareMatch.efficiency[k] ?? 0
                const better = v1 > v2 ? 'left' : v1 < v2 ? 'right' : 'equal'
                return (
                  <div key={k} className="compare-row">
                    <span className={`compare-val ${better === 'left' ? 'better' : ''}`}>{v1}</span>
                    <span className="compare-label">{label}</span>
                    <span className={`compare-val ${better === 'right' ? 'better' : ''}`}>{v2}</span>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Detailed Stats Display */}
      {displayStats && (
        <div className="detailed-stats-section">
          <div className="detailed-stats-header">
            <h3>
              {selectedMatch
                ? `📋 ${selectedMatch.opponent ? `vs ${selectedMatch.opponent}` : 'Match'} - ${new Date(selectedMatch.date).toLocaleDateString('fr-FR')}`
                : `📊 Total sur ${displayStats.matchCount} match${displayStats.matchCount > 1 ? 's' : ''}`
              }
            </h3>
            {selectedMatch && (
              <div className="match-actions-row">
                {selectedMatch.shotMarkers && selectedMatch.shotMarkers.length > 0 && (
                  <button className="replay-btn-history" onClick={() => setShowReplay(true)}>
                    🎬 Replay
                  </button>
                )}
                <button className="share-btn-history" onClick={() => onShare(selectedMatch.id)}>
                  📤 Partager
                </button>
                <button className="share-btn-history" onClick={() => onExportPDF(selectedMatch.id)}>
                  📄 PDF
                </button>
              </div>
            )}
          </div>

          {/* Match Photo */}
          {selectedMatch && selectedMatch.photo && (
            <div className="match-photo-display">
              <img src={selectedMatch.photo} alt="Photo du match" />
            </div>
          )}

          {/* Main Stats */}
          <div className="detailed-stats-grid">
            <div className="detailed-stat big">
              <span className="ds-value">{displayStats.points}</span>
              <span className="ds-label">POINTS</span>
            </div>
            <div className="detailed-stat">
              <span className="ds-value">{displayStats.rebounds}</span>
              <span className="ds-label">REBONDS</span>
            </div>
            <div className="detailed-stat">
              <span className="ds-value">{displayStats.assists}</span>
              <span className="ds-label">PASSES D.</span>
            </div>
            <div className="detailed-stat">
              <span className="ds-value">{displayStats.steals}</span>
              <span className="ds-label">INTERC.</span>
            </div>
            <div className="detailed-stat">
              <span className="ds-value">{displayStats.blocks}</span>
              <span className="ds-label">CONTRES</span>
            </div>
            <div className="detailed-stat negative">
              <span className="ds-value">{displayStats.turnovers}</span>
              <span className="ds-label">PERTES</span>
            </div>
            <div className="detailed-stat negative">
              <span className="ds-value">{displayStats.fouls}</span>
              <span className="ds-label">FAUTES</span>
            </div>
            <div className={`detailed-stat ${(displayStats.plusMinus || 0) > 0 ? 'positive' : (displayStats.plusMinus || 0) < 0 ? 'negative' : ''}`}>
              <span className="ds-value">{(displayStats.plusMinus || 0) > 0 ? '+' : ''}{displayStats.plusMinus || 0}</span>
              <span className="ds-label">+/-</span>
            </div>
            <div className="detailed-stat efficiency">
              <span className="ds-value">{displayStats.trueShootingPct || 0}%</span>
              <span className="ds-label">TS%</span>
            </div>
            <div className={`detailed-stat efficiency ${parseFloat(displayStats.gameScore || 0) >= 10 ? 'positive' : parseFloat(displayStats.gameScore || 0) < 0 ? 'negative' : ''}`}>
              <span className="ds-value">{displayStats.gameScore || 0}</span>
              <span className="ds-label">{selectedMatch ? 'GmSc' : 'GmSc moy.'}</span>
            </div>
            <div className={`detailed-stat efficiency ${parseFloat(displayStats.per || 0) >= 15 ? 'positive' : parseFloat(displayStats.per || 0) < 10 ? 'negative' : ''}`}>
              <span className="ds-value">{displayStats.per || 0}</span>
              <span className="ds-label">{selectedMatch ? 'PER' : 'PER moy.'}</span>
            </div>
            <div className="detailed-stat efficiency">
              <span className="ds-value">{displayStats.usageRate || 0}%</span>
              <span className="ds-label">{selectedMatch ? 'USG%' : 'USG% moy.'}</span>
            </div>
          </div>

          {/* Shooting Stats */}
          <div className="shooting-stats">
            <h4>🎯 Tirs</h4>
            <div className="shooting-grid">
              <div className="shooting-stat">
                <div className="shooting-label">2 Points</div>
                <div className="shooting-value">
                  {displayStats.fg2Made}/{displayStats.fg2Attempted}
                  <span className="shooting-pct">
                    {displayStats.fg2Attempted > 0
                      ? ` (${Math.round(displayStats.fg2Made / displayStats.fg2Attempted * 100)}%)`
                      : ' (0%)'}
                  </span>
                </div>
              </div>
              <div className="shooting-stat">
                <div className="shooting-label">3 Points</div>
                <div className="shooting-value">
                  {displayStats.fg3Made}/{displayStats.fg3Attempted}
                  <span className="shooting-pct">
                    {displayStats.fg3Attempted > 0
                      ? ` (${Math.round(displayStats.fg3Made / displayStats.fg3Attempted * 100)}%)`
                      : ' (0%)'}
                  </span>
                </div>
              </div>
              <div className="shooting-stat">
                <div className="shooting-label">Lancers Francs</div>
                <div className="shooting-value">
                  {displayStats.ftMade}/{displayStats.ftAttempted}
                  <span className="shooting-pct">
                    {displayStats.ftAttempted > 0
                      ? ` (${Math.round(displayStats.ftMade / displayStats.ftAttempted * 100)}%)`
                      : ' (0%)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Playing Time (only for selected match) */}
          {selectedMatch && selectedMatch.playingTime && (
            <div className="playing-time-display">
              <h4>⏱️ Temps de jeu</h4>
              <div className="playing-time-grid">
                <div className="playing-time-item">
                  <span className="pt-value">{formatMinutes(selectedMatch.playingTime.onCourt)}</span>
                  <span className="pt-label">Sur le terrain</span>
                </div>
                <div className="playing-time-item">
                  <span className="pt-value">{formatMinutes(selectedMatch.playingTime.bench)}</span>
                  <span className="pt-label">Sur le banc</span>
                </div>
              </div>
            </div>
          )}

          {/* Quarter Stats (only for selected match) */}
          {selectedMatch && selectedMatch.quarterStats && (
            <div className="quarter-stats-display">
              <h4>📊 Stats par quart-temps</h4>
              <div className="quarter-stats-grid">
                {selectedMatch.quarterStats.map(q => (
                  <div key={q.quarter} className="quarter-stat-card">
                    <span className="qs-quarter">Q{q.quarter}</span>
                    <span className="qs-points">{q.points} pts</span>
                    <span className="qs-detail">{quarterFg(q).made}/{quarterFg(q).att} FG</span>
                    <span className="qs-detail">{q.rebounds} reb</span>
                    <span className="qs-detail">{q.assists} ast</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match Notes (only for selected match) */}
          {selectedMatch && selectedMatch.notes && (selectedMatch.notes.strengths || selectedMatch.notes.improvements) && (
            <div className="match-notes-display">
              <h4>📝 Notes du match</h4>
              {selectedMatch.notes.strengths && (
                <div className="note-item strengths">
                  <span className="note-icon">💪</span>
                  <span className="note-text">{selectedMatch.notes.strengths}</span>
                </div>
              )}
              {selectedMatch.notes.improvements && (
                <div className="note-item improvements">
                  <span className="note-icon">📈</span>
                  <span className="note-text">{selectedMatch.notes.improvements}</span>
                </div>
              )}
            </div>
          )}

          {/* Averages (only for all matches) */}
          {!selectedMatch && averages && (
            <div className="averages-inline">
              <h4>📈 Moyennes par match</h4>
              <div className="averages-inline-grid">
                <span>{averages.points} pts</span>
                <span>{averages.rebounds} reb</span>
                <span>{averages.assists} ast</span>
                <span>{averages.steals} stl</span>
                <span>{averages.blocks} blk</span>
              </div>

              {/* Moyennes glissantes */}
              {recentAverages3 && history.length >= 3 && (
                <div className="rolling-averages">
                  <h5>3 derniers matchs</h5>
                  <div className="averages-inline-grid">
                    <span>{recentAverages3.points} pts {getTrend('points', recentAverages3, averages)}</span>
                    <span>{recentAverages3.rebounds} reb {getTrend('rebounds', recentAverages3, averages)}</span>
                    <span>{recentAverages3.assists} ast {getTrend('assists', recentAverages3, averages)}</span>
                    <span>{recentAverages3.steals} stl {getTrend('steals', recentAverages3, averages)}</span>
                    <span>{recentAverages3.blocks} blk {getTrend('blocks', recentAverages3, averages)}</span>
                  </div>
                </div>
              )}
              {recentAverages5 && history.length >= 5 && (
                <div className="rolling-averages">
                  <h5>5 derniers matchs</h5>
                  <div className="averages-inline-grid">
                    <span>{recentAverages5.points} pts {getTrend('points', recentAverages5, averages)}</span>
                    <span>{recentAverages5.rebounds} reb {getTrend('rebounds', recentAverages5, averages)}</span>
                    <span>{recentAverages5.assists} ast {getTrend('assists', recentAverages5, averages)}</span>
                    <span>{recentAverages5.steals} stl {getTrend('steals', recentAverages5, averages)}</span>
                    <span>{recentAverages5.blocks} blk {getTrend('blocks', recentAverages5, averages)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personal Records (only for all matches) */}
          {!selectedMatch && records && (
            <div className="records-inline">
              <h4>🏆 Records personnels</h4>
              <div className="records-grid">
                <div className="record-card">
                  <span className="record-icon">🔥</span>
                  <span className="record-value">{records.points.value}</span>
                  <span className="record-label">Points</span>
                  {records.points.opponent && (
                    <span className="record-info">vs {records.points.opponent}</span>
                  )}
                </div>
                <div className="record-card">
                  <span className="record-icon">🏀</span>
                  <span className="record-value">{records.rebounds.value}</span>
                  <span className="record-label">Rebonds</span>
                  {records.rebounds.opponent && (
                    <span className="record-info">vs {records.rebounds.opponent}</span>
                  )}
                </div>
                <div className="record-card">
                  <span className="record-icon">🎯</span>
                  <span className="record-value">{records.assists.value}</span>
                  <span className="record-label">Passes D.</span>
                  {records.assists.opponent && (
                    <span className="record-info">vs {records.assists.opponent}</span>
                  )}
                </div>
                <div className="record-card">
                  <span className="record-icon">✋</span>
                  <span className="record-value">{records.steals.value}</span>
                  <span className="record-label">Interc.</span>
                  {records.steals.opponent && (
                    <span className="record-info">vs {records.steals.opponent}</span>
                  )}
                </div>
                <div className="record-card">
                  <span className="record-icon">🛡️</span>
                  <span className="record-value">{records.blocks.value}</span>
                  <span className="record-label">Contres</span>
                  {records.blocks.opponent && (
                    <span className="record-info">vs {records.blocks.opponent}</span>
                  )}
                </div>
                {records.plusMinus.value !== 0 && (
                  <div className="record-card">
                    <span className="record-icon">📊</span>
                    <span className="record-value">
                      {records.plusMinus.value > 0 ? '+' : ''}{records.plusMinus.value}
                    </span>
                    <span className="record-label">+/-</span>
                    {records.plusMinus.opponent && (
                      <span className="record-info">vs {records.plusMinus.opponent}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Goals Progress (only for all matches) */}
          {!selectedMatch && averages && goals && (goals.points || goals.rebounds || goals.assists) && (
            <div className="goals-section">
              <h4>🎯 Objectifs</h4>
              <div className="goals-progress-grid">
                {goals.points && (
                  <div className="goal-progress">
                    <div className="goal-info">
                      <span className="goal-label">Points</span>
                      <span className="goal-values">{averages.points} / {goals.points}</span>
                    </div>
                    <div className="goal-bar">
                      <div
                        className={`goal-fill ${parseFloat(averages.points) >= parseFloat(goals.points) ? 'reached' : ''}`}
                        style={{ width: `${Math.min(100, (parseFloat(averages.points) / parseFloat(goals.points)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {goals.rebounds && (
                  <div className="goal-progress">
                    <div className="goal-info">
                      <span className="goal-label">Rebonds</span>
                      <span className="goal-values">{averages.rebounds} / {goals.rebounds}</span>
                    </div>
                    <div className="goal-bar">
                      <div
                        className={`goal-fill ${parseFloat(averages.rebounds) >= parseFloat(goals.rebounds) ? 'reached' : ''}`}
                        style={{ width: `${Math.min(100, (parseFloat(averages.rebounds) / parseFloat(goals.rebounds)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {goals.assists && (
                  <div className="goal-progress">
                    <div className="goal-info">
                      <span className="goal-label">Passes D.</span>
                      <span className="goal-values">{averages.assists} / {goals.assists}</span>
                    </div>
                    <div className="goal-bar">
                      <div
                        className={`goal-fill ${parseFloat(averages.assists) >= parseFloat(goals.assists) ? 'reached' : ''}`}
                        style={{ width: `${Math.min(100, (parseFloat(averages.assists) / parseFloat(goals.assists)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Match List */}
      <div className="match-list">
        <div className="match-list-header">
          <h3>📋 Liste des matchs</h3>
        </div>

        {history.length === 0 ? (
          <div className="no-matches">
            <p>Aucun match enregistré.</p>
            <p>Retourne à l'onglet "Match" et clique sur "Sauvegarder le match" pour commencer !</p>
          </div>
        ) : (
          <div className="matches">
            {[...history].reverse().map((match) => {
              const matchRecords = getMatchRecords(match)
              return (
              <div
                key={match.id}
                className={`match-card ${selectedMatchId === match.id ? 'selected' : ''} ${matchRecords.length > 0 ? 'has-record' : ''}`}
                onClick={() => setSelectedMatchId(selectedMatchId === match.id ? 'all' : match.id)}
              >
                <div className="match-header">
                  <span className={`match-location ${match.location || 'home'}`}>
                    {match.location === 'away' ? '✈️' : '🏠'}
                  </span>
                  <span className="match-date">
                    {new Date(match.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  {match.opponent && (
                    <span className="match-opponent">vs {match.opponent}</span>
                  )}
                  {matchRecords.length > 0 && (
                    <span className="record-badge">🏆 {matchRecords.join(', ')}</span>
                  )}
                  {match.playingTime && match.playingTime.onCourt > 0 && (
                    <span className="match-playtime">⏱️ {formatMinutes(match.playingTime.onCourt)}</span>
                  )}
                  {match.score && (match.score.team !== null || match.score.opponent !== null) && (
                    <span className={`match-score ${
                      match.score.team > match.score.opponent ? 'win' :
                      match.score.team < match.score.opponent ? 'loss' : 'draw'
                    }`}>
                      {match.score.team ?? '-'} - {match.score.opponent ?? '-'}
                    </span>
                  )}
                  <button
                    className="edit-btn"
                    onClick={(e) => { e.stopPropagation(); onEditOpponent(match.id, match.opponent); }}
                    title="Modifier l'adversaire"
                  >
                    ✎
                  </button>
                  <button
                    className="edit-btn"
                    onClick={(e) => { e.stopPropagation(); onEditScore(match.id, match.score); }}
                    title="Modifier le score"
                  >
                    🏆
                  </button>
                  <button
                    className="edit-btn"
                    onClick={(e) => { e.stopPropagation(); openEditStats(match); }}
                    title="Modifier les stats"
                  >
                    🔢
                  </button>
                  <button
                    className="edit-btn"
                    onClick={(e) => { e.stopPropagation(); onAddPhoto(match.id); }}
                    title={match.photo ? 'Changer la photo' : 'Ajouter une photo'}
                  >
                    📷
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}
                    title="Supprimer ce match"
                  >
                    ×
                  </button>
                </div>
                <div className="match-stats">
                  <div className="match-stat highlight">
                    <span className="stat-val">{match.summary.points}</span>
                    <span className="stat-name">PTS</span>
                  </div>
                  <div className="match-stat">
                    <span className="stat-val">{match.summary.rebounds}</span>
                    <span className="stat-name">REB</span>
                  </div>
                  <div className="match-stat">
                    <span className="stat-val">{match.summary.assists}</span>
                    <span className="stat-name">AST</span>
                  </div>
                  <div className="match-stat">
                    <span className="stat-val">{match.summary.steals}</span>
                    <span className="stat-name">STL</span>
                  </div>
                  <div className="match-stat">
                    <span className="stat-val">{match.summary.blocks}</span>
                    <span className="stat-name">BLK</span>
                  </div>
                  <div className="match-stat">
                    <span className="stat-val">{match.summary.fgPercentage}%</span>
                    <span className="stat-name">FG%</span>
                  </div>
                  {match.plusMinus !== undefined && match.plusMinus !== 0 && (
                    <div className={`match-stat ${match.plusMinus > 0 ? 'positive' : 'negative'}`}>
                      <span className="stat-val">{match.plusMinus > 0 ? '+' : ''}{match.plusMinus}</span>
                      <span className="stat-name">+/-</span>
                    </div>
                  )}
                  {match.efficiency && (
                    <>
                      <div className="match-stat efficiency">
                        <span className="stat-val">{match.efficiency.trueShootingPct}%</span>
                        <span className="stat-name">TS%</span>
                      </div>
                      <div className={`match-stat efficiency ${match.efficiency.gameScore >= 10 ? 'positive' : match.efficiency.gameScore < 0 ? 'negative' : ''}`}>
                        <span className="stat-val">{match.efficiency.gameScore}</span>
                        <span className="stat-name">GmSc</span>
                      </div>
                      {match.efficiency.per !== undefined && (
                        <div className={`match-stat efficiency ${match.efficiency.per >= 15 ? 'positive' : match.efficiency.per < 10 ? 'negative' : ''}`}>
                          <span className="stat-val">{match.efficiency.per}</span>
                          <span className="stat-name">PER</span>
                        </div>
                      )}
                      {match.efficiency.usageRate !== undefined && (
                        <div className="match-stat efficiency">
                          <span className="stat-val">{match.efficiency.usageRate}%</span>
                          <span className="stat-name">USG%</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Modification des stats d'un match */}
      {editMatch && (
        <div className="edit-stats-overlay" onClick={() => setEditMatch(null)}>
          <div className="edit-stats-box" onClick={e => e.stopPropagation()}>
            <h3>🔢 Modifier les stats</h3>
            <p className="edit-stats-sub">
              {new Date(editMatch.date).toLocaleDateString('fr-FR')}{editMatch.opponent ? ` · vs ${editMatch.opponent}` : ''}
            </p>
            <div className="edit-stats-grid">
              {EDIT_FIELDS.map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={editValues[key]}
                    onChange={e => setEditValues(v => ({ ...v, [key]: e.target.value }))}
                  />
                </label>
              ))}
              <label>
                +/-
                <span className="edit-pm">
                  <input type="number" value={editPM} onChange={e => setEditPM(e.target.value)} />
                  <button type="button" title="Changer le signe" onClick={() => setEditPM(v => String(-(parseInt(v, 10) || 0)))}>±</button>
                </span>
              </label>
            </div>
            {editQuarters.length > 0 && (
              <>
                <h4 className="edit-q-title">Par quart-temps</h4>
                <div className="edit-q-grid" style={{ gridTemplateColumns: `auto repeat(${editQuarters.length}, 1fr) auto` }}>
                  <span />
                  {editMatch.quarterStats.map(q => <span key={q.quarter} className="edit-q-head">Q{q.quarter}</span>)}
                  <span className="edit-q-head">Σ / total</span>
                  {QUARTER_FIELDS.map(([key, label]) => {
                    const sum = editQuarters.reduce((acc, q) => acc + (parseInt(q[key], 10) || 0), 0)
                    return [
                      <span key={key} className="edit-q-label">{label}</span>,
                      ...editQuarters.map((q, i) => (
                        <input
                          key={`${key}-${i}`}
                          type="number"
                          inputMode="numeric"
                          min="0"
                          aria-label={`Q${editMatch.quarterStats[i].quarter} ${label}`}
                          value={q[key]}
                          onChange={e => setQuarterValue(i, key, e.target.value)}
                        />
                      )),
                      <span key={`${key}-sum`} className={`edit-q-sum ${sum === editTotals[key] ? '' : 'edit-q-bad'}`}>{sum} / {editTotals[key]}</span>
                    ]
                  })}
                </div>
                <div className="edit-shot-row edit-q-recalc">
                  <button type="button" onClick={recalcQuarters} disabled={editShots.length === 0}>
                    ↻ Recalculer PTS et tirs depuis la carte
                  </button>
                </div>
              </>
            )}
            <h4 className="edit-q-title">Carte des tirs</h4>
            <p className="edit-stats-sub">Touche le terrain pour ajouter un tir, ou un tir pour le modifier ; fais-le glisser pour le déplacer. Les lancers francs se gèrent sous le terrain.</p>
            <svg
              ref={courtRef}
              className="edit-court"
              viewBox="0 0 500 470"
              onClick={handleCourtTap}
              onPointerDown={handleCourtDown}
              onPointerMove={handleCourtMove}
              onPointerUp={handleCourtUp}
              onPointerCancel={handleCourtUp}
            >
              <rect x="0" y="0" width="500" height="470" fill="#c4893b" />
              <rect x="170" y="0" width="160" height="190" fill="#1a4a8f" stroke="#fff" strokeWidth="3" />
              <circle cx="250" cy="190" r="60" fill="none" stroke="#fff" strokeWidth="3" />
              <line x1="30" y1="2" x2="30" y2="141" stroke="#fff" strokeWidth="4" />
              <line x1="470" y1="2" x2="470" y2="141" stroke="#fff" strokeWidth="4" />
              <path d="M 30 141 A 238 238 0 0 0 470 141" fill="none" stroke="#fff" strokeWidth="4" />
              <rect x="2" y="2" width="496" height="466" fill="none" stroke="#fff" strokeWidth="4" />
              <circle cx="250" cy="50" r="12" fill="none" stroke="#ff4500" strokeWidth="4" />
              {editShots.map((shot, i) => (
                <g key={i} className="edit-shot-marker">
                  <circle
                    cx={shot.x}
                    cy={shot.y}
                    r={i === selectedShot ? 19 : shot.isFreeThrow ? 10 : 14}
                    fill={shot.made ? '#2ecc71' : '#e74c3c'}
                    stroke={i === selectedShot ? '#111' : '#fff'}
                    strokeWidth={i === selectedShot ? 5 : 3}
                  />
                  {!shot.isFreeThrow && (
                    <text x={shot.x} y={shot.y + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
                      {shotIsThree(shot) ? '3' : '2'}
                    </text>
                  )}
                </g>
              ))}
            </svg>
            <div className="edit-ft-row">
              <span>Lancers francs :</span>
              {editShots.map((shot, i) => !shot.isFreeThrow ? null : (
                <button
                  type="button"
                  key={i}
                  className={`edit-ft-chip ${shot.made ? 'made' : 'missed'} ${i === selectedShot ? 'selected' : ''}`}
                  onClick={() => setSelectedShot(i)}
                >
                  {shot.made ? '✓' : '✗'} Q{shot.quarter}
                </button>
              ))}
              <button type="button" className="edit-ft-chip" onClick={addFreeThrow}>+ LF</button>
            </div>
            <div className="edit-shot-counts">
              <span className={`edit-q-sum ${editShotCounts.made2 === editTotals.fg2Made && editShotCounts.total2 === editTotals.fg2Att ? '' : 'edit-q-bad'}`}>
                2PTS carte {editShotCounts.made2}/{editShotCounts.total2} · total {editTotals.fg2Made}/{editTotals.fg2Att}
              </span>
              <span className={`edit-q-sum ${editShotCounts.made3 === editTotals.fg3Made && editShotCounts.total3 === editTotals.fg3Att ? '' : 'edit-q-bad'}`}>
                3PTS carte {editShotCounts.made3}/{editShotCounts.total3} · total {editTotals.fg3Made}/{editTotals.fg3Att}
              </span>
              <span className={`edit-q-sum ${editShotCounts.madeFT === editTotals.ftMade && editShotCounts.totalFT === editTotals.ftAtt ? '' : 'edit-q-bad'}`}>
                LF carte {editShotCounts.madeFT}/{editShotCounts.totalFT} · total {editTotals.ftMade}/{editTotals.ftAtt}
              </span>
            </div>
            <div className="edit-shot-row edit-q-recalc">
              <button type="button" onClick={recalcTotals} disabled={editShots.length === 0}>
                ↻ Recalculer les totaux 2PTS, 3PTS et LF depuis la carte
              </button>
            </div>
            <div className="edit-shot-row edit-q-recalc">
              <button type="button" className="active" onClick={() => { recalcTotals(); recalcQuarters() }} disabled={editShots.length === 0}>
                ↻ Tout recalculer depuis la carte
              </button>
            </div>
            {shotsChanged && (
              <p className="edit-stats-sub edit-streaks">
                Séries recalculées : {editStreaks.bestStreak} tirs d'affilée · {editStreaks.bestPointsStreak} pts d'affilée
              </p>
            )}
            {selectedShot !== null && editShots[selectedShot] && (
              <div className="edit-shot-panel">
                <div className="edit-shot-row">
                  <button type="button" className={editShots[selectedShot].made ? 'active' : ''} onClick={() => updateShot({ made: true })}>✓ Réussi</button>
                  <button type="button" className={!editShots[selectedShot].made ? 'active' : ''} onClick={() => updateShot({ made: false })}>✗ Raté</button>
                </div>
                {!editShots[selectedShot].isFreeThrow && (
                  <div className="edit-shot-row">
                    <button type="button" className={!shotIsThree(editShots[selectedShot]) ? 'active' : ''} onClick={() => updateShot({ isThree: false, type: '2pts' })}>2PTS</button>
                    <button type="button" className={shotIsThree(editShots[selectedShot]) ? 'active' : ''} onClick={() => updateShot({ isThree: true, type: '3pts' })}>3PTS</button>
                  </div>
                )}
                <div className="edit-shot-row">
                  {[1, 2, 3, 4].map(q => (
                    <button type="button" key={q} className={editShots[selectedShot].quarter === q ? 'active' : ''} onClick={() => updateShot({ quarter: q })}>Q{q}</button>
                  ))}
                </div>
                <div className="edit-shot-row">
                  <button type="button" onClick={deleteShot}>🗑 Supprimer ce {editShots[selectedShot].isFreeThrow ? 'lancer franc' : 'tir'}</button>
                </div>
              </div>
            )}
            <div className="edit-stats-actions">
              <button onClick={() => setEditMatch(null)}>Annuler</button>
              <button className="edit-stats-save" onClick={saveEditStats}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Replay modal */}
      {showReplay && selectedMatch && (
        <ShotReplay
          shotMarkers={selectedMatch.shotMarkers || []}
          actionHistory={selectedMatch.actionHistory || []}
          onClose={() => setShowReplay(false)}
        />
      )}
    </div>
  )
}
