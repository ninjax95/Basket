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
│   ├── App.jsx              # Composant principal + tous les styles CSS (~7000 lignes)
│   ├── main.jsx             # Point d'entrée React
│   ├── components/
│   │   ├── CourtMap.jsx     # Carte interactive du terrain (SVG) avec zones de tir
│   │   ├── Timer.jsx        # Timer avec gestion des quart-temps
│   │   ├── PlayerInfo.jsx   # Infos joueur (nom, numéro)
│   │   ├── StatsDisplay.jsx # Affichage résumé des stats
│   │   ├── StatCounter.jsx  # Compteur de statistiques (+/-)
│   │   ├── MatchHistory.jsx # Historique des matchs avec filtres et édition
│   │   ├── EvolutionChart.jsx    # Graphique d'évolution des stats (Recharts)
│   │   ├── PerformanceRadar.jsx  # Graphique radar performances (Recharts)
│   │   ├── ShotHeatmap.jsx       # Carte des tirs historique
│   │   ├── ThermalHeatmap.jsx    # Carte thermique zones chaudes/froides
│   │   ├── ShotReplay.jsx        # Replay animé des tirs du match
│   │   └── PinLock.jsx           # Écran de verrouillage PIN 4 chiffres
│   └── hooks/
│       └── useStats.js      # Hooks personnalisés (~685 lignes)
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

# Push sur GitHub (déclenche auto-deploy Vercel)
git add -A && git commit -m "message" && git push origin main
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

### Onglets de l'application
1. **Match** : Écran principal pour tracker les stats en temps réel
2. **Historique** : Liste des matchs sauvegardés avec stats détaillées
3. **Analyse** : Graphiques et visualisations avancées
4. **Options** : Paramètres (thème, PIN, sync, durée QT)
5. **Aide** : Guide d'utilisation

### Stats de match
- **Tirs** : 2PTS, 3PTS, LF (réussis/ratés séparés avec boutons +/-)
- **Rebonds** : Offensifs et Défensifs séparés
- **Autres** : Passes décisives, Interceptions, Contres, Fautes, Pertes de balle

### Stats avancées (calculées automatiquement)
- **TS%** : True Shooting Percentage
- **GmSc** : Game Score (formule Hollinger)
- **PER** : Player Efficiency Rating (version simplifiée)
- **USG%** : Usage Rate
- **+/-** : Plus/Minus différentiel (points marqués - encaissés quand sur le terrain)

### Carte des tirs interactive
- Terrain SVG avec zones définies (peinture, mi-distance, 3 points, corners)
- Marqueurs de tir (vert = réussi, rouge = raté)
- Clic sur le terrain pour enregistrer un tir
- Choix du type de tir (2PTS, 3PTS, LF)

### Score en direct
- Boutons +/- pour score équipe et adversaire
- Calcul automatique du +/- personnel
- Indicateur visuel victoire/défaite

### Timer et quart-temps
- Timer avec pause/play
- Gestion des 4 quart-temps (Q1-Q4)
- Durée configurable (8, 10, 12 minutes)
- Stats par quart-temps

### Temps de jeu
- Toggle Terrain/Banc
- Compteur temps sur le terrain
- Compteur temps sur le banc

### Historique des actions
- Liste des actions avec horodatage
- Possibilité d'annuler/supprimer une action
- Groupé par quart-temps

### Séries de réussite (Streaks)
- Affichage en temps réel quand 2+ tirs consécutifs réussis
- Icône flamme pour série en cours
- Record de série sauvegardé avec le match
- Affichage dans l'analyse (par match et global)

### Historique des matchs
- Liste des matchs sauvegardés
- Filtres et tri
- Stats détaillées par match
- **Bouton ✎ pour modifier l'adversaire après sauvegarde**
- Bouton × pour supprimer un match
- Badges records personnels

### Analyse et graphiques
- **Graphique d'évolution** : Courbe des stats sur plusieurs matchs
- **Radar de performance** : Visualisation multi-dimensionnelle
- **Heatmap des tirs** : Carte des zones de tir fréquentes
- **Carte thermique** : Zones chaudes/froides du terrain
- **Replay des tirs** : Animation des tirs du match
- Moyennes par match
- Records personnels avec date et adversaire

### Notes de match
- Champ "Points forts" (ce qui a bien marché)
- Champ "À améliorer" (axes de progression)

### Thèmes
- **Mode sombre** (défaut) : Fond foncé, texte clair
- **Mode clair** : Fond clair, texte foncé avec bon contraste

### Sécurité
- **PIN 4 chiffres** : Verrouillage de l'app
- Stockage sécurisé (base64)
- Bouton reset complet des données

### Synchronisation
- Export/Import des données via GitHub Gist
- Sauvegarde automatique dans localStorage

### Mode hors-ligne (PWA)
- Service Worker cache tous les assets
- Fonctionne sans connexion internet
- Installable sur écran d'accueil (web)
- Icônes PWA 192x192 et 512x512

## Hooks personnalisés (useStats.js)

- `useStats()` :
  - stats, updateStat(), resetStats(), importStats()
  - actionHistory, deleteAction(), undoLastAction()
  - getSummary(), getEfficiency(), getStreaks()
  - getStatsByQuarter()

- `usePlayer()` :
  - player {name, number}
  - updatePlayer()

- `useTimer()` :
  - timer state (time, quarter, isRunning)
  - toggleTimer(), resetTimer(), nextQuarter()
  - formatTime()

- `usePlayingTime()` :
  - playingTime, benchTime, isOnCourt
  - toggleCourt()

- `useMatchHistory()` :
  - history (liste des matchs)
  - saveMatch(), deleteMatch(), **updateMatchOpponent()**
  - clearHistory(), importHistory()
  - getAverages(), getRecords(), checkNewRecords()

## localStorage keys

- `basketAppPin` : code PIN (base64)
- `basketStats` : stats du match en cours
- `basketActionHistory` : historique des actions du match
- `basketPlayer` : infos joueur {name, number}
- `basketTimer` : état du timer {time, quarter, isRunning}
- `basketQuarterDuration` : durée d'un QT (défaut: 600s = 10min)
- `basketMatchHistory` : historique complet des matchs
- `basketPlayingTime` : temps sur le terrain (secondes)
- `basketBenchTime` : temps sur le banc (secondes)
- `basketIsOnCourt` : boolean terrain/banc
- `basketGithubToken` : token GitHub pour sync
- `basketGistId` : ID du Gist pour sync
- `basketTheme` : 'dark' | 'light'

## Structure d'un match sauvegardé

```javascript
{
  id: Date.now(),
  date: ISO string,
  player: { name, number },
  opponent: string,              // Modifiable après sauvegarde
  location: 'home' | 'away',
  score: { team, opponent },
  plusMinus: number,
  stats: {
    fg2Made, fg2Attempted,
    fg3Made, fg3Attempted,
    ftMade, ftAttempted,
    offRebounds, defRebounds,
    assists, steals, blocks, fouls, turnovers
  },
  shotMarkers: [{
    x, y,           // Position sur le terrain (%)
    made,           // boolean
    isThree,        // boolean
    isFreeThrow,    // boolean
    quarter         // 1-4
  }],
  summary: {
    points, rebounds, assists, steals, blocks,
    fouls, turnovers, fgPercentage, ftPercentage
  },
  efficiency: {
    trueShootingPct,  // TS%
    gameScore,        // GmSc
    per,              // PER
    usageRate         // USG%
  },
  streaks: {
    bestStreak,       // Meilleure série de tirs
    bestPointsStreak  // Meilleure série en points
  },
  notes: {
    strengths,        // Points forts
    improvements      // À améliorer
  }
}
```

## Déploiement

Le déploiement sur Vercel est automatique à chaque push sur la branche `main` de GitHub.

```bash
# Workflow complet
git add -A
git commit -m "Description des changements"
git push origin main
# → Vercel détecte le push et déploie automatiquement
# → Visible sur https://basket-roan.vercel.app en ~1 minute
```
