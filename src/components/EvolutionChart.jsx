import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function EvolutionChart({ history }) {
  if (history.length === 0) {
    return (
      <div className="chart-empty">
        <p>Aucun match enregistré. Sauvegarde ton premier match pour voir l'évolution !</p>
      </div>
    )
  }

  const data = history.map((match, index) => ({
    name: match.opponent || `Match ${index + 1}`,
    date: new Date(match.date).toLocaleDateString('fr-FR'),
    Points: match.summary.points,
    Rebonds: match.summary.rebounds,
    Passes: match.summary.assists
  }))

  return (
    <div className="chart-container">
      <h3>📈 Évolution par match</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.7)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.7)"
            tick={{ fill: 'rgba(255,255,255,0.7)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 26, 46, 0.95)',
              border: '1px solid #61dafb',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Points"
            stroke="#ff6b35"
            strokeWidth={3}
            dot={{ fill: '#ff6b35', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="Rebonds"
            stroke="#61dafb"
            strokeWidth={3}
            dot={{ fill: '#61dafb', strokeWidth: 2, r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Passes"
            stroke="#2ecc71"
            strokeWidth={3}
            dot={{ fill: '#2ecc71', strokeWidth: 2, r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
