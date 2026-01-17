# CLAUDE.md - Stats Basket App

## Overview

Application React/Capacitor pour tracker les statistiques d'un joueur de basketball pendant un match. Disponible en web (PWA) et Android (APK).

- **Repo GitHub** : https://github.com/ninjax95/Basket
- **Hébergement Web** : Vercel (auto-deploy depuis GitHub)
- **URL Production** : https://basket-roan.vercel.app
- **Gist ID (sync)** : bf483a09e37ffa5ffe84cb46109c6890

## Structure du projet

```
Score kaiji/
├── src/
│   ├── App.jsx              # Composant principal + tous les styles CSS
│   ├── main.jsx             # Point d'entrée React
│   ├── components/
│   │   ├── CourtMap.jsx     # Carte interactive du terrain (SVG)
│   │   ├── Timer.jsx        # Timer avec gestion des quart-temps
│   │   ├── PlayerInfo.jsx   # Infos joueur (nom, numéro)
│   │   ├── StatsDisplay.jsx # Affichage résumé des stats
│   │   ├── MatchHistory.jsx # Historique des matchs avec filtres
│   │   ├── EvolutionChart.jsx    # Graphique d'évolution (Recharts)
│   │   ├── PerformanceRadar.jsx  # Graphique radar (Recharts)
│   │   ├── ShotHeatmap.jsx       # Carte des tirs historique
│   │   ├── ThermalHeatmap.jsx    # Carte thermique zones chaudes/froides
│   │   ├── ShotReplay.jsx        # Replay des tirs du match
│   │   └── PinLock.jsx           # Écran de verrouillage PIN
│   └── hooks/
│       └── useStats.js      # Hooks: useStats, usePlayer, useTimer, usePlayingTime, useMatchHistory
├── public/
│   ├── pwa-192x192.png      # Icône PWA 192px
│   └── pwa-512x512.png      # Icône PWA 512px
├── android/                 # Projet Capacitor Android
│   ├── app/
│   │   └── build.gradle
│   └── local.properties     # sdk.dir=/home/ninjax/Android/Sdk
├── capacitor.config.ts
├── package.json
├── vite.config.js           # Config Vite + PWA
└── StatsBasket.apk          # APK générée
```

## Commandes

```bash
# Développement web
npm run dev

# Build production (avec PWA)
npm run build

# Build APK Android complet
npm run build && npx cap sync android && cd android && ./gradlew assembleDebug
# APK générée dans: android/app/build/outputs/apk/debug/app-debug.apk

# Copier APK à la racine
cp android/app/build/outputs/apk/debug/app-debug.apk ./StatsBasket.apk

# Émulateur Android (S24 Ultra)
~/Android/Sdk/emulator/emulator -avd S24Ultra -gpu auto
~/Android/Sdk/platform-tools/adb install -r StatsBasket.apk
```

## Stack technique

- **Framework** : React 18 avec Vite
- **Mobile** : Capacitor (Android)
- **Graphiques** : Recharts (LineChart, RadarChart)
- **PWA** : vite-plugin-pwa (Service Worker + Manifest)
- **Persistance** : localStorage
- **Style** : CSS-in-JS avec clamp() pour le responsive
- **Java** : OpenJDK 21 (requis pour le build Android)

## Fonctionnalités principales

### Stats de match
- **Tirs** : 2PTS, 3PTS, LF (réussis/ratés séparés)
- **Rebonds** : Offensifs et Défensifs séparés
- **Autres** : Passes, Interceptions, Contres, Fautes, Pertes

### Stats avancées (calculées automatiquement)
- **TS%** : True Shooting Percentage
- **GmSc** : Game Score (Hollinger)
- **PER** : Player Efficiency Rating (simplifié)
- **USG%** : Usage Rate
- **+/-** : Plus/Minus différentiel

### Séries de réussite (Streaks)
- Affichage en temps réel quand 2+ tirs consécutifs réussis
- Record de série sauvegardé avec le match
- Affichage dans l'analyse (par match et global)

### Mode hors-ligne (PWA)
- Service Worker cache tous les assets
- Fonctionne sans connexion internet
- Installable sur écran d'accueil (web)

## Hooks personnalisés (useStats.js)

- `useStats()` : stats + actionHistory + getEfficiency() + getStreaks() + deleteAction()
- `usePlayer()` : nom et numéro
- `useTimer()` : timer avec quart-temps
- `usePlayingTime()` : temps terrain/banc
- `useMatchHistory()` : historique + saveMatch() + getAverages() + getRecords()

## localStorage keys

- `basketAppPin` : code PIN (base64)
- `basketStats` : stats du match en cours
- `basketActionHistory` : historique des actions
- `basketPlayer` : infos joueur {name, number}
- `basketTimer` : état du timer
- `basketQuarterDuration` : durée d'un QT (défaut: 600s = 10min)
- `basketMatchHistory` : historique des matchs
- `basketPlayingTime` / `basketBenchTime` / `basketIsOnCourt`
- `basketGithubToken` / `basketGistId` : sync GitHub
- `basketTheme` : dark/light

## Structure d'un match sauvegardé

```javascript
{
  id: Date.now(),
  date: ISO string,
  player: { name, number },
  opponent: string,
  location: 'home' | 'away',
  score: { team, opponent },
  plusMinus: number,
  stats: { fg2Made, fg2Attempted, fg3Made, ... },
  shotMarkers: [{ x, y, made, isThree, isFreeThrow, quarter }],
  summary: { points, rebounds, assists, ... },
  efficiency: { trueShootingPct, gameScore, per, usageRate },
  streaks: { bestStreak, bestPointsStreak },
  notes: { strengths, improvements }
}
```
