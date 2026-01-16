import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

export default function PerformanceRadar({ averages, lastMatch }) {
  if (!averages && !lastMatch) {
    return (
      <div className="chart-empty">
        <p>Aucune donnée disponible pour le radar.</p>
      </div>
    )
  }

  // Normaliser les stats sur une échelle de 0-100 pour le radar
  // Basé sur des valeurs "excellentes" typiques en basket
  const maxValues = {
    points: 40,
    rebounds: 15,
    assists: 12,
    steals: 5,
    blocks: 4
  }

  const normalize = (value, max) => Math.min(100, (value / max) * 100)

  const source = lastMatch?.summary || averages

  const data = [
    {
      stat: 'Scoring',
      value: normalize(parseFloat(source.points), maxValues.points),
      fullMark: 100
    },
    {
      stat: 'Rebonds',
      value: normalize(parseFloat(source.rebounds), maxValues.rebounds),
      fullMark: 100
    },
    {
      stat: 'Playmaking',
      value: normalize(parseFloat(source.assists), maxValues.assists),
      fullMark: 100
    },
    {
      stat: 'Interceptions',
      value: normalize(parseFloat(source.steals), maxValues.steals),
      fullMark: 100
    },
    {
      stat: 'Contres',
      value: normalize(parseFloat(source.blocks), maxValues.blocks),
      fullMark: 100
    }
  ]

  return (
    <div className="chart-container">
      <h3>🎯 Profil de performance {lastMatch ? '(Dernier match)' : '(Moyenne)'}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 26, 46, 0.95)',
              border: '1px solid #61dafb',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value) => [`${value.toFixed(0)}%`, 'Performance']}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#61dafb"
            fill="#61dafb"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="radar-legend">
        <span>Points: {source.points}</span>
        <span>Rebonds: {source.rebounds}</span>
        <span>Passes: {source.assists}</span>
        <span>Steals: {source.steals}</span>
        <span>Contres: {source.blocks}</span>
      </div>
    </div>
  )
}
