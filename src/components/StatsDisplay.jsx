export default function StatsDisplay({ summary }) {
  return (
    <div className="summary">
      <h3>📈 Résumé</h3>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-value">{summary.totalPoints}</div>
          <div className="summary-label">Points</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{summary.totalRebounds}</div>
          <div className="summary-label">Rebonds</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{summary.assists}</div>
          <div className="summary-label">Passes</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{summary.fgPercentage}%</div>
          <div className="summary-label">% Tirs</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{summary.ftPercentage}%</div>
          <div className="summary-label">% LF</div>
        </div>
      </div>
    </div>
  )
}
