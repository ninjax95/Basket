import { useState } from 'react'
import ShotReplay from './ShotReplay'

export default function MatchHistory({
  history,
  averages,
  records,
  onDelete
}) {
  const [selectedMatchId, setSelectedMatchId] = useState('all') // 'all' or match id
  const [showReplay, setShowReplay] = useState(false)

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
    }), {
      points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0, turnovers: 0,
      fg2Made: 0, fg2Attempted: 0, fg3Made: 0, fg3Attempted: 0, ftMade: 0, ftAttempted: 0,
      plusMinus: 0, gameScoreSum: 0, gameScoreCount: 0
    })

    // Calculate True Shooting % for all shots combined
    const fga = totals.fg2Attempted + totals.fg3Attempted
    const tsa = fga + 0.44 * totals.ftAttempted
    const trueShootingPct = tsa > 0 ? Math.round(totals.points / (2 * tsa) * 100) : 0

    // Average Game Score
    const avgGameScore = totals.gameScoreCount > 0
      ? (totals.gameScoreSum / totals.gameScoreCount).toFixed(1)
      : null

    return {
      ...totals,
      trueShootingPct,
      avgGameScore
    }
  }

  const totals = getTotals()
  const selectedMatch = selectedMatchId === 'all' ? null : history.find(m => m.id === selectedMatchId)

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
    gameScore: selectedMatch.efficiency?.gameScore
  } : totals ? {
    ...totals,
    matchCount: history.length,
    gameScore: totals.avgGameScore
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
            {selectedMatch && selectedMatch.shotMarkers && selectedMatch.shotMarkers.length > 0 && (
              <button
                className="replay-btn-history"
                onClick={() => setShowReplay(true)}
              >
                🎬 Replay
              </button>
            )}
          </div>

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
                  {match.score && (match.score.team !== null || match.score.opponent !== null) && (
                    <span className={`match-score ${
                      match.score.team > match.score.opponent ? 'win' :
                      match.score.team < match.score.opponent ? 'loss' : 'draw'
                    }`}>
                      {match.score.team ?? '-'} - {match.score.opponent ?? '-'}
                    </span>
                  )}
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
                    </>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

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
