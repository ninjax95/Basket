export default function StatCounter({ label, value, onIncrement, onDecrement }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-controls">
        <button className="stat-btn minus" onClick={onDecrement}>−</button>
        <span className="stat-value">{value}</span>
        <button className="stat-btn plus" onClick={onIncrement}>+</button>
      </div>
    </div>
  )
}
