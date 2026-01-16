export default function PlayerInfo({ name, number, onNameChange, onNumberChange }) {
  return (
    <div className="player-info">
      <input
        type="text"
        placeholder="Nom du joueur"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <input
        type="text"
        placeholder="N°"
        maxLength={2}
        value={number}
        onChange={(e) => onNumberChange(e.target.value)}
        style={{ width: '80px', textAlign: 'center' }}
      />
    </div>
  )
}
