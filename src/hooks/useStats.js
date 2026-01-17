import { useState, useEffect, useRef } from 'react'

const initialStats = {
  fg2Made: 0,
  fg2Attempted: 0,
  fg3Made: 0,
  fg3Attempted: 0,
  ftMade: 0,
  ftAttempted: 0,
  offRebounds: 0,
  defRebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  fouls: 0,
  turnovers: 0
}

// Labels for action types
const actionLabels = {
  fg2Made: '2PTS réussi',
  fg2Attempted: '2PTS raté',
  fg3Made: '3PTS réussi',
  fg3Attempted: '3PTS raté',
  ftMade: 'LF réussi',
  ftAttempted: 'LF raté',
  offRebounds: 'Rebond OFF',
  defRebounds: 'Rebond DEF',
  assists: 'Passe décisive',
  steals: 'Interception',
  blocks: 'Contre',
  fouls: 'Faute',
  turnovers: 'Perte de balle'
}

export function useStats() {
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('basketStats')
    return saved ? JSON.parse(saved) : initialStats
  })

  // Action history with timestamps
  const [actionHistory, setActionHistory] = useState(() => {
    const saved = localStorage.getItem('basketActionHistory')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('basketStats', JSON.stringify(stats))
  }, [stats])

  useEffect(() => {
    localStorage.setItem('basketActionHistory', JSON.stringify(actionHistory))
  }, [actionHistory])

  const updateStat = (statName, delta, quarter = 1, timeLeft = 0, silent = false) => {
    setStats(prev => ({
      ...prev,
      [statName]: Math.max(0, prev[statName] + delta)
    }))

    // Skip history recording if silent mode
    if (silent) return

    // Record action in history (only for positive actions)
    if (delta > 0) {
      const action = {
        id: Date.now(),
        type: statName,
        label: actionLabels[statName] || statName,
        quarter,
        timeLeft,
        timestamp: new Date().toISOString()
      }
      setActionHistory(prev => [action, ...prev])
    } else if (delta < 0) {
      // Remove the most recent action of this type if decrementing
      setActionHistory(prev => {
        const idx = prev.findIndex(a => a.type === statName)
        if (idx !== -1) {
          return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
        }
        return prev
      })
    }
  }

  const resetStats = () => {
    setStats(initialStats)
    setActionHistory([])
    localStorage.setItem('basketStats', JSON.stringify(initialStats))
    localStorage.setItem('basketActionHistory', JSON.stringify([]))
  }

  const importStats = (newStats) => {
    setStats(newStats)
  }

  const getSummary = () => {
    const totalPoints = (stats.fg2Made * 2) + (stats.fg3Made * 3) + stats.ftMade
    const totalRebounds = stats.offRebounds + stats.defRebounds
    const fgMade = stats.fg2Made + stats.fg3Made
    const fgAttempted = stats.fg2Attempted + stats.fg3Attempted
    const fgPercentage = fgAttempted > 0 ? Math.round((fgMade / fgAttempted) * 100) : 0
    const ftPercentage = stats.ftAttempted > 0 ? Math.round((stats.ftMade / stats.ftAttempted) * 100) : 0

    return {
      totalPoints,
      totalRebounds,
      assists: stats.assists,
      fgPercentage,
      ftPercentage
    }
  }

  // Calculate efficiency metrics (True Shooting % and Game Score)
  const getEfficiency = () => {
    const totalPoints = (stats.fg2Made * 2) + (stats.fg3Made * 3) + stats.ftMade
    const fgAttempted = stats.fg2Attempted + stats.fg3Attempted
    const fgMade = stats.fg2Made + stats.fg3Made
    const ftAttempted = stats.ftAttempted
    const ftMade = stats.ftMade

    // True Shooting % = Points / (2 * (FGA + 0.44 * FTA))
    const tsaDenominator = 2 * (fgAttempted + 0.44 * ftAttempted)
    const trueShootingPct = tsaDenominator > 0 ? (totalPoints / tsaDenominator) * 100 : 0

    // Game Score (John Hollinger)
    // GmSc = PTS + 0.4*FGM - 0.7*FGA - 0.4*(FTA-FTM) + 0.7*ORB + 0.3*DRB + STL + 0.7*AST + 0.7*BLK - 0.4*PF - TOV
    const gameScore = totalPoints
      + 0.4 * fgMade
      - 0.7 * fgAttempted
      - 0.4 * (ftAttempted - ftMade)
      + 0.7 * stats.offRebounds
      + 0.3 * stats.defRebounds
      + stats.steals
      + 0.7 * stats.assists
      + 0.7 * stats.blocks
      - 0.4 * stats.fouls
      - stats.turnovers

    return {
      trueShootingPct: Math.round(trueShootingPct * 10) / 10, // 1 decimal
      gameScore: Math.round(gameScore * 10) / 10 // 1 decimal
    }
  }

  // Get stats grouped by quarter
  const getStatsByQuarter = () => {
    const quarterStats = { 1: { ...initialStats }, 2: { ...initialStats }, 3: { ...initialStats }, 4: { ...initialStats } }

    actionHistory.forEach(action => {
      if (quarterStats[action.quarter] && quarterStats[action.quarter][action.type] !== undefined) {
        quarterStats[action.quarter][action.type]++
      }
    })

    // Calculate points for each quarter
    return Object.entries(quarterStats).map(([q, s]) => ({
      quarter: parseInt(q),
      points: (s.fg2Made * 2) + (s.fg3Made * 3) + s.ftMade,
      rebounds: s.offRebounds + s.defRebounds,
      assists: s.assists,
      steals: s.steals,
      blocks: s.blocks,
      fouls: s.fouls,
      turnovers: s.turnovers,
      fg: `${s.fg2Made + s.fg3Made}/${s.fg2Attempted + s.fg3Attempted}`
    }))
  }

  const undoLastAction = () => {
    if (actionHistory.length === 0) return

    const lastAction = actionHistory[0]
    setStats(prev => ({
      ...prev,
      [lastAction.type]: Math.max(0, prev[lastAction.type] - 1)
    }))
    setActionHistory(prev => prev.slice(1))
  }

  return {
    stats,
    updateStat,
    resetStats,
    importStats,
    getSummary,
    getEfficiency,
    actionHistory,
    getStatsByQuarter,
    undoLastAction
  }
}

// Hook for tracking playing time
export function usePlayingTime() {
  const [isOnCourt, setIsOnCourt] = useState(() => {
    const saved = localStorage.getItem('basketIsOnCourt')
    return saved ? JSON.parse(saved) : false
  })

  const [playingTime, setPlayingTime] = useState(() => {
    const saved = localStorage.getItem('basketPlayingTime')
    return saved ? JSON.parse(saved) : 0 // in seconds
  })

  const [benchTime, setBenchTime] = useState(() => {
    const saved = localStorage.getItem('basketBenchTime')
    return saved ? JSON.parse(saved) : 0
  })

  const intervalRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('basketIsOnCourt', JSON.stringify(isOnCourt))
  }, [isOnCourt])

  useEffect(() => {
    localStorage.setItem('basketPlayingTime', JSON.stringify(playingTime))
  }, [playingTime])

  useEffect(() => {
    localStorage.setItem('basketBenchTime', JSON.stringify(benchTime))
  }, [benchTime])

  // Track time when timer is running
  const trackTime = (isTimerRunning) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        if (isOnCourt) {
          setPlayingTime(prev => prev + 1)
        } else {
          setBenchTime(prev => prev + 1)
        }
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const toggleOnCourt = () => {
    setIsOnCourt(prev => !prev)
  }

  const resetPlayingTime = () => {
    setPlayingTime(0)
    setBenchTime(0)
    setIsOnCourt(false)
    localStorage.setItem('basketPlayingTime', JSON.stringify(0))
    localStorage.setItem('basketBenchTime', JSON.stringify(0))
    localStorage.setItem('basketIsOnCourt', JSON.stringify(false))
  }

  const formatPlayingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    isOnCourt,
    playingTime,
    benchTime,
    toggleOnCourt,
    resetPlayingTime,
    trackTime,
    formatPlayingTime
  }
}

export function usePlayer() {
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('basketPlayer')
    return saved ? JSON.parse(saved) : { name: '', number: '' }
  })

  useEffect(() => {
    localStorage.setItem('basketPlayer', JSON.stringify(player))
  }, [player])

  const updatePlayer = (field, value) => {
    setPlayer(prev => ({ ...prev, [field]: value }))
  }

  return { player, updatePlayer }
}

export function useTimer() {
  const [quarterDuration, setQuarterDuration] = useState(() => {
    const saved = localStorage.getItem('basketQuarterDuration')
    return saved ? parseInt(saved) : 600 // Default 10 minutes
  })

  const [timerState, setTimerState] = useState(() => {
    const saved = localStorage.getItem('basketTimer')
    const duration = localStorage.getItem('basketQuarterDuration')
    const defaultDuration = duration ? parseInt(duration) : 600
    return saved ? JSON.parse(saved) : { quarter: 1, timeLeft: defaultDuration, isRunning: false }
  })

  useEffect(() => {
    localStorage.setItem('basketQuarterDuration', quarterDuration.toString())
  }, [quarterDuration])

  useEffect(() => {
    localStorage.setItem('basketTimer', JSON.stringify({
      quarter: timerState.quarter,
      timeLeft: timerState.timeLeft
    }))
  }, [timerState.quarter, timerState.timeLeft])

  useEffect(() => {
    let intervalId
    if (timerState.isRunning && timerState.timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }))
      }, 1000)
    } else if (timerState.timeLeft === 0 && timerState.isRunning) {
      setTimerState(prev => ({ ...prev, isRunning: false }))
      alert('Fin du quart-temps !')
    }
    return () => clearInterval(intervalId)
  }, [timerState.isRunning, timerState.timeLeft])

  const toggleTimer = () => {
    setTimerState(prev => ({ ...prev, isRunning: !prev.isRunning }))
  }

  const resetQuarter = () => {
    setTimerState(prev => ({ ...prev, timeLeft: quarterDuration, isRunning: false }))
  }

  const nextQuarter = () => {
    if (timerState.quarter < 4) {
      setTimerState(prev => ({
        ...prev,
        quarter: prev.quarter + 1,
        timeLeft: quarterDuration,
        isRunning: false
      }))
    } else {
      alert('Match terminé !')
    }
  }

  const prevQuarter = () => {
    if (timerState.quarter > 1) {
      setTimerState(prev => ({
        ...prev,
        quarter: prev.quarter - 1,
        timeLeft: quarterDuration,
        isRunning: false
      }))
    }
  }

  const formatTime = () => {
    const minutes = Math.floor(timerState.timeLeft / 60)
    const seconds = timerState.timeLeft % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const resetTimer = () => {
    const newState = { quarter: 1, timeLeft: quarterDuration, isRunning: false }
    setTimerState(newState)
    localStorage.setItem('basketTimer', JSON.stringify({ quarter: 1, timeLeft: quarterDuration }))
  }

  const updateQuarterDuration = (minutes) => {
    const newDuration = minutes * 60
    setQuarterDuration(newDuration)
    // Also update current timeLeft if timer hasn't started
    if (!timerState.isRunning && timerState.timeLeft === quarterDuration) {
      setTimerState(prev => ({ ...prev, timeLeft: newDuration }))
    }
  }

  const adjustTime = (seconds) => {
    setTimerState(prev => ({
      ...prev,
      timeLeft: Math.max(0, prev.timeLeft + seconds)
    }))
  }

  return {
    quarter: timerState.quarter,
    timeLeft: timerState.timeLeft,
    isRunning: timerState.isRunning,
    quarterDuration,
    toggleTimer,
    resetQuarter,
    nextQuarter,
    prevQuarter,
    resetTimer,
    formatTime,
    updateQuarterDuration,
    adjustTime
  }
}

export function useMatchHistory() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('basketMatchHistory')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('basketMatchHistory', JSON.stringify(history))
  }, [history])

  const saveMatch = (player, stats, opponent = '', shotMarkers = [], score = null, location = 'home', plusMinus = 0, notes = null) => {
    const totalPoints = (stats.fg2Made * 2) + (stats.fg3Made * 3) + stats.ftMade
    const totalRebounds = stats.offRebounds + stats.defRebounds
    const fgMade = stats.fg2Made + stats.fg3Made
    const fgAttempted = stats.fg2Attempted + stats.fg3Attempted

    // Calculate efficiency metrics
    const ftAttempted = stats.ftAttempted
    const ftMade = stats.ftMade
    const tsaDenominator = 2 * (fgAttempted + 0.44 * ftAttempted)
    const trueShootingPct = tsaDenominator > 0 ? Math.round((totalPoints / tsaDenominator) * 1000) / 10 : 0

    const gameScore = Math.round((totalPoints
      + 0.4 * fgMade
      - 0.7 * fgAttempted
      - 0.4 * (ftAttempted - ftMade)
      + 0.7 * stats.offRebounds
      + 0.3 * stats.defRebounds
      + stats.steals
      + 0.7 * stats.assists
      + 0.7 * stats.blocks
      - 0.4 * stats.fouls
      - stats.turnovers) * 10) / 10

    const match = {
      id: Date.now(),
      date: new Date().toISOString(),
      player: { ...player },
      opponent,
      location,  // 'home' or 'away'
      score: score || null,  // { team: number, opponent: number }
      plusMinus,  // +/- differential when on court
      stats: { ...stats },
      shotMarkers: [...shotMarkers],  // Save shot positions
      summary: {
        points: totalPoints,
        rebounds: totalRebounds,
        assists: stats.assists,
        steals: stats.steals,
        blocks: stats.blocks,
        fouls: stats.fouls,
        turnovers: stats.turnovers,
        fgPercentage: fgAttempted > 0 ? Math.round((fgMade / fgAttempted) * 100) : 0,
        ftPercentage: stats.ftAttempted > 0 ? Math.round((stats.ftMade / stats.ftAttempted) * 100) : 0
      },
      efficiency: {
        trueShootingPct,
        gameScore
      },
      notes: notes || null  // { strengths: '', improvements: '' }
    }

    setHistory(prev => [...prev, match])
    return match
  }

  const deleteMatch = (matchId) => {
    setHistory(prev => prev.filter(m => m.id !== matchId))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const importHistory = (newHistory) => {
    setHistory(newHistory)
  }

  const getAverages = () => {
    if (history.length === 0) return null

    const totals = history.reduce((acc, match) => ({
      points: acc.points + match.summary.points,
      rebounds: acc.rebounds + match.summary.rebounds,
      assists: acc.assists + match.summary.assists,
      steals: acc.steals + match.summary.steals,
      blocks: acc.blocks + match.summary.blocks,
      fouls: acc.fouls + match.summary.fouls,
      turnovers: acc.turnovers + match.summary.turnovers
    }), { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0, turnovers: 0 })

    const count = history.length
    return {
      points: (totals.points / count).toFixed(1),
      rebounds: (totals.rebounds / count).toFixed(1),
      assists: (totals.assists / count).toFixed(1),
      steals: (totals.steals / count).toFixed(1),
      blocks: (totals.blocks / count).toFixed(1),
      fouls: (totals.fouls / count).toFixed(1),
      turnovers: (totals.turnovers / count).toFixed(1)
    }
  }

  const getRecords = () => {
    if (history.length === 0) return null

    const records = {
      points: { value: 0, date: null, opponent: null },
      rebounds: { value: 0, date: null, opponent: null },
      assists: { value: 0, date: null, opponent: null },
      steals: { value: 0, date: null, opponent: null },
      blocks: { value: 0, date: null, opponent: null },
      plusMinus: { value: -999, date: null, opponent: null }
    }

    history.forEach(match => {
      if (match.summary.points > records.points.value) {
        records.points = { value: match.summary.points, date: match.date, opponent: match.opponent }
      }
      if (match.summary.rebounds > records.rebounds.value) {
        records.rebounds = { value: match.summary.rebounds, date: match.date, opponent: match.opponent }
      }
      if (match.summary.assists > records.assists.value) {
        records.assists = { value: match.summary.assists, date: match.date, opponent: match.opponent }
      }
      if (match.summary.steals > records.steals.value) {
        records.steals = { value: match.summary.steals, date: match.date, opponent: match.opponent }
      }
      if (match.summary.blocks > records.blocks.value) {
        records.blocks = { value: match.summary.blocks, date: match.date, opponent: match.opponent }
      }
      if (match.plusMinus !== undefined && match.plusMinus > records.plusMinus.value) {
        records.plusMinus = { value: match.plusMinus, date: match.date, opponent: match.opponent }
      }
    })

    // Reset plusMinus if no valid value found
    if (records.plusMinus.value === -999) {
      records.plusMinus = { value: 0, date: null, opponent: null }
    }

    return records
  }

  const checkNewRecords = (newMatch) => {
    const records = getRecords()
    if (!records) return []

    const newRecords = []
    if (newMatch.summary.points > records.points.value) {
      newRecords.push({ stat: 'Points', value: newMatch.summary.points, old: records.points.value })
    }
    if (newMatch.summary.rebounds > records.rebounds.value) {
      newRecords.push({ stat: 'Rebonds', value: newMatch.summary.rebounds, old: records.rebounds.value })
    }
    if (newMatch.summary.assists > records.assists.value) {
      newRecords.push({ stat: 'Passes', value: newMatch.summary.assists, old: records.assists.value })
    }
    if (newMatch.summary.steals > records.steals.value) {
      newRecords.push({ stat: 'Interceptions', value: newMatch.summary.steals, old: records.steals.value })
    }
    if (newMatch.summary.blocks > records.blocks.value) {
      newRecords.push({ stat: 'Contres', value: newMatch.summary.blocks, old: records.blocks.value })
    }
    if (newMatch.plusMinus !== undefined && newMatch.plusMinus > records.plusMinus.value) {
      newRecords.push({ stat: '+/-', value: newMatch.plusMinus, old: records.plusMinus.value })
    }
    return newRecords
  }

  return { history, saveMatch, deleteMatch, clearHistory, importHistory, getAverages, getRecords, checkNewRecords }
}
