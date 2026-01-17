import { useState } from 'react'
import EvolutionChart from './EvolutionChart'
import PerformanceRadar from './PerformanceRadar'
import ShotHeatmap from './ShotHeatmap'
import ThermalHeatmap from './ThermalHeatmap'
import ShotReplay from './ShotReplay'

export default function MatchHistory({
  history,
  averages,
  onDelete,
  onClear,
  onImport,
  onSaveGist,
  onLoadGist,
  onOpenGistSettings,
  gistLoading,
  gistConnected
}) {
  const [selectedMatchId, setSelectedMatchId] = useState('all') // 'all' or match id
  const [showReplay, setShowReplay] = useState(false)
  const lastMatch = history.length > 0 ? history[history.length - 1] : null

  // Calculate totals across all matches
  const getTotals = () => {
    if (history.length === 0) return null

    return history.reduce((acc, match) => ({
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
    }), {
      points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0, turnovers: 0,
      fg2Made: 0, fg2Attempted: 0, fg3Made: 0, fg3Attempted: 0, ftMade: 0, ftAttempted: 0
    })
  }

  const totals = getTotals()
  const selectedMatch = selectedMatchId === 'all' ? null : history.find(m => m.id === selectedMatchId)

  // Get stats to display based on selection
  const displayStats = selectedMatch ? {
    ...selectedMatch.summary,
    ...selectedMatch.stats,
    matchCount: 1
  } : totals ? {
    ...totals,
    matchCount: history.length
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
        </div>
      )}

      {/* Shot Charts Section */}
      <div className="shot-charts-grid">
        <ShotHeatmap history={history} selectedMatchId={selectedMatchId} />
        <ThermalHeatmap history={history} selectedMatchId={selectedMatchId} />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <EvolutionChart history={history} />
        <PerformanceRadar averages={averages} lastMatch={lastMatch} />
      </div>

      {/* GitHub Gist Sync Section */}
      <div className="gist-section">
        <div className="gist-header">
          <h3>☁️ Synchronisation GitHub</h3>
          <button
            className="gist-settings-btn"
            onClick={onOpenGistSettings}
            title="Configurer GitHub"
          >
            ⚙️ Config
          </button>
        </div>
        <div className="gist-buttons">
          <button
            className="gist-action-btn"
            onClick={onSaveGist}
            disabled={gistLoading || history.length === 0}
          >
            {gistLoading ? '⏳' : '⬆️'} Sauvegarder sur Gist
          </button>
          <button
            className="gist-action-btn"
            onClick={onLoadGist}
            disabled={gistLoading}
          >
            {gistLoading ? '⏳' : '⬇️'} Charger depuis Gist
          </button>
          {gistConnected && <span className="gist-status connected">● Token configuré</span>}
          {!gistConnected && <span className="gist-status">● Non configuré</span>}
        </div>
      </div>

      {/* Match List */}
      <div className="match-list">
        <div className="match-list-header">
          <h3>📋 Liste des matchs</h3>
          <div className="match-list-actions">
            <button className="import-btn" onClick={onImport}>
              📥 Backup local
            </button>
            {history.length > 0 && (
              <button className="clear-btn" onClick={onClear}>
                Tout effacer
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="no-matches">
            <p>Aucun match enregistré.</p>
            <p>Retourne à l'onglet "Match" et clique sur "Sauvegarder le match" pour commencer !</p>
          </div>
        ) : (
          <div className="matches">
            {[...history].reverse().map((match) => (
              <div
                key={match.id}
                className={`match-card ${selectedMatchId === match.id ? 'selected' : ''}`}
                onClick={() => setSelectedMatchId(selectedMatchId === match.id ? 'all' : match.id)}
              >
                <div className="match-header">
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
                </div>
              </div>
            ))}
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
