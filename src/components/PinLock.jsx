import { useState, useEffect } from 'react'

export default function PinLock({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isSettingPin, setIsSettingPin] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1 = enter, 2 = confirm (for new pin)

  useEffect(() => {
    const savedPin = localStorage.getItem('basketAppPin')
    if (!savedPin) {
      setIsSettingPin(true)
    }
  }, [])

  const handlePinChange = (value) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '').slice(0, 6)

    if (isSettingPin && step === 2) {
      setConfirmPin(digits)
    } else {
      setPin(digits)
    }
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isSettingPin) {
      if (step === 1) {
        if (pin.length < 4) {
          setError('Le code doit avoir au moins 4 chiffres')
          return
        }
        setStep(2)
        return
      } else {
        // Step 2: confirm pin
        if (pin !== confirmPin) {
          setError('Les codes ne correspondent pas')
          setConfirmPin('')
          return
        }
        // Save pin
        localStorage.setItem('basketAppPin', btoa(pin))
        onUnlock()
      }
    } else {
      // Verify pin
      const savedPin = localStorage.getItem('basketAppPin')
      if (savedPin && atob(savedPin) === pin) {
        onUnlock()
      } else {
        setError('Code incorrect')
        setPin('')
      }
    }
  }

  const handleKeyPress = (digit) => {
    if (isSettingPin && step === 2) {
      if (confirmPin.length < 6) {
        handlePinChange(confirmPin + digit)
      }
    } else {
      if (pin.length < 6) {
        handlePinChange(pin + digit)
      }
    }
  }

  const handleBackspace = () => {
    if (isSettingPin && step === 2) {
      setConfirmPin(prev => prev.slice(0, -1))
    } else {
      setPin(prev => prev.slice(0, -1))
    }
  }

  const currentPin = (isSettingPin && step === 2) ? confirmPin : pin

  return (
    <div className="pin-lock-overlay">
      <div className="pin-lock-container">
        <div className="pin-lock-icon">🏀</div>
        <h2>Stats Basket</h2>

        <p className="pin-instruction">
          {isSettingPin
            ? step === 1
              ? 'Créer votre code PIN (4-6 chiffres)'
              : 'Confirmer votre code PIN'
            : 'Entrer votre code PIN'
          }
        </p>

        <form onSubmit={handleSubmit}>
          <div className="pin-dots">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`pin-dot ${i < currentPin.length ? 'filled' : ''}`}
              />
            ))}
          </div>

          {error && <p className="pin-error">{error}</p>}

          <div className="pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
              <button
                key={digit}
                type="button"
                className="pin-key"
                onClick={() => handleKeyPress(digit.toString())}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              className="pin-key pin-key-empty"
              disabled
            />
            <button
              type="button"
              className="pin-key"
              onClick={() => handleKeyPress('0')}
            >
              0
            </button>
            <button
              type="button"
              className="pin-key pin-key-back"
              onClick={handleBackspace}
            >
              ←
            </button>
          </div>

          <button
            type="submit"
            className="pin-submit"
            disabled={currentPin.length < 4}
          >
            {isSettingPin
              ? step === 1 ? 'Suivant' : 'Confirmer'
              : 'Déverrouiller'
            }
          </button>
        </form>

        {isSettingPin && step === 2 && (
          <button
            className="pin-back-btn"
            onClick={() => {
              setStep(1)
              setConfirmPin('')
              setError('')
            }}
          >
            ← Retour
          </button>
        )}
      </div>
    </div>
  )
}
