import { useState, useEffect, useRef } from 'react'

export default function StatCounter({ label, value, onIncrement, onDecrement }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState(null) // 'up' or 'down'
  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current) {
      setAnimationType(value > prevValue.current ? 'up' : 'down')
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      prevValue.current = value
      return () => clearTimeout(timer)
    }
  }, [value])

  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-controls">
        <button className="stat-btn minus" onClick={onDecrement}>−</button>
        <span className={`stat-value ${isAnimating ? `pop ${animationType}` : ''}`}>
          {value}
        </span>
        <button className="stat-btn plus" onClick={onIncrement}>+</button>
      </div>
    </div>
  )
}
