import { useState } from 'react'

export default function Timer({
  quarter,
  formattedTime,
  isRunning,
  quarterDuration,
  onToggle,
  onReset,
  onNext,
  onPrev,
  onDurationChange,
  onEndMatch,
  onAdjustTime
}) {
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirm, setShowConfirm] = useState(null) // 'next', 'prev', or 'end'

  const durationOptions = [
    { minutes: 5, label: '5 min' },
    { minutes: 8, label: '8 min' },
    { minutes: 10, label: '10 min' },
    { minutes: 12, label: '12 min' },
    { minutes: 15, label: '15 min' },
  ]

  const currentMinutes = quarterDuration / 60

  const handleDurationSelect = (minutes) => {
    onDurationChange(minutes)
    setShowSettings(false)
  }

  const handleNextClick = () => {
    if (quarter < 4) {
      setShowConfirm('next')
    }
  }

  const handlePrevClick = () => {
    if (quarter > 1) {
      setShowConfirm('prev')
    }
  }

  const handleEndMatchClick = () => {
    setShowConfirm('end')
  }

  const confirmAction = () => {
    if (showConfirm === 'next') {
      onNext()
    } else if (showConfirm === 'prev') {
      onPrev()
    } else if (showConfirm === 'end') {
      onEndMatch()
    }
    setShowConfirm(null)
  }

  const cancelAction = () => {
    setShowConfirm(null)
  }

  return (
    <div className="timer-section">
      <div className="timer-header">
        <div className="quarter-display">Quart-temps : {quarter}/4</div>
        {!isRunning && (
          <button
            className={`settings-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Paramètres du timer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        )}
      </div>

      {showSettings && !isRunning && (
        <div className="duration-selector">
          <p>Durée d'un quart-temps :</p>
          <div className="duration-options">
            {durationOptions.map(option => (
              <button
                key={option.minutes}
                className={`duration-btn ${currentMinutes === option.minutes ? 'active' : ''}`}
                onClick={() => handleDurationSelect(option.minutes)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="timer-display-wrapper">
        <div className="time-adjust-group">
          <button className="time-adjust-btn" onClick={() => onAdjustTime(-60)} title="-1 min">-1m</button>
          <button className="time-adjust-btn" onClick={() => onAdjustTime(-10)} title="-10 sec">-10s</button>
        </div>
        <div className="timer-display">{formattedTime}</div>
        <div className="time-adjust-group">
          <button className="time-adjust-btn" onClick={() => onAdjustTime(10)} title="+10 sec">+10s</button>
          <button className="time-adjust-btn" onClick={() => onAdjustTime(60)} title="+1 min">+1m</button>
        </div>
      </div>

      <div className="timer-buttons">
        <button
          className={`timer-btn quarter-nav ${quarter === 1 ? 'disabled' : ''}`}
          onClick={handlePrevClick}
          disabled={quarter === 1}
        >
          ← QT Préc.
        </button>
        <button className="timer-btn primary" onClick={onToggle}>
          {isRunning ? '⏸ Pause' : '▶ Démarrer'}
        </button>
        <button className="timer-btn secondary" onClick={onReset}>↺ Reset</button>
        <button
          className={`timer-btn quarter-nav ${quarter === 4 ? 'disabled' : ''}`}
          onClick={handleNextClick}
          disabled={quarter === 4}
        >
          QT Suiv. →
        </button>
        <button
          className="timer-btn end-match"
          onClick={handleEndMatchClick}
        >
          🏁 Fin
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">
              {showConfirm === 'next' ? '→' : showConfirm === 'prev' ? '←' : '🏁'}
            </div>
            <p>
              {showConfirm === 'next'
                ? `Passer au quart-temps ${quarter + 1} ?`
                : showConfirm === 'prev'
                ? `Revenir au quart-temps ${quarter - 1} ?`
                : 'Terminer le match ?'
              }
            </p>
            <p className="confirm-warning">
              {showConfirm === 'end'
                ? 'Vous pourrez sauvegarder les stats.'
                : 'Le timer sera réinitialisé.'
              }
            </p>
            <div className="confirm-buttons">
              <button className="confirm-btn yes" onClick={confirmAction}>
                {showConfirm === 'end' ? 'Oui, terminer' : 'Oui, confirmer'}
              </button>
              <button className="confirm-btn no" onClick={cancelAction}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
